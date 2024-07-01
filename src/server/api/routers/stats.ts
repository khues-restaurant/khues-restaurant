import { format } from "date-fns";
import Decimal from "decimal.js";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

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

        currStartDate: z.date(),
        currEndDate: z.date(),
        prevStartDate: z.date().optional(),
        prevEndDate: z.date().optional(),
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
        currStartDate,
        currEndDate,
        prevStartDate,
        prevEndDate,
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

      if (totalOrders) {
        // I'm not sure if we can always type out this localResults array, but works for here
        const currResults: number[] = [];

        // get the total orders for the current period
        const currPeriod = await ctx.prisma.order.findMany({
          where: {
            createdAt: {
              gte: currStartDate,
              lte: currEndDate,
            },
          },
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc", // prob not necessary
          },
        });

        let index = 0;

        // group/aggregate the orders by the periodicity
        for (const order of currPeriod) {
          const createdAt = order.createdAt;

          if (periodicity === "daily") {
            index = createdAt.getHours();
          } else if (periodicity === "weekly") {
            index = createdAt.getDay();
          } else if (periodicity === "monthly") {
            index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
            // grouping into 4 weeks you'll need to change this
          } else if (periodicity === "yearly") {
            index = createdAt.getMonth();
          }

          currResults[index] = (currResults[index] || 0) + 1;
        }

        // prev period (if necessary)
        const prevResults: number[] = [];

        if (prevStartDate && prevEndDate) {
          // get the total orders for the current period
          const prevPeriod = await ctx.prisma.order.findMany({
            where: {
              createdAt: {
                gte: prevStartDate,
                lte: prevEndDate,
              },
            },
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc", // prob not necessary
            },
          });

          let index = 0;

          // group/aggregate the orders by the periodicity
          for (const order of prevPeriod) {
            const createdAt = order.createdAt;

            if (periodicity === "daily") {
              index = createdAt.getHours();
            } else if (periodicity === "weekly") {
              index = createdAt.getDay();
            } else if (periodicity === "monthly") {
              index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
              // grouping into 4 weeks you'll need to change this
            } else if (periodicity === "yearly") {
              index = createdAt.getMonth();
            }

            prevResults[index] = (prevResults[index] || 0) + 1;
          }
        }

        // format/combine the results (if necessary)
        const combinedResults = [];

        // name will be be dynamic based on the periodicity (6:00 PM, Monday, etc)

        let iterationAmount = 24;

        if (periodicity === "weekly") {
          iterationAmount = 7;
        } else if (periodicity === "monthly") {
          iterationAmount = 31;
        } else if (periodicity === "yearly") {
          iterationAmount = 12;
        }

        for (let i = 0; i < iterationAmount; i++) {
          // TODO: const name = getDynamicName(i, periodicity);

          const curr = currResults[i] || 0;
          const prev = prevResults[i] || 0;

          combinedResults.push({
            name: getPeriodName(i, periodicity),
            curr,
            prev,
          });
        }

        // get total orders for the current period and the previous period (if necessary)
        const totalCurr = currResults.reduce((a, b) => a + b, 0);
        const totalPrev =
          prevStartDate && prevEndDate
            ? prevResults.reduce((a, b) => a + b, 0)
            : null;

        // add to the results under key of "totalOrders"
        results.push({
          ...generateTitleAndTimeRange({
            category: "totalOrders",
            periodicity,
            currStartDate,
            currEndDate,
            prevStartDate,
            prevEndDate,
          }),
          data: combinedResults,
          ...generateContextStrings({
            category: "totalOrders",
            totalCurr,
            totalPrev,
          }),
        });
      }

      if (totalRevenue) {
        // get the total revenue for the current period
        const currPeriod = await ctx.prisma.order.findMany({
          where: {
            createdAt: {
              gte: currStartDate,
              lte: currEndDate,
            },
          },
          select: {
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc", // prob not necessary
          },
        });

        let index = 0;

        const currResults: number[] = [];

        // group/aggregate the orders by the periodicity
        for (const order of currPeriod) {
          const createdAt = order.createdAt;

          if (periodicity === "daily") {
            index = createdAt.getHours();
          } else if (periodicity === "weekly") {
            index = createdAt.getDay();
          } else if (periodicity === "monthly") {
            index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
            // grouping into 4 weeks you'll need to change this
          } else if (periodicity === "yearly") {
            index = createdAt.getMonth();
          }

          currResults[index] = (currResults[index] || 0) + order.total;
        }

        // prev period (if necessary)
        const prevResults: number[] = [];

        if (prevStartDate && prevEndDate) {
          // get the total orders for the current period
          const prevPeriod = await ctx.prisma.order.findMany({
            where: {
              createdAt: {
                gte: prevStartDate,
                lte: prevEndDate,
              },
            },
            select: {
              total: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc", // prob not necessary
            },
          });

          let index = 0;

          // group/aggregate the orders by the periodicity
          for (const order of prevPeriod) {
            const createdAt = order.createdAt;

            if (periodicity === "daily") {
              index = createdAt.getHours();
            } else if (periodicity === "weekly") {
              index = createdAt.getDay();
            } else if (periodicity === "monthly") {
              index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
              // grouping into 4 weeks you'll need to change this
            } else if (periodicity === "yearly") {
              index = createdAt.getMonth();
            }

            prevResults[index] = (prevResults[index] || 0) + order.total;
          }
        }

        // format/combine the results (if necessary)
        const combinedResults = [];

        // name will be be dynamic based on the periodicity (6:00 PM, Monday, etc)

        let iterationAmount = 24;

        if (periodicity === "weekly") {
          iterationAmount = 7;
        } else if (periodicity === "monthly") {
          iterationAmount = 31;
        } else if (periodicity === "yearly") {
          iterationAmount = 12;
        }

        for (let i = 0; i < iterationAmount; i++) {
          // all database money values are stored as cents, so divide by 100 to get dollars
          const curr = new Decimal(currResults[i] || 0).div(100).toNumber();
          const prev = new Decimal(prevResults[i] || 0).div(100).toNumber();

          combinedResults.push({
            name: getPeriodName(i, periodicity),
            curr,
            prev,
          });
        }

        // get total orders for the current period and the previous period (if necessary)
        const totalCurrInCents = currResults.reduce((a, b) => a + b, 0);
        const totalPrevInCents =
          prevStartDate && prevEndDate
            ? prevResults.reduce((a, b) => a + b, 0)
            : null;

        const totalCurr = new Decimal(totalCurrInCents).div(100).toNumber();
        const totalPrev = totalPrevInCents
          ? new Decimal(totalPrevInCents).div(100).toNumber()
          : null;

        // add to the results under key of "totalOrders"
        results.push({
          ...generateTitleAndTimeRange({
            category: "totalRevenue",
            periodicity,
            currStartDate,
            currEndDate,
            prevStartDate,
            prevEndDate,
          }),
          data: combinedResults,
          ...generateContextStrings({
            category: "totalRevenue",
            totalCurr,
            totalPrev,
          }),
        });
      }

      if (totalTips) {
        // get the total tips for the current period
        const currPeriod = await ctx.prisma.order.findMany({
          where: {
            createdAt: {
              gte: currStartDate,
              lte: currEndDate,
            },
          },
          select: {
            tipValue: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc", // prob not necessary
          },
        });

        let index = 0;

        const currResults: number[] = [];

        // group/aggregate the orders by the periodicity
        for (const order of currPeriod) {
          const createdAt = order.createdAt;

          if (periodicity === "daily") {
            index = createdAt.getHours();
          } else if (periodicity === "weekly") {
            index = createdAt.getDay();
          } else if (periodicity === "monthly") {
            index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
            // grouping into 4 weeks you'll need to change this
          } else if (periodicity === "yearly") {
            index = createdAt.getMonth();
          }

          currResults[index] = (currResults[index] || 0) + order.tipValue;
        }

        // prev period (if necessary)
        const prevResults: number[] = [];

        if (prevStartDate && prevEndDate) {
          // get the total orders for the current period
          const prevPeriod = await ctx.prisma.order.findMany({
            where: {
              createdAt: {
                gte: prevStartDate,
                lte: prevEndDate,
              },
            },
            select: {
              tipValue: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc", // prob not necessary
            },
          });

          let index = 0;

          // group/aggregate the orders by the periodicity
          for (const order of prevPeriod) {
            const createdAt = order.createdAt;

            if (periodicity === "daily") {
              index = createdAt.getHours();
            } else if (periodicity === "weekly") {
              index = createdAt.getDay();
            } else if (periodicity === "monthly") {
              index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
              // grouping into 4 weeks you'll need to change this
            } else if (periodicity === "yearly") {
              index = createdAt.getMonth();
            }

            prevResults[index] = (prevResults[index] || 0) + order.tipValue;
          }
        }

        // format/combine the results (if necessary)
        const combinedResults = [];

        // name will be be dynamic based on the periodicity (6:00 PM, Monday, etc)

        let iterationAmount = 24;

        if (periodicity === "weekly") {
          iterationAmount = 7;
        } else if (periodicity === "monthly") {
          iterationAmount = 31;
        } else if (periodicity === "yearly") {
          iterationAmount = 12;
        }

        for (let i = 0; i < iterationAmount; i++) {
          // all database money values are stored as cents, so divide by 100 to get dollars
          const curr = new Decimal(currResults[i] || 0).div(100).toNumber();
          const prev = new Decimal(prevResults[i] || 0).div(100).toNumber();

          combinedResults.push({
            name: getPeriodName(i, periodicity),
            curr,
            prev,
          });
        }

        // get total orders for the current period and the previous period (if necessary)
        const totalCurrInCents = currResults.reduce((a, b) => a + b, 0);
        const totalPrevInCents =
          prevStartDate && prevEndDate
            ? prevResults.reduce((a, b) => a + b, 0)
            : null;

        const totalCurr = new Decimal(totalCurrInCents).div(100).toNumber();
        const totalPrev = totalPrevInCents
          ? new Decimal(totalPrevInCents).div(100).toNumber()
          : null;

        // add to the results under key of "totalOrders"
        results.push({
          ...generateTitleAndTimeRange({
            category: "totalTips",
            periodicity,
            currStartDate,
            currEndDate,
            prevStartDate,
            prevEndDate,
          }),
          data: combinedResults,
          ...generateContextStrings({
            category: "totalTips",
            totalCurr,
            totalPrev,
          }),
        });
      }

      if (averageOrderValue) {
        // get the average order value for the current period
        const currPeriod = await ctx.prisma.order.findMany({
          where: {
            createdAt: {
              gte: currStartDate,
              lte: currEndDate,
            },
          },
          select: {
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc", // prob not necessary
          },
        });

        let index = 0;

        const currResults: number[] = [];
        const currOrderCounts: number[] = [];

        // group/aggregate the orders by the periodicity
        for (const order of currPeriod) {
          const createdAt = order.createdAt;

          if (periodicity === "daily") {
            index = createdAt.getHours();
          } else if (periodicity === "weekly") {
            index = createdAt.getDay();
          } else if (periodicity === "monthly") {
            index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
            // grouping into 4 weeks you'll need to change this
          } else if (periodicity === "yearly") {
            index = createdAt.getMonth();
          }

          currResults[index] = (currResults[index] || 0) + order.total;
          currOrderCounts[index] = (currOrderCounts[index] || 0) + 1;
        }

        // prev period (if necessary)
        const prevResults: number[] = [];
        const prevOrderCounts: number[] = [];

        if (prevStartDate && prevEndDate) {
          // get the total orders for the current period
          const prevPeriod = await ctx.prisma.order.findMany({
            where: {
              createdAt: {
                gte: prevStartDate,
                lte: prevEndDate,
              },
            },
            select: {
              total: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc", // prob not necessary
            },
          });

          let index = 0;

          // group/aggregate the orders by the periodicity
          for (const order of prevPeriod) {
            const createdAt = order.createdAt;

            if (periodicity === "daily") {
              index = createdAt.getHours();
            } else if (periodicity === "weekly") {
              index = createdAt.getDay();
            } else if (periodicity === "monthly") {
              index = createdAt.getDate(); // see how this looks, obv if you want to go back to the
              // grouping into 4 weeks you'll need to change this
            } else if (periodicity === "yearly") {
              index = createdAt.getMonth();
            }

            prevResults[index] = (prevResults[index] || 0) + order.total;
            prevOrderCounts[index] = (prevOrderCounts[index] || 0) + 1;
          }
        }

        // format/combine the results (if necessary)
        const combinedResults = [];

        // name will be be dynamic based on the periodicity (6:00 PM, Monday, etc)

        let iterationAmount = 24;

        if (periodicity === "weekly") {
          iterationAmount = 7;
        } else if (periodicity === "monthly") {
          iterationAmount = 31;
        } else if (periodicity === "yearly") {
          iterationAmount = 12;
        }

        for (let i = 0; i < iterationAmount; i++) {
          const curr = new Decimal(currResults[i] || 0).div(100).toNumber();
          const prev = new Decimal(prevResults[i] || 0).div(100).toNumber();

          // divide by 100 to get the average order value in dollars
          const currOrderCount = currOrderCounts[i] || 0;
          const prevOrderCount = prevOrderCounts[i] || 0;

          combinedResults.push({
            name: getPeriodName(i, periodicity),
            curr: new Decimal(curr / currOrderCount).toNumber(),
            prev: new Decimal(prev / prevOrderCount).toNumber(),
          });
        }

        // get total average order value for the current period and the previous period (if necessary)
        const totalCurrValueInCents = currResults.reduce((a, b) => a + b, 0);
        const totalPrevValueInCents =
          prevStartDate && prevEndDate
            ? prevResults.reduce((a, b) => a + b, 0)
            : null;

        const totalCurrValue = new Decimal(totalCurrValueInCents)
          .div(100)
          .toNumber();
        const totalPrevValue = totalPrevValueInCents
          ? new Decimal(totalPrevValueInCents).div(100).toNumber()
          : null;

        const totalCurrOrderCount = currOrderCounts.reduce((a, b) => a + b, 0);
        const totalPrevOrderCount =
          prevStartDate && prevEndDate
            ? prevOrderCounts.reduce((a, b) => a + b, 0)
            : null;

        const totalCurr = new Decimal(
          totalCurrValue / totalCurrOrderCount,
        ).toNumber();
        const totalPrev =
          totalPrevValue && totalPrevOrderCount
            ? new Decimal(totalPrevValue / totalPrevOrderCount).toNumber()
            : null;

        // add to the results under key of "totalOrders"
        results.push({
          ...generateTitleAndTimeRange({
            category: "averageOrderValue",
            periodicity,
            currStartDate,
            currEndDate,
            prevStartDate,
            prevEndDate,
          }),
          data: combinedResults,
          ...generateContextStrings({
            category: "averageOrderValue",
            totalCurr,
            totalPrev,
          }),
        });
      }

      if (averageOrderCompletionTime) {
        // get the average order completion time for the current period
        const currPeriod = await ctx.prisma.order
          .findMany({
            where: {
              orderCompletedAt: {
                gte: currStartDate,
                lte: currEndDate,
              },
            },
            select: {
              orderStartedAt: true,
              orderCompletedAt: true,
            },
            orderBy: {
              orderCompletedAt: "asc", // prob not necessary
            },
          })
          .then((orders) => {
            return orders.filter((order) => order.orderStartedAt !== null);
          });

        let index = 0;

        const currResults: number[] = [];
        const currOrderCounts: number[] = [];

        // group/aggregate the orders by the periodicity
        for (const order of currPeriod) {
          const orderStartedAt = order.orderStartedAt!;
          const orderCompletedAt = order.orderCompletedAt!;

          if (periodicity === "daily") {
            index = orderCompletedAt.getHours();
          } else if (periodicity === "weekly") {
            index = orderCompletedAt.getDay();
          } else if (periodicity === "monthly") {
            index = orderCompletedAt.getDate(); // see how this looks, obv if you want to go back to the
            // grouping into 4 weeks you'll need to change this
          } else if (periodicity === "yearly") {
            index = orderCompletedAt.getMonth();
          }

          currResults[index] =
            (currResults[index] || 0) +
            (orderCompletedAt.getTime() - orderStartedAt.getTime());
          currOrderCounts[index] = (currOrderCounts[index] || 0) + 1;
        }

        // prev period (if necessary)
        const prevResults: number[] = [];
        const prevOrderCounts: number[] = [];

        if (prevStartDate && prevEndDate) {
          // get the total orders for the current period
          const prevPeriod = await ctx.prisma.order
            .findMany({
              where: {
                orderCompletedAt: {
                  gte: prevStartDate,
                  lte: prevEndDate,
                },
              },
              select: {
                orderStartedAt: true,
                orderCompletedAt: true,
              },
              orderBy: {
                orderCompletedAt: "asc", // prob not necessary
              },
            })
            .then((orders) => {
              return orders.filter((order) => order.orderStartedAt !== null);
            });

          let index = 0;

          // group/aggregate the orders by the periodicity
          for (const order of prevPeriod) {
            const orderStartedAt = order.orderStartedAt!;
            const orderCompletedAt = order.orderCompletedAt!;

            if (periodicity === "daily") {
              index = orderCompletedAt.getHours();
            } else if (periodicity === "weekly") {
              index = orderCompletedAt.getDay();
            } else if (periodicity === "monthly") {
              index = orderCompletedAt.getDate(); // see how this looks, obv if you want to go back to the
              // grouping into 4 weeks you'll need to change this
            } else if (periodicity === "yearly") {
              index = orderCompletedAt.getMonth();
            }

            prevResults[index] =
              (prevResults[index] || 0) +
              (orderCompletedAt.getTime() - orderStartedAt.getTime());
            prevOrderCounts[index] = (prevOrderCounts[index] || 0) + 1;
          }
        }

        // format/combine the results (if necessary)
        const combinedResults = [];

        // name will be be dynamic based on the periodicity (6:00 PM, Monday, etc)

        let iterationAmount = 24;

        if (periodicity === "weekly") {
          iterationAmount = 7;
        } else if (periodicity === "monthly") {
          iterationAmount = 31;
        } else if (periodicity === "yearly") {
          iterationAmount = 12;
        }

        for (let i = 0; i < iterationAmount; i++) {
          const curr = currResults[i] || 0;
          const prev = prevResults[i] || 0;

          const currOrderCount = currOrderCounts[i] || 0;
          const prevOrderCount = prevOrderCounts[i] || 0;

          combinedResults.push({
            name: getPeriodName(i, periodicity),
            curr: new Decimal(
              millisecondsToMinutes(curr) / currOrderCount,
            ).toNumber(),
            prev: new Decimal(
              millisecondsToMinutes(prev) / prevOrderCount,
            ).toNumber(),
          });
        }

        // get total order completion time average for the current period and the previous period (if necessary)
        const totalCurrValueInMilliseconds = currResults.reduce(
          (a, b) => a + b,
          0,
        );
        const totalPrevValueInMilliseconds =
          prevStartDate && prevEndDate
            ? prevResults.reduce((a, b) => a + b, 0)
            : null;

        const totalCurrValue = new Decimal(
          millisecondsToMinutes(totalCurrValueInMilliseconds),
        ).toNumber();
        const totalPrevValue = totalPrevValueInMilliseconds
          ? new Decimal(
              millisecondsToMinutes(totalPrevValueInMilliseconds),
            ).toNumber()
          : null;

        const totalCurrOrderCount = currOrderCounts.reduce((a, b) => a + b, 0);
        const totalPrevOrderCount =
          prevStartDate && prevEndDate
            ? prevOrderCounts.reduce((a, b) => a + b, 0)
            : null;

        const totalCurr = new Decimal(
          totalCurrValue / totalCurrOrderCount,
        ).toNumber();
        const totalPrev =
          totalPrevValue && totalPrevOrderCount
            ? new Decimal(totalPrevValue / totalPrevOrderCount).toNumber()
            : null;

        // add to the results under key of "totalOrders"
        results.push({
          ...generateTitleAndTimeRange({
            category: "averageOrderCompletionTime",
            periodicity,
            currStartDate,
            currEndDate,
            prevStartDate,
            prevEndDate,
          }),
          data: combinedResults,
          ...generateContextStrings({
            category: "averageOrderCompletionTime",
            totalCurr,
            totalPrev,
          }),
        });
      }

      if (lateOrders) {
        // get the late orders for the current period
        const currPeriod = await ctx.prisma.order
          .findMany({
            where: {
              orderCompletedAt: {
                gte: currStartDate,
                lte: currEndDate,
              },
            },
            select: {
              datetimeToPickup: true,
              orderCompletedAt: true,
            },
            orderBy: {
              orderCompletedAt: "asc", // prob not necessary
            },
          })
          .then((orders) => {
            return orders.filter((order) => {
              const completedAt = order.orderCompletedAt;
              if (!completedAt) return false;

              return completedAt.getTime() > order.datetimeToPickup.getTime();
            });
          });

        let index = 0;

        const currResults: number[] = [];

        // group/aggregate the orders by the periodicity
        for (const order of currPeriod) {
          const orderCompletedAt = order.orderCompletedAt!;

          if (periodicity === "daily") {
            index = orderCompletedAt.getHours();
          } else if (periodicity === "weekly") {
            index = orderCompletedAt.getDay();
          } else if (periodicity === "monthly") {
            index = orderCompletedAt.getDate(); // see how this looks, obv if you want to go back to the
            // grouping into 4 weeks you'll need to change this
          } else if (periodicity === "yearly") {
            index = orderCompletedAt.getMonth();
          }

          currResults[index] = (currResults[index] || 0) + 1;
        }

        // prev period (if necessary)
        const prevResults: number[] = [];

        if (prevStartDate && prevEndDate) {
          // get the total orders for the current period
          const prevPeriod = await ctx.prisma.order
            .findMany({
              where: {
                orderCompletedAt: {
                  gte: prevStartDate,
                  lte: prevEndDate,
                },
              },
              select: {
                datetimeToPickup: true,
                orderCompletedAt: true,
              },
              orderBy: {
                orderCompletedAt: "asc", // prob not necessary
              },
            })
            .then((orders) => {
              return orders.filter((order) => {
                const completedAt = order.orderCompletedAt;
                if (!completedAt) return false;

                return completedAt.getTime() > order.datetimeToPickup.getTime();
              });
            });

          let index = 0;

          // group/aggregate the orders by the periodicity
          for (const order of prevPeriod) {
            const orderCompletedAt = order.orderCompletedAt!;

            if (periodicity === "daily") {
              index = orderCompletedAt.getHours();
            } else if (periodicity === "weekly") {
              index = orderCompletedAt.getDay();
            } else if (periodicity === "monthly") {
              index = orderCompletedAt.getDate(); // see how this looks, obv if you want to go back to the
              // grouping into 4 weeks you'll need to change this
            } else if (periodicity === "yearly") {
              index = orderCompletedAt.getMonth();
            }

            prevResults[index] = (prevResults[index] || 0) + 1;
          }
        }

        // format/combine the results (if necessary)
        const combinedResults = [];

        // name will be be dynamic based on the periodicity (6:00 PM, Monday, etc)

        let iterationAmount = 24;

        if (periodicity === "weekly") {
          iterationAmount = 7;
        } else if (periodicity === "monthly") {
          iterationAmount = 31;
        } else if (periodicity === "yearly") {
          iterationAmount = 12;
        }

        for (let i = 0; i < iterationAmount; i++) {
          const curr = currResults[i] || 0;
          const prev = prevResults[i] || 0;

          combinedResults.push({
            name: getPeriodName(i, periodicity),
            curr,
            prev,
          });
        }

        // get total late orders for the current period and the previous period (if necessary)
        const totalCurr = currResults.reduce((a, b) => a + b, 0);
        const totalPrev =
          prevStartDate && prevEndDate
            ? prevResults.reduce((a, b) => a + b, 0)
            : null;

        // add to the results under key of "totalOrders"
        results.push({
          ...generateTitleAndTimeRange({
            category: "lateOrders",
            periodicity,
            currStartDate,
            currEndDate,
            prevStartDate,
            prevEndDate,
          }),
          data: combinedResults,
          ...generateContextStrings({
            category: "lateOrders",
            totalCurr,
            totalPrev,
          }),
        });
      }

      return results;
    }),
});

////////////////////////////////////////////////////////////////////

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
  currStartDate: Date;
  currEndDate: Date;
  prevStartDate?: Date;
  prevEndDate?: Date;
}

function formatDate(date: Date): string {
  return format(date, "MM/dd/yyyy");
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateTitleAndTimeRange({
  category,
  periodicity,
  currStartDate,
  currEndDate,
  prevStartDate,
  prevEndDate,
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

  const currentPeriod = `${formatDate(currStartDate)} - ${formatDate(currEndDate)}`;

  let title = `${categoryMap[category]} - ${capitalizeFirstLetter(periodicity)}`;
  let timeRange = `(${currentPeriod})`;

  if (prevStartDate && prevEndDate) {
    const previousPeriod = `${formatDate(prevStartDate)} - ${formatDate(prevEndDate)}`;
    title = `${categoryMap[category]} - Compared to ${periodicityToLabel[periodicity]}`;
    timeRange = `(${previousPeriod} | ${currentPeriod})`;
  }

  return { title, timeRange };
}

////////////////////////////////////////////////////////////////////

interface ContextParams {
  category: Category;
  totalCurr: number;
  totalPrev: number | null;
}

function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

function formatTime(value: number): string {
  const minutes = Math.floor(value);
  const seconds = Math.round((value - minutes) * 60);
  return `${minutes} minutes and ${seconds} seconds`;
}

function generateContextStrings({
  category,
  totalCurr,
  totalPrev,
}: ContextParams): { totalCurr: string; totalPrev: string | null } {
  const categoryMap: {
    [key in Category]: (
      curr: number,
      prev: number | null,
    ) => { totalCurr: string; totalPrev: string | null };
  } = {
    totalOrders: (curr, prev) => ({
      totalCurr: `${curr} orders made`,
      totalPrev: prev !== null ? `${prev} orders made` : null,
    }),
    totalRevenue: (curr, prev) => ({
      totalCurr: `$${formatNumber(curr)} in revenue`,
      totalPrev: prev !== null ? `$${formatNumber(prev)} in revenue` : null,
    }),
    totalTips: (curr, prev) => ({
      totalCurr: `$${formatNumber(curr)} in tips`,
      totalPrev: prev !== null ? `$${formatNumber(prev)} in tips` : null,
    }),
    averageOrderValue: (curr, prev) => ({
      totalCurr: `$${formatNumber(curr)} per order`,
      totalPrev: prev !== null ? `$${formatNumber(prev)} per order` : null,
    }),
    averageOrderCompletionTime: (curr, prev) => ({
      totalCurr: `${formatTime(curr)} per order`,
      totalPrev: prev !== null ? `${formatTime(prev)} per order` : null,
    }),
    lateOrders: (curr, prev) => ({
      totalCurr: `${curr} late orders`,
      totalPrev: prev !== null ? `${prev} late orders` : null,
    }),
  };

  return categoryMap[category](totalCurr, totalPrev);
}

////////////////////////////////////////////////////////////////////

function millisecondsToMinutes(milliseconds: number) {
  const minutes = new Decimal(milliseconds).div(60000).toNumber();
  return minutes;
}

////////////////////////////////////////////////////////////////////

function getPeriodName(
  index: number,
  periodicity: "daily" | "weekly" | "monthly" | "yearly",
): string {
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
  if (day > 3 && day < 21) return "th"; // covers 11th to 19th
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
