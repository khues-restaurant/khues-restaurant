import { zodResolver } from "@hookform/resolvers/zod";
import {
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
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const chartConfig: ChartConfig = {
  prev: {
    label: "Previous",
    color: "hsl(var(--chart-2))", // stone-400
  },
  curr: {
    label: "Current",
    color: "hsl(var(--chart-1))", // primary
  },
};

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

    currentStartDate: Date;
    currentEndDate: Date;
    previousStartDate?: Date;
    previousEndDate?: Date;
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
      currentStartDate: startDate,
      currentEndDate: endDate,
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
      className="baseVertFlex my-8 mb-24 h-full max-w-[350px] sm:max-w-md md:max-w-xl tablet:max-w-3xl desktop:max-w-6xl"
    >
      {/* form + preset report buttons grid */}

      <div className="baseVertFlex size-full !items-start !justify-between tablet:!flex-row">
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
                      <div className="baseVertFlex relative w-full max-w-64 !items-start gap-2">
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

                <div className="grid w-72 grid-cols-1 grid-rows-4 gap-2 tablet:w-96 tablet:grid-cols-2 tablet:grid-rows-2">
                  <FormField
                    control={customReportForm.control}
                    name="day"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                        <div className="baseVertFlex relative w-full max-w-64 !items-start gap-2">
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
                        <div className="baseVertFlex relative w-full max-w-64 !items-start gap-2">
                          <FormLabel className="font-semibold">Week</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              orderYearRange === undefined ||
                              generatingReport ||
                              customReportForm.getValues("periodicity") !==
                                "weekly"
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
                        <div className="baseVertFlex relative w-full max-w-64 !items-start gap-2">
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
                        <div className="baseVertFlex w-full max-w-64 !items-start gap-2">
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

        <Separator className="my-4 h-[1px] w-full bg-gray-300 tablet:mx-4 tablet:h-[400px] tablet:w-[1px]" />

        {/* not the biggest fan of hardcoding the height here */}
        <div className="baseVertFlex relative w-full !items-start !justify-start gap-4 tablet:h-[416px]">
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
              Yesterday & Today
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
              Last week & This week
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
              Last month & This month
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
              Last year & This year
            </Button>
          </div>

          <Button
            disabled={selectedPresetReport === null || generatingReport}
            className="tablet:absolute tablet:bottom-0 tablet:left-0"
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
              totalCurrent={report.totalCurrent}
              totalPrevious={report.totalPrevious}
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
    xAxisLabel: string;
    current: number;
    previous: number | null;
  }[];
  totalCurrent: string;
  totalPrevious: string | null;
}

function StatsCategoryVisualReport({
  title,
  timeRange,
  data,
  totalCurrent,
  totalPrevious,
}: StatsCategoryVisualReport) {
  return (
    <div className="baseVertFlex w-full gap-4 border-b pb-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{timeRange}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart width={1000} height={400} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="xAxisLabel" />
              <YAxis />
              <ChartTooltip
                animationDuration={100}
                cursor={true}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend />
              <Bar
                dataKey="previous"
                fill={chartConfig.prev!.color}
                radius={4}
                name={"Previous"}
                minPointSize={5}
              />
              <Bar
                dataKey="current"
                fill={chartConfig.curr!.color}
                radius={4}
                name={"Current"}
                minPointSize={5}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-sm">
          <div className="baseFlex gap-8 font-medium">
            {totalPrevious !== null && <p>Previous: {totalPrevious}</p>}
            <p>Current: {totalCurrent}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

type Periodicity = "daily" | "weekly" | "monthly" | "yearly";

function getReportDateRanges(periodicity: Periodicity) {
  let currentStartDate: Date;
  let currentEndDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;

  const now = new Date();

  switch (periodicity) {
    case "daily":
      currentStartDate = startOfDay(now);
      currentEndDate = endOfDay(now);

      previousStartDate = startOfDay(subDays(currentStartDate, 1));
      previousEndDate = endOfDay(previousStartDate);
      break;

    case "weekly":
      currentStartDate = startOfWeek(now);
      currentEndDate = endOfWeek(now);

      previousStartDate = startOfWeek(subWeeks(currentStartDate, 1));
      previousEndDate = endOfWeek(previousStartDate);
      break;

    case "monthly":
      currentStartDate = startOfMonth(now);
      currentEndDate = endOfMonth(now);

      previousStartDate = startOfMonth(subMonths(currentStartDate, 1));
      previousEndDate = endOfMonth(previousStartDate);
      break;

    case "yearly":
      currentStartDate = startOfYear(now);
      currentEndDate = endOfYear(now);

      previousStartDate = startOfYear(subYears(currentStartDate, 1));
      previousEndDate = endOfYear(previousStartDate);
      break;

    default:
      throw new Error("Invalid periodicity");
  }

  return {
    currentStartDate,
    currentEndDate,
    previousStartDate,
    previousEndDate,
  };
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
    const parsedMonth = parse(
      `${year}-${month}-01`,
      "yyyy-MMMM-dd",
      new Date(),
    );
    if (!isNaN(parsedMonth.getTime())) {
      startDate = parsedMonth;
      endDate = endOfMonth(startDate);
    } else {
      startDate = parse(`${year}-${month}-01`, "yyyy-MM-dd", new Date());
      endDate = endOfMonth(startDate);
    }
  }

  switch (periodicity) {
    case "daily":
      if (day) {
        startDate = parse(
          `${year}-${month}-${parseInt(day) + 1}`,
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
        startDate = addWeeks(startOfMonth(startDate), weekNumber);
        endDate = endOfWeek(startDate);
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
