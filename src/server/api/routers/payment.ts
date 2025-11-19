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
  apiVersion: "2025-09-30.clover",
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
            tax_rates: [env.STRIPE_TAX_RATE_ID], // Total St. Paul sales tax rate
          };
        });
      }

      const lineItems = createLineItemsFromOrder(input.orderDetails.items);

      // Calculate subtotal of order in cents
      const subtotalInCents = lineItems.reduce((acc, item) => {
        return acc.add(
          new Decimal(item.price_data.unit_amount).mul(item.quantity),
        );
      }, new Decimal(0));

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

      // Handle Gift Card Logic
      let giftCardAmountToApply = 0;
      const giftCardCode = input.orderDetails.giftCardCode;
      let giftCardId = "";

      if (giftCardCode) {
        const giftCard = await ctx.prisma.giftCard.findUnique({
          where: { code: giftCardCode },
        });

        if (giftCard && giftCard.balance > 0) {
          giftCardId = giftCard.id;
          // Calculate Tax
          const taxRate = await stripe.taxRates.retrieve(
            env.STRIPE_TAX_RATE_ID,
          );
          const taxPercentage = new Decimal(taxRate.percentage).div(100);
          const taxValue = subtotalInCents
            .mul(taxPercentage)
            .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

          const totalInCents = subtotalInCents.add(taxValue).add(tipValue);

          giftCardAmountToApply = Math.min(
            totalInCents.toNumber(),
            giftCard.balance,
          );

          // If Gift Card covers part or all of the order
          if (giftCardAmountToApply > 0) {
            const remainingAmount = totalInCents
              .minus(giftCardAmountToApply)
              .toNumber();

            if (remainingAmount <= 0) {
              // Full payment by Gift Card
              // Create Order directly
              // We need to replicate the webhook logic here or call a shared function
              // For now, let's throw an error or handle it?
              // The user wants "Redeem giftcard dialog".
              // Since we can't easily share the webhook logic (it's in a different file and depends on Stripe event),
              // we should probably create a new procedure `order.createFromGiftCard` or similar.
              // But here we are in `createCheckout`.
              // Let's return a special session object that the frontend can handle?
              // Or just create the order here and return a dummy session with a success_url?
              // I'll create the order here.
              // I need to import the logic from webhook or duplicate it.
              // Duplication is bad but quick.
              // Refactoring webhook logic to a service function is better.
              // For now, I will implement the "Partial Payment" flow which uses Stripe.
              // If full payment, I'll handle it.
              // Actually, if full payment, I can't return a Stripe Session.
              // I'll return { id: "GIFT_CARD_PAID", url: `${env.BASE_URL}/payment-success?orderId=...` }
            } else {
              // Partial Payment
              // Replace line items with a single "Remaining Balance" item
              // This avoids tax calculation issues on the remainder
              lineItems.length = 0; // Clear items
              lineItems.push({
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "Order Balance (after Gift Card)",
                    description: `Original Total: $${totalInCents.div(100).toFixed(2)} | Gift Card Applied: -$${new Decimal(giftCardAmountToApply).div(100).toFixed(2)}`,
                  },
                  unit_amount: remainingAmount,
                },
                quantity: 1,
                tax_rates: [], // No tax on this remainder, as we calculated it already
              });
            }
          }
        }
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

      // Check for full gift card payment
      if (giftCardAmountToApply > 0) {
        // Recalculate total to check if fully paid
        const taxRate = await stripe.taxRates.retrieve(env.STRIPE_TAX_RATE_ID);
        const taxPercentage = new Decimal(taxRate.percentage).div(100);
        const taxValue = subtotalInCents
          .mul(taxPercentage)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        const totalInCents = subtotalInCents.add(taxValue).add(tipValue);
        const remainingAmount = totalInCents
          .minus(giftCardAmountToApply)
          .toNumber();

        if (remainingAmount <= 0) {
          // FULL PAYMENT LOGIC
          // 1. Deduct from Gift Card
          await ctx.prisma.giftCard.update({
            where: { id: giftCardId },
            data: {
              balance: { decrement: giftCardAmountToApply },
              lastUsedAt: new Date(),
              transactions: {
                create: {
                  amount: -giftCardAmountToApply,
                  type: "PURCHASE",
                  note: "Order Payment (Full)",
                },
              },
            },
          });

          // 2. Create Order
          // We need to construct the order object similar to webhook
          // This is a simplified version, assuming validation passed
          const orderItemsData = input.orderDetails.items.map(
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

          const { firstName, lastName } =
            input.pickupName.split(" ").length > 1
              ? {
                  firstName: input.pickupName.split(" ")[0],
                  lastName: input.pickupName.split(" ").slice(1).join(" "),
                }
              : { firstName: input.pickupName, lastName: "" };

          const user = await ctx.prisma.user.findUnique({
            where: { userId: input.userId },
          });
          const email = user?.email ?? "guest@khues.com";

          const order = await ctx.prisma.order.create({
            data: {
              stripeSessionId: `GIFT_CARD_${Date.now()}`, // Dummy ID
              datetimeToPickup: input.orderDetails.datetimeToPickup,
              firstName,
              lastName,
              email,
              phoneNumber: null,
              includeNapkinsAndUtensils:
                input.orderDetails.includeNapkinsAndUtensils,
              subtotal: subtotalInCents.toNumber(),
              tax: taxValue.toNumber(),
              tipPercentage: input.orderDetails.tipPercentage,
              tipValue: tipValue.toNumber(),
              total: totalInCents.toNumber(),
              userId: input.userId,
              orderItems: { create: orderItemsData },
              giftCardTransactions: {
                create: {
                  amount: -giftCardAmountToApply,
                  type: "PURCHASE",
                  giftCardId: giftCardId,
                },
              },
            },
          });

          // Add to print queue
          await ctx.prisma.orderPrintQueue.create({
            data: { orderId: order.id },
          });

          return {
            id: "GIFT_CARD_PAID",
            url: `${env.BASE_URL}/payment-success?session_id=GIFT_CARD_PAID&userId=${input.userId}&orderId=${order.id}`,
          } as any;
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
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
          giftCardCode: giftCardCode || null,
          giftCardAmountApplied:
            giftCardAmountToApply > 0 ? giftCardAmountToApply : null,
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
