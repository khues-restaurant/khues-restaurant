import { z } from "zod";
import { type OrderDetails, orderDetailsSchema } from "~/stores/MainStore";
import isEqual from "lodash.isequal";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getMidnightDate } from "~/utils/getMidnightDate";
import { isAbleToRenderASAPTimeSlot } from "~/utils/isAbleToRenderASAPTimeSlot";
import { is30MinsFromDatetime } from "~/utils/is30MinsFromDatetime";
import Decimal from "decimal.js";

const holidays = [
  new Date("2024-12-25"),
  new Date("2024-12-26"),
  new Date("2025-01-01"),
];

function isSundayOrMonday(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 1;
}

function isHoliday(date: Date, holidays: Date[]) {
  const dateString = date.toISOString().split("T")[0]; // Converts date to YYYY-MM-DD format
  return holidays.some(
    (holiday) => holiday.toISOString().split("T")[0] === dateString,
  );
}

function validateDateToPickUp(orderDetails: OrderDetails, holidays: Date[]) {
  let datetimeToPickUp = new Date(orderDetails.datetimeToPickUp);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize now to midnight for consistent comparison

  // If datetimeToPickUp is in the past, adjust it to midnight today
  if (datetimeToPickUp <= now) {
    datetimeToPickUp = now;
  }

  // Check and adjust for Sundays, Mondays, and Holidays
  while (
    isSundayOrMonday(datetimeToPickUp) ||
    isHoliday(datetimeToPickUp, holidays)
  ) {
    datetimeToPickUp.setDate(datetimeToPickUp.getDate() + 1); // Move to the next day
  }

  // Update the orderDetails with the validated or adjusted date
  orderDetails.datetimeToPickUp = datetimeToPickUp;
}

function validateTimeToPickup(
  orderDetails: OrderDetails,
  minOrderPickupDatetime: Date,
) {
  const now = new Date();
  const datetimeToPickUp = orderDetails.datetimeToPickUp;

  // ASAP time slot validation
  if (
    orderDetails.isASAP &&
    isAbleToRenderASAPTimeSlot(new Date()) &&
    now >= minOrderPickupDatetime
  ) {
    return;
  }

  // Regular pickup time validation
  if (
    datetimeToPickUp > now &&
    datetimeToPickUp > minOrderPickupDatetime &&
    is30MinsFromDatetime(datetimeToPickUp, new Date())
  ) {
    return;
  }

  orderDetails.datetimeToPickUp = getMidnightDate(now);
}

export const validateOrderRouter = createTRPCRouter({
  validate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        orderDetails: orderDetailsSchema,
        forceReturnOrderDetails: z.boolean().optional(),
        validatingAReorder: z.boolean().optional(),
        resetOrderDetails: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Date validation rules:
      //  - datetimeToPickUp must be in the future
      //  - (potentially also check if it's not on a day the store is closed)

      // Pickup time validation rules:
      //  - pickup time must be greater than the minOrderPickupDatetime
      //  - pickup time must be greater than current datetime
      //  - not doing the +30 minutes here since we want the user to get that feedback on press of
      //    the "proceed to checkout" button

      // Item validation rules:
      //  - General item rules:
      //  - item must exist in the database and have an "available" field set to true
      //  - item must have a price that matches the price in the database
      //  - item must have a quantity that is greater than 0
      //  - if an item is not available, it should be removed from the order, but it's Id should be
      //    added to an array which gets returned at the end of this function
      //  - shouldn't ever happen, but just remove item if it has "isAlcoholic" field set to true
      //  - Customizations:
      //    - customization choice ids must exist in the database, otherwise set to default choice id.
      //      If the default choice id isn't available, cycle through the customization category's
      //      choices and set it to the first one that is available
      //    - similarly, if the current choice id isn't available, set it to the default choice id
      //      or cycle to find the first available choice id
      //  - Discount:
      //    - discount id must exist in the database and it's "expirationDate" must be in the future,
      //      and it must have an "active" field set to true
      //    - if the discount id is not valid, it should be removed from the order item
      //    - if discount name includes "Points" or "Birthday", it must have the same userId as the
      //      userId passed in.
      //  - Reward:
      //    - if an item is a point reward, it should be checked if the user has enough points to
      //      redeem the reward. If they aren't a user, remove the item from the order. If they don't
      //      have enough points, remove the pointReward flag from the item.
      //    - if validatingAReorder is true, the item should be kept in the order, but it's pointReward
      //      and birthdayReward should be set to false

      //  -? do we really need to check if menu item category exists in database? doesn't seem necessary

      const {
        userId,
        orderDetails: originalOrderDetails,
        forceReturnOrderDetails,
        validatingAReorder,
        resetOrderDetails,
      } = input;

      const orderDetails = structuredClone(originalOrderDetails);

      if (!validatingAReorder) {
        // Date validation
        validateDateToPickUp(orderDetails, holidays);

        // Pickup time validation
        const dbMinOrderPickupTime =
          await ctx.prisma.minimumOrderPickupTime.findFirst({
            where: {
              id: 1,
            },
          });

        if (!dbMinOrderPickupTime) {
          throw new Error("Minimum order pickup time not found");
        }

        const minOrderPickupDatetime = dbMinOrderPickupTime.value;
        validateTimeToPickup(orderDetails, minOrderPickupDatetime);
      }

      // Item validation
      const items = resetOrderDetails ? [] : orderDetails.items;
      const removedItemNames = [];

      for (const item of items) {
        const dbItem = await ctx.prisma.menuItem.findFirst({
          where: {
            id: item.itemId,
          },
        });

        if (
          !dbItem ||
          !dbItem.available ||
          dbItem.price !== item.price ||
          dbItem.isAlcoholic ||
          item.quantity <= 0
        ) {
          // removing item from order
          items.splice(items.indexOf(item), 1);

          // adding item name to removedItemNames
          removedItemNames.push(item.name);
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
          // try to set to defaultChoiceId, if that isn't avail
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
        if (item.discountId) {
          const dbDiscount = await ctx.prisma.discount.findFirst({
            where: {
              id: item.discountId,
              expirationDate: {
                gt: new Date(),
              },
              active: true,
            },
          });

          if (!dbDiscount) {
            item.discountId = null;
          } else if (
            dbDiscount.name.includes("Points") ||
            dbDiscount.name.includes("Birthday")
          ) {
            if (dbDiscount.userId !== userId) {
              item.discountId = null;
            }
          }
        }

        // If an item was a point reward or birthday reward, we (tentatively) are going to
        // still keep it in the order, but set it's values of pointReward and birthdayReward to false

        if (item.pointReward) {
          if (validatingAReorder) {
            item.pointReward = false;
            item.birthdayReward = false;
          } else {
            // check if the user has enough points to redeem the point reward
            if (item.pointReward) {
              const itemRewardPoints = new Decimal(item.price)
                .div(0.005)
                .toNumber();

              const user = await ctx.prisma.user.findFirst({
                where: {
                  userId,
                },
              });

              if (!user) {
                // removing item from order
                items.splice(items.indexOf(item), 1);

                // adding item name to removedItemNames
                removedItemNames.push(item.name);
              } else if (user.rewardsPoints < itemRewardPoints) {
                item.pointReward = false; // choosing to leave item in order, but treat it as a regular
                // item instead of a point reward
              }
            }
          }
        }

        // TODO: validate logic for birthday reward
        // if (item.birthdayReward) {
        //   if (validatingAReorder) {
        //     item.pointReward = false;
        //     item.birthdayReward = false;
        //   } else {
        //     // check if the user has a birthday reward available
        //     // if not, set birthdayReward to false
        //   }
        // }
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
