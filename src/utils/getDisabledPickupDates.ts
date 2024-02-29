export function getDisabledDates() {
  const disableSundaysMondays = { dayOfWeek: [0, 1] };

  // Get today's date without time part to accurately disable past days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disableBeforeToday = { before: today };

  // TODO: set holiday dates to disable
  const disableHolidays = [
    new Date("2024-12-25"),
    new Date("2024-12-26"),
    new Date("2025-01-01"),
  ];

  return [disableSundaysMondays, disableBeforeToday, disableHolidays];
}
