import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useMemo, useState } from "react";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import StaticLotus from "~/components/ui/StaticLotus";
import { useMainStore } from "~/stores/MainStore";
import { type DayOfWeek } from "~/types/operatingHours";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import {
  getHoursForDay,
  getOpenTimesForDay,
  isHoliday,
  isPastFinalPickupPlacementTimeForDay,
  isRestaurantClosedToday,
} from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { isSelectedTimeSlotValid } from "~/utils/dateHelpers/isSelectedTimeSlotValid";
import { mergeDateAndTime } from "~/utils/dateHelpers/mergeDateAndTime";
import { formatTimeString } from "~/utils/formatters/formatTimeString";

interface AvailablePickupTimesProps {
  selectedDate: Date;
  minPickupTime: Date | null | undefined;
}

function AvailablePickupTimes({
  selectedDate,
  minPickupTime,
}: AvailablePickupTimesProps) {
  const { hoursOfOperation, holidays } = useMainStore((state) => ({
    hoursOfOperation: state.hoursOfOperation,
    holidays: state.holidays,
  }));

  const [availablePickupTimes, setAvailablePickupTimes] = useState<string[]>(
    [],
  );

  useLayoutEffect(() => {
    if (!hoursOfOperation.length) {
      setAvailablePickupTimes([]);
      return;
    }

    let basePickupTimes = getOpenTimesForDay({
      dayOfWeek: selectedDate.getDay() as DayOfWeek,
      limitToThirtyMinutesBeforeClose: true,
      hoursOfOperation,
    });

    if (!basePickupTimes.length) {
      setAvailablePickupTimes([]);
      return;
    }

    const now = toZonedTime(new Date(), "America/Chicago");

    if (selectedDate.getDate() === now.getDate() && minPickupTime) {
      basePickupTimes = basePickupTimes.filter((time) => {
        const slotDateTime = mergeDateAndTime(selectedDate, time);

        if (!slotDateTime) {
          return false;
        }

        const pickupTimeIsValid = isSelectedTimeSlotValid({
          datetimeToPickup: slotDateTime,
          minPickupDatetime: minPickupTime,
          hoursOfOperation,
          holidays,
        });

        return pickupTimeIsValid;
      });
    }

    setAvailablePickupTimes(basePickupTimes);
  }, [selectedDate, minPickupTime, hoursOfOperation, holidays]);

  const orderingIsNotAvailable = useMemo(() => {
    if (!hoursOfOperation.length) {
      return true;
    }

    const now = toZonedTime(new Date(), "America/Chicago");
    const todaysHours = getHoursForDay(
      hoursOfOperation,
      now.getDay() as DayOfWeek,
    );

    if (!todaysHours || todaysHours.isClosedAllDay) {
      return true;
    }

    const todayAtMidnight = getMidnightCSTInUTC();

    return (
      selectedDate.getTime() === todayAtMidnight.getTime() &&
      ((minPickupTime &&
        minPickupTime.getHours() >= todaysHours.closeHour &&
        minPickupTime.getMinutes() >= todaysHours.closeMinute) ||
        isPastFinalPickupPlacementTimeForDay({
          currentHour: now.getHours(),
          currentMinute: now.getMinutes(),
          closeHour: todaysHours.closeHour,
          closeMinute: todaysHours.closeMinute,
        }))
    );
  }, [selectedDate, minPickupTime, hoursOfOperation]);

  if (!hoursOfOperation.length) {
    return (
      <SelectGroup>
        <SelectLabel>Available pickup times</SelectLabel>
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
      </SelectGroup>
    );
  }

  if (
    isRestaurantClosedToday(selectedDate, hoursOfOperation) ||
    isHoliday(selectedDate, holidays)
  ) {
    return (
      <div className="baseVertFlex w-64 !items-start gap-2 p-4">
        <p className="font-semibold underline underline-offset-2">Notice:</p>
        <p className="text-sm">
          Our restaurant is not open on this day. Please select a future date
          for your pickup. We apologize for any inconvenience this may cause.
        </p>
      </div>
    );
  }

  if (orderingIsNotAvailable) {
    return (
      <div className="baseVertFlex relative w-64 !items-start gap-2 p-4">
        <StaticLotus className="absolute -right-6 -top-6 size-16 rotate-[-135deg] fill-primary/50" />

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
        availablePickupTimes.length > 0 ? (
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
