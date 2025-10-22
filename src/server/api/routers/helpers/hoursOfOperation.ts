import { type HoursOfOperation as HoursOfOperationRecord } from "@prisma/client";

export const DAY_OF_WEEK_ORDER = [0, 1, 2, 3, 4, 5, 6] as const;

export type DayOfWeek = (typeof DAY_OF_WEEK_ORDER)[number];

export type NormalizedHours = {
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

export function coerceToNormalizedHours(
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
