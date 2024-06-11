import { addDays, format } from "date-fns";
import { SelectGroup, SelectItem, SelectLabel } from "~/components/ui/select";
import {
  isHoliday,
  isRestaurantClosedToday,
} from "~/utils/datesAndHoursOfOperation";

const getCurrentWeekDates = () => {
  const today = new Date();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    dates.push(date);
  }
  return dates;
};

function AvailablePickupDays() {
  const weekDates = getCurrentWeekDates();

  return (
    <SelectGroup>
      <SelectLabel>Available pickup days</SelectLabel>

      {weekDates.map((date, index) => {
        const isClosed = isRestaurantClosedToday(date) || isHoliday(date);
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
