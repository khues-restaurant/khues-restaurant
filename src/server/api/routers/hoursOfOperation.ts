import { type HoursOfOperation as HoursOfOperationRecord } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const DAY_OF_WEEK_ORDER = [0, 1, 2, 3, 4, 5, 6] as const;

type DayOfWeek = (typeof DAY_OF_WEEK_ORDER)[number];

type NormalizedHours = {
  id: string | null;
  dayOfWeek: DayOfWeek;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  isClosedAllDay: boolean;
};

const DEFAULT_WEEKLY_HOURS: Record<
  DayOfWeek,
  Omit<NormalizedHours, "dayOfWeek" | "id">
> = {
  0: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  1: {
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
    isClosedAllDay: true,
  },
  2: {
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
    isClosedAllDay: true,
  },
  3: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  4: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  5: {
    openHour: 16,
    openMinute: 30,
    closeHour: 22,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  6: {
    openHour: 16,
    openMinute: 30,
    closeHour: 22,
    closeMinute: 0,
    isClosedAllDay: false,
  },
};

const dayHoursSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6),
  openHour: z.number().int().min(0).max(23),
  openMinute: z.number().int().min(0).max(59),
  closeHour: z.number().int().min(0).max(23),
  closeMinute: z.number().int().min(0).max(59),
  isClosedAllDay: z.boolean(),
});

function coerceToNormalizedHours(
  records: HoursOfOperationRecord[],
): NormalizedHours[] {
  const mapped = new Map<DayOfWeek, HoursOfOperationRecord>();

  for (const record of records) {
    mapped.set(record.dayOfWeek as DayOfWeek, record);
  }

  return DAY_OF_WEEK_ORDER.map((day) => {
    const existing = mapped.get(day);

    if (!existing) {
      const defaults = DEFAULT_WEEKLY_HOURS[day];

      return {
        id: null,
        dayOfWeek: day,
        ...defaults,
      } satisfies NormalizedHours;
    }

    return {
      id: existing.id,
      dayOfWeek: existing.dayOfWeek as DayOfWeek,
      openHour: existing.openHour,
      openMinute: existing.openMinute,
      closeHour: existing.closeHour,
      closeMinute: existing.closeMinute,
      isClosedAllDay: existing.isClosedAllDay,
    } satisfies NormalizedHours;
  });
}

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
