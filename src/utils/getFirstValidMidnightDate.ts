import { format, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { loopToFindFirstOpenDay } from "~/utils/loopToFindFirstOpenDay";
import { setDateToMidnightCST } from "~/utils/setDateToMidnightCST";

// process.env.TZ = "Asia/Calcutta";

// Not the happiest about state of this function, is currently just a thin
// wrapper around loopToFindFirstOpenDay, making sure to pass in the current
// day at midnight. Maybe refactor later
export function getFirstValidMidnightDate() {
  const todayAtMidnight = toZonedTime(
    startOfDay(new Date()),
    "America/Chicago",
  );

  console.log(
    "testtesttest:",
    format(todayAtMidnight, "yyyy-MM-dd HH:mm:ssXXX"),
  );
  // todayAtMidnight.setUTCHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison

  return loopToFindFirstOpenDay(todayAtMidnight);
}
