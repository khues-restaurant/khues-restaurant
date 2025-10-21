import { format } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";

type DayOfWeekConfig = {
  id: string | null;
  dayOfWeek: number;
  label: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  isClosedAllDay: boolean;
};

const CLIENT_DEFAULTS: Record<
  number,
  Omit<DayOfWeekConfig, "label" | "dayOfWeek" | "id">
> = {
  0: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  1: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: true,
  },
  2: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: true,
  },
  3: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  4: {
    openHour: 16,
    openMinute: 30,
    closeHour: 21,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  5: {
    openHour: 16,
    openMinute: 30,
    closeHour: 22,
    closeMinute: 0,
    isClosedAllDay: false,
  },
  6: {
    openHour: 16,
    openMinute: 30,
    closeHour: 22,
    closeMinute: 0,
    isClosedAllDay: false,
  },
};

const DAY_ROWS: { label: string; dayOfWeek: number }[] = [
  { label: "Monday", dayOfWeek: 1 },
  { label: "Tuesday", dayOfWeek: 2 },
  { label: "Wednesday", dayOfWeek: 3 },
  { label: "Thursday", dayOfWeek: 4 },
  { label: "Friday", dayOfWeek: 5 },
  { label: "Saturday", dayOfWeek: 6 },
  { label: "Sunday", dayOfWeek: 0 },
];

const GENERIC_OPEN_CONFIG = {
  openHour: 16,
  openMinute: 30,
  closeHour: 21,
  closeMinute: 0,
  isClosedAllDay: false,
};

type NormalizedHours = {
  id: string | null;
  dayOfWeek: number;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  isClosedAllDay: boolean;
};

function HoursOfOperation() {
  const { toast } = useToast();
  const ctx = api.useUtils();

  const { isLoading } = api.hoursOfOperation.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      const reordered = reorderForDisplay(data);
      const dirty = initialRows !== null && hasChanges(initialRows, formRows);

      if (!dirty) {
        setInitialRows(reordered);
        setFormRows(reordered);
      }
    },
  });

  const [formRows, setFormRows] = useState<DayOfWeekConfig[]>([]);
  const [initialRows, setInitialRows] = useState<DayOfWeekConfig[] | null>(
    null,
  );

  const { mutate: saveHours, isLoading: isSaving } =
    api.hoursOfOperation.upsertWeek.useMutation({
      onSuccess: (updated) => {
        const reordered = reorderForDisplay(updated);
        setFormRows(reordered);
        setInitialRows(reordered);
        toast({
          description: "Hours of operation updated.",
        });
        void ctx.hoursOfOperation.getAll.invalidate();
      },
      onError: (error) => {
        toast({
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const label = format(new Date(2020, 0, 1, hour), "h a");
      return { value: hour.toString(), label };
    });
  }, []);

  const minuteOptions = useMemo(() => {
    return [0, 15, 30, 45].map((minute) => ({
      value: minute.toString(),
      label: minute.toString().padStart(2, "0"),
    }));
  }, []);

  if (isLoading && formRows.length === 0) {
    return (
      <motion.div
        key="hoursOfOperationLoading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="baseVertFlex my-8 w-full"
      >
        <p className="text-lg font-medium">Loading hours of operation…</p>
      </motion.div>
    );
  }

  const dirty = initialRows !== null && hasChanges(initialRows, formRows);

  return (
    <motion.div
      key="hoursOfOperation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex my-8  !items-start gap-8 px-4"
    >
      <div className="baseVertFlex  !items-start gap-2">
        <p className="text-2xl font-semibold text-primary">
          Hours of operation
        </p>
        <p className="text-sm text-muted-foreground">
          Update the daily open and close times. Mark a day as closed to disable
          online ordering for that date.
        </p>
      </div>

      <div className=" overflow-x-auto">
        <div className="grid w-[880px] grid-cols-[160px_repeat(4,120px)_140px] items-center gap-4 rounded-lg border bg-offwhite p-4">
          <div className="text-sm font-semibold text-muted-foreground">Day</div>
          <div className="text-sm font-semibold text-muted-foreground">
            Opens (hr)
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            Opens (min)
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            Closes (hr)
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            Closes (min)
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            Closed all day
          </div>

          {formRows.map((row) => (
            <Row
              key={row.dayOfWeek}
              row={row}
              hourOptions={hourOptions}
              minuteOptions={minuteOptions}
              onRowUpdate={(updates) => {
                setFormRows((prev) =>
                  prev.map((day) =>
                    day.dayOfWeek === row.dayOfWeek
                      ? { ...day, ...updates }
                      : day,
                  ),
                );
              }}
            />
          ))}
        </div>
      </div>

      <Separator className="w-full" />

      <div className="baseFlex w-full !justify-end gap-4">
        <Button
          variant="secondary"
          disabled={!dirty || isSaving}
          onClick={() => {
            if (initialRows) {
              setFormRows(initialRows);
            }
          }}
        >
          Discard changes
        </Button>

        <Button
          disabled={!dirty || isSaving}
          onClick={() => {
            const payload = formRows.map(
              (row) =>
                ({
                  id: row.id,
                  dayOfWeek: row.dayOfWeek,
                  openHour: row.openHour,
                  openMinute: row.openMinute,
                  closeHour: row.closeHour,
                  closeMinute: row.closeMinute,
                  isClosedAllDay: row.isClosedAllDay,
                }) satisfies NormalizedHours,
            );

            saveHours({ hours: payload });
          }}
        >
          Save changes
        </Button>
      </div>
    </motion.div>
  );
}

function Row({
  row,
  hourOptions,
  minuteOptions,
  onRowUpdate,
}: {
  row: DayOfWeekConfig;
  hourOptions: { value: string; label: string }[];
  minuteOptions: { value: string; label: string }[];
  onRowUpdate: (updates: Partial<DayOfWeekConfig>) => void;
}) {
  const defaultConfig = CLIENT_DEFAULTS[row.dayOfWeek] ?? GENERIC_OPEN_CONFIG;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Label className="text-base font-medium text-primary">
          {row.label}
        </Label>
        {row.isClosedAllDay && (
          <span className="text-xs text-muted-foreground">Closed</span>
        )}
      </div>

      <Select
        value={row.isClosedAllDay ? "" : row.openHour.toString()}
        onValueChange={(value) =>
          onRowUpdate({ openHour: Number.parseInt(value, 10) })
        }
        disabled={row.isClosedAllDay}
      >
        <SelectTrigger>
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={row.isClosedAllDay ? "" : row.openMinute.toString()}
        onValueChange={(value) =>
          onRowUpdate({ openMinute: Number.parseInt(value, 10) })
        }
        disabled={row.isClosedAllDay}
      >
        <SelectTrigger>
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={row.isClosedAllDay ? "" : row.closeHour.toString()}
        onValueChange={(value) =>
          onRowUpdate({ closeHour: Number.parseInt(value, 10) })
        }
        disabled={row.isClosedAllDay}
      >
        <SelectTrigger>
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={row.isClosedAllDay ? "" : row.closeMinute.toString()}
        onValueChange={(value) =>
          onRowUpdate({ closeMinute: Number.parseInt(value, 10) })
        }
        disabled={row.isClosedAllDay}
      >
        <SelectTrigger>
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="baseFlex !justify-start gap-3">
        <Switch
          id={`closed-${row.dayOfWeek}`}
          checked={row.isClosedAllDay}
          onCheckedChange={(checked) => {
            if (checked) {
              onRowUpdate({ isClosedAllDay: true });
              return;
            }

            const reopenedDefaults =
              (CLIENT_DEFAULTS[row.dayOfWeek]?.isClosedAllDay === false
                ? CLIENT_DEFAULTS[row.dayOfWeek]
                : undefined) ?? GENERIC_OPEN_CONFIG;

            onRowUpdate({
              isClosedAllDay: false,
              openHour:
                row.openHour === 0 && row.openMinute === 0
                  ? reopenedDefaults.openHour
                  : row.openHour,
              openMinute:
                row.openHour === 0 && row.openMinute === 0
                  ? reopenedDefaults.openMinute
                  : row.openMinute,
              closeHour:
                row.closeHour === 0 && row.closeMinute === 0
                  ? reopenedDefaults.closeHour
                  : row.closeHour,
              closeMinute:
                row.closeHour === 0 && row.closeMinute === 0
                  ? reopenedDefaults.closeMinute
                  : row.closeMinute,
            });
          }}
        />
      </div>
    </>
  );
}

function reorderForDisplay(hours: NormalizedHours[]): DayOfWeekConfig[] {
  const byDay = new Map<number, NormalizedHours>();

  for (const entry of hours) {
    byDay.set(entry.dayOfWeek, entry);
  }

  return DAY_ROWS.map(({ label, dayOfWeek }) => {
    const existing = byDay.get(dayOfWeek);

    if (!existing) {
      const defaults = CLIENT_DEFAULTS[dayOfWeek] ?? GENERIC_OPEN_CONFIG;

      return {
        id: null,
        dayOfWeek,
        label,
        ...defaults,
      } satisfies DayOfWeekConfig;
    }

    return {
      id: existing.id,
      dayOfWeek,
      label,
      openHour: existing.openHour,
      openMinute: existing.openMinute,
      closeHour: existing.closeHour,
      closeMinute: existing.closeMinute,
      isClosedAllDay: existing.isClosedAllDay,
    } satisfies DayOfWeekConfig;
  });
}

function hasChanges(
  reference: DayOfWeekConfig[],
  comparison: DayOfWeekConfig[],
): boolean {
  return JSON.stringify(reference) !== JSON.stringify(comparison);
}

export default HoursOfOperation;
