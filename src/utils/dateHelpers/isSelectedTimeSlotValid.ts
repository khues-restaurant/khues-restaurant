import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { getCSTDateInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import {
  convertOperatingHoursToUTC,
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
  // console.log(new Date(), datetimeToPickup, minPickupDatetime);

  const now = getCSTDateInUTC(new Date());
  const pickupTime = getCSTDateInUTC(datetimeToPickup);
  const minPickupTime = getCSTDateInUTC(minPickupDatetime);

  // console.log(now, pickupTime, minPickupTime);

  // console.log("----------------------");

  // FYI: all times are coerced into the CST time zone, and then converted to UTC
  // for consistent comparison

  const pickupDayHours =
    hoursOpenPerDay[pickupTime.getDay() as keyof typeof hoursOpenPerDay];

  // const pickupDayStart = getCSTDateInUTC(
  //   new Date(
  //     now.getUTCFullYear(),
  //     now.getUTCMonth(),
  //     now.getUTCDate(),
  //     pickupDayHours.openHour,
  //     pickupDayHours.openMinute,
  //   ),
  // );

  // const pickupDayEnd = getCSTDateInUTC(
  //   new Date(
  //     now.getUTCFullYear(),
  //     now.getUTCMonth(),
  //     now.getUTCDate(),
  //     pickupDayHours.closeHour,
  //     pickupDayHours.closeMinute,
  //   ),
  // );

  // these are CST values, since the hoursOpenPerDay object is in CST and conversion
  // to UTC proved to be problematic/not straightforward
  const asapAdjustedPickupHour = isASAP
    ? toZonedTime(now, "America/Chicago").getHours()
    : toZonedTime(pickupTime, "America/Chicago").getHours();

  // don't need to convert minutes since they are the same in CST and UTC
  const asapAdjustedPickupMinute = isASAP
    ? now.getMinutes()
    : pickupTime.getMinutes();

  console.log(
    "isASAP",
    isASAP,
    "| now",
    format(now, "yyyy-MM-dd HH:mm:ss"),
    "| full pickupTime",
    format(pickupTime, "yyyy-MM-dd HH:mm:ss"),
    "| minPickupTime",
    format(minPickupTime, "yyyy-MM-dd HH:mm:ss"),
    asapAdjustedPickupHour,
    asapAdjustedPickupMinute,
    now.getHours(),
    now.getMinutes(),
    pickupDayHours,
  );

  // if restaurant is closed today, immediately return false
  if (
    (pickupDayHours.openHour === 0 &&
      pickupDayHours.openMinute === 0 &&
      pickupDayHours.closeHour === 0 &&
      pickupDayHours.closeMinute === 0) ||
    isHoliday(pickupTime)
  ) {
    console.log(
      "returning false 1",
      pickupDayHours.openHour,
      pickupDayHours.openMinute,
      pickupDayHours.closeHour,
      pickupDayHours.closeMinute,
      isHoliday(pickupTime),
    );
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
    console.log("returning true 1");
    return true;
  }

  // if pickupTime is earlier than opening time, return false
  if (
    asapAdjustedPickupHour < pickupDayHours.openHour ||
    (asapAdjustedPickupHour === pickupDayHours.openHour &&
      asapAdjustedPickupMinute < pickupDayHours.openMinute)
  ) {
    console.log(
      "returning false 2",
      asapAdjustedPickupHour,
      asapAdjustedPickupMinute,
      pickupDayHours.openHour,
      pickupDayHours.openMinute,
    );
    return false;
  }

  if (isASAP) {
    // make sure that the passed in datetimeToPickup is the current day
    if (pickupTime.getDate() !== now.getDate()) {
      console.log("returning false 3", pickupTime.getDate(), now.getDate());
      return false;
    }
  } else {
    // make sure that the passed in datetimeToPickup is later than the current time
    // and more specifically, is >= 20 minutes from the current time
    if (pickupTime <= now || !isAtLeast20MinsFromDatetime(pickupTime, now)) {
      console.log("returning false 4", pickupTime, now);
      return false;
    }
  }

  // if pickupTime time is earlier than minPickupTime, return false
  // fyi: this still works for isASAP, since the pickupTime will be midnight of the current
  // day, and by definition isASAP orders shouldn't be allowed when the minPickupTime is
  // anything other than midnight of the current day (aka whenever a minPickupTime is set)
  if (pickupTime.getTime() < minPickupTime.getTime()) {
    console.log(
      "returning false 5",
      pickupTime.getTime(),
      minPickupTime.getTime(),
    );
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
    console.log(
      "returning false 6",
      asapAdjustedPickupHour,
      asapAdjustedPickupMinute,
      pickupDayHours.closeHour,
      pickupDayHours.closeMinute,
    );
    return false;
  }

  return true;
}
