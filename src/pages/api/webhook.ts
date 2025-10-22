import type { NextApiResponse, NextApiRequest } from "next";
import { buffer } from "micro";
import { env } from "~/env";
import Stripe from "stripe";
import { type Discount, PrismaClient, type Order } from "@prisma/client";
import { z } from "zod";
import { type OrderDetails } from "~/stores/MainStore";
import { orderDetailsSchema } from "~/stores/MainStore";
import Decimal from "decimal.js";
import { splitFullName } from "~/utils/formatters/splitFullName";
import { addMinutes, addMonths } from "date-fns";
import { Resend } from "resend";
import Receipt from "emails/Receipt";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { prisma } from "~/server/db";
import OpenAI from "openai";
import { io } from "socket.io-client";
import { getFirstValidMidnightDate } from "~/utils/dateHelpers/getFirstValidMidnightDate";
import { toZonedTime } from "date-fns-tz";

const resend = new Resend(env.RESEND_API_KEY);
const openai = new OpenAI({
  apiKey: env.OPEN_AI_KEY,
});

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const PaymentMetadataSchema = z.object({
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
      const prisma = new PrismaClient();

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
        customerMetadata = PaymentMetadataSchema.parse(customerDetails);
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

      // - earning point conversion: one dollar spent rewards the user with 10 points
      // - spending point conversion: item reward price is the cent value multiplied by 2
      // - all prices are in cents

      let subtotal = new Decimal(payment.amount_subtotal ?? 0);

      // subtract tip from subtotal (if it exists)
      if (orderDetails.tipValue > 0) {
        subtotal = subtotal.minus(new Decimal(orderDetails.tipValue));
      }

      // 3) create order row
      // fyi: prisma already assigns the uuid of the order being created here to orderId field

      // expected shape is almost there, just need to convert customizations to the correct format
      // and add the menuItemId field
      const orderItemsData = orderDetails.items.map(
        ({ itemId, id, customizations, ...rest }) => ({
          ...rest,
          menuItemId: itemId,
          customizations: {
            create: Object.entries(customizations).map(
              ([categoryId, choiceId]) => ({
                customizationCategoryId: categoryId,
                customizationChoiceId: choiceId,
              }),
            ),
          },
        }),
      );

      const adjustedDatetimeToPickup = new Date(orderDetails.datetimeToPickup);

      // calculate/retrieve subtotal, tax, tip, total values here:
      const tax = new Decimal(payment.total_details?.amount_tax ?? 0);
      const tipPercentage = orderDetails.tipPercentage;
      const tipValue = orderDetails.tipValue;

      const total = new Decimal(payment.amount_total);

      const includeDietaryRestrictions = orderDetails.items.some(
        (item) => item.includeDietaryRestrictions,
      );

      const orderData = {
        stripeSessionId: payment.id,
        datetimeToPickup: adjustedDatetimeToPickup,
        firstName: customerMetadata.firstName,
        lastName: customerMetadata.lastName,
        email: customerMetadata.email,
        phoneNumber: customerMetadata.phoneNumber ?? null,
        dietaryRestrictions: includeDietaryRestrictions
          ? (user?.dietaryRestrictions ?? null)
          : null,
        includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
        subtotal: subtotal.toNumber(),
        tax: tax.toNumber(),
        tipPercentage,
        tipValue,
        total: total.toNumber(),
        userId: user ? user.userId : null,
        orderItems: {
          create: orderItemsData, // Nested array for order items and their customizations
        },
      };

      const order = await prisma.order.create({
        data: orderData,
      });

      // 5) add order to print queue model in database
      await prisma.orderPrintQueue.create({
        data: {
          orderId: order.id,
        },
      });

      // 6) send socket emit to socket.io server to notify dashboard of new order
      const socket = io(env.SOCKET_IO_URL, {
        query: {
          userId: "webhook", // this shouldn't actually be necessary, can probably remove later
        },
        secure: env.NODE_ENV === "production" ? true : false,
        retries: 3,
      });

      socket.on("connect", () => {
        console.log("Connected to socket.io server from webhook");

        socket.emit("newOrderPlaced", {
          orderId: order.id,
        });
      });

      // TODO: uncomment for production
      // // 8) send email receipt (if allowed) to user
      // if (user?.allowsEmailReceipts) {
      //   await SendEmailReceipt({
      //     // email: customerMetadata.email,
      //     order,
      //     orderDetails,
      //     userIsAMember: true,
      //   });
      // }

      // // check if customer email is on do not email blacklist in database
      // else {
      //   const emailBlacklistValue = await prisma.blacklistedEmail.findFirst({
      //     where: {
      //       emailAddress: customerMetadata.email,
      //     },
      //   });

      //   if (!emailBlacklistValue) {
      //     await SendEmailReceipt({
      //       // email: customerMetadata.email,
      //       order,
      //       orderDetails,
      //       userIsAMember: false,
      //     });
      //   }
      // }

      // TODO: uncomment for production
      // 9) do chatgpt search for whether or not the user is a notable food critic, news reporter,
      // writer, or otherwise influential person in the food industry.

      // const params: OpenAI.Chat.ChatCompletionCreateParams = {
      //   messages: [
      //     {
      //       role: "user",
      //       content: `Given the name ${customerMetadata.firstName} ${customerMetadata.lastName}, provide a brief one-sentence summary indicating if they are a notable food critic, news reporter, writer, influential person related to the food industry, popular on social media, or a 'foodie'. Otherwise, reply with the response: "Person is not notable"`,
      //     },
      //   ],
      //   model: "gpt-4o-mini",
      // };
      // const chatCompletion: OpenAI.Chat.ChatCompletion =
      //   await openai.chat.completions.create(params);

      // const response = chatCompletion.choices[0]?.message.content;

      // if (response && response !== "Person is not notable") {
      //   // update the Order row with the descripion of the notable person
      //   await prisma.order.update({
      //     where: {
      //       id: order.id,
      //     },
      //     data: {
      //       notableUserDescription: response,
      //     },
      //   });
      //
      //  need to have dashboard refetch the order to display the notableUserDescription

      //    socket.emit("newOrderPlaced", {
      //      orderId: order.id,
      //    });
      // }

      // 10) cleanup transient order, technically not necessary though right since we just upsert either way?
      // deleteMany instead of delete because prisma throws an error if the row doesn't exist
      await prisma.transientOrder.deleteMany({
        where: {
          userId: payment.metadata.userId,
        },
      });

      // 11) close socket connection
      socket.close();
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

export default webhook;

interface SendEmailReceipt {
  order: Order;
  orderDetails: {
    items: {
      id: number;
      name: string;
      quantity: number;
      price: number;
      itemId: string;
      specialInstructions: string;
      includeDietaryRestrictions: boolean;
      customizations: Record<string, string>;
      discountId: string | null;
      isChefsChoice: boolean;
      isAlcoholic: boolean;
      isVegetarian: boolean;
      isVegan: boolean;
      isGlutenFree: boolean;
      showUndercookedOrRawDisclaimer: boolean;
      hasImageOfItem: boolean;
      pointReward: boolean;
      birthdayReward: boolean;
    }[];
  };
  userIsAMember: boolean;
}

async function SendEmailReceipt({
  order,
  orderDetails,
  userIsAMember,
}: SendEmailReceipt) {
  console.log("sending email receipt");

  const unsubscriptionToken = await prisma.emailUnsubscriptionToken.create({
    data: {
      expiresAt: addMonths(new Date(), 3),
      emailAddress: order.email,
    },
  });

  const rawCustomizationChoices = await prisma.customizationChoice.findMany({
    include: {
      customizationCategory: true,
    },
  });

  const customizationChoices = rawCustomizationChoices.reduce(
    (acc, choice) => {
      acc[choice.id] = choice;
      return acc;
    },
    {} as Record<string, CustomizationChoiceAndCategory>,
  );

  const rawDiscounts = await prisma.discount.findMany({
    where: {
      active: true,
      expirationDate: {
        gte: new Date(),
      },
      userId: null,
      menuItem: undefined, // assuming that we are most likely not doing the category/item %/bogo discounts
      menuCategory: undefined, // assuming that we are most likely not doing the category/item %/bogo discounts
    },
  });

  const discounts = rawDiscounts.reduce(
    (acc, discount) => {
      acc[discount.id] = discount;
      return acc;
    },
    {} as Record<string, Discount>,
  );

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "khues.dev@gmail.com", // order.email,
      subject: "Hello world",
      react: Receipt({
        order: {
          ...order,
          orderItems: orderDetails.items.map((item) => ({
            ...item,
            id: item.itemId, // not "correct", but the actual id isn't necessary for the email
            orderId: order.id,
            menuItemId: item.itemId,
            customizationChoices: item.customizations
              ? Object.entries(item.customizations).map(
                  ([categoryId, choiceId]) => ({
                    categoryId,
                    choiceId,
                    choice: customizationChoices[choiceId],
                  }),
                )
              : [],
            discount: item.discountId ? discounts[item.discountId]! : null,
            hasImageOfItem: item.hasImageOfItem,
          })),
        },
        customizationChoices,
        discounts,
        userIsAMember,
        unsubscriptionToken: unsubscriptionToken.id,
      }),
    });

    if (error) {
      // res.status(400).json({ error });
      console.error(error);
    }

    // res.status(200).json({ data });
    console.log("went through", data);
  } catch (error) {
    // res.status(400).json({ error });
    console.error(error);
  }
}
