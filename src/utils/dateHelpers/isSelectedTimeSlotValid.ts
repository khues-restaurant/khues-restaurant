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
  datetimeToPickup: Date;
  minPickupDatetime: Date;
  hoursOfOperation?: WeekOperatingHours;
  holidays?: HolidayList;
}

export function isSelectedTimeSlotValid({
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
    pickupTime.getSeconds() === 0
  ) {
    return true;
  }

  const pickupHour = toZonedTime(pickupTime, "America/Chicago").getHours();
  const pickupMinute = pickupTime.getMinutes();

  if (
    pickupHour < pickupDayHours.openHour ||
    (pickupHour === pickupDayHours.openHour &&
      pickupMinute < pickupDayHours.openMinute)
  ) {
    return false;
  }

  if (pickupTime <= now || !isAtLeast20MinsFromDatetime(pickupTime, now)) {
    return false;
  }

  if (pickupTime.getTime() < minPickupTime.getTime()) {
    return false;
  }

  if (
    isPastFinalPickupPlacementTimeForDay({
      currentHour: pickupHour,
      currentMinute: pickupMinute,
      closeHour: pickupDayHours.closeHour,
      closeMinute: pickupDayHours.closeMinute,
      bufferFromCloseMinutes: 30,
    })
  ) {
    return false;
  }

  return true;
}
