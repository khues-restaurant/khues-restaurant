import { toZonedTime } from "date-fns-tz";
import { is15MinsFromDatetime } from "~/utils/is15MinsFromDatetime";
interface IsSelectedTimeSlotValid {
  isASAP?: boolean;
  datetimeToPickup: Date;
  minPickupDatetime: Date;
}

export function isSelectedTimeSlotValid({
  isASAP,
  datetimeToPickup,
  minPickupDatetime,
}: IsSelectedTimeSlotValid) {
  const now = toZonedTime(new Date(), "America/Chicago");
  const tzDatetimeToPickup = toZonedTime(datetimeToPickup, "America/Chicago");
  const tzMinPickupDatetime = toZonedTime(minPickupDatetime, "America/Chicago");

  // TODO: keep an eye on this check, might have unintended side effects
  // if tzDatetimeToPickup is midnight, return true
  if (
    tzDatetimeToPickup.getHours() === 0 &&
    tzDatetimeToPickup.getMinutes() === 0 &&
    tzDatetimeToPickup.getSeconds() === 0
  ) {
    return true;
  }

  // if currentDate hours is earlier than opening time, return false
  if (tzDatetimeToPickup.getHours() < 12) {
    return false;
  }

  if (isASAP) {
    // make sure that the passed in datetimeToPickup is the current day
    if (tzDatetimeToPickup.getDay() !== now.getDay()) {
      return false;
    }
  } else {
    // make sure that the passed in datetimeToPickup is later than the current time
    // and more specifically 15+ minutes from the current time
    if (
      tzDatetimeToPickup <= now ||
      !is15MinsFromDatetime(tzDatetimeToPickup, now)
    ) {
      return false;
    }
  }

  // if tzDatetimeToPickup time is earlier than tzMinPickupDatetime, return false
  if (tzDatetimeToPickup.getTime() < tzMinPickupDatetime.getTime()) {
    return false;
  }

  // if tzDatetimeToPickup hours is later than 21:30 (9:30 PM), return false

  // TODO: depending on what specific interaction that eric wants (either
  // 30 mins from close is last time customer will be walking in to pickup their order,
  // or 30 mins from close is last time customer can place an order for pickup that night)
  // this will either be .getMinutes() > 30 or .getMinutes() > 15 respectively.
  if (
    tzDatetimeToPickup.getHours() >= 21 &&
    tzDatetimeToPickup.getMinutes() > 30
  ) {
    return false;
  }

  return true;
}
