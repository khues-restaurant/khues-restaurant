import { z } from "zod";
import { orderDetailsSchema } from "~/stores/MainStore";
import isEqual from "lodash.isequal";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getMidnightDate } from "~/utils/getMidnightDate";

export const validateOrderRouter = createTRPCRouter({
  validate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        orderDetails: orderDetailsSchema,
        forceReturnOrderDetails: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("have been hit, validation");

      // Date validation
      //  rules:
      //  - datetimeToPickUp must be in the future
      //  - (potentially also check if it's not on a day the store is closed)

      // Pickup time validation
      //  rules:
      //  - pickup time must be greater than the minOrderPickupDatetime
      //  - pickup time must be greater than current datetime
      //  - not doing the +30 minutes here since we want the user to get that feedback on press of
      //    the "proceed to checkout" button

      // Item validation
      //  rules:
      //  - item must exist in the database and have an "available" field set to true
      //  - item must have a price that matches the price in the database
      //  - item must have a quantity that is greater than 0
      //  - if an item is not available, it should be removed from the order, but it's Id should be
      //    added to an array which gets returned at the end of this function
      //  - Customizations:
      //    - customization choice ids must exist in the database, otherwise set to default choice id
      //  - Discount:
      //    - discount id must exist in the database and it's "expirationDate" must be in the future,
      //      and it must have an "active" field set to true
      //    - if the discount id is not valid, it should be removed from the order item
      //    - if discount name includes "Points" or "Birthday", it must have the same userId as the
      //      userId passed in.
      //  -* do we really need to check if menu item category exists in database? doesn't seem necessary

      const {
        userId,
        orderDetails: originalOrderDetails,
        forceReturnOrderDetails,
      } = input;

      const orderDetails = structuredClone(originalOrderDetails);

      // Check if user exists
      const user = await ctx.prisma.user.findFirst({
        where: {
          userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Date validation
      const datetimeToPickUp = orderDetails.datetimeToPickUp;
      const now = new Date();

      if (datetimeToPickUp <= now) {
        orderDetails.datetimeToPickUp = getMidnightDate(now);
      }

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

      if (
        datetimeToPickUp <= now ||
        datetimeToPickUp < minOrderPickupDatetime
      ) {
        orderDetails.datetimeToPickUp = getMidnightDate(now);
      }

      // Item validation
      const items = orderDetails.items;
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

          if (!dbCustomizationChoice) {
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

            item.customizations[categoryId] =
              dbCustomizationCategory.defaultChoiceId;
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
