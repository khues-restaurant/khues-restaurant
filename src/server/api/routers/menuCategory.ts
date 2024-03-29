import { MenuCategory, MenuItem } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface Discount {
  // Assuming a structure for Discount, add properties as needed
  id: string;
  name: string;
  description: string;
  expirationDate: Date;
  active: boolean;
  userId: string | null;
}

interface CustomizationChoice {
  id: string;
  name: string;
  description: string;
  priceAdjustment: number;
  // Assuming the existence of a field to link back to CustomizationCategory if necessary
  customizationCategoryId: string;
}

export interface StoreCustomizationCategory {
  id: string;
  name: string;
  description: string;
  defaultChoiceId: string;
  customizationChoice: CustomizationChoice[];
}

export interface FullMenuItem {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  ingredientsPrice: number;
  available: boolean;
  discontinued: boolean;
  chefsChoice: boolean;
  listOrder: number;
  menuCategoryId: string;
  activeDiscount: Discount | null;
  activeDiscountId: string | null;
  customizationCategory: StoreCustomizationCategory[];
}

// interface MenuCategory {
//   id: string;
//   createdAt: Date;
//   name: string;
//   active: boolean;
//   listOrder: number;
//   menuItems: MenuItem[];
//   activeDiscount?: Discount;
// }

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
            customizationCategory: {
              include: {
                customizationChoice: true,
              },
            },
          },
        },
      },
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
            customizationCategory: {
              include: {
                customizationChoice: true,
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
