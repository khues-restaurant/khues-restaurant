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

// lets typescript know for a fact that 0-6 will be valid
// keys for the object
const hoursOpenPerDay: Record<DayOfWeek, { open: number; close: number }> = {
  [DayOfWeek.Sunday]: { open: 0, close: 0 },
  [DayOfWeek.Monday]: { open: 12, close: 22 },
  [DayOfWeek.Tuesday]: { open: 12, close: 22 },
  [DayOfWeek.Wednesday]: { open: 12, close: 22 },
  [DayOfWeek.Thursday]: { open: 12, close: 22 },
  [DayOfWeek.Friday]: { open: 12, close: 22 },
  [DayOfWeek.Saturday]: { open: 12, close: 22 },
};

function isRestaurantClosedToday(date: Date) {
  const dayOfWeek = date.getDay() as DayOfWeek;
  const hours = hoursOpenPerDay[dayOfWeek];

  return hours.open === 0 && hours.close === 0;
}

function isHoliday(date: Date) {
  return holidays.some((holiday) => isSameDay(date, holiday));
}

function formatTime(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return format(date, "h a");
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
          <p key={day}>
            {formatTime(hours.open)} - {formatTime(hours.close)}
          </p>
        );
      })}
    </>
  );
}

export {
  holidays,
  hoursOpenPerDay,
  isRestaurantClosedToday,
  isHoliday,
  getWeeklyHours,
};
