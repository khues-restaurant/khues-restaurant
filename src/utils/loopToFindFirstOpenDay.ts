import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay, addDays } from "date-fns";
import {
  isRestaurantClosedToday,
  isHoliday,
} from "~/utils/datesAndHoursOfOperation";

// export function loopToFindFirstOpenDay(datetimeToPickup: Date) {
//   const localDatetimeToPickup = toZonedTime(
//     datetimeToPickup,
//     "America/Chicago",
//   );

//   // Check and adjust for days of week that the restaurant is closed + holidays
//   while (
//     isRestaurantClosedToday(localDatetimeToPickup) ||
//     isHoliday(localDatetimeToPickup)
//   ) {
//     // reset to midnight and move to the next day (bit redundant but it's fine)
//     localDatetimeToPickup.setHours(0, 0, 0, 0); // Normalize to midnight for consistent comparison

//     localDatetimeToPickup.setDate(localDatetimeToPickup.getDate() + 1); // Move to the next day
//   }

//   return localDatetimeToPickup;
// }

export function loopToFindFirstOpenDay(datetimeToPickup: Date) {
  // Convert the given datetime to CST
  let localDatetimeToPickup = toZonedTime(datetimeToPickup, "America/Chicago");

  // Normalize to midnight in CST
  // localDatetimeToPickup = startOfDay(localDatetimeToPickup);

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
