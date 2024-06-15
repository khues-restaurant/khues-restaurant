import { format } from "date-fns";

export function formatTimeString(timeString: string): string {
  // Assuming the current date, as we need a full date object to work with date-fns
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();

  if (hours === undefined || minutes === undefined) {
    throw new Error("Invalid time");
  }

  date.setHours(hours, minutes, 0, 0);

  // Format the date object to a "7:30 PM" style string
  return format(date, "h:mm a");
}
