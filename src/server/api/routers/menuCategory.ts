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
});
