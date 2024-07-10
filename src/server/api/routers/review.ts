import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

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
    return ctx.prisma.review.findMany({
      include: {
        order: true, // TODO: prob need the customizations here too but not right now
      },
    });
  }),
});
