import { toZonedTime } from "date-fns-tz";
import {
  isRestaurantClosedToday,
  isHoliday,
} from "~/utils/datesAndHoursOfOperation";

export function loopToFindFirstOpenDay(datetimeToPickup: Date) {
  const localDatetimeToPickup = toZonedTime(
    datetimeToPickup,
    "America/Chicago",
  );

  // Check and adjust for days of week that the restaurant is closed + holidays
  while (
    isRestaurantClosedToday(localDatetimeToPickup) ||
    isHoliday(localDatetimeToPickup)
  ) {
    // reset to midnight and move to the next day (bit redundant but it's fine)
    localDatetimeToPickup.setHours(0, 0, 0, 0); // Normalize to midnight for consistent comparison

    localDatetimeToPickup.setDate(localDatetimeToPickup.getDate() + 1); // Move to the next day
  }

  return localDatetimeToPickup;
}
