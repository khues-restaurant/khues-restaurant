import { z } from "zod";
import { type OrderDetails, orderDetailsSchema } from "~/stores/MainStore";
import isEqual from "lodash.isequal";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Decimal from "decimal.js";
import { coerceToNormalizedHours } from "~/server/api/routers/helpers/hoursOfOperation";
import {
  type HolidayList,
  type WeekOperatingHours,
} from "~/types/operatingHours";
import { isSelectedTimeSlotValid } from "~/utils/dateHelpers/isSelectedTimeSlotValid";
import { loopToFindFirstOpenDay } from "~/utils/dateHelpers/loopToFindFirstOpenDay";
import { isEligibleForBirthdayReward } from "~/utils/dateHelpers/isEligibleForBirthdayReward";
import {
  getCSTDateInUTC,
  getMidnightCSTInUTC,
} from "~/utils/dateHelpers/cstToUTCHelpers";

/**
 * Validation Flow and Checks Overview:
 *
 *
 * 1. Date Validation:
 *    - `datetimeToPickup` must be in the future.
 *    - If `datetimeToPickup` is in the past, find the next valid day.
 *    - Ensure the selected day is not a holiday or a day when the restaurant is closed.
 *
 * 2. Pickup Time Validation:
 *    - `datetimeToPickup` must be greater than `minOrderPickupDatetime`.
 *    - Ensure the selected pickup time is within operating hours.
 *    - Ensure `datetimeToPickup` is at least 20 minutes from the current time.
 *    - If `isASAP`, ensure `datetimeToPickup` is today and within operating hours.
 *    - Ensure `datetimeToPickup` is not less than 30 minutes before closing time.
 *
 * 3. Item Validation:
 *    - General item rules:
 *      - Item must exist in the database and be available.
 *      - Item's price must match the price in the database.
 *      - Item's quantity must be greater than 0.
 *      - Remove items that are unavailable (86'd).
 *    - Customizations:
 *      - Customization choice IDs must exist and be available in the database.
 *      - If a customization choice ID is invalid, set to default or first available choice.
 *      - Default to removing item from the order if no valid customization choice is found.
 *    - Discounts (not implemented):
 *      - Discount ID must exist, be active, and not expired.
 *      - Remove invalid discount IDs from the order item.
 *      - If the discount name includes "Points" or "Birthday", it must match the userId.
 *    - Rewards:
 *      - Validate point rewards based on user's available points.
 *      - If `validatingAReorder` is true, keep the item but set `pointReward` and `birthdayReward` to false.
 *      - For birthday rewards, check eligibility based on user's birthday and redemption year.
 */

function validateDayOfDatetimeToPickup(
  orderDatetimeToPickup: Date,
  hoursOfOperation: WeekOperatingHours,
  holidays: HolidayList,
) {
  let datetimeToPickup = orderDatetimeToPickup
    ? getCSTDateInUTC(orderDatetimeToPickup)
    : getMidnightCSTInUTC();

  const todayAtMidnight = getMidnightCSTInUTC();

  // If datetimeToPickup is in the past, need to find the next valid day
  // (at midnight specifically) to set it to.
  if (datetimeToPickup < todayAtMidnight) {
    console.log(
      "day is in the past, finding next valid day",
      datetimeToPickup,
      todayAtMidnight,
    );
    datetimeToPickup = loopToFindFirstOpenDay(
      todayAtMidnight,
      hoursOfOperation,
      holidays,
    );
  }

  return datetimeToPickup;
}

function validateTimeToPickup(
  orderDetails: OrderDetails,
  minOrderPickupDatetime: Date,
  hoursOfOperation: WeekOperatingHours,
  holidays: HolidayList,
) {
  if (
    isSelectedTimeSlotValid({
      isASAP: orderDetails.isASAP,
      datetimeToPickup: orderDetails.datetimeToPickup,
      minPickupDatetime: minOrderPickupDatetime,
      hoursOfOperation,
      holidays,
    })
  ) {
    console.log("time is valid", orderDetails.datetimeToPickup);
    return;
  }

  // at this point datetimeToPickup is invalid, so we need to find the next valid
  // day to set it to, and by convention we set isASAP to false as a precaution.
  orderDetails.isASAP = false;

  const nowAtMidnight = getMidnightCSTInUTC();
  console.log("time is invalid, finding next valid day", nowAtMidnight);
  orderDetails.datetimeToPickup = loopToFindFirstOpenDay(
    nowAtMidnight,
    hoursOfOperation,
    holidays,
  );
}

export const validateOrderRouter = createTRPCRouter({
  validate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        orderDetails: orderDetailsSchema,
        forceReturnOrderDetails: z.boolean().optional(),
        validatingAReorder: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        userId,
        orderDetails: originalOrderDetails,
        forceReturnOrderDetails,
        validatingAReorder,
      } = input;

      const orderDetails = structuredClone(originalOrderDetails);

      const [hoursOfOperationRecords, holidayRecords] = await Promise.all([
        ctx.prisma.hoursOfOperation.findMany({
          orderBy: { dayOfWeek: "asc" },
        }),
        ctx.prisma.holiday.findMany({
          orderBy: { date: "asc" },
        }),
      ]);

      const normalizedHours = coerceToNormalizedHours(
        hoursOfOperationRecords,
      ) as WeekOperatingHours;

      const normalizedHolidays: HolidayList = holidayRecords.map((holiday) => {
        const normalizedDate = new Date(holiday.date);
        normalizedDate.setHours(0, 0, 0, 0);

        return {
          id: holiday.id,
          date: normalizedDate,
          isRecurringAnnual: holiday.isRecurringAnnual,
        };
      });

      if (!validatingAReorder) {
        // Date validation
        orderDetails.datetimeToPickup = validateDayOfDatetimeToPickup(
          orderDetails.datetimeToPickup,
          normalizedHours,
          normalizedHolidays,
        );

        // Pickup time validation
        let dbMinOrderPickupTime =
          await ctx.prisma.minimumOrderPickupTime.findFirst({
            where: {
              id: 1,
            },
          });

        if (!dbMinOrderPickupTime) {
          dbMinOrderPickupTime = {
            id: 1,
            value: getMidnightCSTInUTC(),
          };
        }

        const minOrderPickupDatetime = dbMinOrderPickupTime.value;
        validateTimeToPickup(
          orderDetails,
          minOrderPickupDatetime,
          normalizedHours,
          normalizedHolidays,
        );
      }

      // Item validation
      let items = orderDetails.items;
      let removedItemNames = [];
      const itemIds = items.map((item) => item.itemId);

      try {
        const dbItems = await ctx.prisma.menuItem.findMany({
          where: {
            id: { in: itemIds },
          },

          include: {
            menuCategory: true,
          },
        });

        const dbItemsMap = new Map(dbItems.map((item) => [item.id, item]));
        let pointRewardFound = false; // only allow one point reward per order
        let birthdayRewardFound = false; // only allow one birthday reward per order

        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];

          if (item === undefined) continue;

          const dbItem = dbItemsMap.get(item.itemId);

          if (
            !dbItem ||
            !dbItem.menuCategory.active ||
            !dbItem.menuCategory.orderableOnline ||
            !dbItem.available ||
            dbItem.price !== item.price ||
            item.quantity <= 0
          ) {
            items.splice(i, 1);
            removedItemNames.push(item.name);
            continue;
          }

          // Customizations

          // TODO: I think it's potentially possible for an item to have had a customization/customization category
          // that no longer exists (due to a menu change), so in this case we need to check and see what customization
          // categories exist with ties to the menu item, and kind of do a whole separate loop at some stage here to
          // basically replace all of the invalid customizationIds with the default customization choice ids of
          // each proper customization category for the menu item.

          for (const [categoryId, choiceId] of Object.entries(
            item.customizations,
          )) {
            const dbCustomizationChoice =
              await ctx.prisma.customizationChoice.findFirst({
                where: {
                  id: choiceId,
                },
              });

            // if the customization choice doesn't exist, or isn't available
            // try to set to defaultChoiceId
            if (!dbCustomizationChoice?.isAvailable) {
              // need to query for the category's default choice id
              const dbCustomizationCategory =
                await ctx.prisma.customizationCategory.findFirst({
                  where: {
                    id: categoryId,
                  },
                });

              if (!dbCustomizationCategory) {
                throw new Error("Customization category not found");
              }

              const defaultChoiceId = dbCustomizationCategory.defaultChoiceId;

              if (!defaultChoiceId) {
                throw new Error("Default choice id not found");
              }

              const dbDefaultCustomizationChoice =
                await ctx.prisma.customizationChoice.findFirst({
                  where: {
                    id: defaultChoiceId,
                  },
                });

              if (!dbDefaultCustomizationChoice?.isAvailable) {
                // need to cycle through the choices to find the first available one
                const dbCustomizationChoices =
                  await ctx.prisma.customizationChoice.findMany({
                    where: {
                      customizationCategoryId: categoryId,
                    },
                    orderBy: {
                      listOrder: "asc",
                    },
                  });

                const firstAvailableChoice = dbCustomizationChoices.find(
                  (choice) => choice.isAvailable,
                );

                if (!firstAvailableChoice) {
                  // removing item from order
                  items.splice(items.indexOf(item), 1);

                  // adding item name to removedItemNames
                  removedItemNames.push(item.name);
                } else {
                  item.customizations[categoryId] = firstAvailableChoice.id;
                }
              } else {
                item.customizations[categoryId] = defaultChoiceId;
              }
            }
          }

          // Discount
          // if (item.discountId) {
          //   const now = toZonedTime(new Date(), "America/Chicago");

          //   const dbDiscount = await ctx.prisma.discount.findFirst({
          //     where: {
          //       id: item.discountId,
          //       expirationDate: {
          //         gt: now,
          //       },
          //       active: true,
          //     },
          //   });

          //   if (!dbDiscount) {
          //     item.discountId = null;
          //   } else if (
          //     dbDiscount.name.includes("Points") ||
          //     dbDiscount.name.includes("Birthday")
          //   ) {
          //     if (dbDiscount.userId !== userId) {
          //       item.discountId = null;
          //     }
          //   }
          // }

          // If a reordered item was a point reward or birthday reward, we (tentatively) are going to
          // still keep it in the order, but set it's values of pointReward and birthdayReward to false

          if (item.birthdayReward) {
            if (birthdayRewardFound || validatingAReorder) {
              item.birthdayReward = false;
            } else {
              birthdayRewardFound = true;

              const user = await ctx.prisma.user.findFirst({
                where: {
                  userId,
                },
              });

              if (
                !user ||
                !isEligibleForBirthdayReward(
                  new Date(user.birthday),
                  user.lastBirthdayRewardRedemptionYear,
                )
              ) {
                // item is not allowed to be redeemed as a reward,
                // but choosing to leave item in order and treat it as a regular item
                item.birthdayReward = false;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error validating items:", error);

        items = [];
        removedItemNames = [];
      }

      if (validatingAReorder) {
        return {
          validItems: items,
          removedItemNames,
        };
      }

      // don't want to constantly calling updateOrder() if the order is already
      // valid.
      const changedOrderDetails = isEqual(orderDetails, originalOrderDetails)
        ? null
        : orderDetails;

      return {
        changedOrderDetails: forceReturnOrderDetails
          ? orderDetails
          : changedOrderDetails,
        removedItemNames,
      };
    }),
});
