import { type Discount } from "@prisma/client";
import { z } from "zod";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import {
  type FilteredMenuCategory,
  type RewardCategoriesResponse,
} from "~/server/api/routers/menuCategory";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const storeDBQueriesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const menuCategories = await ctx.prisma.menuCategory.findMany({
        where: {
          active: true,
        },
        include: {
          activeDiscount: true,
          menuItems: {
            include: {
              activeDiscount: true,
              customizationCategories: {
                include: {
                  customizationCategory: {
                    include: {
                      customizationChoices: {
                        orderBy: {
                          listOrder: "asc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          listOrder: "asc",
        },
      });

      // filter out the "extra" field for "customizationCategory" for each menu item
      const filteredMenuCategories = menuCategories.map((category) => {
        return {
          ...category,
          menuItems: category.menuItems.map((item) => {
            return {
              ...item,
              customizationCategories: item.customizationCategories.map(
                (category) => {
                  return category.customizationCategory;
                },
              ),
            };
          }),
        };
      });

      /////////////////////////////////////////////////////////

      const customizationChoices =
        await ctx.prisma.customizationChoice.findMany({
          include: {
            customizationCategory: true,
          },
        });

      const formattedCustomizationChoices = customizationChoices.reduce(
        (acc, choice) => {
          acc[choice.id] = choice;
          return acc;
        },
        {} as Record<string, CustomizationChoiceAndCategory>,
      );

      /////////////////////////////////////////////////////////

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

      /////////////////////////////////////////////////////////

      // reusing the filteredMenuCategories from above to avoid a redundant query

      let rewardMenuCategories = filteredMenuCategories.filter((category) => {
        return category.menuItems.some((item) => item.pointReward);
      });

      // filter further to only include the relevant reward items from each category
      rewardMenuCategories = rewardMenuCategories.map((category) => {
        return {
          ...category,
          menuItems: category.menuItems.filter((item) => item.pointReward),
        };
      });

      let birthdayMenuCategories = filteredMenuCategories.filter((category) => {
        return category.menuItems.some((item) => item.birthdayReward);
      });

      // filter further to only include the relevant reward items from each category
      birthdayMenuCategories = birthdayMenuCategories.map((category) => {
        return {
          ...category,
          menuItems: category.menuItems.filter((item) => item.birthdayReward),
        };
      });

      /////////////////////////////////////////////////////////

      const favoriteItemIds = await ctx.prisma.favoriteItem.findMany({
        where: {
          userId: input.userId,
        },
        select: {
          menuItemId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const userFavoriteItemIds = favoriteItemIds.map(
        (favoriteItem) => favoriteItem.menuItemId,
      );

      return {
        menuCategories: filteredMenuCategories as FilteredMenuCategory[],
        customizationChoices: formattedCustomizationChoices,
        discounts: formattedDiscounts,
        rewardMenuCategories: {
          rewardMenuCategories,
          birthdayMenuCategories,
        } as RewardCategoriesResponse,
        userFavoriteItemIds,
      };
    }),
});
