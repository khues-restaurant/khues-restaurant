import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import {
  isHoliday,
  isRestaurantClosedToday,
} from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { useMainStore } from "~/stores/MainStore";

const getCurrentWeekDates = () => {
  const today = toZonedTime(new Date(), "America/Chicago");
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    dates.push(date);
  }
  return dates;
};

function AvailablePickupDays() {
  const { hoursOfOperation, holidays } = useMainStore((state) => ({
    hoursOfOperation: state.hoursOfOperation,
    holidays: state.holidays,
  }));

  const weekDates = getCurrentWeekDates();

  if (!hoursOfOperation.length) {
    return (
      <SelectGroup>
        <SelectLabel>Available pickup days</SelectLabel>
        <SelectItem value="loading" disabled>
          Loading available days…
        </SelectItem>
      </SelectGroup>
    );
  }

  return (
    <SelectGroup>
      <SelectLabel>Available pickup days</SelectLabel>

      {weekDates.map((date, index) => {
        const isClosed =
          isRestaurantClosedToday(date, hoursOfOperation) ||
          isHoliday(date, holidays);
        return (
          <SelectItem
            key={index}
            value={format(date, "yyyy-MM-dd")}
            disabled={isClosed}
          >
            {format(date, "EEEE, MMMM d")}
          </SelectItem>
        );
      })}
    </SelectGroup>
  );
}

export default AvailablePickupDays;
