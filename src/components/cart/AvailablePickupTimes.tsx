import { AnimatePresence, motion } from "framer-motion";
import React, {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import { api } from "~/utils/api";
import { parseTimeToNumber } from "~/utils/parseTimeToNumber";

interface AvailablePickupTimes {
  selectedDate: Date | undefined;
  minPickupTime: number | null | undefined;
  // pickupTime: string;
  // setPickupTime: Dispatch<SetStateAction<string>>; these only needed if auto changing pickup time
  // to be valid on date change (idk if this is good ux though)
}
function AvailablePickupTimes({
  selectedDate,
  minPickupTime,
  // pickupTime,
  // setPickupTime, these only needed if auto changing pickup time
  // to be valid on date change (idk if this is good ux though)
}: AvailablePickupTimes) {
  // const { data: minPickupTime } = api.minimOrderPickupTime.get.useQuery();

  // TODO: onchange of calendar date, setPickupTime to undefined as a heavyhanded approach

  // in the form of "300", "330", etc
  const [availablePickupTimes, setAvailablePickupTimes] = useState<string[]>([
    "300",
    "330",
    "400",
    "430",
    "500",
    "530",
    "600",
    "630",
    "700",
    "730",
    "800",
    "830",
    "900",
    "930",
    "1000",
  ]);

  useEffect(() => {
    if (minPickupTime === undefined) return;

    let basePickupTimes = [
      "300",
      "330",
      "400",
      "430",
      "500",
      "530",
      "600",
      "630",
      "700",
      "730",
      "800",
      "830",
      "900",
      "930",
      "1000",
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // if selectedDate is today, then we need to check if the current time
    // is past the minimum pickup time
    if (selectedDate?.getTime() === today.getTime() && minPickupTime) {
      basePickupTimes = basePickupTimes.filter((time) => {
        if (parseTimeToNumber(time) >= minPickupTime) {
          return true;
        }
      });
    }

    setAvailablePickupTimes(basePickupTimes);
  }, [selectedDate, minPickupTime]);

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
          >
            {availablePickupTimes.map((time) => (
              <SelectItem
                key={time}
                value={`${time.slice(0, -2)}:${time.slice(-2)}PM`}
              >
                {`${time.slice(0, -2)}:${time.slice(-2)} PM`}
              </SelectItem>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={"loading-pickup-times"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
