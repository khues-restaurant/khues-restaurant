const holidays = [
  new Date("2024-12-25"),
  new Date("2024-12-26"),
  new Date("2025-01-01"),
];

function isSundayOrMonday(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 1;
}

function isHoliday(date: Date, holidays: Date[]) {
  const dateString = date.toISOString().split("T")[0]; // Converts date to YYYY-MM-DD format
  return holidays.some(
    (holiday) => holiday.toISOString().split("T")[0] === dateString,
  );
}

export function getFirstValidMidnightDate(currentDate: Date) {
  let datetimeToPickup = new Date(currentDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison

  // If datetimeToPickup is in the past, adjust it to midnight today
  // fyi: this is a bit redundant since comparing to "now" will always be in the past right?
  if (datetimeToPickup <= now) {
    datetimeToPickup = now;
  }

  // Check and adjust for Sundays, Mondays, and Holidays
  while (
    isSundayOrMonday(datetimeToPickup) ||
    isHoliday(datetimeToPickup, holidays)
  ) {
    datetimeToPickup.setDate(datetimeToPickup.getDate() + 1); // Move to the next day
  }

  return datetimeToPickup;
}
