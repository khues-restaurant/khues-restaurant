import { type Review } from "@prisma/client";
import { z } from "zod";
import { type DBOrderSummary } from "~/server/api/routers/order";

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
          include: {
            orderItems: {
              include: {
                customizations: true,
                discount: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (!reviews) return null;

    // Iterate over each order to transform the item customizations
    // into a Record<string, string> for each order's items
    const transformedReviews = reviews.map((review) => {
      review.order.orderItems = review.order.orderItems.map((item) => {
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

      return review;
    });

    // @ts-expect-error asdf
    return transformedReviews as DashboardReview[];
  }),
});
