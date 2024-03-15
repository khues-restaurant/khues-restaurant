import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import { formatTimeString } from "~/utils/formatTimeString";
import { is30MinsFromDatetime } from "~/utils/is30MinsFromDatetime";
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
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    // intentially excluding last 30 mins slot to not stress kitchen at end of night.
  ]);

  useEffect(() => {
    if (!minPickupTime) return;

    let basePickupTimes = [
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      // intentially excluding last 30 mins slot to not stress kitchen at end of night.
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // TODO: also make function from chatgpt to take in a Date and return true if
    // that date is greater than or equal to 30 minutes from now
    // ^^ only check this if selectedDate is today

    // "parseTimeToNumber" will have to be refactored to "parseTimeToDate" and take in
    // the time string and the date to then return the combined date.

    // if selectedDate is today, then we need to check if the current time
    // is past the minimum pickup time
    if (selectedDate.getTime() === today.getTime() && minPickupTime) {
      basePickupTimes = basePickupTimes.filter((time) => {
        const datetime = mergeDateAndTime(selectedDate, time);

        if (!datetime) return false;

        // Time is 30+ mins from now to allow kitchen to prepare on time, and
        // also after the minPickupTime.
        if (
          is30MinsFromDatetime(datetime, new Date()) &&
          datetime >= minPickupTime
        ) {
          console.log(
            "letting",
            time,
            "through",
            datetime,
            minPickupTime,
            today,
          );

          return true;
        }
      });
    }

    setAvailablePickupTimes(basePickupTimes);
  }, [selectedDate, minPickupTime]);

  if (minPickupTime && minPickupTime.getHours() >= 22) {
    return (
      <div className="baseVertFlex w-64 !items-start gap-2 p-4">
        <p className="font-semibold underline underline-offset-2">Notice:</p>
        <p>
          We are not accepting any new orders for the night. Sorry for the
          inconvenience.
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
                {formatTimeString(time)}
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
              className="inline-block size-8 animate-spin rounded-full border-[4px] border-primary border-t-transparent text-primary"
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
