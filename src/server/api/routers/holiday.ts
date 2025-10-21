import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const holidayInputSchema = z.object({
  date: z.date(),
  isRecurringAnnual: z.boolean().optional(),
});

export const holidayRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.holiday.findMany({
      orderBy: {
        date: "asc",
      },
    });
  }),

  add: adminProcedure
    .input(holidayInputSchema)
    .mutation(async ({ ctx, input }) => {
      const normalizedDate = new Date(input.date);
      normalizedDate.setHours(0, 0, 0, 0);

      try {
        const createdHoliday = await ctx.prisma.holiday.create({
          data: {
            date: normalizedDate,
            isRecurringAnnual: input.isRecurringAnnual ?? false,
          },
        });

        return createdHoliday;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A holiday already exists on the selected date.",
          });
        }

        throw error;
      }
    }),

  remove: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.holiday.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true } as const;
    }),
});
