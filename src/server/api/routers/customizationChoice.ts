import {
  type CustomizationCategory,
  type CustomizationChoice,
} from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export type CustomizationChoiceAndCategory = CustomizationChoice & {
  customizationCategory: CustomizationCategory;
};

export const customizationChoiceRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const customizationChoices = await ctx.prisma.customizationChoice.findMany({
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

    return formattedCustomizationChoices;
  }),
});
