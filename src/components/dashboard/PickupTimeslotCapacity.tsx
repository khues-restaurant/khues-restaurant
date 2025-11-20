import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";

function PickupTimeslotCapacity() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const timeslotCapacityApi = (
    api as typeof api & {
      numberOfOrdersAllowedPerPickupTimeSlot: typeof api.minimumOrderPickupTime;
    }
  ).numberOfOrdersAllowedPerPickupTimeSlot;

  const { data: numberOfOrdersAllowed } = timeslotCapacityApi.get.useQuery();

  const capacityUtils =
    utils.numberOfOrdersAllowedPerPickupTimeSlot as typeof utils.minimumOrderPickupTime;

  const orderUtils = utils.order as typeof utils.order & {
    getTimeslotUsage: typeof utils.order.getDashboardOrders;
  };

  const { mutate: updateCapacity, isLoading } =
    timeslotCapacityApi.set.useMutation({
      onSuccess: () => {
        void capacityUtils.get.invalidate();
        void orderUtils.getTimeslotUsage.invalidate();
        setShowDialog(false);
        toast({
          description: "Updated the pickup timeslot capacity.",
        });
      },
      onError: (error) => {
        console.error(error);
        toast({
          description:
            "We couldn't update the pickup timeslot capacity. Please try again.",
          variant: "destructive",
        });
      },
    });

  const [showDialog, setShowDialog] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const capacityRecord = numberOfOrdersAllowed ?? null;
  const capacityValue = capacityRecord?.value ?? null;

  useEffect(() => {
    if (!showDialog) {
      return;
    }

    if (capacityValue !== null) {
      setInputValue(capacityValue.toString());
    }
  }, [showDialog, capacityValue]);

  const parsedValue = Number(inputValue);
  const valueIsValid =
    inputValue.trim().length > 0 &&
    Number.isFinite(parsedValue) &&
    parsedValue >= 1 &&
    parsedValue <= 50;

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant="link"
          className="text-lg tablet:text-xl"
          onClick={() => setShowDialog(true)}
        >
          Set pickup capacity
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <div className="baseVertFlex gap-6">
          <p>
            Currently allowing up to{" "}
            <span className="font-semibold">
              {capacityValue !== null ? capacityValue : "—"}
            </span>{" "}
            orders per 15-minute pickup window.
          </p>

          <div className="baseVertFlex !items-start gap-2">
            <Label htmlFor="timeslot-capacity">Pickup capacity</Label>
            <Input
              id="timeslot-capacity"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={50}
              step={1}
              value={inputValue}
              onChange={(event) => {
                const rawValue = event.target.value;

                if (rawValue === "") {
                  setInputValue("");
                  return;
                }

                const sanitizedValue = rawValue.replace(/[^0-9]/g, "");

                if (sanitizedValue === "") {
                  setInputValue("");
                  return;
                }

                const numericValue = Number(sanitizedValue);

                if (Number.isNaN(numericValue)) {
                  return;
                }

                const clampedValue = Math.max(1, Math.min(50, numericValue));
                setInputValue(clampedValue.toString());
              }}
            />
          </div>

          <AlertDialogFooter className="baseFlex mt-4 w-full !flex-row !justify-between gap-8">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              disabled={!valueIsValid || isLoading}
              onClick={() => {
                if (!valueIsValid) {
                  return;
                }

                updateCapacity({ value: Number(inputValue) });
              }}
            >
              Save
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PickupTimeslotCapacity;
