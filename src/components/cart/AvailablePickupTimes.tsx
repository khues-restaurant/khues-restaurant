import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useMemo, useState } from "react";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import { formatTimeString } from "~/utils/formatTimeString";
import { is30MinsFromDatetime } from "~/utils/is30MinsFromDatetime";
import { isAbleToRenderASAPTimeSlot } from "~/utils/isAbleToRenderASAPTimeSlot";
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

  // avoiding brief flash of ASAP time slot if it's not able to be rendered
  useLayoutEffect(() => {
    if (!minPickupTime) return;

    let basePickupTimes = [
      "ASAP (~20 mins)",
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

    // if selectedDate is today, then we need to check if the current time
    // is past the minimum pickup time
    if (selectedDate.getTime() === today.getTime() && minPickupTime) {
      basePickupTimes = basePickupTimes.filter((time, index) => {
        if (
          time === "ASAP (~20 mins)" &&
          isAbleToRenderASAPTimeSlot(new Date()) &&
          new Date() >= minPickupTime
        ) {
          return true;
        }

        const datetime = mergeDateAndTime(selectedDate, time);

        if (!datetime) return false;

        // Time is 30+ mins from now to allow kitchen to prepare on time, and
        // also after the minPickupTime.
        if (
          is30MinsFromDatetime(datetime, new Date()) &&
          datetime >= minPickupTime
        ) {
          return true;
        }
      });
    } else {
      basePickupTimes.splice(0, 1); // remove ASAP time slot
    }

    setAvailablePickupTimes(basePickupTimes);
  }, [selectedDate, minPickupTime]);

  const today = useMemo(() => new Date(), []);

  const orderingIsNotAvailable = useMemo(() => {
    return (
      selectedDate.getTime() === today.getTime() &&
      ((minPickupTime && minPickupTime.getHours() >= 22) ||
        today.getHours() >= 22)
    );
  }, [selectedDate, minPickupTime, today]);

  if (orderingIsNotAvailable) {
    return (
      <div className="baseVertFlex w-64 !items-start gap-2 p-4">
        <p className="font-semibold underline underline-offset-2">Notice:</p>
        <p className="text-sm">
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
