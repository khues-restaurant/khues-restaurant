import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay, addDays } from "date-fns";
import {
  isRestaurantClosedToday,
  isHoliday,
} from "~/utils/datesAndHoursOfOperation";

export function loopToFindFirstOpenDay(datetimeToPickup: Date) {
  // Convert the given datetime to CST
  let localDatetimeToPickup = toZonedTime(datetimeToPickup, "America/Chicago");

  // Check and adjust for days of the week that the restaurant is closed and holidays
  while (
    isRestaurantClosedToday(localDatetimeToPickup) ||
    isHoliday(localDatetimeToPickup)
  ) {
    // Move to the next day in CST
    localDatetimeToPickup = addDays(localDatetimeToPickup, 1);
    localDatetimeToPickup = startOfDay(localDatetimeToPickup); // Ensure it's at midnight
  }

  // Convert the final open day back to UTC
  const finalDatetimeUTC = fromZonedTime(
    localDatetimeToPickup,
    "America/Chicago",
  );

  return finalDatetimeUTC;
}
