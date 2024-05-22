import { type Discount } from "@prisma/client";
import Decimal from "decimal.js";
import Stripe from "stripe";
import { z } from "zod";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orderDetailsSchema } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { env } from "~/env";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
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
              .div(0.005)
              .toNumber()} Point reward`;
          }

          if (item.birthdayReward) {
            description += `${Object.values(item.customizations).length > 0 ? " | " : ""}Birthday reward`;
          }

          if (item.discountId) {
            const discount = discounts[item.discountId];
            if (discount) {
              description += `\n ${Object.values(item.customizations).length > 0 ? " | " : ""}Discount: ${discount.name}`;
            }
          }

          const priceInCents = new Decimal(price)
            .mul(100)
            .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
            .toNumber();

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
                // stripe doesn't like empty strings for the description
                ...(description.length > 0 && { description }),
              },
              unit_amount: priceInCents,
            },
            quantity: item.quantity,
          };
        });
      }

      const lineItems = createLineItemsFromOrder(input.orderDetails.items);

      if (input.orderDetails.rewardBeingRedeemed) {
        const item = input.orderDetails.rewardBeingRedeemed.item;

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

        if (item.discountId) {
          const discount = discounts[item.discountId];
          if (discount) {
            description += `${Object.values(item.customizations).length > 0 ? " | " : ""}Discount: ${discount.name}`;
          }
        }

        const priceInCents = new Decimal(price)
          .mul(100)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
          .toNumber();

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              // stripe doesn't like empty strings for the description
              ...(description.length > 0 && { description }),
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
          // tax_rates: [""], // TODO: replace with production MN/St.Paul sales tax rate
        });
      }

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
      let tipValue = new Decimal(input.orderDetails.tipValue);

      if (
        input.orderDetails.tipPercentage === 10 ||
        input.orderDetails.tipPercentage === 15 ||
        input.orderDetails.tipPercentage === 20 ||
        (input.orderDetails.tipPercentage === null &&
          input.orderDetails.tipValue !== 0)
      ) {
        // calculate subtotal of order to apply tip percentage to
        if (input.orderDetails.tipPercentage !== null) {
          const subtotal = lineItems.reduce((acc, item) => {
            return acc.add(
              new Decimal(item.price_data.unit_amount)
                .div(100)
                .mul(item.quantity),
            );
          }, new Decimal(0));

          tipValue = subtotal.mul(input.orderDetails.tipPercentage).div(100);
        }

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tip${input.orderDetails.tipPercentage !== null ? ` (${input.orderDetails.tipPercentage}%)` : ""}`,
            },
            unit_amount: tipValue
              .mul(100)
              .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
              .toNumber(),
          },
          quantity: 1,
          // tax_rates: ["txr_1PIgFbKPndF2uHGQrW0TnYca"], // TODO: replace with production tax-free rate
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
            tipValue: tipValue.toNumber(), // reminder: this is the calculated, final tip value
          } as unknown as Record<string, unknown>,
        },
        update: {
          // @ts-expect-error details is just json object
          details: {
            ...input.orderDetails,
            tipValue: tipValue.toNumber(), // reminder: this is the calculated, final tip value
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

        // automatic_tax: {
        //   enabled: true,
        // },

        metadata: {
          userId: input.userId,
          pickupName: input.pickupName,
        },

        success_url: `${env.BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&userId=${input.userId}`,
        cancel_url: `${env.BASE_URL}`,
      });

      setTimeout(
        () => {
          // check if session is still active after 5 mins, if so expire it
          void stripe.checkout.sessions.retrieve(session.id).then((session) => {
            console.log("retrieved session", session.status);
            if (session.status === "open") {
              console.log("session is still open, expiring it");
              void stripe.checkout.sessions
                .expire(session.id)
                .then((session) => {
                  console.log("expired session", session);
                });
            }
          });
        },
        1000 * 60 * 5,
      );

      return session; // TODO: okay shoot I believe when we return we will be ending the http request,
      // and therefore the setTimeout will not be able to run... maybe we need to make a separate tprc endpoint
      // that will be passed in the session id and simply just have the setTimeout in there?

      // TODO: if this doesn't work in production, then prob have to make a cron job to handle this
      // but what mess you would have to have the checking frequency be so often... hopefully this works

      // ^^^ dang I don't think that you can use the "waitUntil()" vercel function method because
      // on the pro plan I think the max function execution time you can have is 300ms (5 mins)...
      // ^ maybe workaround would be to expire it at 4 mins 30 seconds instead? probably the easiest option imo
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
