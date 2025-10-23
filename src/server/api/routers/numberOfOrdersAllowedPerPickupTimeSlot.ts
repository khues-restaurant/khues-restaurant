import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";

export const numberOfOrdersAllowedPerPickupTimeSlotRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.numberOfOrdersAllowedPerPickupTimeSlot.findFirst({
      where: {
        id: 1,
      },
    });
  }),
  set: adminProcedure
    .input(
      z.object({
        value: z.number().int().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.numberOfOrdersAllowedPerPickupTimeSlot.update({
        where: {
          id: 1,
        },
        data: {
          value: input.value,
        },
      });
    }),
});
