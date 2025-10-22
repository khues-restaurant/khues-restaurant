export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayOperatingHours {
  id: string | null;
  dayOfWeek: DayOfWeek;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  isClosedAllDay: boolean;
}

export type WeekOperatingHours = DayOperatingHours[];

export interface HolidayDefinition {
  id: string;
  date: Date;
  isRecurringAnnual: boolean;
}

export type HolidayList = HolidayDefinition[];
