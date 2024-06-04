import { z } from "zod";
import { type OrderDetails, orderDetailsSchema } from "~/stores/MainStore";
import isEqual from "lodash.isequal";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Decimal from "decimal.js";
import { toZonedTime } from "date-fns-tz";
import { getFirstValidMidnightDate } from "~/utils/getFirstValidMidnightDate";
import { isSelectedTimeSlotValid } from "~/utils/isSelectedTimeSlotValid";
import { loopToFindFirstOpenDay } from "~/utils/loopToFindFirstOpenDay";

function validateTimeToPickup(
  orderDetails: OrderDetails,
  minOrderPickupDatetime: Date,
) {
  const now = toZonedTime(new Date(), "America/Chicago");
  const datetimeToPickup = toZonedTime(
    orderDetails.datetimeToPickup,
    "America/Chicago",
  );
  const minPickupDatetime = toZonedTime(
    minOrderPickupDatetime,
    "America/Chicago",
  );

  if (
    isSelectedTimeSlotValid({
      isASAP: orderDetails.isASAP,
      datetimeToPickup,
      minPickupDatetime,
    })
  ) {
    return;
  }

  orderDetails.datetimeToPickup = loopToFindFirstOpenDay(now);
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
      // Date validation rules:
      //  - datetimeToPickup must be in the future
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
      } = input;

      const orderDetails = structuredClone(originalOrderDetails);

      if (!validatingAReorder) {
        // Date validation
        orderDetails.datetimeToPickup = getFirstValidMidnightDate(
          orderDetails.datetimeToPickup,
        );

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
      const items = orderDetails.items;
      const removedItemNames = [];
      const itemIds = items.map((item) => item.itemId);

      const dbItems = await ctx.prisma.menuItem.findMany({
        where: {
          id: { in: itemIds },
        },
      });

      const dbItemsMap = new Map(dbItems.map((item) => [item.id, item]));

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];

        if (item === undefined) continue;

        const dbItem = dbItemsMap.get(item.itemId);

        if (
          !dbItem ||
          !dbItem.available ||
          dbItem.price !== item.price ||
          dbItem.isAlcoholic ||
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
          const now = toZonedTime(new Date(), "America/Chicago");

          const dbDiscount = await ctx.prisma.discount.findFirst({
            where: {
              id: item.discountId,
              expirationDate: {
                gt: now,
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
