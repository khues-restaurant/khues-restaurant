import type { NextApiResponse, NextApiRequest } from "next";
import { buffer } from "micro";
import { env } from "~/env";
import Stripe from "stripe";
import { type Discount, PrismaClient } from "@prisma/client";
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

const resend = new Resend(env.RESEND_API_KEY);

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

      // calculate new rewards points from order
      const totalPrice = payment.amount_total;

      for (const item of orderDetails.items) {
        if (item.pointReward) {
          const points = new Decimal(item.price).div(0.005).toNumber();
          spentPoints = points;
        }
      }

      const earnedPoints = Math.floor(totalPrice / 5);

      const lifetimeRewardPoints =
        (user?.lifetimeRewardPoints ?? 0) + earnedPoints;

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

      let adjustedDatetimeToPickup = new Date(orderDetails.datetimeToPickUp);

      // add 20 minutes to current time if order is ASAP
      if (orderDetails.isASAP) {
        adjustedDatetimeToPickup = new Date();
        adjustedDatetimeToPickup.setMinutes(
          adjustedDatetimeToPickup.getMinutes() + 20,
        );
      }

      const orderData = {
        stripeSessionId: payment.id,
        datetimeToPickup: adjustedDatetimeToPickup,
        firstName: customerMetadata.firstName,
        lastName: customerMetadata.lastName,
        email: customerMetadata.email,
        phoneNumber: customerMetadata.phoneNumber ?? null,
        dietaryRestrictions: user?.dietaryRestrictions ?? null,
        includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
        prevRewardsPoints: prevPoints,
        earnedRewardsPoints: earnedPoints,
        spentRewardsPoints: spentPoints,
        userId: user ? user.userId : null,
        orderItems: {
          create: orderItemsData, // Nested array for order items and their customizations
        },
      };

      const order = await prisma.order.create({
        data: orderData,
      });

      // 3.5) set any reward discount to inactive if it was used
      // if (orderDetails.rewardBeingRedeemed) {
      //   await prisma.discount.update({
      //     where: {
      //       id: orderDetails.rewardBeingRedeemed.reward.id,
      //     },
      //     data: {
      //       active: false,
      //     },
      //   });
      // }

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

      // 4) if user exists, update user rewards points + reset their currentOrder

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

        function getTodayAtMidnight() {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return today;
        }

        await prisma.user.update({
          where: {
            userId: payment.metadata.userId,
          },
          data: {
            rewardsPoints: prevPoints + earnedPoints - spentPoints,
            lifetimeRewardPoints,
            currentOrder: {
              datetimeToPickUp: getTodayAtMidnight(),
              isASAP: false,
              items: [],
              includeNapkinsAndUtensils: false,
              discountId: null,
            },
          },
        });
      }

      // TODO: remove/uncomment this depending on if using STAR cloudPRNT solution
      // 5) add order to print queue model in database
      // await prisma.orderPrintQueue.create({
      //   data: {
      //     orderId: order.id,
      //   },
      // });

      // 6) send email receipt (if allowed) to user
      if (user?.allowsEmailReceipts) {
        await SendEmailReceipt({
          // email: customerMetadata.email,
          order,
          orderDetails,
          userIsAMember: true,
        });
      }

      // check if customer email is on do not email blacklist in database
      else {
        const emailBlacklistValue = await prisma.blacklistedEmail.findFirst({
          where: {
            emailAddress: customerMetadata.email,
          },
        });

        if (!emailBlacklistValue) {
          await SendEmailReceipt({
            // email: customerMetadata.email,
            order,
            orderDetails,
            userIsAMember: false,
          });
        }
      }

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

interface SendEmailReceipt {
  order: {
    id: string;
    datetimeToPickup: Date;
    firstName: string;
    lastName: string;
    email: string;
    includeNapkinsAndUtensils: boolean;
  };
  orderDetails: {
    items: {
      id: string;
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
        id: order.id,
        datetimeToPickup: order.datetimeToPickup,
        pickupName: `${order.firstName} ${order.lastName}`,
        includeNapkinsAndUtensils: order.includeNapkinsAndUtensils,
        items: orderDetails.items,
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
