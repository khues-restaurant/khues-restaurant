import {
  Prisma,
  type Discount as DBDiscount,
  type GiftCard,
  type GiftCardTransaction,
} from "@prisma/client";
import { addDays, addMonths } from "date-fns";
import OrderReady from "emails/OrderReady";
import { Resend } from "resend";
import { z } from "zod";
import { env } from "~/env";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { io } from "socket.io-client";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type Decimal from "decimal.js";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import {
  type DBOrderSummary,
  type DBOrderSummaryItem,
  type OrderAppliedGiftCard,
} from "~/types/orderSummary";

const resend = new Resend(env.RESEND_API_KEY);

interface CustomizationChoice {
  id: string;
  name: string;
  description: string;
  priceAdjustment: number;

  customizationCategoryId: string;
}

interface CustomizationCategory {
  id: string;
  name: string;
  description: string;
  defaultChoiceId: string;

  customizationChoice: CustomizationChoice[];
}

interface Discount {
  id: string;
  name: string;
  description: string;
  expirationDate: Date;
  active: boolean;
}

interface OrderItemCustomization {
  id: string;
  customizationChoice: CustomizationChoice;
  customizationCategory: CustomizationCategory;
}

export interface DashboardOrderItem {
  id: string;
  name: string;
  specialInstructions: string;
  includeDietaryRestrictions: boolean;
  quantity: number;
  price: number;
  customizations: OrderItemCustomization[];
  discount: Discount | null;
}

export interface DashboardOrder {
  id: string;
  createdAt: Date;
  orderStartedAt: Date | null;
  orderCompletedAt: Date | null;
  datetimeToPickup: Date;

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  includeNapkinsAndUtensils: boolean;

  orderItems: DashboardOrderItem[];

  prevRewardsPoints: number;
  rewardsPoints: number;

  stripeSessionId: string;

  userId: string | null;
}

type GiftCardTransactionWithCard = GiftCardTransaction & {
  giftCard: GiftCard;
};

export const orderSummaryInclude = {
  orderItems: {
    include: {
      customizations: true,
      discount: true,
    },
  },
  giftCardTransactions: {
    where: {
      type: "REDEMPTION",
    },
    include: {
      giftCard: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} as const;

export type OrderSummaryWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderSummaryInclude;
}>;

export function transformOrderToSummary(
  order: OrderSummaryWithRelations,
): DBOrderSummary {
  const orderItems = order.orderItems.map((item) => {
    const customizationsRecord = item.customizations.reduce(
      (acc, customization) => {
        acc[customization.customizationCategoryId] =
          customization.customizationChoiceId;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      ...item,
      customizations: customizationsRecord,
    };
  });

  const appliedGiftCards = order.giftCardTransactions
    .filter((transaction) => transaction.giftCard && transaction.amount !== 0)
    .map((transaction) => ({
      id: transaction.id,
      giftCardId: transaction.giftCard.id,
      code: transaction.giftCard.code,
      amount: Math.abs(transaction.amount),
    }));

  const { giftCardTransactions, ...baseOrder } = order;

  return {
    ...baseOrder,
    orderItems,
    appliedGiftCards,
  };
}

export const orderRouter = createTRPCRouter({
  // leverage this skeleton below to get the order details for the OrderReady stuff right?
  // legit just copy and paste

  getTimeslotUsage: publicProcedure
    .input(
      z.object({
        date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startOfDay = fromZonedTime(
        `${input.date}T00:00:00`,
        "America/Chicago",
      );
      const endOfDay = addDays(startOfDay, 1);

      const groupedOrders = await ctx.prisma.order.groupBy({
        by: ["datetimeToPickup"],
        where: {
          datetimeToPickup: {
            gte: startOfDay,
            lt: endOfDay,
          },
          orderRefundedAt: null,
        },
        _count: {
          _all: true,
        },
      });

      return groupedOrders.reduce(
        (acc, entry) => {
          const key = formatInTimeZone(
            entry.datetimeToPickup,
            "America/Chicago",
            "HH:mm",
          );

          acc[key] = entry._count._all;

          return acc;
        },
        {} as Record<string, number>,
      );
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const order = await ctx.prisma.order.findFirst({
        where: {
          id,
        },
        include: orderSummaryInclude,
      });

      if (!order) return null;

      return transformOrderToSummary(order);
    }),

  // TODO: technically want this to be infinite scroll
  getUsersOrders: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limitToFirstSix: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      const recentOrders = await ctx.prisma.order.findMany({
        where: {
          userId: input.userId,
        },
        include: orderSummaryInclude,
        orderBy: {
          datetimeToPickup: "desc",
        },
      });

      if (!recentOrders) return null;

      const transformedOrders = recentOrders.map(transformOrderToSummary);

      return transformedOrders.slice(
        0,
        input.limitToFirstSix ? 6 : transformedOrders.length,
      );
    }),

  getByStripeSessionId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: stripeSessionId }) => {
      return ctx.prisma.order.findFirst({
        where: {
          stripeSessionId,
        },
      });
    }),

  getDashboardOrders: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.order.findMany({
      where: {
        datetimeToPickup: {
          gte: getMidnightCSTInUTC(new Date()),
        },
      },
      include: {
        orderItems: {
          include: {
            customizations: true,
          },
        },
      },
    });
  }),
  startOrder: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          orderStartedAt: new Date(),
        },
      });

      const socket = io(env.SOCKET_IO_URL, {
        query: {
          userId: "startOrder", // this shouldn't actually be necessary, can probably remove later
        },
        secure: env.NODE_ENV === "production" ? true : false,
        retries: 3,
      });

      socket.on("connect", () => {
        console.log("Connected to socket.io server from webhook");

        socket.emit("orderStatusChanged", {
          orderId: input.id,
        });

        socket.close();
      });
    }),
  completeOrder: adminProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string().nullable(),
        customerEmail: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          orderCompletedAt: new Date(),
        },
      });

      const socket = io(env.SOCKET_IO_URL, {
        query: {
          userId: "completeOrder", // this shouldn't actually be necessary, can probably remove later
        },
        secure: env.NODE_ENV === "production" ? true : false,
        retries: 3,
      });

      socket.on("connect", () => {
        console.log("Connected to socket.io server from webhook");

        socket.emit("orderStatusChanged", {
          orderId: input.id,
        });

        socket.close();
      });

      // TODO: uncomment for production
      // const user = await ctx.prisma.user.findFirst({
      //   where: {
      //     email: input.customerEmail,
      //   },
      // });

      // // send email receipt (if allowed) to user
      // if (user?.allowsEmailReceipts) {
      //   const orderDetails = await queryForOrderDetails(input.id);

      //   if (orderDetails) {
      //     await SendOrderReadyEmail({
      //       order: {
      //         id: input.id,
      //         datetimeToPickup: orderDetails.datetimeToPickup,
      //         firstName: orderDetails.firstName,
      //         lastName: orderDetails.lastName,
      //         email: user.email,
      //         includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
      //       },
      //       orderDetails,
      //       userIsAMember: true,
      //     });
      //   }
      // }

      // // check if customer email is on do not email blacklist in database
      // else {
      //   const emailBlacklistValue = await prisma.blacklistedEmail.findFirst({
      //     where: {
      //       emailAddress: input.customerEmail,
      //     },
      //   });

      //   if (!emailBlacklistValue) {
      //     const orderDetails = await queryForOrderDetails(input.id);

      //     if (orderDetails) {
      //       await SendOrderReadyEmail({
      //         order: {
      //           id: input.id,
      //           datetimeToPickup: orderDetails.datetimeToPickup,
      //           firstName: orderDetails.firstName,
      //           lastName: orderDetails.lastName,
      //           email: input.customerEmail,
      //           includeNapkinsAndUtensils:
      //             orderDetails.includeNapkinsAndUtensils,
      //         },
      //         orderDetails,
      //         userIsAMember: false,
      //       });
      //     }
      //   }
      // }
    }),
});

async function queryForOrderDetails(orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: orderSummaryInclude,
  });

  if (!order) return null;

  return transformOrderToSummary(order);
}

interface SendOrderReadyEmail {
  order: Order;
  orderDetails: DBOrderSummary;
  userIsAMember: boolean;
}

async function SendOrderReadyEmail({
  order,
  orderDetails,
  userIsAMember,
}: SendOrderReadyEmail) {
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
    {} as Record<string, DBDiscount>,
  );

  const orderWithSummaryData: DBOrderSummary = {
    ...order,
    orderItems: orderDetails.orderItems,
    appliedGiftCards: orderDetails.appliedGiftCards,
  };

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "khues.dev@gmail.com", // order.email,
      subject: "Your order is ready for pickup!",
      react: OrderReady({
        order: orderWithSummaryData,
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
