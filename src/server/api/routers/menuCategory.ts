import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const menuCategoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const menuCategories = await ctx.prisma.menuCategory.findMany({
      include: {
        menuItems: true,
      },
    });

    return menuCategories;
  }),
});
