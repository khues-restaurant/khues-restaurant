import { toZonedTime } from "date-fns-tz";
import { loopToFindFirstOpenDay } from "~/utils/loopToFindFirstOpenDay";

// Not the happiest about state of this function, is currently just a thin
// wrapper around loopToFindFirstOpenDay, making sure to pass in the current
// day at midnight. Maybe refactor later
export function getFirstValidMidnightDate() {
  const todayAtMidnight = toZonedTime(new Date(), "America/Chicago");
  todayAtMidnight.setHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison

  return loopToFindFirstOpenDay(todayAtMidnight);
}
