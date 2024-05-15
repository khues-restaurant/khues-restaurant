import {
  type MenuCategory,
  type CustomizationCategory,
  type CustomizationChoice,
  type Discount,
  type MenuItem,
} from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export type StoreCustomizationCategory = CustomizationCategory & {
  customizationChoices: CustomizationChoice[];
};

export type FullMenuItem = MenuItem & {
  activeDiscount: Discount | null;
  customizationCategories: StoreCustomizationCategory[];
};

export type FilteredMenuCategory = MenuCategory & {
  activeDiscount: Discount | null;
  menuItems: FullMenuItem[];
};

// any validity of these copilot generated skeleton types here?
// type RewardItem = {
//   // Include properties of the reward item here
// };

// type MenuCategory = {
//   // Include properties of the menu category here
//   menuItems: RewardItem[];
// };

// type GetRewardsCategoriesResult = {
//   rewardMenuCategories: MenuCategory[];
//   birthdayMenuCategories: MenuCategory[];
// };

export const menuCategoryRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ onlyOnlineOrderable: z.boolean() }).optional())
    .query(async ({ ctx, input }) => {
      const menuCategories = await ctx.prisma.menuCategory.findMany({
        where: {
          active: true,
          ...(input?.onlyOnlineOrderable ? { orderableOnline: true } : {}),
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

      return filteredMenuCategories as FilteredMenuCategory[];
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

    let rewardMenuCategories = filteredMenuCategories.filter((category) => {
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

    let birthdayMenuCategories = filteredMenuCategories.filter((category) => {
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
