import { type Discount } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const discountRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const discounts = await ctx.prisma.discount.findMany();

    const formattedDiscounts = discounts.reduce(
      (acc, discount) => {
        acc[discount.id] = discount;
        return acc;
      },
      {} as Record<string, Discount>,
    );

    return formattedDiscounts;
  }),
});
