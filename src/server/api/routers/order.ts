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

export const orderRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      return ctx.prisma.order.findFirst({
        where: {
          id,
        },
      });
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
  // getTodaysOrders: protectedProcedure.query(async ({ ctx }) => {
  //   return ctx.prisma.order.findMany({
  //     // TODO: uncomment this for production
  //     // where: {
  //     //   datetimeToPickup: {
  //     //     gte: new Date(new Date().setHours(0, 0, 0, 0)),
  //     //     lte: new Date(new Date().setHours(23, 59, 59, 999)),
  //     //   },
  //     // },
  //     include: {
  //       orderItems: {
  //         include: {
  //           // customizations: {
  //           //   include: {
  //           //     orderItem: true,
  //           //     customizationChoice: true,
  //           //     customizationCategory: true,
  //           //   },
  //           // },
  //           // menuItem: {
  //           //   include: {
  //           //     activeDiscount: true,
  //           //     customizationCategory: {
  //           //       include: {
  //           //         customizationChoice: true,
  //           //       },
  //           //     },
  //           //   },
  //           // },
  //           customizations: true,
  //           discount: true,
  //           menuItem: true,
  //           order: true,
  //         },
  //       },
  //     },
  //   });
  // }),

  // prob don't want this below:
  // menuItem: {
  //   include: {
  //     menuCategory: true,
  //     activeDiscount: true,
  //     customizationCategory: {
  //       include: {
  //         customizationChoice: true,
  //       },
  //     },
  //   },
  // },

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
