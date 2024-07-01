import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDays,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CiViewTable } from "react-icons/ci";
import { IoStatsChart } from "react-icons/io5";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

const customReportSchema = z.object({
  category: z.enum([
    "totalOrders",
    "totalRevenue",
    "totalTips",
    "averageOrderValue",
    "averageOrderCompletionTime",
    "lateOrders",
  ]),
  periodicity: z.enum(["daily", "weekly", "monthly", "yearly"]),
  day: z.string().optional(),
  week: z.string().optional(),
  month: z.string().optional(),
  year: z.string(),
});

function Stats() {
  const [reportParams, setReportParams] = useState<{
    totalOrders?: boolean;
    totalRevenue?: boolean;
    averageOrderValue?: boolean;
    averageOrderCompletionTime?: boolean;
    lateOrders?: boolean;

    periodicity: Periodicity;

    currStartDate: Date;
    currEndDate: Date;
    prevStartDate?: Date;
    prevEndDate?: Date;
  }>(getPresetReportParams("daily"));

  const { data: orderYearRange } = api.stats.getYearRange.useQuery();

  const { data: reportResults, isLoading: generatingReport } =
    api.stats.generateReport.useQuery(reportParams, {
      refetchOnWindowFocus: false,
    });

  const customReportForm = useForm<z.infer<typeof customReportSchema>>({
    resolver: zodResolver(customReportSchema),
    values: {
      category: "totalOrders",
      periodicity: "daily",
      year: new Date().getFullYear().toString(),
    },
  });

  async function onFormSubmit(values: z.infer<typeof customReportSchema>) {
    setSelectedPresetReport(null);

    const { startDate, endDate } = getSpecificDateRange(values);

    setReportParams({
      [values.category]: true,
      periodicity: values.periodicity,
      currStartDate: startDate,
      currEndDate: endDate,
    });
  }

  const [selectedPresetReport, setSelectedPresetReport] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | null
  >("daily");

  if (!orderYearRange) return null;

  return (
    <motion.div
      key={"stats"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex my-8 mb-24 mt-24 h-full max-w-3xl tablet:mt-28 desktop:max-w-6xl"
    >
      {/* form + preset report buttons grid */}

      <div className="baseFlex size-full !items-start !justify-between">
        <div className="baseVertFlex w-full !items-start gap-4">
          <p className="font-medium underline underline-offset-2">
            Custom report
          </p>

          <Form {...customReportForm}>
            <form
              onSubmit={customReportForm.handleSubmit(onFormSubmit)}
              className="baseVertFlex w-full !items-start gap-2"
            >
              <div className="baseVertFlex w-full !items-start gap-8">
                <FormField
                  control={customReportForm.control}
                  name="category"
                  disabled={orderYearRange === undefined || generatingReport}
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                      <div className="baseVertFlex relative w-full max-w-64 !items-start gap-2">
                        <FormLabel className="font-semibold">
                          Category
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="totalOrders">
                              Total orders
                            </SelectItem>
                            <SelectItem value="totalRevenue">
                              Total Revenue
                            </SelectItem>
                            <SelectItem value="totalTips">
                              Total tips
                            </SelectItem>
                            <SelectItem value="averageOrderValue">
                              Average order value
                            </SelectItem>
                            <SelectItem value="averageOrderCompletionTime">
                              Average order completion time
                            </SelectItem>
                            <SelectItem value="lateOrders">
                              Late orders
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <AnimatePresence>
                        {invalid && (
                          <motion.div
                            key={"categoryError"}
                            initial={{
                              opacity: 0,
                              height: 0,
                              marginTop: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: "0.5rem",
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-1 text-sm font-medium text-red-500"
                          >
                            {error?.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />

                <FormField
                  control={customReportForm.control}
                  name="periodicity"
                  disabled={orderYearRange === undefined || generatingReport}
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                      <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                        <FormLabel className="font-semibold">Range</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(e) => {
                              // reset day, week, and month inputs to an empty string
                              customReportForm.setValue("day", "", {
                                shouldValidate: true,
                              });
                              customReportForm.setValue("week", "", {
                                shouldValidate: true,
                              });
                              customReportForm.setValue("month", "", {
                                shouldValidate: true,
                              });

                              field.onChange(e);
                              // unsure of why this is necessary, but the customReportForm.getValues("periodicity")
                              // was not updating when switching to monthly/yearly without it...
                              void customReportForm.trigger("periodicity");
                            }}
                            value={field.value}
                            className="baseFlex gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="daily" />
                              </FormControl>
                              <FormLabel className="font-normal">Day</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="weekly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Week
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="monthly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Month
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yearly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Year
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </div>
                      <AnimatePresence>
                        {invalid && (
                          <motion.div
                            key={"periodicityError"}
                            initial={{
                              opacity: 0,
                              height: 0,
                              marginTop: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: "0.5rem",
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-1 text-sm font-medium text-red-500"
                          >
                            {error?.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />

                <div className="grid w-96 grid-cols-2 grid-rows-2 gap-2">
                  <FormField
                    control={customReportForm.control}
                    name="day"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                        <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                          <FormLabel className="font-semibold">Day</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              orderYearRange === undefined ||
                              generatingReport ||
                              customReportForm.getValues("periodicity") !==
                                "daily"
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* for loop that renders 1-31, shifted to 0-30 for the value */}
                              {Array.from({ length: 31 }, (_, i) => i).map(
                                (i) => (
                                  <SelectItem key={i} value={`${i}`}>
                                    {getOrdinalNumber(i + 1)}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <AnimatePresence>
                          {invalid && (
                            <motion.div
                              key={"dayError"}
                              initial={{
                                opacity: 0,
                                height: 0,
                                marginTop: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: "0.5rem",
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-1 text-sm font-medium text-red-500"
                            >
                              {error?.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customReportForm.control}
                    name="week"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                        <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                          <FormLabel className="font-semibold">Week</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              orderYearRange === undefined ||
                              generatingReport ||
                              customReportForm.getValues("periodicity") ===
                                "monthly" ||
                              customReportForm.getValues("periodicity") ===
                                "yearly"
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a week" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1st week">1st week</SelectItem>
                              <SelectItem value="2nd week">2nd week</SelectItem>
                              <SelectItem value="3rd week">3rd week</SelectItem>
                              <SelectItem value="4th week">4th week</SelectItem>
                              <SelectItem value="5th week">
                                5th week*
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <AnimatePresence>
                          {invalid && (
                            <motion.div
                              key={"weekError"}
                              initial={{
                                opacity: 0,
                                height: 0,
                                marginTop: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: "0.5rem",
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-1 text-sm font-medium text-red-500"
                            >
                              {error?.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customReportForm.control}
                    name="month"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                        <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                          <FormLabel className="font-semibold">Month</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              orderYearRange === undefined ||
                              generatingReport ||
                              customReportForm.getValues("periodicity") ===
                                "yearly"
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="January">January</SelectItem>
                              <SelectItem value="February">February</SelectItem>
                              <SelectItem value="March">March</SelectItem>
                              <SelectItem value="April">April</SelectItem>
                              <SelectItem value="May">May</SelectItem>
                              <SelectItem value="June">June</SelectItem>
                              <SelectItem value="July">July</SelectItem>
                              <SelectItem value="August">August</SelectItem>
                              <SelectItem value="September">
                                September
                              </SelectItem>
                              <SelectItem value="October">October</SelectItem>
                              <SelectItem value="November">November</SelectItem>
                              <SelectItem value="December">December</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <AnimatePresence>
                          {invalid && (
                            <motion.div
                              key={"monthError"}
                              initial={{
                                opacity: 0,
                                height: 0,
                                marginTop: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: "0.5rem",
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-1 text-sm font-medium text-red-500"
                            >
                              {error?.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customReportForm.control}
                    name="year"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                        <div className="baseVertFlex w-full !items-start gap-2">
                          <FormLabel className="font-semibold">Year</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              orderYearRange === undefined || generatingReport
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from(
                                {
                                  length:
                                    orderYearRange?.maxYear -
                                    orderYearRange?.minYear +
                                    1, // double check this +1 you added
                                },
                                (_, i) => i,
                              ).map((i) => (
                                <SelectItem
                                  key={i}
                                  value={`${i + orderYearRange.minYear}`}
                                >
                                  {i + orderYearRange.minYear}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <AnimatePresence>
                          {invalid && (
                            <motion.div
                              key={"yearError"}
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: "0.5rem",
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-1 text-sm font-medium text-red-500"
                            >
                              {error?.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="mt-8"
                disabled={orderYearRange === undefined || generatingReport}
              >
                Generate report
              </Button>
            </form>
          </Form>
        </div>

        <Separator className="mx-4 h-[400px] w-[1px] bg-gray-300" />

        {/* not the biggest fan of hardcoding the height here */}
        <div className="baseVertFlex relative h-[416px] w-full !items-start !justify-start gap-4">
          <p className="font-medium underline underline-offset-2">
            Preset comparison reports
          </p>

          <div className="baseVertFlex w-full !items-start gap-4">
            <Button
              variant={selectedPresetReport === "daily" ? "default" : "outline"}
              className="w-64"
              onClick={() => {
                setSelectedPresetReport("daily");
              }}
            >
              Today / Yesterday
            </Button>
            <Button
              variant={
                selectedPresetReport === "weekly" ? "default" : "outline"
              }
              className="w-64"
              onClick={() => {
                setSelectedPresetReport("weekly");
              }}
            >
              This week / Last week
            </Button>

            <Button
              variant={
                selectedPresetReport === "monthly" ? "default" : "outline"
              }
              className="w-64"
              onClick={() => {
                setSelectedPresetReport("monthly");
              }}
            >
              This month / Last month
            </Button>

            <Button
              variant={
                selectedPresetReport === "yearly" ? "default" : "outline"
              }
              className="w-64"
              onClick={() => {
                setSelectedPresetReport("yearly");
              }}
            >
              This year / Last year
            </Button>
          </div>

          <Button
            disabled={selectedPresetReport === null || generatingReport}
            className="absolute bottom-0 left-0"
            onClick={() => {
              if (selectedPresetReport === null) return;

              setReportParams(getPresetReportParams(selectedPresetReport));
            }}
          >
            Generate report
          </Button>
        </div>
      </div>

      <Separator className="my-4 h-[1px] w-full bg-gray-300" />

      {/* .map() of results from query */}
      {reportResults === null && (
        <p className="text-lg font-medium">
          No results found for the selected report
        </p>
      )}

      {generatingReport && (
        <div className="baseVertFlex h-80 w-full">
          <AnimatedLotus className="size-24 fill-primary" />
          <p className="text-lg font-medium">Generating report</p>
        </div>
      )}

      {reportResults && (
        <div className="baseVertFlex w-full gap-4">
          {/* .map() through results */}
          {reportResults.map((report) => (
            <StatsCategoryVisualReport
              key={`${report.title}-${report.timeRange}`}
              title={report.title}
              timeRange={report.timeRange}
              data={report.data}
              totalCurr={report.totalCurr}
              totalPrev={report.totalPrev}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Stats;

interface StatsCategoryVisualReport {
  title: string;
  timeRange: string;
  data: {
    name: string;
    curr: number;
    prev: number;
  }[];
  totalCurr: string;
  totalPrev: string | null;
}

function StatsCategoryVisualReport({
  title,
  timeRange,
  data,
  totalCurr,
  totalPrev,
}: StatsCategoryVisualReport) {
  const [reportType, setReportType] = useState<"graph" | "table">("graph");
  // ^ maybe end up having this be a prop passed in from parent component so it
  // affects all rendered <StatsCategoryVisualReport /> components at once

  return (
    <div className="baseVertFlex w-full gap-4 border-b pb-4">
      <div className="baseVertFlex w-full gap-2">
        <div className="baseFlex w-full !justify-end gap-2">
          <Button
            variant={reportType === "graph" ? "default" : "outline"}
            onClick={() => setReportType("graph")}
          >
            <IoStatsChart className="size-5" />
          </Button>
          <Button
            variant={reportType === "table" ? "default" : "outline"}
            onClick={() => setReportType("table")}
          >
            <CiViewTable className="size-5" />
          </Button>
        </div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm font-normal">{timeRange}</p>
      </div>

      {reportType === "graph" ? (
        <BarChart width={700} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          {/* ^ figure out the domain with this so that it automatically is a sensible amount based
          on the data. maybe it's off since there are so few data points right now? */}
          <Tooltip animationDuration={0} />
          <Legend />
          <Bar dataKey="prev" fill="#8884d8" minPointSize={5} />
          <Bar dataKey="curr" fill="#82ca9d" minPointSize={5} />
        </BarChart>
      ) : null}

      <div className="baseFlex gap-8 font-medium">
        {totalPrev !== null && <p>Previous: {totalPrev}</p>}
        <p>Current: {totalCurr} </p>
      </div>
    </div>
  );
}

type Periodicity = "daily" | "weekly" | "monthly" | "yearly";

function getReportDateRanges(periodicity: Periodicity) {
  const currEndDate = new Date();
  let currStartDate = new Date();
  let prevStartDate = new Date();
  let prevEndDate = new Date();

  switch (periodicity) {
    case "daily":
      currStartDate = startOfDay(currEndDate);
      prevEndDate = subDays(currStartDate, 1);
      prevStartDate = startOfDay(prevEndDate);
      break;

    case "weekly":
      currStartDate = startOfWeek(currEndDate);
      prevEndDate = subDays(currStartDate, 1);
      prevStartDate = startOfWeek(prevEndDate);
      break;

    case "monthly":
      currStartDate = startOfMonth(currEndDate);
      prevEndDate = subDays(currStartDate, 1);
      prevStartDate = startOfMonth(prevEndDate);
      break;

    case "yearly":
      currStartDate = startOfYear(currEndDate);
      prevEndDate = subDays(currStartDate, 1);
      prevStartDate = startOfYear(prevEndDate);
      break;

    default:
      throw new Error("Invalid periodicity");
  }

  currEndDate.setHours(23, 59, 59, 999); // Ensure currEndDate is at the end of the day

  return { currStartDate, currEndDate, prevStartDate, prevEndDate };
}

function getSpecificDateRange({
  periodicity,
  day,
  week,
  month,
  year,
}: {
  periodicity: Periodicity;
  day?: string;
  week?: string;
  month?: string;
  year: string;
}) {
  let startDate = new Date();
  let endDate = new Date();

  if (year) {
    startDate = parse(`${year}-01-01`, "yyyy-MM-dd", new Date());
    endDate = parse(`${year}-12-31`, "yyyy-MM-dd", new Date());
  }

  if (month) {
    startDate = parse(`${year}-${month}-01`, "yyyy-MMMM-dd", new Date());
    endDate = endOfMonth(startDate);
  }

  switch (periodicity) {
    case "daily":
      if (day) {
        startDate = parse(
          `${year}-${month}-${day}`,
          "yyyy-MMMM-dd",
          new Date(),
        );
        endDate = endOfDay(startDate);
      } else {
        startDate = startOfDay(startDate);
        endDate = endOfDay(endDate);
      }
      break;

    case "weekly":
      if (week) {
        const weekNumber = parseInt(week.split(" ")[0] ?? "1", 10) - 1; // Get week number (0-indexed)
        const monthStartDate = startOfMonth(startDate);
        startDate = addWeeks(monthStartDate, weekNumber);
        endDate = addDays(startDate, 6);
      } else {
        startDate = startOfWeek(startDate);
        endDate = endOfWeek(endDate);
      }
      break;

    case "monthly":
      startDate = startOfMonth(startDate);
      endDate = endOfMonth(endDate);
      break;

    case "yearly":
      startDate = startOfYear(startDate);
      endDate = endOfYear(endDate);
      break;

    default:
      throw new Error("Invalid periodicity");
  }

  return { startDate, endDate };
}

function getPresetReportParams(periodicity: Periodicity) {
  return {
    totalOrders: true,
    totalRevenue: true,
    totalTips: true,
    averageOrderValue: true,
    averageOrderCompletionTime: true,
    lateOrders: true,

    periodicity,

    ...getReportDateRanges(periodicity),
  };
}

function getOrdinalNumber(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;

  if (v > 10 && v < 20) {
    return `${n}th`;
  } else {
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  }
}
