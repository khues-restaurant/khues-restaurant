export function getHoursAndMinutesFromDate(date: Date) {
  // Extract hours and minutes
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Need to return an empty string since midnight is the "default" time
  // that is set in the validation step(s). This is to properly show the
  // placeholder of "Select a time" in the <Select> component trigger.
  if (hours === 0 && minutes === 0) {
    return "";
  }

  // Pad with leading zero if necessary and format to "HH:MM"
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}
