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

// currently only supporting PM times
const times = [
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
  "5:00",
  "5:30",
  "6:00",
  "6:30",
  "7:00",
  "7:30",
  "8:00",
  "8:30",
  "9:00",
  "9:30",
];

function getFormattedTime(date: Date, time: string) {
  if (time === "") return "";

  // console.log(date, time);
  const [hours, minutes] = time.split(":").map(Number);

  // console.log(hours, minutes);

  if (hours === undefined || minutes === undefined)
    throw new Error("Invalid time");

  const newDate = new Date(date);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  const timeDiff = newDate.getTime() - Date.now();
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesDiff = Math.floor((timeDiff / (1000 * 60)) % 60);
  return `${time} PM - ${hoursDiff > 0 ? `${hoursDiff} hour${hoursDiff > 1 ? "s" : ""} ` : ""}${minutesDiff} minute${minutesDiff > 1 ? "s" : ""}`;
}

function formatNumberToTime(num: number): string {
  const hours = Math.floor(num / 100);
  const minutes = num % 100;
  // Padding the minutes to ensure two digits are always displayed
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${formattedMinutes}`;
}

function DelayNewOrders() {
  const ctx = api.useUtils();
  const { data: minOrderPickupTime } = api.minimOrderPickupTime.get.useQuery();
  const {
    mutate: setNewMinOrderPickupTime,
    isLoading: isUpdatingNewMinOrderPickupTime,
  } = api.minimOrderPickupTime.set.useMutation({
    onSuccess: () => {
      void ctx.minimOrderPickupTime.get.refetch();
      setShowDialog(false);
    },
    onError: (e) => {
      // toast notification here
      console.error(e);
    },
  });

  const [showDialog, setShowDialog] = useState(false);

  // setTimeout for every minute to update the current date/time?
  const [currentDate, setCurrentDate] = useState(new Date());
  const [minOrderPickupTimeValue, setMinOrderPickupTimeValue] = useState("");

  useEffect(() => {
    if (minOrderPickupTime && minOrderPickupTime?.value !== 0) {
      const value = formatNumberToTime(minOrderPickupTime.value);
      setMinOrderPickupTimeValue(value);
    }
  }, [showDialog, minOrderPickupTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []); // not exactly what you want, but it's close enough I think
  // ^ TODO: maybe need to have actual AlertDialogContent be in a separate component so you can properly
  // tap into the lifcycle hooks?

  // TODO: technically want to make an effect here that will check to see if the current time is past
  // the minOrderPickupTime and if so, then set the new minOrderPickupTime to 0

  console.log(minOrderPickupTimeValue);

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
        {minOrderPickupTime !== undefined && minOrderPickupTime !== null && (
          <div className="baseVertFlex w-full">
            <div className="baseVertFlex gap-8">
              {minOrderPickupTime.value !== 0 ? (
                <div className="baseVertFlex gap-4">
                  <p>
                    Online ordering is paused until{" "}
                    {formatNumberToTime(minOrderPickupTime.value) + " PM"}.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setNewMinOrderPickupTime(0);
                    }}
                    disabled={isUpdatingNewMinOrderPickupTime}
                  >
                    Resume online ordering
                  </Button>
                </div>
              ) : (
                <p>Online ordering is accepting new orders as normal.</p>
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
                            {currentDate.getTime() <
                              new Date().setHours(
                                parseInt(time.split(":")[0]), // still jank, consider making db minOrderPickupTime an actual Date (optionally null)
                                parseInt(time.split(":")[1]), // still jank, consider making db minOrderPickupTime an actual Date (optionally null)
                              ) && (
                              <SelectItem key={time} value={time}>
                                {/* this is probably useless information... check in with Eric to be sure */}
                                {/* {getFormattedTime(
                                  currentDate ?? new Date(),
                                  time,
                                )} */}
                                {time} PM
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
                const [hours, minutes] = minOrderPickupTimeValue.split(":");

                if (hours === undefined || minutes === undefined)
                  throw new Error("Invalid time");

                const newMinOrderPickupTime =
                  parseInt(hours) * 100 + parseInt(minutes);
                setNewMinOrderPickupTime(newMinOrderPickupTime);
              }}
            >
              {minOrderPickupTime?.value === 0 ? "Pause" : "Update"}
              {/* TODO: add spinner + checkmark for mutation */}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DelayNewOrders;
