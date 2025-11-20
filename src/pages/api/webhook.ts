import type { NextApiResponse, NextApiRequest } from "next";
import { buffer } from "micro";
import { env } from "~/env";
import Stripe from "stripe";
import { z } from "zod";
import { type OrderDetails } from "~/stores/MainStore";
import { orderDetailsSchema } from "~/stores/MainStore";
import Decimal from "decimal.js";
import { splitFullName } from "~/utils/formatters/splitFullName";
import { Resend } from "resend";
import GiftCardEmail from "emails/GiftCard";
import { prisma } from "~/server/db";
import { createOrderInDb } from "~/server/utils/createOrderInDb";
import { type GiftCardRecipientType } from "~/types/giftCards";

const resend = new Resend(env.RESEND_API_KEY);

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const paymentMetadataSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
});

interface PaymentMetadata {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null | undefined;
}

// TODO: clean up all of the early returns and try to maybe consolidate them a bit?
// maybe also send back error status codes for them?

// FYI: all prices are in cents

const webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    let message = "Unknown Error";
    if (err instanceof Error) message = err.message;
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      const payment = event.data.object;

      if (payment.metadata?.type === "GIFT_CARD") {
        const amount = parseInt(payment.metadata.amount || "0", 10);
        const recipientEmail = payment.metadata.recipientEmail;
        const recipientName = payment.metadata.recipientName || undefined;
        const senderName = payment.metadata.senderName || undefined;
        const message = payment.metadata.message || undefined;
        const purchaserUserId = payment.metadata.purchaserUserId || undefined;
        const recipientType: GiftCardRecipientType =
          payment.metadata.recipientType === "myself"
            ? "myself"
            : "someoneElse";

        if (!recipientEmail || amount <= 0) {
          console.error("Invalid gift card metadata:", payment.metadata);
          res.json({ received: true });
          return;
        }

        if (
          recipientType === "someoneElse" &&
          (!recipientName || !senderName)
        ) {
          console.error(
            "Missing names for gift card metadata:",
            payment.metadata,
          );
          res.json({ received: true });
          return;
        }

        // Generate unique code
        let code = "";
        let isUnique = false;
        while (!isUnique) {
          const chars = "0123456789";
          code = "";
          for (let i = 0; i < 16; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          const existing = await prisma.giftCard.findUnique({
            where: { code },
          });
          if (!existing) isUnique = true;
        }

        let associatedUserId: string | undefined;
        if (recipientType === "myself" && purchaserUserId) {
          const existingUser = await prisma.user.findUnique({
            where: { userId: purchaserUserId },
            select: { userId: true },
          });

          if (existingUser) {
            associatedUserId = existingUser.userId;
          }
        }

        await prisma.giftCard.create({
          data: {
            code,
            balance: amount,
            user: associatedUserId
              ? {
                  connect: {
                    userId: associatedUserId,
                  },
                }
              : undefined,
            transactions: {
              create: {
                amount,
                type: "ACTIVATION_ONLINE",
                note: senderName ? `Purchased by ${senderName}` : undefined,
              },
            },
          },
        });

        // Send Email
        try {
          const emailSubject =
            recipientType === "myself"
              ? "Your Khue's Restaurant gift card is ready!"
              : `You received a gift card from ${senderName ?? "Khue's Restaurant"}!`;

          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: recipientEmail,
            subject: emailSubject,
            react: GiftCardEmail({
              senderName,
              recipientName,
              amount,
              code,
              message,
              recipientType,
            }),
          });
        } catch (error) {
          console.error("Error sending gift card email:", error);
        }

        res.json({ received: true });
        return;
      }

      if (payment.metadata?.type && payment.metadata.type !== "ORDER") {
        console.log(`Ignoring unknown payment type: ${payment.metadata.type}`);
        res.json({ received: true });
        return;
      }

      if (payment.metadata?.userId === undefined) {
        console.error("No userId in payment metadata");
        res.json({ received: true });
        return;
      }

      // 0) check if order already exists in database
      const orderExists = await prisma.order.findFirst({
        where: {
          stripeSessionId: payment.id,
        },
      });

      if (orderExists) {
        console.error("Order already exists in database");
        res.json({ received: true });
        return;
      }

      if (payment.metadata === null || payment.amount_total === null) {
        console.error("returning early, metadata or amount_total is null");
        res.json({ received: true });
        return;
      }

      let customerMetadata: PaymentMetadata | undefined = undefined;

      try {
        const { firstName, lastName } = splitFullName(
          payment.metadata.pickupName ?? payment.customer_details?.name ?? "",
        );

        const customerDetails = {
          userId: payment.metadata.userId ?? "",
          firstName,
          lastName,
          email: payment.customer_details?.email,
          phoneNumber: payment.customer_details?.phone,
        };

        // This will throw an error if the object does not match the schema
        customerMetadata = paymentMetadataSchema.parse(customerDetails);
      } catch (error) {
        console.error("Validation failed on customerDetails:", error);
      }

      if (customerMetadata === undefined) {
        console.error("returning early, customerMetadata is undefined");
        res.json({ received: true });
        return;
      }

      // 1) get user object (if exists) from user table
      const user = await prisma.user.findFirst({
        where: {
          userId: payment.metadata.userId,
        },
      });

      // falling back to db first/last name if not provided/able to be extracted
      // by splitting the name
      if (
        user &&
        customerMetadata.firstName === "" &&
        customerMetadata.lastName === ""
      ) {
        customerMetadata.firstName = user.firstName;
        customerMetadata.lastName = user.lastName;
      }

      // 2) get transient order details
      const transientOrder = await prisma.transientOrder.findFirst({
        where: {
          userId: payment.metadata.userId,
        },
      });

      if (!transientOrder) {
        console.error("No transient order found for user", event.type);
        res.json({ received: true });
        return;
      }

      let orderDetails: OrderDetails | undefined = undefined;

      try {
        // This will throw an error if the object does not match the schema
        orderDetails = orderDetailsSchema.parse(transientOrder.details);
      } catch (error) {
        console.error("Validation failed:", error);
      }

      if (orderDetails === undefined) {
        console.error("returning early, orderDetails is undefined");
        res.json({ received: true });
        return;
      }

      let subtotal = new Decimal(payment.amount_subtotal ?? 0);

      // subtract tip from subtotal (if it exists)
      if (orderDetails.tipValue > 0) {
        subtotal = subtotal.minus(new Decimal(orderDetails.tipValue));
      }

      // 3) create order row
      // fyi: prisma already assigns the uuid of the order being created here to orderId field

      // expected shape is almost there, just need to convert customizations to the correct format
      // and add the menuItemId field

      const adjustedDatetimeToPickup = new Date(orderDetails.datetimeToPickup);

      // calculate/retrieve subtotal, tax, tip, total values here:
      const tax = new Decimal(payment.total_details?.amount_tax ?? 0);
      const tipPercentage = orderDetails.tipPercentage;
      const tipValue = orderDetails.tipValue;

      const total = new Decimal(payment.amount_total);

      let giftCardUsage: { code: string; amount: number; id: string }[] = [];
      if (payment.metadata?.giftCardUsage) {
        try {
          giftCardUsage = JSON.parse(payment.metadata.giftCardUsage);
        } catch (e) {
          console.error("Error parsing gift card usage", e);
        }
      }

      await createOrderInDb({
        userId: payment.metadata.userId,
        user,
        orderDetails,
        paymentMetadata: {
          firstName: customerMetadata.firstName,
          lastName: customerMetadata.lastName,
          email: customerMetadata.email,
          phoneNumber: customerMetadata.phoneNumber ?? null,
        },
        paymentDetails: {
          stripeSessionId: payment.id,
          subtotal: subtotal.toNumber(),
          tax: tax.toNumber(),
          tipPercentage,
          tipValue,
          total: total.toNumber(),
        },
        giftCardUsage,
      });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

export default webhook;
