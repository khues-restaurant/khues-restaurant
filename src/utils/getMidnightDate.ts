export function getMidnightDate(date: Date) {
  // Create a new Date instance to avoid modifying the original date
  const newDate = new Date(date.getTime());
  newDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
  return newDate;
}
