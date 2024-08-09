import type { Prisma, PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";
import { format, formatDuration } from "date-fns";
import Decimal from "decimal.js";
import { z } from "zod";
import { type getAuth } from "@clerk/nextjs/server";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

interface AuthContext {
  auth: ReturnType<typeof getAuth>;
}

type Category =
  | "totalOrders"
  | "totalRevenue"
  | "totalTips"
  | "averageOrderValue"
  | "averageOrderCompletionTime"
  | "lateOrders";

type Periodicity = "daily" | "weekly" | "monthly" | "yearly";

interface Params {
  category: Category;
  periodicity: Periodicity;
  currentStartDate: Date;
  currentEndDate: Date;
  previousStartDate?: Date;
  previousEndDate?: Date;
}

interface ContextParams {
  category: Category;
  totalCurrent: number;
  totalPrevious: number | null;
}

interface Order {
  createdAt: Date;
  total?: number;
  tipValue?: number;
  orderStartedAt?: Date | null;
  orderCompletedAt?: Date | null;
  datetimeToPickup?: Date | null;
}

interface QueryAndAggregateParams {
  ctx: {
    auth: AuthContext;
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  };
  startDate: Date;
  endDate: Date;
  periodicity: Periodicity;
  queryField: keyof Order;
  key: Category;
}

interface GroupByPeriodicityParams {
  results: Array<{ createdAt: Date; value: number; count: number }>;
  periodicity: Periodicity;
}

export const statsRouter = createTRPCRouter({
  getYearRange: adminProcedure.query(async ({ ctx }) => {
    const minMaxDates = await ctx.prisma.order.aggregate({
      _min: {
        createdAt: true,
      },
      _max: {
        createdAt: true,
      },
    });

    const minYear =
      minMaxDates._min.createdAt?.getFullYear() || new Date().getFullYear();
    const maxYear =
      minMaxDates._max.createdAt?.getFullYear() || new Date().getFullYear();

    return { minYear, maxYear };
  }),

  generateReport: adminProcedure
    .input(
      z.object({
        totalOrders: z.boolean().optional(),
        totalRevenue: z.boolean().optional(),
        totalTips: z.boolean().optional(),
        averageOrderValue: z.boolean().optional(),
        averageOrderCompletionTime: z.boolean().optional(),
        lateOrders: z.boolean().optional(),

        periodicity: z.enum(["daily", "weekly", "monthly", "yearly"]),

        currentStartDate: z.date(),
        currentEndDate: z.date(),
        previousStartDate: z.date().optional(),
        previousEndDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        totalOrders,
        totalRevenue,
        totalTips,
        averageOrderValue,
        averageOrderCompletionTime,
        lateOrders,
        periodicity,
        currentStartDate,
        currentEndDate,
        previousStartDate,
        previousEndDate,
      } = input;

      if (
        !totalOrders &&
        !totalRevenue &&
        !totalTips &&
        !averageOrderValue &&
        !averageOrderCompletionTime &&
        !lateOrders
      ) {
        throw new Error(
          "At least one category must be requested when generating a report.",
        );
      }

      const results = [];
      const categories = [
        { key: "totalOrders", queryField: "createdAt" },
        { key: "totalRevenue", queryField: "createdAt" },
        { key: "totalTips", queryField: "createdAt" },
        {
          key: "averageOrderValue",
          queryField: "createdAt",
        },
        {
          key: "averageOrderCompletionTime",
          queryField: "orderCompletedAt",
        },
        { key: "lateOrders", queryField: "orderCompletedAt" },
      ] as const;

      for (const category of categories) {
        if (input[category.key]) {
          const currentResults = await queryAndAggregate({
            // @ts-expect-error clerk didn't have proper export for SignedInAuthObject
            ctx,
            startDate: currentStartDate,
            endDate: currentEndDate,
            periodicity,
            queryField: category.queryField,
            key: category.key,
          });

          const previousResults =
            previousStartDate && previousEndDate
              ? await queryAndAggregate({
                  // @ts-expect-error clerk didn't have proper export for SignedInAuthObject
                  ctx,
                  startDate: previousStartDate,
                  endDate: previousEndDate,
                  periodicity,
                  queryField: category.queryField,
                  key: category.key,
                })
              : null;

          const combinedResults = generateCombinedResults({
            currentResults,
            previousResults,
            periodicity,
          });

          const totalCurrent = sumResults(
            currentResults,
            category.key.includes("average"),
            false, // FYI: hardcoded as false since both avg order value and avg order completion time are do not want to include zero values in average. Change this behavior later if needed.
          );
          const totalPrevious = previousResults
            ? sumResults(
                previousResults,
                category.key.includes("average"),
                false, // FYI: hardcoded as false since both avg order value and avg order completion time are do not want to include zero values in average. Change this behavior later if needed.
              )
            : null;

          results.push({
            ...generateTitleAndTimeRange({
              category: category.key,
              periodicity,
              currentStartDate,
              currentEndDate,
              previousStartDate,
              previousEndDate,
            }),
            data: combinedResults,
            ...generateContextStrings({
              category: category.key,
              totalCurrent,
              totalPrevious,
            }),
          });
        }
      }

      return results;
    }),
});

async function queryAndAggregate({
  ctx,
  startDate,
  endDate,
  periodicity,
  queryField,
  key,
}: QueryAndAggregateParams): Promise<number[]> {
  const results: Array<{ createdAt: Date; value: number; count: number }> = [];
  const orders = await ctx.prisma.order.findMany({
    where: {
      [queryField]: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      orderStartedAt: key === "averageOrderCompletionTime" ? true : undefined,
      orderCompletedAt:
        key === "averageOrderCompletionTime" || key === "lateOrders"
          ? true
          : undefined,
      datetimeToPickup: key === "lateOrders" ? true : undefined,
      total:
        key === "totalRevenue" || key === "averageOrderValue"
          ? true
          : undefined,
      tipValue: key === "totalTips" ? true : undefined,
    },
    orderBy: {
      [queryField]: "asc",
    },
  });

  orders.forEach((order) => {
    let value = 0;
    const count = 1;

    if (key === "lateOrders" && order.datetimeToPickup) {
      if (
        order.orderCompletedAt &&
        order.orderCompletedAt > order.datetimeToPickup
      ) {
        value = 1;
      }
    } else if (
      key === "averageOrderCompletionTime" &&
      order.orderStartedAt &&
      order.orderCompletedAt
    ) {
      value = order.orderCompletedAt.getTime() - order.orderStartedAt.getTime();
    } else if (key === "totalRevenue" || key === "averageOrderValue") {
      value = new Decimal(order.total || 0).div(100).toNumber(); // Convert cents to dollars
    } else if (key === "totalTips") {
      value = new Decimal(order.tipValue || 0).div(100).toNumber(); // Convert cents to dollars
    } else if (key === "totalOrders") {
      value = 1;
    }

    results.push({ createdAt: order[queryField] as Date, value, count });
  });

  return groupByPeriodicity({ results, periodicity, key });
}

function groupByPeriodicity({
  results,
  periodicity,
  key,
}: GroupByPeriodicityParams & { key: Category }): number[] {
  const grouped = new Map<
    number,
    { sum: number; count: number; dates: Date[] }
  >();

  results.forEach(({ createdAt, value, count }) => {
    let index: number;
    if (periodicity === "daily") {
      index = createdAt.getHours();
    } else if (periodicity === "weekly") {
      index = createdAt.getDay();
    } else if (periodicity === "monthly") {
      index = createdAt.getDate();
    } else if (periodicity === "yearly") {
      index = createdAt.getMonth();
    } else {
      throw new Error("Invalid periodicity");
    }

    const existing = grouped.get(index) || { sum: 0, count: 0, dates: [] };
    grouped.set(index, {
      sum: existing.sum + value,
      count: existing.count + count,
      dates: [...existing.dates, createdAt],
    });
  });

  const size =
    periodicity === "daily"
      ? 24
      : periodicity === "weekly"
        ? 7
        : periodicity === "monthly"
          ? 31
          : 12;

  return Array.from({ length: size }, (_, i) => {
    const group = grouped.get(i) || { sum: 0, count: 0, dates: [] };
    const value =
      (key === "averageOrderValue" || key === "averageOrderCompletionTime") &&
      group.count > 0
        ? group.sum / group.count // Correctly calculate the average
        : group.sum;

    return value;
  });
}

function generateCombinedResults({
  currentResults,
  previousResults,
  periodicity,
}: {
  currentResults: number[];
  previousResults: number[] | null;
  periodicity: Periodicity;
}): Array<{
  xAxisLabel: string;
  current: number;
  previous: number | null;
}> {
  const combinedResults = currentResults.map((current, i) => ({
    xAxisLabel: getPeriodName(i, periodicity),
    current,
    previous: previousResults ? previousResults[i] || 0 : null,
  }));

  return combinedResults;
}

function sumResults(
  results: number[],
  calculateAverage: boolean,
  includeZeroValuesInAverage?: boolean,
): number {
  const totalSum = results.reduce((a, b) => a + b, 0);

  if (calculateAverage) {
    // const totalCount = results.length;
    const totalCount = includeZeroValuesInAverage
      ? results.length
      : results.filter((result) => result > 0).length;

    return new Decimal(totalSum).div(totalCount).toDecimalPlaces(2).toNumber(); // Calculate the average across the entire period
  }

  return totalSum;
}

function getPeriodName(index: number, periodicity: Periodicity): string {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  switch (periodicity) {
    case "daily":
      const hours = index % 12 || 12;
      const ampm = index < 12 ? "AM" : "PM";
      return `${hours}:00 ${ampm}`;
    case "weekly":
      return daysOfWeek[index % 7]!;
    case "monthly":
      return `${index + 1}${getOrdinalSuffix(index + 1)}`;
    case "yearly":
      return monthsOfYear[index % 12]!;
    default:
      throw new Error("Invalid periodicity");
  }
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function generateTitleAndTimeRange({
  category,
  periodicity,
  currentStartDate,
  currentEndDate,
  previousStartDate,
  previousEndDate,
}: Params): { title: string; timeRange: string } {
  const categoryMap: { [key in Category]: string } = {
    totalOrders: "Total orders",
    totalRevenue: "Total revenue",
    totalTips: "Total tips",
    averageOrderValue: "Average order value",
    averageOrderCompletionTime: "Average order completion time",
    lateOrders: "Late orders",
  };

  const periodicityToLabel: { [key in Periodicity]: string } = {
    daily: "yesterday",
    weekly: "last week",
    monthly: "last month",
    yearly: "last year",
  };

  const currententPeriod = `${formatDate(currentStartDate)} - ${formatDate(currentEndDate)}`;

  let title = `${categoryMap[category]} - ${capitalizeFirstLetter(periodicity)}`;
  let timeRange = `(${currententPeriod})`;

  if (previousStartDate && previousEndDate) {
    const previousiousPeriod = `${formatDate(previousStartDate)} - ${formatDate(previousEndDate)}`;
    title = `${categoryMap[category]} - Compared to ${periodicityToLabel[periodicity]}`;
    timeRange = `(${previousiousPeriod} | ${currententPeriod})`;
  }

  return { title, timeRange };
}

function formatDate(date: Date): string {
  return format(date, "MM/dd/yyyy");
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

function formatTime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return formatDuration({
    days,
    hours,
    minutes,
    seconds,
  });
}

function generateContextStrings({
  category,
  totalCurrent,
  totalPrevious,
}: ContextParams): { totalCurrent: string; totalPrevious: string | null } {
  const categoryMap: {
    [key in Category]: (
      current: number,
      previous: number | null,
    ) => { totalCurrent: string; totalPrevious: string | null };
  } = {
    totalOrders: (current, previous) => ({
      totalCurrent: `${current} orders made`,
      totalPrevious: previous !== null ? `${previous} orders made` : null,
    }),
    totalRevenue: (current, previous) => ({
      totalCurrent: `$${formatNumber(current)} in revenue`,
      totalPrevious:
        previous !== null ? `$${formatNumber(previous)} in revenue` : null,
    }),
    totalTips: (current, previous) => ({
      totalCurrent: `$${formatNumber(current)} in tips`,
      totalPrevious:
        previous !== null ? `$${formatNumber(previous)} in tips` : null,
    }),
    averageOrderValue: (current, previous) => ({
      totalCurrent: `$${formatNumber(current)} per order`,
      totalPrevious:
        previous !== null ? `$${formatNumber(previous)} per order` : null,
    }),
    averageOrderCompletionTime: (current, previous) => ({
      totalCurrent: `${formatTime(current)} per order`,
      totalPrevious:
        previous !== null ? `${formatTime(previous)} per order` : null,
    }),
    lateOrders: (current, previous) => ({
      totalCurrent: `${current} late orders`,
      totalPrevious: previous !== null ? `${previous} late orders` : null,
    }),
  };

  return categoryMap[category](totalCurrent, totalPrevious);
}
