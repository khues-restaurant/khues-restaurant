import { TRPCError } from "@trpc/server";
import { addDays } from "date-fns";
import { z } from "zod";
import { stripe } from "./payment";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";

const REFUND_ORDER_INCLUDE = {
  orderItems: {
    include: {
      customizations: true,
      discount: true,
    },
  },
} as const;

export const refundRouter = createTRPCRouter({
  getOrdersByDate: adminProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startOfDayUtc = getMidnightCSTInUTC(input.date);
      const endOfDayUtc = addDays(startOfDayUtc, 1);

      const orders = await ctx.prisma.order.findMany({
        where: {
          datetimeToPickup: {
            gte: startOfDayUtc,
            lt: endOfDayUtc,
          },
        },
        include: REFUND_ORDER_INCLUDE,
        orderBy: {
          createdAt: "desc",
        },
      });

      return orders;
    }),

  getOrdersByCustomerName: adminProcedure
    .input(
      z.object({
        query: z.string().min(2).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const trimmedQuery = input.query.trim();

      if (trimmedQuery.length === 0) {
        return [];
      }

      const terms = trimmedQuery.split(/\s+/);

      const orders = await ctx.prisma.order.findMany({
        where: {
          AND: terms.map((term) => ({
            OR: [
              {
                firstName: {
                  contains: term,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: term,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: term,
                  mode: "insensitive",
                },
              },
            ],
          })),
        },
        include: REFUND_ORDER_INCLUDE,
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });

      return orders;
    }),

  refundOrder: adminProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
        reason: z
          .enum(["duplicate", "fraudulent", "requested_by_customer"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        include: REFUND_ORDER_INCLUDE,
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });
      }

      if (order.orderRefundedAt) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Order has already been refunded.",
        });
      }

      if (!order.stripeSessionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order is missing Stripe session information.",
        });
      }

      const session = await stripe.checkout.sessions.retrieve(
        order.stripeSessionId,
      );

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!paymentIntentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unable to locate payment intent for this order.",
        });
      }

      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: input.reason,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe refund failed. Please try again.",
          cause: error,
        });
      }

      // Making sure that the order is removed from the "in progress" list
      // on <OrderManagement> if it was refunded.
      const updatedOrderStartedAt = order.orderStartedAt ?? new Date();
      const updatedOrderCompletedAt = order.orderCompletedAt ?? new Date();

      const updatedOrder = await ctx.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          orderRefundedAt: new Date(),
          orderRefundReason: input.reason,
          orderStartedAt: updatedOrderStartedAt,
          orderCompletedAt: updatedOrderCompletedAt,
        },
        include: REFUND_ORDER_INCLUDE,
      });

      return updatedOrder;
    }),
});
