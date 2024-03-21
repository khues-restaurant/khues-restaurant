import { type Order, type OrderItem } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

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

  status: string; // better types?
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

export type DBOrderSummary = Order & {
  orderItems: DBOrderSummaryItem[];
};

export type DBOrderSummaryItem = OrderItem & {
  customizations: Record<string, string>;
  discount: Discount | null;
};

export const orderRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const order = await ctx.prisma.order.findFirst({
        where: {
          id,
        },
        include: {
          orderItems: {
            include: {
              customizations: true,
              discount: true,
            },
          },
        },
      });

      if (!order) return null;

      // turn the item customizations into a Record<string, string>
      // for easier access in the frontend
      order.orderItems = order.orderItems.map((item) => {
        // @ts-expect-error asdf
        item.customizations = item.customizations.reduce(
          (acc, customization) => {
            acc[customization.customizationCategoryId] =
              customization.customizationChoiceId;
            return acc;
          },
          {} as Record<string, string>,
        );

        return item;
      });

      // @ts-expect-error asdf
      return order as DBOrderSummary;
    }),

  // TODO: technically want this to be infinite scroll
  getUsersRecentOrders: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      const recentOrders = await ctx.prisma.order.findMany({
        where: {
          userId,
        },
        include: {
          orderItems: {
            include: {
              customizations: true,
              discount: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!recentOrders) return null;

      // Iterate over each order to transform the item customizations
      // into a Record<string, string> for each order's items
      const transformedOrders = recentOrders.map((order) => {
        order.orderItems = order.orderItems.map((item) => {
          // @ts-expect-error asdf
          item.customizations = item.customizations.reduce(
            (acc, customization) => {
              acc[customization.customizationCategoryId] =
                customization.customizationChoiceId;
              return acc;
            },
            {} as Record<string, string>,
          );

          return item;
        });

        return order;
      });

      // @ts-expect-error asdf
      return transformedOrders as DBOrderSummary[];
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

  getTodaysOrders: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.order.findMany({
      // Uncomment and adjust according to your requirements
      // where: {
      //   datetimeToPickup: {
      //     gte: new Date(new Date().setHours(0, 0, 0, 0)),
      //     lte: new Date(new Date().setHours(23, 59, 59, 999)),
      //   },
      // },
      include: {
        orderItems: {
          include: {
            customizations: true,
          },
        },
      },
    });
  }),
  startOrder: protectedProcedure
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

      // send out socket.io event if it works in trpc here
    }),
  completeOrder: protectedProcedure
    .input(z.object({ id: z.string(), customerEmail: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          orderCompletedAt: new Date(),
        },
      });

      // send out socket.io event if it works in trpc here

      // send out email to user's email
    }),
});
