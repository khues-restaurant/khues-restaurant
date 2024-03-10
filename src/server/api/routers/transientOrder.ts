import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const transientOrderRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        details: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.transientOrder.upsert({
        where: {
          userId: input.userId,
        },
        create: {
          userId: input.userId,
          // @ts-expect-error details is just json object
          details: input.details as unknown as Record<string, unknown>,
        },
        update: {
          // @ts-expect-error details is just json object
          details: input.details as unknown as Record<string, unknown>,
        },
      });
    }),

  get: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      return ctx.prisma.transientOrder.findFirst({
        where: {
          userId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: userId }) => {
      return ctx.prisma.transientOrder.delete({
        where: {
          userId,
        },
      });
    }),
});
