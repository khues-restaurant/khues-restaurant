import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { env } from "~/env";
import { type LineItem } from "@stripe/stripe-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const paymentRouter = createTRPCRouter({
  // isPaidEmail: publicProcedure
  //   .input(
  //     z.object({
  //       email: z.string(),
  //     }),
  //   )
  //   .query(async ({ input }) => {
  //     const account = await client
  //       .get({
  //         TableName: env.TABLE_NAME,
  //         Key: {
  //           pk: `email|${input.email}`,
  //           sk: `email|${input.email}`,
  //         },
  //       })
  //       .promise();

  //     return {
  //       isValid: account.Item ? true : false,
  //     };
  //   }),
  createCheckout: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        email: z.string().email(),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        phoneNumber: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
        orderDetails: z.any(),
      }),
    )
    .mutation(({ input }) => {
      console.log("hit with input of ", input);

      function createLineItemsFromOrder(items: any) {
        return items.map((item) => {
          return {
            // price: `${item.price}`, will eventually have to create automated migration script to create
            // line item/price in stripe
            price: "price_1OoL8NKPndF2uHGQFokCYWPV",
            quantity: item.quantity,
          };
        });
      }

      console.log(createLineItemsFromOrder(input.orderDetails.items));

      return stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.email,
        // client_reference_id: input.userId,
        line_items: createLineItemsFromOrder(input.orderDetails.items),
        // idempotencyKey how to do this?

        metadata: {
          userId: input.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          email: input.email,
        },

        // is the checkout_session_id encoded properly below?
        // success_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/`,
        success_url:
          "http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:3000/",
        // expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // Checkout will auto-expire in 2 hours
      });
    }),
  getStripeSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      return {
        email: session.customer_details?.email,
      };
    }),
});
