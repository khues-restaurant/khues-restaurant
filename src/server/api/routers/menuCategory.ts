import {
  type CustomizationCategory,
  type CustomizationChoice,
  type Discount,
  type MenuItem,
  type SuggestedPairing,
} from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

type StoreSuggestedPairing = SuggestedPairing & {
  foodMenuItem: MenuItem;
  drinkMenuItem: MenuItem;
};

export type StoreCustomizationCategory = CustomizationCategory & {
  customizationChoices: CustomizationChoice[];
};

export type FullMenuItem = MenuItem & {
  activeDiscount: Discount | null;
  customizationCategories: StoreCustomizationCategory[];
  suggestedPairings: StoreSuggestedPairing[];
  suggestedWith: StoreSuggestedPairing[];
};

export const menuCategoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
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
                customizationChoices: true,
              },
            },
            suggestedPairings: {
              include: {
                drinkMenuItem: true,
              },
            },
            suggestedWith: {
              include: {
                foodMenuItem: true,
              },
            },
          },
        },
      },
      // Is there any use case for ordering the menu categories?
      // orderBy: {
      //   listOrder: "asc",
      // },
    });

    return menuCategories;
  }),

  getRewardsCategories: publicProcedure.query(async ({ ctx }) => {
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
                customizationChoices: true,
              },
            },
            suggestedPairings: {
              include: {
                drinkMenuItem: true,
              },
            },
            suggestedWith: {
              include: {
                foodMenuItem: true,
              },
            },
          },
        },
      },
    });

    let rewardMenuCategories = menuCategories.filter((category) => {
      return category.menuItems.some(
        (item) => item.isRewardItem && category.name !== "Desserts",
      );
    });

    // filter further to only include the relevant reward items from each category
    rewardMenuCategories = rewardMenuCategories.map((category) => {
      return {
        ...category,
        menuItems: category.menuItems.filter((item) => item.isRewardItem),
      };
    });

    let birthdayMenuCategories = menuCategories.filter((category) => {
      return category.menuItems.some(
        (item) => item.isRewardItem && category.name === "Desserts",
      );
    });

    // filter further to only include the relevant reward items from each category
    birthdayMenuCategories = birthdayMenuCategories.map((category) => {
      return {
        ...category,
        menuItems: category.menuItems.filter(
          (item) => item.isRewardItem && category.name === "Desserts",
        ),
      };
    });

    return {
      rewardMenuCategories,
      birthdayMenuCategories,
    };
  }),
});
