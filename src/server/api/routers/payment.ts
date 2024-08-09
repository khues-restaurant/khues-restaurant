import { type Discount } from "@prisma/client";
import Decimal from "decimal.js";
import Stripe from "stripe";
import { z } from "zod";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orderDetailsSchema } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";
import { env } from "~/env";
import { waitUntil } from "@vercel/functions";

export const config = {
  runtime: "nodejs",
  maxDuration: 270, // 4 minutes, 30 seconds to be safe regarding vercel pro function timeout of 5 minutes
  api: {
    bodyParser: false,
  },
};

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const paymentRouter = createTRPCRouter({
  createCheckout: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        stripeUserId: z.string().min(1).max(100).optional(),
        orderDetails: orderDetailsSchema,
        pickupName: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("hit with input of ", input);

      // TODO: verify whether this is necessary, could just pass in the store db values without
      // much harm I think
      const rawCustomizationChoices =
        await ctx.prisma.customizationChoice.findMany({
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

      const rawDiscounts = await ctx.prisma.discount.findMany();

      const discounts = rawDiscounts.reduce(
        (acc, discount) => {
          acc[discount.id] = discount;
          return acc;
        },
        {} as Record<string, Discount>,
      );

      function createLineItemsFromOrder(
        items: z.infer<typeof orderDetailsSchema>["items"],
      ) {
        return items.map((item) => {
          const price = calculateRelativeTotal({
            items: [
              {
                ...item,
                quantity: 1,
              },
            ],
            customizationChoices,
            discounts,
          });

          let description = "";

          if (Object.values(item.customizations).length > 0) {
            description += "Customizations: ";
            for (const choiceId of Object.values(item.customizations)) {
              const customizationCategory =
                customizationChoices[choiceId]?.customizationCategory;

              const customizationChoice = customizationChoices[choiceId]?.name;

              if (customizationCategory && customizationChoice) {
                description += `${customizationCategory.name} - ${customizationChoice}`;
              }
            }
          }

          if (item.pointReward) {
            description += `${Object.values(item.customizations).length > 0 ? " | " : ""}${new Decimal(
              item.price,
            )
              .mul(2) // item price (in cents) multiplied by 2
              .toNumber()} Point reward`;
          }

          if (item.birthdayReward) {
            description += `${Object.values(item.customizations).length > 0 ? " | " : ""}Birthday reward`;
          }

          // if (item.discountId) {
          //   const discount = discounts[item.discountId];
          //   if (discount) {
          //     description += `\n ${Object.values(item.customizations).length > 0 ? " | " : ""}Discount: ${discount.name}`;
          //   }
          // }

          const safePriceInCents = new Decimal(price)
            .toDecimalPlaces(0, Decimal.ROUND_HALF_UP) // I don't think this is necessary, keeping as a precaution
            .toNumber();

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
                // stripe doesn't like empty strings for the description
                ...(description.length > 0 && { description }),
              },
              unit_amount: safePriceInCents,
            },
            quantity: item.quantity,
            tax_rates: ["txr_1PW1YNKPndF2uHGQ4aBqBTcX"], // Total St. Paul sales tax rate
          };
        });
      }

      const lineItems = createLineItemsFromOrder(input.orderDetails.items);

      // strongly suspect that this block is referencing an older system we used
      // if (input.orderDetails.rewardBeingRedeemed) {
      //   const item = input.orderDetails.rewardBeingRedeemed.item;

      //   const price = calculateRelativeTotal({
      //     items: [
      //       {
      //         ...item,
      //         quantity: 1,
      //       },
      //     ],
      //     customizationChoices,
      //     discounts,
      //   });

      //   let description = "";

      //   if (Object.values(item.customizations).length > 0) {
      //     description += "Customizations: ";
      //     for (const choiceId of Object.values(item.customizations)) {
      //       const customizationCategory =
      //         customizationChoices[choiceId]?.customizationCategory;

      //       const customizationChoice = customizationChoices[choiceId]?.name;

      //       if (customizationCategory && customizationChoice) {
      //         description += `${customizationCategory.name} - ${customizationChoice}`;
      //       }
      //     }
      //   }

      //   // if (item.discountId) {
      //   //   const discount = discounts[item.discountId];
      //   //   if (discount) {
      //   //     description += `${Object.values(item.customizations).length > 0 ? " | " : ""}Discount: ${discount.name}`;
      //   //   }
      //   // }

      //   const priceInCents = new Decimal(price)
      //     .mul(100)
      //     .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      //     .toNumber();

      //   lineItems.push({
      //     price_data: {
      //       currency: "usd",
      //       product_data: {
      //         name: item.name,
      //         // stripe doesn't like empty strings for the description
      //         ...(description.length > 0 && { description }),
      //       },
      //       unit_amount: priceInCents,
      //     },
      //     quantity: 1,
      //     // tax_rates: [""], // TODO: replace with production MN/St.Paul sales tax rate
      //   });
      // }

      // discounts: not currently being used
      // let discountToApply = {};

      // if (input.orderDetails.discountId) {
      //   if (
      //     discounts[input.orderDetails.discountId]?.name ===
      //     "Spend $35, Save $5"
      //   ) {
      //     discountToApply = {
      //       price_data: {
      //         currency: "usd",
      //         product_data: {
      //           name: "Spend $35, Save $5",
      //         },
      //         unit_amount: -500,
      //       },
      //       quantity: 1,
      //     };
      //   }
      // }

      // TODO: associate proper 0-tax rate with tips
      // TODO: verify process and correctness of tip calculation logic
      // Convert initial tip value from dollars to cents
      let tipValue = new Decimal(input.orderDetails.tipValue)
        .mul(100)
        .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

      if (
        input.orderDetails.tipPercentage === 10 ||
        input.orderDetails.tipPercentage === 15 ||
        input.orderDetails.tipPercentage === 20 ||
        (input.orderDetails.tipPercentage === null &&
          input.orderDetails.tipValue !== 0)
      ) {
        // Calculate subtotal of order in cents
        const subtotalInCents = lineItems.reduce((acc, item) => {
          return acc.add(
            new Decimal(item.price_data.unit_amount).mul(item.quantity),
          );
        }, new Decimal(0));

        // If tip percentage is provided, calculate tip value in cents
        if (input.orderDetails.tipPercentage !== null) {
          tipValue = subtotalInCents
            .mul(input.orderDetails.tipPercentage)
            .div(100)
            .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        }

        // Prepare the tip line item
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tip${input.orderDetails.tipPercentage !== null ? ` (${input.orderDetails.tipPercentage}%)` : ""}`,
            },
            unit_amount: tipValue.toNumber(), // `tipValue` is now in cents
          },
          quantity: 1,
          tax_rates: [], // No tax on tips
        });
      }

      await ctx.prisma.transientOrder.upsert({
        where: {
          userId: input.userId,
        },
        create: {
          userId: input.userId,
          // @ts-expect-error details is just json object
          details: {
            ...input.orderDetails,
            tipValue: tipValue.toNumber(), // reminder: this is the calculated, final tip value in cents
          } as unknown as Record<string, unknown>,
        },
        update: {
          // @ts-expect-error details is just json object
          details: {
            ...input.orderDetails,
            tipValue: tipValue.toNumber(), // reminder: this is the calculated, final tip value in cents
          } as unknown as Record<string, unknown>,
        },
      });

      let customer = undefined;

      if (input.stripeUserId) {
        try {
          customer = await stripe.customers.retrieve(input.stripeUserId);
        } catch {
          //
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        currency: "usd",
        customer: customer?.id,

        line_items: lineItems,
        // discounts: [discountToApply],

        phone_number_collection: {
          enabled: true,
        },

        metadata: {
          userId: input.userId,
          pickupName: input.pickupName,
        },

        success_url: `${env.BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&userId=${input.userId}`,
        cancel_url: `${env.BASE_URL}/`,
      });

      waitUntil(waitForTimeoutAndExpireSession(session.id, 1000 * 60 * 4.5)); // 4 minutes, 30 seconds

      return session;
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

function waitForTimeoutAndExpireSession(
  sessionId: string,
  delay: number,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      expireSessionIfOpen(sessionId)
        .then(resolve)
        .catch((error) => {
          console.error("Error retrieving or expiring session", error);
          resolve(); // Resolve even in case of an error to avoid hanging promises
        });
    }, delay);
  });
}

async function expireSessionIfOpen(sessionId: string): Promise<void> {
  // Check if the session is still active after the specified delay
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log("retrieved session", session.status);

  if (session.status === "open") {
    console.log("session is still open, expiring it");
    const expiredSession = await stripe.checkout.sessions.expire(sessionId);
    console.log("expired session", expiredSession);
  }
}
