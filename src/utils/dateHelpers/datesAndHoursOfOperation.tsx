import {
  addMinutes,
  format,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from "date-fns";

enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

const holidays = [
  // Christmas / New Year's
  new Date("2024-12-25"),
  new Date("2024-12-26"),
  new Date("2025-01-01"),
];

const hoursOpenPerDay: Record<
  DayOfWeek,
  {
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
  }
> = {
  [DayOfWeek.Sunday]: {
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
  },
  [DayOfWeek.Monday]: {
    openHour: 12,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  [DayOfWeek.Tuesday]: {
    openHour: 12,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  [DayOfWeek.Wednesday]: {
    openHour: 12,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  [DayOfWeek.Thursday]: {
    openHour: 12,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  [DayOfWeek.Friday]: {
    openHour: 12,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 30,
  },
  [DayOfWeek.Saturday]: {
    openHour: 12,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 30,
  },
};

function isRestaurantClosedToday(date: Date) {
  const dayOfWeek = date.getDay() as DayOfWeek;
  const hours = hoursOpenPerDay[dayOfWeek];

  return (
    hours.openHour === 0 &&
    hours.openMinute === 0 &&
    hours.closeHour === 0 &&
    hours.closeMinute === 0
  );
}

function isHoliday(date: Date) {
  return holidays.some((holiday) => isSameDay(date, holiday));
}

// final pickup time for day is 30 minutes before close
function isPastFinalPickupTimeForDay({
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

  const pastFinalPickupTime = currentTotalMinutes > closeTotalMinutes - 30;

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
  includeASAPOption,
  limitToThirtyMinutesBeforeClose,
}: {
  dayOfWeek: DayOfWeek;
  includeASAPOption?: boolean;
  limitToThirtyMinutesBeforeClose?: boolean;
}): string[] {
  const hours = hoursOpenPerDay[dayOfWeek];
  if (
    hours.openHour === 0 &&
    hours.openMinute === 0 &&
    hours.closeHour === 0 &&
    hours.closeMinute === 0
  ) {
    return []; // Closed all day
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

  if (includeASAPOption) {
    times.push("ASAP (~20 mins)");
  }

  while (currentTime <= closeTime) {
    times.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, 15);
  }

  return times;
}

function getWeeklyHours() {
  const displayDaysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const dayOfWeekOrder = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday,
  ];

  const today = new Date();

  return (
    <>
      {displayDaysOfWeek.map((day, index) => {
        const date = new Date();
        const dayOfWeek = dayOfWeekOrder[index]!;
        date.setDate(today.getDate() - today.getDay() + dayOfWeek);

        if (isRestaurantClosedToday(date) || isHoliday(date)) {
          return <p key={day}>Closed</p>;
        }

        const hours = hoursOpenPerDay[dayOfWeek];
        return (
          <p key={day} className="text-nowrap">
            {formatTime(hours.openHour, hours.openMinute)} -{" "}
            {formatTime(hours.closeHour, hours.closeMinute)}
          </p>
        );
      })}
    </>
  );
}

export {
  holidays,
  hoursOpenPerDay,
  isPastFinalPickupTimeForDay,
  isRestaurantClosedToday,
  isHoliday,
  getWeeklyHours,
  getOpenTimesForDay,
};
