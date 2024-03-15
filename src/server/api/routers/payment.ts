import { type Discount } from "@prisma/client";
import Decimal from "decimal.js";
import Stripe from "stripe";
import { z } from "zod";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";

export const config = {
  api: {
    bodyParser: false,
  },
};

const storeCustomizationChoiceSchema = z.record(z.string());

const discountSchema = z.object({
  id: z.string(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
  name: z.string(),
  description: z.string(),
  expirationDate: z.date().or(z.string().transform((val) => new Date(val))),
  active: z.boolean(),
  userId: z.string().nullable(),
});

const itemSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  name: z.string(),
  customizations: storeCustomizationChoiceSchema,
  discountId: z.string().nullable(),
  specialInstructions: z.string(),
  includeDietaryRestrictions: z.boolean(),
  quantity: z.number(),
  price: z.number(),
});

export const orderDetailsSchema = z.object({
  datetimeToPickUp: z.date().or(z.string().transform((val) => new Date(val))),
  items: z.array(itemSchema),
  includeNapkinsAndUtensils: z.boolean(),
  rewardBeingRedeemed: z
    .object({
      reward: discountSchema,
      item: itemSchema,
    })
    .optional(),
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const paymentRouter = createTRPCRouter({
  createCheckout: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        email: z.string().email(),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        phoneNumber: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
        orderDetails: orderDetailsSchema,
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

      // maybe use line_items.price_data.product_data.description to store extra details about
      // customizations/discounts?

      // general idea: probably keep the items.map idea below, but inside just do call to
      // calculateRelativeTotal with item and customizationChoices and discounts

      // ^ and then worry about conveying extra details about customizations/discounts to stripe later

      // pretty sure we have to pass quantity of 1 to the calculateRelativeTotal because stripe will
      // automatically multiply the quantity by the price of the line item, and we need to pass through
      // the quantity to stripe 100%
      // ^^^ some extra work is prob needed if BOGO related discounts are involved later on

      function createLineItemsFromOrder(
        items: z.infer<typeof orderDetailsSchema>["items"],
      ) {
        return items.map((item) => {
          // manipulate here
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
        });
      }

      console.dir(lineItems);

      return stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.email,
        // client_reference_id: input.userId,
        line_items: lineItems,
        // idempotencyKey how to do this?
        currency: "usd",

        metadata: {
          userId: input.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          email: input.email,
        },

        // success_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/`,
        success_url:
          "http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:3000/",

        expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
        // Checkout will auto-expire in 15mins. Should be long enough for customer to sort out
        // their payment while covering us from people ordering later and forcing the kitchen to
        // prepare the order faster than they should have to.

        // ^^^ okay stripe actually limits this to be minimum of 30 mins, which seems bad for us given the
        // circumstances. what would an implementation look like with this? some kind of cron to invoke?
        // https://docs.stripe.com/api/checkout/sessions/expire
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
