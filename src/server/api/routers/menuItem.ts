import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const menuItemRouter = createTRPCRouter({
  changeAvailability: adminProcedure
    .input(z.object({ id: z.string(), available: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const menuCategories = await ctx.prisma.menuItem.update({
        where: {
          id: input.id,
        },
        data: {
          available: input.available,
        },
      });

      return menuCategories;
    }),
});
