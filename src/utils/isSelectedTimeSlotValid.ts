import { format } from "date-fns";
import { getCSTDateInUTC } from "~/utils/cstToUTCHelpers";
import { hoursOpenPerDay, isHoliday } from "~/utils/datesAndHoursOfOperation";
import { isAtLeast15MinsFromDatetime } from "~/utils/isAtLeast15MinsFromDatetime";

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
  const now = getCSTDateInUTC(new Date());
  const tzDatetimeToPickup = getCSTDateInUTC(datetimeToPickup);
  const tzMinPickupDatetime = getCSTDateInUTC(minPickupDatetime);

  const todaysHours =
    hoursOpenPerDay[now.getDay() as keyof typeof hoursOpenPerDay];

  console.log(
    todaysHours.open,
    todaysHours.close,
    isHoliday(now),
    now.getDay(),
    format(now, "yyyy-MM-dd HH:mm:ss"),
    format(tzDatetimeToPickup, "yyyy-MM-dd HH:mm:ss"),
    format(tzMinPickupDatetime, "yyyy-MM-dd HH:mm:ss"),
  );

  // if restaurant is closed today, immediately return false
  if ((todaysHours.open === 0 && todaysHours.close === 0) || isHoliday(now)) {
    return false;
  }

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
  if (tzDatetimeToPickup.getHours() < todaysHours.open) {
    return false;
  }

  if (isASAP) {
    // make sure that the passed in datetimeToPickup is the current day
    if (tzDatetimeToPickup.getDay() !== now.getDay()) {
      return false;
    }
  } else {
    // make sure that the passed in datetimeToPickup is later than the current time
    // and more specifically, is >= 15 minutes from the current time
    if (
      tzDatetimeToPickup <= now ||
      !isAtLeast15MinsFromDatetime(tzDatetimeToPickup, now)
    ) {
      return false;
    }
  }

  // if tzDatetimeToPickup time is earlier than tzMinPickupDatetime, return false
  if (tzDatetimeToPickup.getTime() < tzMinPickupDatetime.getTime()) {
    return false;
  }

  // if tzDatetimeToPickup > 30 mins from close or later, return false

  // TODO: depending on what specific interaction that eric wants (either
  // 30 mins from close is last time customer will be walking in to pickup their order,
  // or 30 mins from close is last time customer can place an order for pickup that night)
  // this will either be .getMinutes() > 30 or .getMinutes() > 15 respectively.
  if (
    tzDatetimeToPickup.getHours() >= todaysHours.close ||
    (tzDatetimeToPickup.getHours() === todaysHours.close - 1 &&
      tzDatetimeToPickup.getMinutes() > 30)
  ) {
    return false;
  }

  return true;
}
