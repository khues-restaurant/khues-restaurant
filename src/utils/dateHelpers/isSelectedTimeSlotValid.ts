import { toZonedTime } from "date-fns-tz";
import { useMainStore } from "~/stores/MainStore";
import {
  type DayOfWeek,
  type HolidayList,
  type WeekOperatingHours,
} from "~/types/operatingHours";
import { getCSTDateInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import {
  getHoursForDay,
  isHoliday,
  isPastFinalPickupPlacementTimeForDay,
} from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { isAtLeast20MinsFromDatetime } from "~/utils/dateHelpers/isAtLeast20MinsFromDatetime";

interface IsSelectedTimeSlotValid {
  isASAP?: boolean;
  datetimeToPickup: Date;
  minPickupDatetime: Date;
  hoursOfOperation?: WeekOperatingHours;
  holidays?: HolidayList;
}

export function isSelectedTimeSlotValid({
  isASAP,
  datetimeToPickup,
  minPickupDatetime,
  hoursOfOperation,
  holidays,
}: IsSelectedTimeSlotValid) {
  const state =
    hoursOfOperation === undefined || holidays === undefined
      ? useMainStore.getState()
      : undefined;

  const effectiveHours = hoursOfOperation ?? state?.hoursOfOperation ?? [];
  const effectiveHolidays = holidays ?? state?.holidays ?? [];

  if (!effectiveHours.length) {
    return false;
  }

  const now = getCSTDateInUTC(new Date());
  const pickupTime = getCSTDateInUTC(datetimeToPickup);
  const minPickupTime = getCSTDateInUTC(minPickupDatetime);

  const pickupDayHours = getHoursForDay(
    effectiveHours,
    pickupTime.getDay() as DayOfWeek,
  );

  if (
    !pickupDayHours ||
    pickupDayHours.isClosedAllDay ||
    isHoliday(pickupTime, effectiveHolidays)
  ) {
    return false;
  }

  if (
    pickupTime.getHours() === 0 &&
    pickupTime.getMinutes() === 0 &&
    pickupTime.getSeconds() === 0 &&
    !isASAP
  ) {
    return true;
  }

  const asapAdjustedPickupHour = isASAP
    ? toZonedTime(now, "America/Chicago").getHours()
    : toZonedTime(pickupTime, "America/Chicago").getHours();

  const asapAdjustedPickupMinute = isASAP
    ? now.getMinutes()
    : pickupTime.getMinutes();

  if (
    asapAdjustedPickupHour < pickupDayHours.openHour ||
    (asapAdjustedPickupHour === pickupDayHours.openHour &&
      asapAdjustedPickupMinute < pickupDayHours.openMinute)
  ) {
    return false;
  }

  if (isASAP) {
    if (pickupTime.getDate() !== now.getDate()) {
      return false;
    }
  } else if (
    pickupTime <= now ||
    !isAtLeast20MinsFromDatetime(pickupTime, now)
  ) {
    return false;
  }

  if (pickupTime.getTime() < minPickupTime.getTime()) {
    return false;
  }

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
