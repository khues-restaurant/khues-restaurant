import { toZonedTime } from "date-fns-tz";

export function getMidnightDate(date: Date) {
  // Create a new Date instance to avoid modifying the original date
  const newDate = toZonedTime(new Date(date.getTime()), "America/Chicago");
  newDate.setHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison
  return newDate;
}
