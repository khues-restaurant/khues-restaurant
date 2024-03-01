import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

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
  getTodaysOrders: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.order.findMany({
      // TODO once we have a datetimeToPickUp field, use this
      // where: {
      //   datetimeToPickUp: {
      //     gte: new Date(new Date().setHours(0, 0, 0, 0)),
      //     lte: new Date(new Date().setHours(23, 59, 59, 999)),
      //   },
      // },
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
