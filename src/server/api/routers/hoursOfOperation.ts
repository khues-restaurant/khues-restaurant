import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import {
  coerceToNormalizedHours,
  type DayOfWeek,
  type NormalizedHours,
} from "./helpers/hoursOfOperation";

const dayHoursSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6),
  openHour: z.number().int().min(0).max(23),
  openMinute: z.number().int().min(0).max(59),
  closeHour: z.number().int().min(0).max(23),
  closeMinute: z.number().int().min(0).max(59),
  isClosedAllDay: z.boolean(),
});

export const hoursOfOperationRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    const records = await ctx.prisma.hoursOfOperation.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return coerceToNormalizedHours(records);
  }),

  upsertWeek: adminProcedure
    .input(
      z.object({
        hours: z.array(dayHoursSchema).length(7),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const validatedHours = input.hours.map((entry) => {
        const sanitized = {
          id: entry.id ?? null,
          dayOfWeek: entry.dayOfWeek as DayOfWeek,
          openHour: entry.isClosedAllDay ? 0 : entry.openHour,
          openMinute: entry.isClosedAllDay ? 0 : entry.openMinute,
          closeHour: entry.isClosedAllDay ? 0 : entry.closeHour,
          closeMinute: entry.isClosedAllDay ? 0 : entry.closeMinute,
          isClosedAllDay: entry.isClosedAllDay,
        } satisfies NormalizedHours;

        if (!sanitized.isClosedAllDay) {
          const opensAt = sanitized.openHour * 60 + sanitized.openMinute;
          const closesAt = sanitized.closeHour * 60 + sanitized.closeMinute;

          if (closesAt <= opensAt) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Closing time must be later than opening time.",
            });
          }
        }

        return sanitized;
      });

      await ctx.prisma.$transaction(
        validatedHours.map((entry) => {
          const data = {
            dayOfWeek: entry.dayOfWeek,
            openHour: entry.openHour,
            openMinute: entry.openMinute,
            closeHour: entry.closeHour,
            closeMinute: entry.closeMinute,
            isClosedAllDay: entry.isClosedAllDay,
          };

          if (entry.id) {
            return ctx.prisma.hoursOfOperation.update({
              where: { id: entry.id },
              data,
            });
          }

          return ctx.prisma.hoursOfOperation.create({
            data,
          });
        }),
      );

      const records = await ctx.prisma.hoursOfOperation.findMany({
        orderBy: {
          dayOfWeek: "asc",
        },
      });

      return coerceToNormalizedHours(records);
    }),
});
