import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const orderPrintQueueRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reprintedOrder = await ctx.prisma.orderPrintQueue.create({
        data: {
          orderId: input.orderId,
        },
      });

      return reprintedOrder;
    }),
});
