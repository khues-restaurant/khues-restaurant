import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay } from "date-fns";

export function getMidnightCST() {
  // Get the current date and time in UTC
  const now = new Date();

  // Convert the current date and time to CST/CDT
  const cstDate = toZonedTime(now, "America/Chicago");

  // Get the start of the day (midnight) in CST/CDT
  const startOfTodayCST = startOfDay(cstDate);

  // Convert the CST/CDT midnight time back to UTC
  const startOfTodayUTC = fromZonedTime(startOfTodayCST, "America/Chicago");

  return startOfTodayUTC;
}
