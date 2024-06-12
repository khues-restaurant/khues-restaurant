import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay } from "date-fns";

function getMidnightCSTInUTC(date?: Date) {
  // Get the current date and time in UTC
  const initalDate = date ?? new Date();

  // Convert the current date and time to CST/CDT
  const cstDate = toZonedTime(initalDate, "America/Chicago");

  // Get the start of the day (midnight) in CST/CDT
  const startOfTodayCST = startOfDay(cstDate);

  // Convert the CST/CDT midnight time back to UTC
  const startOfTodayUTC = fromZonedTime(startOfTodayCST, "America/Chicago");

  return startOfTodayUTC;
}

function getCSTDateInUTC(date: Date) {
  const cstDate = toZonedTime(date, "America/Chicago");
  const utcDate = fromZonedTime(cstDate, "America/Chicago");

  return utcDate;
}

export { getMidnightCSTInUTC, getCSTDateInUTC };
