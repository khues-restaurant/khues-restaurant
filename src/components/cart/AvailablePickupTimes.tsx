import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { NumberOfOrdersAllowedPerPickupTimeSlot } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
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
import { api } from "~/utils/api";

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

  const selectedDateTimestamp = selectedDate.getTime();
  const minPickupTimestamp =
    minPickupTime instanceof Date ? minPickupTime.getTime() : undefined;

  const selectedDateKey = useMemo(
    () =>
      formatInTimeZone(
        new Date(selectedDateTimestamp),
        "America/Chicago",
        "yyyy-MM-dd",
      ),
    [selectedDateTimestamp],
  );

  const timeslotCapacityApi = (
    api as typeof api & {
      numberOfOrdersAllowedPerPickupTimeSlot: typeof api.minimumOrderPickupTime;
    }
  ).numberOfOrdersAllowedPerPickupTimeSlot;

  const orderApi = api.order as typeof api.order & {
    getTimeslotUsage: typeof api.order.getDashboardOrders;
  };

  const { data: numberOfOrdersAllowed } = timeslotCapacityApi.get.useQuery();

  const timeslotUsageQuery = orderApi.getTimeslotUsage.useQuery(
    { date: selectedDateKey },
    {
      enabled: Boolean(selectedDateKey),
      keepPreviousData: true,
    },
  );

  const timeslotUsage =
    (timeslotUsageQuery.data as Record<string, number> | undefined) ??
    undefined;

  const capacityRecord = (numberOfOrdersAllowed ??
    null) as NumberOfOrdersAllowedPerPickupTimeSlot | null;

  const maxOrdersPerTimeslot = capacityRecord?.value ?? null;

  const availablePickupTimes = useMemo(() => {
    if (!hoursOfOperation.length) {
      return [];
    }

    const selectedDateForCalculation = new Date(selectedDateTimestamp);

    let basePickupTimes = getOpenTimesForDay({
      dayOfWeek: selectedDateForCalculation.getDay() as DayOfWeek,
      limitToThirtyMinutesBeforeClose: true,
      hoursOfOperation,
    });

    if (!basePickupTimes.length) {
      return [];
    }

    const now = toZonedTime(new Date(), "America/Chicago");
    const maybeMinPickupDate =
      typeof minPickupTimestamp === "number"
        ? new Date(minPickupTimestamp)
        : null;

    const isSameCalendarDay =
      selectedDateForCalculation.getFullYear() === now.getFullYear() &&
      selectedDateForCalculation.getMonth() === now.getMonth() &&
      selectedDateForCalculation.getDate() === now.getDate();

    if (isSameCalendarDay && maybeMinPickupDate) {
      basePickupTimes = basePickupTimes.filter((time) => {
        const slotDateTime = mergeDateAndTime(selectedDateForCalculation, time);

        if (!slotDateTime) {
          return false;
        }

        return isSelectedTimeSlotValid({
          datetimeToPickup: slotDateTime,
          minPickupDatetime: maybeMinPickupDate,
          hoursOfOperation,
          holidays,
        });
      });
    }

    return basePickupTimes;
  }, [holidays, hoursOfOperation, minPickupTimestamp, selectedDateTimestamp]);

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
    const maybeMinPickupDate =
      typeof minPickupTimestamp === "number"
        ? new Date(minPickupTimestamp)
        : null;

    return (
      selectedDateTimestamp === todayAtMidnight.getTime() &&
      ((maybeMinPickupDate !== null &&
        maybeMinPickupDate.getHours() >= todaysHours.closeHour &&
        maybeMinPickupDate.getMinutes() >= todaysHours.closeMinute) ||
        isPastFinalPickupPlacementTimeForDay({
          currentHour: now.getHours(),
          currentMinute: now.getMinutes(),
          closeHour: todaysHours.closeHour,
          closeMinute: todaysHours.closeMinute,
        }))
    );
  }, [hoursOfOperation, minPickupTimestamp, selectedDateTimestamp]);

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
              <SelectItem
                key={time}
                value={time}
                disabled={
                  maxOrdersPerTimeslot !== null &&
                  (timeslotUsage?.[time] ?? 0) >= maxOrdersPerTimeslot
                }
                className={
                  maxOrdersPerTimeslot !== null &&
                  (timeslotUsage?.[time] ?? 0) >= maxOrdersPerTimeslot
                    ? "text-muted-foreground"
                    : undefined
                }
              >
                {formatTimeString(time)}
                {maxOrdersPerTimeslot !== null &&
                (timeslotUsage?.[time] ?? 0) >= maxOrdersPerTimeslot
                  ? " (Full)"
                  : ""}
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
