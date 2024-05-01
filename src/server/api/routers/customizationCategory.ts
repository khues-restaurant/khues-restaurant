import {
  type CustomizationCategory,
  type CustomizationChoice,
} from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export type CustomizationChoiceAndCategory = CustomizationChoice & {
  customizationCategory: CustomizationCategory;
};

export const customizationCategoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const customizationChoices =
      await ctx.prisma.customizationCategory.findMany({
        include: {
          customizationChoices: {
            orderBy: {
              listOrder: "asc",
            },
          },
        },
      });

    return customizationChoices;
  }),
});
