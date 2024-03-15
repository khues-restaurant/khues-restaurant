export function selectedDateIsToday(selectedDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate?.getTime() === today.getTime();
}
