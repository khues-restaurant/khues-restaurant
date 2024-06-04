import { toZonedTime } from "date-fns-tz";

const holidays = [
  new Date("2024-12-25"),
  new Date("2024-12-26"),
  new Date("2025-01-01"),
];

function isSundayOrMonday(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 1;
}

function isHoliday(date: Date, holidays: Date[]) {
  const dateString = date.toISOString().split("T")[0]; // Converts date to YYYY-MM-DD format
  return holidays.some(
    (holiday) => holiday.toISOString().split("T")[0] === dateString,
  );
}

export function loopToFindFirstOpenDay(datetimeToPickup: Date) {
  const localDatetimeToPickup = toZonedTime(
    datetimeToPickup,
    "America/Chicago",
  );

  // returning early if the date is already on a valid day
  if (
    !isSundayOrMonday(localDatetimeToPickup) &&
    !isHoliday(localDatetimeToPickup, holidays)
  ) {
    return localDatetimeToPickup;
  }

  localDatetimeToPickup.setHours(0, 0, 0, 0); // Normalize to midnight for consistent comparison

  // Check and adjust for Sundays, Mondays, and Holidays
  while (
    isSundayOrMonday(localDatetimeToPickup) ||
    isHoliday(localDatetimeToPickup, holidays)
  ) {
    localDatetimeToPickup.setDate(localDatetimeToPickup.getDate() + 1); // Move to the next day
  }

  return localDatetimeToPickup;
}
