import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay } from "date-fns";

const CHICAGO_TIME_ZONE: string = "America/Chicago";

function getMidnightCSTInUTC(date: Date = new Date()) {
  // Convert the provided date to the business timezone and zero the clock there.
  const chicagoDate = toZonedTime(date, CHICAGO_TIME_ZONE);
  const midnightInChicago = startOfDay(chicagoDate);

  // Return the equivalent UTC instant so we can store/compare consistently.
  return fromZonedTime(midnightInChicago, CHICAGO_TIME_ZONE);
}

function getCSTDateInUTC(date: Date) {
  // Normalize a date to the same UTC instant we would persist when treating it as Chicago time.
  const chicagoDate = toZonedTime(date, CHICAGO_TIME_ZONE);
  return fromZonedTime(chicagoDate, CHICAGO_TIME_ZONE);
}

export { CHICAGO_TIME_ZONE, getMidnightCSTInUTC, getCSTDateInUTC };
