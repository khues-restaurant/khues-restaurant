import { toZonedTime } from "date-fns-tz";
import { getMidnightDate } from "~/utils/getMidnightDate";
import { loopToFindFirstOpenDay } from "~/utils/loopToFindFirstOpenDay";

export function getFirstValidMidnightDate(orderDatetimeToPickup?: Date) {
  // currently, every use of this function is to just get the (next) first
  // valid midnight _day_, however if orderDatetimeToPickup is passed in,
  // it will be used instead to check if the current order's datetimeToPickup
  // is valid. When reordering, we explicitly do *NOT* send over the previous
  // order's datetimeToPickup since we always want the user to explicitly choose
  // a new datetimeToPickup.

  let datetimeToPickup = orderDatetimeToPickup
    ? toZonedTime(orderDatetimeToPickup, "America/Chicago")
    : toZonedTime(getMidnightDate(new Date()), "America/Chicago");

  const now = toZonedTime(new Date(), "America/Chicago");
  now.setHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison

  // If datetimeToPickup is in the past, adjust it to midnight today
  if (datetimeToPickup < now) {
    datetimeToPickup = now;
  }

  datetimeToPickup = loopToFindFirstOpenDay(datetimeToPickup);

  return datetimeToPickup;
}
