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

  changeAvailability: protectedProcedure
    .input(z.object({ id: z.string(), isAvailable: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const menuCategories = await ctx.prisma.customizationChoice.update({
        where: {
          id: input.id,
        },
        data: {
          isAvailable: input.isAvailable,
        },
      });

      return menuCategories;
    }),
});
