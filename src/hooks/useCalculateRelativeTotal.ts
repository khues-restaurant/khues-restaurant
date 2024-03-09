import { Decimal } from "decimal.js";
import { useCallback } from "react";
import { type Item, useMainStore } from "~/stores/MainStore";

function useCalculateRelativeTotal() {
  const { customizationChoices, discounts } = useMainStore((state) => ({
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
  }));

  // TODO: technically since we are storing the whole discount/customization choice inside of zustand store
  // we could turn this into a regular function and pass those in as arguments

  const calculateRelativeTotal = useCallback(
    (items: Item[]): number => {
      let total = new Decimal(0);

      const customizationChoiceIds = items.flatMap((i) =>
        i.customizations.map((c) => c.choiceId),
      );

      for (const item of items) {
        let price = new Decimal(item.price);

        if (customizationChoiceIds) {
          for (const choiceId of customizationChoiceIds) {
            const priceAdjustment =
              customizationChoices[choiceId]?.priceAdjustment;
            if (priceAdjustment) {
              price = price.add(new Decimal(priceAdjustment));
            }
          }
        }

        if (item.discountId) {
          const discount = discounts[item.discountId];
          if (discount) {
            // Points/Birthday free rewards
            if (
              discount.name.includes("Points") ||
              discount.name.includes("Birthday")
            ) {
              continue;
            }

            if (discount.name === "10% off") {
              price = price.mul(0.9);
            } else if (discount.name === "20% off") {
              price = price.mul(0.8);
            }
            // Add additional discount logic as needed
          }
        }

        price = price.mul(item.quantity);

        total = total.add(price);
      }

      return total.toNumber(); // Converts the Decimal total to a JavaScript number
    },
    [customizationChoices, discounts],
  );

  const calculateOrderTotals = useCallback(
    (items: Item[]) => {
      const relativeTotal = calculateRelativeTotal(items);
      const tax = new Decimal(relativeTotal).mul(0.07);
      const total = new Decimal(relativeTotal).add(tax);

      return {
        subtotal: relativeTotal,
        tax: tax.toNumber(),
        total: total.toNumber(),
      };
    },
    [calculateRelativeTotal],
  );

  return { calculateRelativeTotal, calculateOrderTotals };
}

export default useCalculateRelativeTotal;

// use for cart
// orderDetails.items.map((i) => ({
//                           basePrice: i.price,
//                           quantity: i.quantity,
//                           customizationChoiceIds: i.customizations.map(
//                             (c) => c.choiceId,
//                           ),
//                           discountId: i.discountId,
//                         })),
