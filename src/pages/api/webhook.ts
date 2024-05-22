import type { NextApiResponse, NextApiRequest } from "next";
import { buffer } from "micro";
import { env } from "~/env";
import Stripe from "stripe";
import { type Discount, PrismaClient, type Order } from "@prisma/client";
import { z } from "zod";
import { type OrderDetails } from "~/stores/MainStore";
import { orderDetailsSchema } from "~/stores/MainStore";
import Decimal from "decimal.js";
import { splitFullName } from "~/utils/splitFullName";
import { addMonths } from "date-fns";
import { Resend } from "resend";
import Receipt from "emails/Receipt";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { prisma } from "~/server/db";
import OpenAI from "openai";
import { getFirstValidMidnightDate } from "~/utils/getFirstValidMidnightDate";

const resend = new Resend(env.RESEND_API_KEY);
const openai = new OpenAI({
  apiKey: env.OPEN_AI_KEY,
});

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
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
  phoneNumber: z.string().nullable(), // Additional validation can be added if there's a specific format for phone numbers
});

interface PaymentMetadata {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null | undefined;
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

      console.dir(payment);

      if (payment.metadata === null || payment.amount_total === null) {
        console.log("returning early 1");
        res.json({ received: true });
        return;
      }

      console.log("details are: ", payment.customer_details);

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
        console.error("Validation failed:", error);
      }

      if (customerMetadata === undefined) {
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

      // falling back to db first and last name if not provided/able to be extracted
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
      let spentPoints = 0;

      // also general TODO: look for every opportunity to use Decimal instead of number
      // for example below you have totalPrice / 5 which certainly could cause float issue no?

      // TODO: not sure whether subtotal/tax/total is in cents or dollars but obv that is necessary info to figure out

      // price is in cents, so divide by 100 to get dollars
      const subtotal = new Decimal(payment.amount_subtotal ?? 0).div(100);

      // subtract tip from subtotal (if it exists)
      if (orderDetails.tipValue) {
        subtotal.minus(orderDetails.tipValue);
      }

      // calculate new rewards points from order subtotal
      for (const item of orderDetails.items) {
        if (item.pointReward) {
          spentPoints = new Decimal(item.price).div(0.005).toNumber();
        }
      }

      const earnedPoints = subtotal.div(5).toNumber();

      const lifetimeRewardPoints =
        (user?.lifetimeRewardPoints ?? 0) + earnedPoints;

      // 3) create order row
      // fyi: prisma already assigns the uuid of the order being created here to orderId field

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

      console.log(orderItemsData);

      let adjustedDatetimeToPickup = new Date(orderDetails.datetimeToPickup);

      // add 15 minutes to current time if order is ASAP
      if (orderDetails.isASAP) {
        adjustedDatetimeToPickup = new Date();
        adjustedDatetimeToPickup.setMinutes(
          adjustedDatetimeToPickup.getMinutes() + 15,
        );
      }

      console.log("tax amount: ", payment.total_details?.amount_tax ?? 0);

      // calculate/retrieve subtotal, tax, tip, total values here
      // const subtotal = payment.amount_subtotal ?? 0;
      const tax = new Decimal(payment.total_details?.amount_tax ?? 0);
      // ^ TODO: investigate this, idk if it just by location
      //         is doing the sales tax stuff or exactly what's going on there

      const tipPercentage = orderDetails.tipPercentage;
      const tipValue = orderDetails.tipValue;

      console.log("tip value: ", tipValue, "tip percentage: ", tipPercentage);

      const total = new Decimal(payment.amount_total);

      console.log(
        "Here!",
        subtotal.toNumber(),
        tax.toNumber(),
        tipPercentage,
        tipValue,
        total.toNumber(),
      );

      const orderData = {
        stripeSessionId: payment.id,
        datetimeToPickup: adjustedDatetimeToPickup,
        firstName: customerMetadata.firstName,
        lastName: customerMetadata.lastName,
        email: customerMetadata.email,
        phoneNumber: customerMetadata.phoneNumber ?? null,
        dietaryRestrictions: user?.dietaryRestrictions ?? null,
        includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
        subtotal: subtotal.toNumber(),
        tax: tax.toNumber(),
        tipPercentage,
        tipValue,
        total: total.toNumber(),
        prevRewardsPoints: prevPoints,
        earnedRewardsPoints: earnedPoints,
        spentRewardsPoints: spentPoints,
        rewardsPointsRedeemed: user ? true : false,
        userId: user ? user.userId : null,
        orderItems: {
          create: orderItemsData, // Nested array for order items and their customizations
        },
      };

      const order = await prisma.order.create({
        data: orderData,
      });

      // 4) set any reward discount to inactive if it was used

      // if a reward item was redeemed:
      // need to get all of user's rewards that are active and not expired, sorted by ascending expiration date
      // and then loop over adding their values until we get to the rewards item's value. While doing this we
      // would save the ids that were totally used up to then set to active: false, and the last one most likely
      // would just have it's value subtracted (need to specifically update this row's value) based on how much
      // was left to reach the reward item's value.
      let rewardItemPointValue = 0;

      for (const item of orderDetails.items) {
        if (item.pointReward) {
          rewardItemPointValue = new Decimal(item.price).div(0.005).toNumber();
        }
      }

      if (rewardItemPointValue > 0) {
        const rewards = await prisma.reward.findMany({
          where: {
            userId: payment.metadata.userId,
            active: true,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            expiresAt: "asc",
          },
        });

        let totalValue = 0;
        const rewardIdsToDeactivate: string[] = [];

        for (const reward of rewards) {
          totalValue += reward.value;

          if (totalValue >= rewardItemPointValue) {
            // this reward is the last one to be used up
            if (totalValue === rewardItemPointValue) {
              rewardIdsToDeactivate.push(reward.id);
            } else {
              // this reward is partially used up
              const remainingValue = totalValue - rewardItemPointValue;

              await prisma.reward.update({
                where: {
                  id: reward.id,
                },
                data: {
                  value: remainingValue,
                  partiallyRedeemed: true,
                },
              });
            }

            break;
          }

          rewardIdsToDeactivate.push(reward.id);
        }

        if (rewardIdsToDeactivate.length > 0) {
          await prisma.reward.updateMany({
            where: {
              id: {
                in: rewardIdsToDeactivate,
              },
            },
            data: {
              active: false,
            },
          });
        }
      }

      // 5) if user exists, update user rewards points + reset their currentOrder
      if (user) {
        if (payment.metadata.userId) {
          const currentDate = new Date();
          const sixMonthsLater = addMonths(currentDate, 6);

          await prisma.reward.create({
            data: {
              userId: payment.metadata.userId,
              expiresAt: sixMonthsLater,
              value: earnedPoints,
              orderId: order.id,
            },
          });
        }

        await prisma.user.update({
          where: {
            userId: payment.metadata.userId,
          },
          data: {
            rewardsPoints: prevPoints + earnedPoints - spentPoints,
            lifetimeRewardPoints,
            currentOrder: {
              datetimeToPickup: getFirstValidMidnightDate(new Date()),
              isASAP: false,
              items: [],
              tipPercentage: null,
              tipValue: 0,
              includeNapkinsAndUtensils: false,
              discountId: null,
            },
          },
        });
      }

      // 6) add order to print queue model in database
      await prisma.orderPrintQueue.create({
        data: {
          orderId: order.id,
        },
      });

      // TODO: uncomment for production
      // // 7) send email receipt (if allowed) to user
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
      // 8) do chatgpt search for whether or not the user is a notable food critic, news reporter,
      // writer, or otherwise influential person in the food industry.

      // const params: OpenAI.Chat.ChatCompletionCreateParams = {
      //   messages: [
      //     {
      //       role: "user",
      //       content: `Given the name ${customerMetadata.firstName} ${customerMetadata.lastName}, provide a brief one-sentence summary indicating if they are a notable food critic, news reporter, writer, influential person related to the food industry, popular on social media, or a 'foodie'. Otherwise, reply with the response: "Person is not notable"`,
      //     },
      //   ],
      //   model: "gpt-4o",
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
      // }

      // 9) cleanup transient order, technically not necessary though right since we just upsert either way?
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
