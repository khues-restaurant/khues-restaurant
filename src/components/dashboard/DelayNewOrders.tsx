import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import { useMainStore } from "~/stores/MainStore";
import { type DayOfWeek } from "~/types/operatingHours";
import { api } from "~/utils/api";
import {
  CHICAGO_TIME_ZONE,
  getMidnightCSTInUTC,
} from "~/utils/dateHelpers/cstToUTCHelpers";
import { getOpenTimesForDay } from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { getHoursAndMinutesFromDate } from "~/utils/dateHelpers/getHoursAndMinutesFromDate";
import { mergeDateAndTime } from "~/utils/dateHelpers/mergeDateAndTime";
import { formatTimeString } from "~/utils/formatters/formatTimeString";

function DelayNewOrders() {
  const ctx = api.useUtils();
  const { hoursOfOperation } = useMainStore((state) => ({
    hoursOfOperation: state.hoursOfOperation,
  }));

  const { data: minOrderPickupTime } =
    api.minimumOrderPickupTime.get.useQuery();
  const { mutate: setDBValue, isLoading: isUpdatingNewMinOrderPickupTime } =
    api.minimumOrderPickupTime.set.useMutation({
      onSuccess: async () => {
        await ctx.minimumOrderPickupTime.get.refetch();

        setShowDialog(false);

        // TODO: fix this to be more specific. get the actual time that was set
        // or that orders are resumed as normal based on minimumOrderPickupTime return value
        toast({
          description: "Successfully updated the minimum order pickup time.",
        });
      },
      onError: (e) => {
        // toast notification here
        console.error(e);
      },
      onSettled: () => {
        void ctx.dashboard.getHeaderStatusReport.invalidate();
      },
    });

  const [showDialog, setShowDialog] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [minOrderPickupTimeValue, setMinOrderPickupTimeValue] = useState("");

  const chicagoCurrentDate = toZonedTime(currentDate, CHICAGO_TIME_ZONE);

  const times = hoursOfOperation.length
    ? getOpenTimesForDay({
        dayOfWeek: chicagoCurrentDate.getDay() as DayOfWeek,
        hoursOfOperation,
      })
    : [];

  const { toast } = useToast();

  const todayAtMidnight = getMidnightCSTInUTC(currentDate);

  useEffect(() => {
    if (!minOrderPickupTime) return;

    setMinOrderPickupTimeValue(
      getHoursAndMinutesFromDate(minOrderPickupTime.value),
    );
  }, [showDialog, minOrderPickupTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []); // not exactly what you want, but it's close enough I think
  // ^ TODO: maybe need to have actual AlertDialogContent be in a separate component so you can properly
  // tap into the lifcycle hooks?

  function timeIsEqualToStoreCloseTime(time: string) {
    if (!hoursOfOperation.length) return false;

    const storeCloseTime = getOpenTimesForDay({
      dayOfWeek: chicagoCurrentDate.getDay() as DayOfWeek,
      hoursOfOperation,
    }).slice(-1)[0];

    if (!storeCloseTime) return false;

    return time === formatTimeString(storeCloseTime);
  }

  return (
    <AlertDialog
      open={showDialog}
      onOpenChange={() => {
        setCurrentDate(new Date());
        setMinOrderPickupTimeValue("");
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant={"link"}
          className="text-lg tablet:text-xl"
          onClick={() => setShowDialog(true)}
        >
          Delay New Orders
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        {minOrderPickupTime && (
          <div className="baseVertFlex w-full">
            <div className="baseVertFlex gap-8">
              {minOrderPickupTime.value.getTime() !==
              todayAtMidnight.getTime() ? (
                <div className="baseVertFlex gap-4">
                  <p>
                    Online ordering is paused until{" "}
                    {timeIsEqualToStoreCloseTime(
                      formatInTimeZone(
                        minOrderPickupTime.value,
                        CHICAGO_TIME_ZONE,
                        "p",
                      ),
                    )
                      ? "tomorrow"
                      : formatInTimeZone(
                          minOrderPickupTime.value,
                          CHICAGO_TIME_ZONE,
                          "p",
                        )}
                    .
                  </p>
                  <Button
                    variant="secondary"
                    disabled={isUpdatingNewMinOrderPickupTime}
                    onClick={() => {
                      const todayAtMidnight = getMidnightCSTInUTC(currentDate);

                      setDBValue(todayAtMidnight);
                    }}
                  >
                    Resume online ordering
                  </Button>
                </div>
              ) : (
                <p className="w-48 text-center sm:w-auto">
                  Currently accepting new orders as normal.
                </p>
              )}

              <Separator className="w-full bg-stone-400" />

              <div className="baseVertFlex !items-start gap-2">
                <div className="baseFlex gap-2">
                  <Label htmlFor="delayAmount">Pause online orders until</Label>
                  <Select
                    value={minOrderPickupTimeValue}
                    onValueChange={(value) => setMinOrderPickupTimeValue(value)}
                  >
                    <SelectTrigger id={"delayAmount"} className="w-[180px]">
                      <SelectValue placeholder="Select a delay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Delay until</SelectLabel>
                        {times.map((time, index) => (
                          <>
                            {/* only show times in the future */}
                            {/* also excluding the second to last time slot since an order will never
                                be able to be picked up 20 minutes from close. Just reduces confusion
                                on dashboard side */}
                            {index !== times.length - 2 &&
                              currentDate.getTime() <
                                (mergeDateAndTime(
                                  currentDate,
                                  time,
                                )?.getTime() ?? currentDate.getTime()) && (
                                <SelectItem key={time} value={time}>
                                  {index === times.length - 1
                                    ? "Tomorrow"
                                    : formatTimeString(time)}
                                </SelectItem>
                              )}
                          </>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter className="baseFlex mt-8 w-full !flex-row !justify-between gap-8">
          <Button
            variant="secondary"
            disabled={isUpdatingNewMinOrderPickupTime}
            className="w-full"
            onClick={() => setShowDialog(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={
              minOrderPickupTimeValue === "" || isUpdatingNewMinOrderPickupTime
              // TODO: || minOrderPickupTime === currentDBMinOrderPickupTime
            }
            className="w-full"
            onClick={() => {
              const newMinOrderPickupTime = mergeDateAndTime(
                currentDate,
                minOrderPickupTimeValue,
              );

              if (!newMinOrderPickupTime) return;

              setDBValue(newMinOrderPickupTime);
            }}
          >
            {/* if value is "" then that equates to minOrderPickupTime 
                  to be at midnight of current date */}
            {minOrderPickupTimeValue === "" ? "Pause" : "Update"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DelayNewOrders;
