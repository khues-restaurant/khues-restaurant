import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { CHICAGO_TIME_ZONE } from "~/utils/dateHelpers/cstToUTCHelpers";

export function mergeDateAndTime(date: Date, time: string) {
  const hoursAndMinutes = time?.trim() ? time.split(":") : ["0", "0"];

  if (hoursAndMinutes.length !== 2) return;

  const [rawHours = "", rawMinutes = ""] = hoursAndMinutes;
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

  const formattedHours = rawHours.padStart(2, "0");
  const formattedMinutes = rawMinutes.padStart(2, "0");

  const chicagoDate = formatInTimeZone(date, CHICAGO_TIME_ZONE, "yyyy-MM-dd");
  const candidateIso = `${chicagoDate}T${formattedHours}:${formattedMinutes}:00`;

  try {
    return fromZonedTime(candidateIso, CHICAGO_TIME_ZONE);
  } catch {
    return undefined;
  }
}
