import { toZonedTime } from "date-fns-tz";

export function selectedDateIsToday(selectedDate: Date) {
  const today = toZonedTime(new Date(), "America/Chicago");
  today.setHours(0, 0, 0, 0);

  return selectedDate?.getTime() === today.getTime();
}
