import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useMemo, useState } from "react";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import { getMidnightCSTInUTC } from "~/utils/cstToUTCHelpers";
import {
  hoursOpenPerDay,
  isHoliday,
  isRestaurantClosedToday,
} from "~/utils/datesAndHoursOfOperation";
import { formatTimeString } from "~/utils/formatTimeString";
import { isSelectedTimeSlotValid } from "~/utils/isSelectedTimeSlotValid";
import { mergeDateAndTime } from "~/utils/mergeDateAndTime";

interface AvailablePickupTimes {
  selectedDate: Date;
  minPickupTime: Date | null | undefined;
}

function AvailablePickupTimes({
  selectedDate,
  minPickupTime,
}: AvailablePickupTimes) {
  const [availablePickupTimes, setAvailablePickupTimes] = useState<string[]>([
    "ASAP (~20 mins)",
    "12:00",
    "12:15",
    "12:30",
    "12:45",
    "13:00",
    "13:15",
    "13:30",
    "13:45",
    "14:00",
    "14:15",
    "14:30",
    "14:45",
    "15:00",
    "15:15",
    "15:30",
    "15:45",
    "16:00",
    "16:15",
    "16:30",
    "16:45",
    "17:00",
    "17:15",
    "17:30",
    "17:45",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
    "19:00",
    "19:15",
    "19:30",
    "19:45",
    "20:00",
    "20:15",
    "20:30",
    "20:45",
    "21:00",
    "21:15",
    "21:30",
    // intentially excluding last 30 mins slot to not stress kitchen at end of night.
  ]);

  // avoiding brief flash of ASAP time slot if it's not able to be rendered
  useLayoutEffect(() => {
    if (!minPickupTime) return;

    let basePickupTimes = [
      "ASAP (~20 mins)",
      "12:00",
      "12:15",
      "12:30",
      "12:45",
      "13:00",
      "13:15",
      "13:30",
      "13:45",
      "14:00",
      "14:15",
      "14:30",
      "14:45",
      "15:00",
      "15:15",
      "15:30",
      "15:45",
      "16:00",
      "16:15",
      "16:30",
      "16:45",
      "17:00",
      "17:15",
      "17:30",
      "17:45",
      "18:00",
      "18:15",
      "18:30",
      "18:45",
      "19:00",
      "19:15",
      "19:30",
      "19:45",
      "20:00",
      "20:15",
      "20:30",
      "20:45",
      "21:00",
      "21:15",
      "21:30",
      // intentially excluding last 30 mins slot to not stress kitchen at end of night.
    ];

    const now = toZonedTime(new Date(), "America/Chicago");

    // if selectedDate is today, then we need to check if the current time
    // is past the minimum pickup time
    if (selectedDate.getDay() === now.getDay() && minPickupTime) {
      basePickupTimes = basePickupTimes.filter((time) => {
        if (
          isSelectedTimeSlotValid({
            isASAP: time === "ASAP (~20 mins)",
            datetimeToPickup:
              time === "ASAP (~20 mins)"
                ? now
                : mergeDateAndTime(selectedDate, time) || now,
            minPickupDatetime: minPickupTime,
          })
        ) {
          return true;
        }
      });
    } else {
      basePickupTimes.splice(0, 1); // remove ASAP time slot
    }

    setAvailablePickupTimes(basePickupTimes);
  }, [selectedDate, minPickupTime]);

  // TODO: see if you can use the getMidnightDate function here, I know there were
  // issues with rerendering too many times/infinitely before but I think it should
  // be doable.
  // const todayAtMidnight = useMemo(() => {
  //   const today = toZonedTime(new Date(), "America/Chicago");
  //   today.setHours(0, 0, 0, 0);

  //   return today;
  // }, []);

  const orderingIsNotAvailable = useMemo(() => {
    const now = toZonedTime(new Date(), "America/Chicago");
    const todaysHours =
      hoursOpenPerDay[now.getDay() as keyof typeof hoursOpenPerDay];
    const todayAtMidnight = getMidnightCSTInUTC();

    return (
      selectedDate.getTime() === todayAtMidnight.getTime() &&
      ((minPickupTime && minPickupTime.getHours() >= todaysHours.close) ||
        // if it's 30 mins from close or later, we should disable ordering
        now.getHours() >= todaysHours.close ||
        (now.getHours() === todaysHours.close - 1 && now.getMinutes() >= 30))
    );
  }, [selectedDate, minPickupTime]);

  // should be exceedingly rare that this is true, should only happen if someone manually
  // enables a disabled day in the date picker <Select />...
  if (isRestaurantClosedToday(selectedDate) || isHoliday(selectedDate)) {
    <div className="baseVertFlex w-64 !items-start gap-2 p-4">
      <p className="font-semibold underline underline-offset-2">Notice:</p>
      <p className="text-sm">
        Our restaurant is not open on this day. Please select a future date for
        your pickup. We apologize for any inconvenience this may cause.
      </p>
    </div>;
  }

  if (orderingIsNotAvailable) {
    return (
      <div className="baseVertFlex w-64 !items-start gap-2 p-4">
        <p className="font-semibold underline underline-offset-2">Notice:</p>
        <p className="text-sm">
          We are currently not accepting new orders for the night. Please select
          a future date for your pickup. We apologize for any inconvenience this
          may cause.
        </p>
      </div>
    );
  }

  return (
    <SelectGroup>
      <SelectLabel>Available pickup times</SelectLabel>

      <AnimatePresence mode="wait">
        {minPickupTime !== undefined &&
        minPickupTime !== null &&
        availablePickupTimes ? (
          <motion.div
            key={"pickup-times"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.25,
            }}
          >
            {availablePickupTimes.map((time) => (
              <SelectItem key={time} value={time}>
                {/* I know this looks weird, but I think it's honestly fine */}
                {time === "ASAP (~20 mins)"
                  ? "ASAP (~20 mins)"
                  : formatTimeString(time)}
              </SelectItem>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={"loading-pickup-times"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.25,
            }}
            className="baseFlex"
          >
            <div
              className="my-8 inline-block size-6 animate-spin rounded-full border-[2px] border-primary border-t-transparent text-primary"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SelectGroup>
  );
}

export default AvailablePickupTimes;
