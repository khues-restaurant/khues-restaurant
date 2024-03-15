export function mergeDateAndTime(date: Date, time: string) {
  const hoursAndMinutes = time.split(":");
  if (hoursAndMinutes.length !== 2) return;

  const hours = Number(hoursAndMinutes[0]);
  const minutes = Number(hoursAndMinutes[1]);

  if (isNaN(hours) || isNaN(minutes)) return;

  const newDate = new Date(date);
  newDate.setHours(hours, minutes);

  return newDate;
}
