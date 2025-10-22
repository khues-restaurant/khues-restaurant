import {
  type HolidayList,
  type WeekOperatingHours,
} from "~/types/operatingHours";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import { loopToFindFirstOpenDay } from "~/utils/dateHelpers/loopToFindFirstOpenDay";

// Not the happiest about state of this function, is currently just a thin
// wrapper around loopToFindFirstOpenDay, making sure to pass in the current
// day at midnight. Maybe refactor later
export function getFirstValidMidnightDate(
  hoursOfOperation?: WeekOperatingHours,
  holidays: HolidayList = [],
) {
  const todayAtMidnightUTC = getMidnightCSTInUTC();

  if (!hoursOfOperation?.length) {
    return todayAtMidnightUTC;
  }

  return loopToFindFirstOpenDay(todayAtMidnightUTC, hoursOfOperation, holidays);
}
