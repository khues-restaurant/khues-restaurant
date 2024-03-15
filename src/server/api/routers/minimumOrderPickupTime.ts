import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const minimumOrderPickupTimeRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.minimumOrderPickupTime.findFirst({
      where: {
        id: 1,
      },
    });
  }),
  set: protectedProcedure.input(z.date()).mutation(async ({ ctx, input }) => {
    return ctx.prisma.minimumOrderPickupTime.update({
      where: {
        id: 1,
      },
      data: {
        value: input,
      },
    });
  }),
});
