import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
import { api } from "~/utils/api";
import { formatTimeString } from "~/utils/formatTimeString";
import { getHoursAndMinutesFromDate } from "~/utils/getHoursAndMinutesFromDate";
import { mergeDateAndTime } from "~/utils/mergeDateAndTime";

const times = [
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
  "22:00",
];

function DelayNewOrders() {
  const ctx = api.useUtils();
  const { data: minOrderPickupTime } =
    api.minimumOrderPickupTime.get.useQuery();
  const { mutate: setDBValue, isLoading: isUpdatingNewMinOrderPickupTime } =
    api.minimumOrderPickupTime.set.useMutation({
      onSuccess: () => {
        void ctx.minimumOrderPickupTime.get.refetch();
        setShowDialog(false);
      },
      onError: (e) => {
        // toast notification here
        console.error(e);
      },
    });

  const [showDialog, setShowDialog] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [minOrderPickupTimeValue, setMinOrderPickupTimeValue] = useState("");

  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);

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
          Delay new orders
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        {minOrderPickupTime && (
          <div className="baseVertFlex w-full">
            <div className="baseVertFlex gap-8">
              {/* TODO: why is typescript mad at this? */}
              {minOrderPickupTime.value.getTime() !==
              todayAtMidnight.getTime() ? (
                <div className="baseVertFlex gap-4">
                  <p>
                    Online ordering is paused until{" "}
                    {format(minOrderPickupTime.value, "p")}.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const todayAtMidnight = new Date();
                      todayAtMidnight.setHours(0, 0, 0, 0);

                      setDBValue(todayAtMidnight);
                    }}
                    disabled={isUpdatingNewMinOrderPickupTime}
                  >
                    Resume online ordering
                  </Button>
                </div>
              ) : (
                <p>Currently accepting new orders as normal.</p>
              )}

              {/*  */}
              <div className="baseVertFlex !items-start gap-2">
                <div className="baseFlex gap-2">
                  <Label htmlFor="delayAmount">Pause online orders until</Label>
                  {/* value should be just */}
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
                        {times.map((time) => (
                          <>
                            {/* only show times in the future */}
                            {currentDate.getTime() <
                              (mergeDateAndTime(new Date(), time)?.getTime() ??
                                new Date().getTime()) && (
                              <SelectItem key={time} value={time}>
                                {/* {getFormattedTime(
                                  currentDate ?? new Date(),
                                  time,
                                )} */}
                                {/* ^ the total delay in HH:MM is probably useless information... 
                                    check in with Eric to be sure */}
                                {formatTimeString(time)}
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

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={
                minOrderPickupTimeValue === "" ||
                isUpdatingNewMinOrderPickupTime
              }
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
                  to be at midnight of current dat */}
              {minOrderPickupTimeValue === "" ? "Pause" : "Update"}
              {/* TODO: add spinner + checkmark for mutation */}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DelayNewOrders;
