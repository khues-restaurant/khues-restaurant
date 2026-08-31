import { format, isSameDay } from "date-fns";

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

interface OperatingHours {
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

const hoursOpenPerDay: Record<DayOfWeek, OperatingHours> = {
  [DayOfWeek.Sunday]: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
  },
  [DayOfWeek.Monday]: {
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
  },
  [DayOfWeek.Tuesday]: {
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
  },
  [DayOfWeek.Wednesday]: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
  },
  [DayOfWeek.Thursday]: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
  },
  [DayOfWeek.Friday]: {
    openHour: 16,
    openMinute: 30,
    closeHour: 22,
    closeMinute: 0,
  },
  [DayOfWeek.Saturday]: {
    openHour: 16,
    openMinute: 30,
    closeHour: 22,
    closeMinute: 0,
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

function formatTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (minute === 0) {
    return format(date, "h a");
  }
  return format(date, "h:mm a");
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

export { getWeeklyHours };
