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

export function getFirstValidMidnightDate(orderDatetimeToPickup?: Date) {
  // currently, every use of this function is to just get the (next) first valid midnight date, however if orderDatetimeToPickup is passed in, it will be used instead to check if the current order's datetimeToPickup is valid. When reordering, we explicitly do *NOT* send over the previous order's datetimeToPickup since we always want the user to explicitly choose a new datetimeToPickup.

  let datetimeToPickup = orderDatetimeToPickup
    ? toZonedTime(orderDatetimeToPickup, "America/Chicago")
    : toZonedTime(new Date(), "America/Chicago");

  const now = toZonedTime(new Date(), "America/Chicago");
  now.setHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison

  // If datetimeToPickup is in the past, adjust it to midnight today
  if (datetimeToPickup <= now) {
    datetimeToPickup = now;
  }

  // Check and adjust for Sundays, Mondays, and Holidays
  while (
    isSundayOrMonday(datetimeToPickup) ||
    isHoliday(datetimeToPickup, holidays)
  ) {
    datetimeToPickup.setDate(datetimeToPickup.getDate() + 1); // Move to the next day
  }

  return datetimeToPickup;
}
