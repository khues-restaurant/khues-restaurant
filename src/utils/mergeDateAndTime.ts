export function mergeDateAndTime(date: Date, time: string) {
  // TODO: validate this, adding this logic while tired
  const hoursAndMinutes = time === "" ? ["0", "0"] : time.split(":");

  if (hoursAndMinutes.length !== 2) return;

  const hours = Number(hoursAndMinutes[0]);
  const minutes = Number(hoursAndMinutes[1]);

  if (isNaN(hours) || isNaN(minutes)) return;

  const newDate = new Date(date);
  newDate.setHours(hours, minutes);

  return newDate;
}
