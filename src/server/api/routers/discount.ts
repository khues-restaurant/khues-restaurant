import { type Discount } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const discountRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const discounts = await ctx.prisma.discount.findMany({
      where: {
        active: true,
        expirationDate: {
          gte: new Date(),
        },
        userId: null,
        menuItem: undefined, // assuming that we are most likely not doing the category/item %/bogo discounts
        menuCategory: undefined, // assuming that we are most likely not doing the category/item %/bogo discounts
      },
    });

    const formattedDiscounts = discounts.reduce(
      (acc, discount) => {
        acc[discount.id] = discount;
        return acc;
      },
      {} as Record<string, Discount>,
    );

    return formattedDiscounts;
  }),

  getUserRewards: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      const discounts = await ctx.prisma.discount.findMany({
        where: {
          userId,
          active: true,
          expirationDate: {
            gte: new Date(),
          },
        },
      });

      const formattedRewards = discounts.reduce(
        (acc, discount) => {
          acc[discount.id] = discount;
          return acc;
        },
        {} as Record<string, Discount>,
      );

      return formattedRewards;
    }),

  createCategoryDiscount: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        expirationDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // create a new discount
      const discount = await ctx.prisma.discount.create({
        data: {
          name: input.name,
          description: input.description,
          expirationDate: input.expirationDate,
          active: true,
        },
      });

      // set the activeDiscount field of the menu category to the new discount
      await ctx.prisma.menuCategory.update({
        where: {
          id: input.id,
        },
        data: {
          activeDiscountId: discount.id,
        },
      });

      // loop through all menu items and add the discount to the activeDiscount field
      // of the menu items
      const menuItems = await ctx.prisma.menuItem.findMany({
        where: {
          menuCategoryId: input.id,
        },
      });

      for (const menuItem of menuItems) {
        await ctx.prisma.menuItem.update({
          where: {
            id: menuItem.id,
          },
          data: {
            activeDiscountId: discount.id,
          },
        });
      }

      // update all user's "showRewardsDiscountNotification" field to true
      await ctx.prisma.user.updateMany({
        data: {
          showRewardsDiscountNotification: true,
        },
      });
    }),

  createItemDiscount: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        name: z.string(),
        description: z.string(),
        expirationDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // loop through all menu item ids and add the discount to the
      // corresponding menuItem activeDiscount field
      for (const id of input.ids) {
        await ctx.prisma.menuItem.update({
          where: {
            id,
          },
          data: {
            activeDiscount: {
              create: {
                name: input.name,
                description: input.description,
                expirationDate: input.expirationDate,
                active: true,
              },
            },
          },
        });
      }

      // update all user's "showRewardsDiscountNotification" field to true
      await ctx.prisma.user.updateMany({
        data: {
          showRewardsDiscountNotification: true,
        },
      });
    }),
});
