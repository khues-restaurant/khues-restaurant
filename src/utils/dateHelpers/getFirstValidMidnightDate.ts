import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import { loopToFindFirstOpenDay } from "~/utils/dateHelpers/loopToFindFirstOpenDay";

// Not the happiest about state of this function, is currently just a thin
// wrapper around loopToFindFirstOpenDay, making sure to pass in the current
// day at midnight. Maybe refactor later
export function getFirstValidMidnightDate() {
  const todayAtMidnightUTC = getMidnightCSTInUTC();

  return loopToFindFirstOpenDay(todayAtMidnightUTC);
}
