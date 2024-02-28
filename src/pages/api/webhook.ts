import type { NextApiResponse, NextApiRequest } from "next";
import { buffer } from "micro";
import { env } from "~/env";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

import { socket } from "~/pages/_app";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("hit at all!");

  if (req.method === "POST") {
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
        const paymentIntentSucceeded = event.data.object;

        console.dir(paymentIntentSucceeded);

        if (
          paymentIntentSucceeded.metadata === null ||
          paymentIntentSucceeded.amount_total === null
        ) {
          console.log("returning early");
          res.json({ received: true });
          return;
        }

        const prisma = new PrismaClient();

        // 1) get user object (if exists) from user table
        const user = await prisma.user.findFirst({
          where: {
            id: paymentIntentSucceeded.metadata.userId,
          },
        });

        // 2) get transient order details
        const transientOrder = await prisma.transientOrder.findFirst({
          where: {
            userId: paymentIntentSucceeded.metadata.userId,
          },
        });

        if (!transientOrder) {
          console.log("No transient order found for user");
          res.json({ received: true });
          return;
        }

        const prevPoints = user?.rewardsPoints ?? 0;
        const prevRank = user?.rewardsRank ?? 1;
        let currPoints = 0;
        let currRank = 1;

        // calculate new rewards points/rank from order
        const totalPrice = paymentIntentSucceeded.amount_total;
        const pointsEarned = Math.floor(totalPrice / 10);

        currPoints = prevPoints + pointsEarned;

        if (user) {
          // calculate new rank if applicable
          if (currPoints > 1000 && currRank < 5) {
            currRank++;
            currPoints = currPoints - 1000;
          }
        }

        // 3) create order row
        const order = await prisma.order.create({
          data: {
            firstName: paymentIntentSucceeded.metadata.firstName!,
            lastName: paymentIntentSucceeded.metadata.lastName!,
            email: paymentIntentSucceeded.metadata.email!,
            phoneNumber: paymentIntentSucceeded.metadata.phoneNumber!,
            stripeSessionId: paymentIntentSucceeded.id, // idk is this the right field?

            prevRewardsPoints: prevPoints,
            rewardsPoints: currPoints,
            prevRewardsRank: prevRank,
            rewardsRank: currRank,

            // @ts-expect-error fix typing later
            details: transientOrder.details as unknown as Record<
              string,
              unknown
            >,
            userId: user ? user.userId : null,
          },
        });

        // 4) update user rewards points/rank
        if (user) {
          await prisma.user.update({
            where: {
              id: paymentIntentSucceeded.metadata.userId,
            },
            data: {
              rewardsPoints: currPoints,
              rewardsRank: currRank,
            },
          });
        }

        // 5) send websocket emit to dashboard

        socket.emit("newOrderCreated");

        // TODO

        // 6) send post request to w/e pos system we are using

        // TODO

        await prisma.transientOrder.delete({
          where: {
            userId: paymentIntentSucceeded.metadata.userId,
          },
        });

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default webhook;
