import {
  addMinutes,
  format,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from "date-fns";
import {
  type DayOfWeek,
  type DayOperatingHours,
  type HolidayList,
  type WeekOperatingHours,
} from "~/types/operatingHours";
import { getCSTDateInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";

export interface OperatingHoursWindow {
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

const DISPLAY_DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DAY_OF_WEEK_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

function getHoursForDay(
  hoursOfOperation: WeekOperatingHours,
  dayOfWeek: DayOfWeek,
): DayOperatingHours | undefined {
  return hoursOfOperation.find((entry) => entry.dayOfWeek === dayOfWeek);
}

function isRestaurantClosedToday(
  date: Date,
  hoursOfOperation: WeekOperatingHours,
) {
  const dayOfWeek = date.getDay() as DayOfWeek;
  const hours = getHoursForDay(hoursOfOperation, dayOfWeek);

  if (!hours) {
    return true;
  }

  return hours.isClosedAllDay;
}

function isHoliday(date: Date, holidays: HolidayList) {
  if (!holidays.length) {
    return false;
  }

  const normalizedDate = startOfDay(date);

  return holidays.some((holiday) => {
    const holidayDate = startOfDay(holiday.date);

    if (holiday.isRecurringAnnual) {
      return (
        holidayDate.getMonth() === normalizedDate.getMonth() &&
        holidayDate.getDate() === normalizedDate.getDate()
      );
    }

    return isSameDay(holidayDate, normalizedDate);
  });
}

// final pickup time for day is 30 minutes before close
function isPastFinalPickupPlacementTimeForDay({
  currentHour,
  currentMinute,
  closeHour,
  closeMinute,
}: {
  currentHour: number;
  currentMinute: number;
  closeHour: number;
  closeMinute: number;
}) {
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const closeTotalMinutes = closeHour * 60 + closeMinute;

  // "-50" below is to account for the 30 minute buffer before close
  // along with fact that orders take ~20 minutes to prepare.

  const pastFinalPickupTime = currentTotalMinutes > closeTotalMinutes - 50;

  return pastFinalPickupTime;
}

function formatTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (minute === 0) {
    return format(date, "h a");
  }
  return format(date, "h:mm a");
}

function getOpenTimesForDay({
  dayOfWeek,
  limitToThirtyMinutesBeforeClose,
  hoursOfOperation,
}: {
  dayOfWeek: DayOfWeek;
  limitToThirtyMinutesBeforeClose?: boolean;
  hoursOfOperation: WeekOperatingHours;
}): string[] {
  const hours = getHoursForDay(hoursOfOperation, dayOfWeek);

  if (!hours || hours.isClosedAllDay) {
    return [];
  }

  const openTime = setSeconds(
    setMinutes(
      setHours(startOfDay(new Date()), hours.openHour),
      hours.openMinute,
    ),
    0,
  );

  let closeTime = setSeconds(
    setMinutes(
      setHours(startOfDay(new Date()), hours.closeHour),
      hours.closeMinute,
    ),
    0,
  );

  if (limitToThirtyMinutesBeforeClose) {
    closeTime = addMinutes(closeTime, -30); // Limit to 30 minutes before close
  }

  const times: string[] = [];
  let currentTime = openTime;

  while (currentTime <= closeTime) {
    times.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, 15);
  }

  return times;
}

function getWeeklyHours({
  hoursOfOperation,
  holidays,
}: {
  hoursOfOperation: WeekOperatingHours;
  holidays: HolidayList;
}) {
  const today = new Date();

  return (
    <>
      {DISPLAY_DAYS_OF_WEEK.map((dayLabel, index) => {
        const date = new Date();
        const dayOfWeek = DAY_OF_WEEK_ORDER[index]!;
        date.setDate(today.getDate() - today.getDay() + dayOfWeek);

        if (
          isRestaurantClosedToday(date, hoursOfOperation) ||
          isHoliday(date, holidays)
        ) {
          return <p key={dayLabel}>Closed</p>;
        }

        const hours = getHoursForDay(hoursOfOperation, dayOfWeek);

        if (!hours) {
          return (
            <p key={dayLabel} className="text-nowrap">
              Updating...
            </p>
          );
        }

        return (
          <p key={dayLabel} className="text-nowrap">
            {formatTime(hours.openHour, hours.openMinute)} -{" "}
            {formatTime(hours.closeHour, hours.closeMinute)}
          </p>
        );
      })}
    </>
  );
}

function convertOperatingHoursToUTC(
  hours: OperatingHoursWindow,
): OperatingHoursWindow {
  const convertTime = (hour: number, minute: number) => {
    const currentDate = new Date();
    const dateInCST = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hour,
      minute,
    );
    const utcDate = getCSTDateInUTC(dateInCST);
    return {
      hour: utcDate.getUTCHours(),
      minute: utcDate.getUTCMinutes(),
    };
  };

  const openUTC = convertTime(hours.openHour, hours.openMinute);
  const closeUTC = convertTime(hours.closeHour, hours.closeMinute);

  return {
    openHour: openUTC.hour,
    openMinute: openUTC.minute,
    closeHour: closeUTC.hour,
    closeMinute: closeUTC.minute,
  };
}

export {
  DAY_OF_WEEK_ORDER,
  getHoursForDay,
  getOpenTimesForDay,
  getWeeklyHours,
  isHoliday,
  isPastFinalPickupPlacementTimeForDay,
  isRestaurantClosedToday,
  convertOperatingHoursToUTC,
};
