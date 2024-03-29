import type { NextApiResponse, NextApiRequest } from "next";
import { buffer } from "micro";
import { env } from "~/env";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { emitNewOrderThroughSocket } from "~/utils/emitNewOrderThroughSocket";
import { type OrderDetails } from "~/stores/MainStore";
import { orderDetailsSchema } from "~/stores/MainStore";
import Decimal from "decimal.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
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
  email: z.string().email(), // This validates that the email field contains a valid email address
  phoneNumber: z.string(), // Additional validation can be added if there's a specific format for phone numbers
});

interface PaymentMetadata {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// TODO: clean up all of the early returns and try to maybe consolidate them a bit?

const webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("webhook hit");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      "whsec_6efd9dc6493e04a4078e8e004d174c4a15e6aa678ba464b60fb257eb710a0925", // TODO: replace with process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    let message = "Unknown Error";
    if (err instanceof Error) message = err.message;
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      const payment = event.data.object;

      console.dir(payment);

      if (payment.metadata === null || payment.amount_total === null) {
        console.log("returning early 1");
        res.json({ received: true });
        return;
      }

      let paymentMetadata: PaymentMetadata | undefined = undefined;

      try {
        // This will throw an error if the object does not match the schema
        paymentMetadata = PaymentMetadataSchema.parse(payment.metadata);
      } catch (error) {
        console.error("Validation failed:", error);
      }

      if (paymentMetadata === undefined) {
        console.log("returning early 2");
        res.json({ received: true });
        return;
      }

      const prisma = new PrismaClient();

      // 1) get user object (if exists) from user table
      const user = await prisma.user.findFirst({
        where: {
          userId: payment.metadata.userId,
        },
      });

      // 2) get transient order details
      const transientOrder = await prisma.transientOrder.findFirst({
        where: {
          userId: payment.metadata.userId,
        },
      });

      if (!transientOrder) {
        console.log("No transient order found for user");
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
        console.log("returning early 3");
        res.json({ received: true });
        return;
      }

      const prevPoints = user?.rewardsPoints ?? 0;
      let currPoints = 0;
      let lifetimeRewardPoints = user?.lifetimeRewardPoints ?? 0;

      // calculate new rewards points from order
      const totalPrice = payment.amount_total;
      const pointsEarned = Math.floor(totalPrice / 10);

      let pointsUsedFromRewards = 0;

      for (const item of orderDetails.items) {
        if (item.pointReward) {
          const points = new Decimal(item.price).div(0.01).toNumber();
          pointsUsedFromRewards = points;
        }
      }

      currPoints = prevPoints + pointsEarned - pointsUsedFromRewards;
      lifetimeRewardPoints += pointsEarned;

      // if (user) {
      //   // create new reward discount if threshold is met
      //   if (currPoints > 1500) {
      //     const now = new Date();
      //     const twoMonthsFromNow = new Date(
      //       now.getFullYear(),
      //       now.getMonth() + 2,
      //       now.getDate(),
      //     );

      //     // needs to be awaited or no?
      //     await prisma.discount.create({
      //       data: {
      //         name: "Points",
      //         description: "1500 point free meal reward",
      //         expirationDate: twoMonthsFromNow,
      //         active: true,
      //         userId: user.userId,
      //       },
      //     });

      //     showRewardsDiscountNotification = true;
      //     currPoints = currPoints - 1500;
      //   }
      // }

      // 3) create order row

      // fyi: prisma already assigns the uuid of the order being created here to orderId field

      const orderItemsData = orderDetails.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        menuItemId: item.itemId,
        specialInstructions: item.specialInstructions,
        includeDietaryRestrictions: item.includeDietaryRestrictions,
        customizations: {
          create: Object.entries(item.customizations).map(
            ([categoryId, choiceId]) => ({
              customizationCategoryId: categoryId,
              customizationChoiceId: choiceId,
            }),
          ),
        },
        discountId: item.discountId,
        pointReward: item.pointReward,
        birthdayReward: item.birthdayReward,
      }));

      const orderData = {
        stripeSessionId: payment.id,
        datetimeToPickup: new Date(orderDetails.datetimeToPickUp),
        firstName: paymentMetadata.firstName,
        lastName: paymentMetadata.lastName,
        email: paymentMetadata.email,
        phoneNumber: paymentMetadata.phoneNumber,
        dietaryRestrictions: user?.dietaryRestrictions ?? null,
        includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
        prevRewardsPoints: prevPoints,
        rewardsPoints: currPoints,
        userId: user ? user.userId : null,
        orderItems: {
          create: orderItemsData, // Nested array for order items and their customizations
        },
      };

      console.log("userId is", user?.userId);

      const order = await prisma.order.create({
        data: orderData,
      });

      // 3.5) set any reward discount to inactive if it was used
      if (orderDetails.rewardBeingRedeemed) {
        await prisma.discount.update({
          where: {
            id: orderDetails.rewardBeingRedeemed.reward.id,
          },
          data: {
            active: false,
          },
        });
      }

      // 4) update user rewards points/rank + reset their currentOrder
      if (user) {
        await prisma.user.update({
          where: {
            userId: payment.metadata.userId,
          },
          data: {
            rewardsPoints: currPoints,
            lifetimeRewardPoints,
            currentOrder: {
              datetimeToPickUp: new Date(),
              items: [],
              includeNapkinsAndUtensils: false,
            },
          },
        });

        // TODO: probably want to set showRewardsDiscountNotification to be false
        // if you are redeeming a reward discount on this order. Only exception would be
        // if this order brought the user back over the threshold for a new reward discount.
      }

      // 5) send websocket emit to dashboard

      // seems like we may have to do some extra work to get this to send to
      // backend socket.ts
      // socket.emit("newOrderCreated");
      emitNewOrderThroughSocket();

      // 6) TODO: send post request to w/e pos system we are using

      // 7) cleanup transient order, technically not necessary though right since we just upsert either way?
      await prisma.transientOrder.delete({
        where: {
          userId: payment.metadata.userId,
        },
      });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

export default webhook;
