import { type Review } from "@prisma/client";
import { z } from "zod";
import {
  orderSummaryInclude,
  transformOrderToSummary,
  type OrderSummaryWithRelations,
} from "~/server/api/routers/order";
import { type DBOrderSummary } from "~/types/orderSummary";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export type DashboardReview = Review & {
  user: {
    firstName: string;
    lastName: string;
  } | null;
  order: DBOrderSummary;
};

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        orderId: z.string().min(1).max(100),
        message: z.string().min(1).max(1000),
        allowedToBePublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      await ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          userLeftFeedback: true,
        },
      });

      return ctx.prisma.review.create({
        data: {
          userId: input.userId,
          orderId: input.orderId,
          message: input.message,
          allowedToBePublic: input.allowedToBePublic,
        },
      });
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.review.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        order: {
          include: orderSummaryInclude,
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (!reviews) return null;

    const transformedReviews = reviews.map((review) => ({
      ...review,
      order: transformOrderToSummary(review.order as OrderSummaryWithRelations),
    }));

    return transformedReviews as DashboardReview[];
  }),
});
