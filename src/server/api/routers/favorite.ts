import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const favoriteRouter = createTRPCRouter({
  getFavoriteItemIds: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      const favoriteItemIds = await ctx.prisma.favoriteItem.findMany({
        where: {
          userId,
        },
        select: {
          menuItemId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return favoriteItemIds.map((favoriteItem) => favoriteItem.menuItemId);
    }),

  addFavoriteItem: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        menuItemId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      return ctx.prisma.favoriteItem.create({
        data: {
          ...input,
        },
      });
    }),

  removeFavoriteItem: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        menuItemId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      // technically this is safer(?) I guess because if there were multiple
      // favorite items with the same userId and menuItemId, it would delete all of them
      // but I don't know how that scenario would ever happen
      return ctx.prisma.favoriteItem.deleteMany({
        where: {
          userId: input.userId,
          menuItemId: input.menuItemId,
        },
      });
    }),
});
