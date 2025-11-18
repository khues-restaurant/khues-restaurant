import { format, isSameDay, startOfDay } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "../ui/calendar";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/components/ui/use-toast";
import { api, type RouterOutputs } from "~/utils/api";

type HolidayRecord = RouterOutputs["holiday"]["getAll"][number];

function Holidays() {
  const { toast } = useToast();
  const ctx = api.useUtils();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [recurringAnnual, setRecurringAnnual] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: holidays, isLoading } = api.holiday.getAll.useQuery();

  const { mutate: addHoliday, isLoading: isAdding } =
    api.holiday.add.useMutation({
      onSuccess: () => {
        void ctx.holiday.getAll.invalidate();
        toast({
          description: "Holiday added.",
        });
        setCalendarOpen(false);
      },
      onError: (error) => {
        toast({
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const { mutate: removeHoliday } = api.holiday.remove.useMutation({
    onMutate: ({ id }) => {
      setRemovingId(id);
    },
    onSuccess: () => {
      void ctx.holiday.getAll.invalidate();
      toast({
        description: "Holiday removed.",
      });
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setRemovingId(null);
    },
  });

  const disabledDates = useMemo(() => {
    if (!holidays) return [] as Date[];

    return holidays.map((holiday) => startOfDay(holiday.date));
  }, [holidays]);

  return (
    <motion.div
      key="holidays"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex my-8  !items-start gap-8 px-4"
    >
      <div className="baseVertFlex  !items-start gap-2">
        <p className="text-2xl font-semibold text-primary">Holidays</p>
        <p className="text-sm text-muted-foreground">
          Mark dates when the restaurant will be closed.
        </p>
      </div>

      <div className="baseVertFlex !items-start gap-4 rounded-lg border bg-offwhite p-4 md:w-[600px]">
        <div className="baseFlex w-full !justify-between gap-4">
          <div className="baseFlex gap-3">
            <Switch
              id="recurringSwitch"
              checked={recurringAnnual}
              onCheckedChange={setRecurringAnnual}
              disabled={isAdding}
            />
            <Label htmlFor="recurringSwitch" className="cursor-pointer">
              Repeat annually
            </Label>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button disabled={isAdding}>Add holiday</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-3">
              <Calendar
                mode="single"
                onSelect={(date: Date | undefined) => {
                  if (!date) return;

                  const normalized = startOfDay(date);

                  addHoliday({
                    date: normalized,
                    isRecurringAnnual: recurringAnnual,
                  });
                }}
                disabled={(date: Date) =>
                  disabledDates.some((disabled) => isSameDay(disabled, date))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Separator className="w-full" />

        {isLoading && holidays === undefined && (
          <p className="text-sm text-muted-foreground">Loading holidays…</p>
        )}

        {!isLoading && holidays?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No holidays have been scheduled yet.
          </p>
        )}

        {holidays && holidays.length > 0 && (
          <div className="baseVertFlex w-full !items-start gap-3">
            {holidays.map((holiday) => (
              <HolidayRow
                key={holiday.id}
                holiday={holiday}
                onRemove={(id) => removeHoliday({ id })}
                isRemoving={removingId === holiday.id}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HolidayRow({
  holiday,
  onRemove,
  isRemoving,
}: {
  holiday: HolidayRecord;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) {
  return (
    <div className="baseFlex w-full !justify-between gap-4 rounded-md border px-4 py-3">
      <div className="baseVertFlex !items-start gap-1">
        <p className="text-base font-medium">
          {format(holiday.date, "EEEE, MMMM d, yyyy")}
        </p>
        {holiday.isRecurringAnnual && (
          <span className="text-xs text-muted-foreground">
            Repeats annually
          </span>
        )}
      </div>

      <Button
        variant="destructive"
        size="sm"
        disabled={isRemoving}
        onClick={() => onRemove(holiday.id)}
      >
        Remove
      </Button>
    </div>
  );
}

export default Holidays;
