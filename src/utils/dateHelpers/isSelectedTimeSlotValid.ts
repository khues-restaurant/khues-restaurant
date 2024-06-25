import { getCSTDateInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import {
  hoursOpenPerDay,
  isHoliday,
  isWithin30MinutesBeforeCloseOrLater,
} from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { isAtLeast15MinsFromDatetime } from "~/utils/dateHelpers/isAtLeast15MinsFromDatetime";

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
  const pickupTime = getCSTDateInUTC(datetimeToPickup);
  const minPickupTime = getCSTDateInUTC(minPickupDatetime);

  // FYI: all times are coerced into the CST time zone

  const pickupDayHours =
    hoursOpenPerDay[pickupTime.getDay() as keyof typeof hoursOpenPerDay];

  // if restaurant is closed today, immediately return false
  if (
    (pickupDayHours.openHour === 0 &&
      pickupDayHours.openMinute === 0 &&
      pickupDayHours.closeHour === 0 &&
      pickupDayHours.closeMinute === 0) ||
    isHoliday(pickupTime)
  ) {
    return false;
  }

  // TODO: keep an eye on this check, might have unintended side effects
  // It was meant as a workaround to not immediately throw an error when faced
  // with the default midnight time being passed in to this function.
  // if pickupTime is midnight, return true
  if (
    pickupTime.getHours() === 0 &&
    pickupTime.getMinutes() === 0 &&
    pickupTime.getSeconds() === 0
  ) {
    return true;
  }

  // if pickupTime is earlier than opening time, return false
  if (
    pickupTime.getHours() < pickupDayHours.openHour ||
    (pickupTime.getHours() === pickupDayHours.openHour &&
      pickupTime.getMinutes() < pickupDayHours.openMinute)
  ) {
    return false;
  }

  if (isASAP) {
    // make sure that the passed in datetimeToPickup is the current day
    if (pickupTime.getDate() !== now.getDate()) {
      return false;
    }
  } else {
    // make sure that the passed in datetimeToPickup is later than the current time
    // and more specifically, is >= 15 minutes from the current time
    if (pickupTime <= now || !isAtLeast15MinsFromDatetime(pickupTime, now)) {
      return false;
    }
  }

  // if pickupTime time is earlier than minPickupTime, return false
  if (pickupTime.getTime() < minPickupTime.getTime()) {
    return false;
  }

  // if pickupTime > 30 mins from close or later, return false

  // TODO: depending on what specific interaction that eric wants (either
  // 30 mins from close is last time customer will be walking in to pickup their order,
  // or 30 mins from close is last time customer can place an order for pickup that night)
  // this will either be .getMinutes() > 30 or .getMinutes() > 15 respectively.
  if (
    isWithin30MinutesBeforeCloseOrLater({
      currentHour: now.getHours(),
      currentMinute: now.getMinutes(),
      closeHour: pickupDayHours.closeHour,
      closeMinute: pickupDayHours.closeMinute,
    })
  ) {
    return false;
  }

  return true;
}
