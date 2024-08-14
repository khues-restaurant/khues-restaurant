import { toZonedTime } from "date-fns-tz";
import { getCSTDateInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import {
  hoursOpenPerDay,
  isHoliday,
  isPastFinalPickupPlacementTimeForDay,
} from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { isAtLeast20MinsFromDatetime } from "~/utils/dateHelpers/isAtLeast20MinsFromDatetime";

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

  // FYI: Above times are coerced into the CST time zone, and then converted to UTC
  // for consistent comparison. Need to convert to CST first since functions are executed
  // in Ohio (EST) and the restaurant hours are in CST.

  const pickupDayHours =
    hoursOpenPerDay[pickupTime.getDay() as keyof typeof hoursOpenPerDay];

  // these are CST values, since the hoursOpenPerDay object values are in CST and conversion
  // to UTC proved to be problematic/not straightforward
  const asapAdjustedPickupHour = isASAP
    ? toZonedTime(now, "America/Chicago").getHours()
    : toZonedTime(pickupTime, "America/Chicago").getHours();

  // don't need to convert minutes since they are the same in CST and UTC
  const asapAdjustedPickupMinute = isASAP
    ? now.getMinutes()
    : pickupTime.getMinutes();

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
    pickupTime.getSeconds() === 0 &&
    !isASAP
    // isASAP will by definition always be represented at midnight client side,
    // so making sure that it still passes through all the below checks
  ) {
    return true;
  }

  // if pickupTime is earlier than opening time, return false
  if (
    asapAdjustedPickupHour < pickupDayHours.openHour ||
    (asapAdjustedPickupHour === pickupDayHours.openHour &&
      asapAdjustedPickupMinute < pickupDayHours.openMinute)
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
    // and more specifically, is >= 20 minutes from the current time
    if (pickupTime <= now || !isAtLeast20MinsFromDatetime(pickupTime, now)) {
      return false;
    }
  }

  // if pickupTime time is earlier than minPickupTime, return false
  // fyi: this still works for isASAP, since the pickupTime will be midnight of the current
  // day, and by definition isASAP orders shouldn't be allowed when the minPickupTime is
  // anything other than midnight of the current day (aka whenever a minPickupTime is set)
  if (pickupTime.getTime() < minPickupTime.getTime()) {
    return false;
  }

  // if pickupTime < 30 mins from close or later, return false
  if (
    isPastFinalPickupPlacementTimeForDay({
      currentHour: asapAdjustedPickupHour,
      currentMinute: asapAdjustedPickupMinute,
      closeHour: pickupDayHours.closeHour,
      closeMinute: pickupDayHours.closeMinute,
    })
  ) {
    return false;
  }

  return true;
}
