import { Decimal } from "decimal.js";
import { type Discount } from "@prisma/client";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type Item } from "~/stores/MainStore";
import { type DBOrderSummaryItem } from "~/server/api/routers/order";

interface CalculateRelativeTotal {
  items: Item[] | DBOrderSummaryItem[];
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
}

export function calculateRelativeTotal({
  items,
  customizationChoices,
  discounts,
}: CalculateRelativeTotal): number {
  let total = new Decimal(0);

  for (const item of items) {
    let price = new Decimal(item.birthdayReward ? 0 : item.price);

    const customizationChoiceIds = Object.values(item.customizations);

    if (customizationChoiceIds) {
      for (const choiceId of customizationChoiceIds) {
        const priceAdjustment = customizationChoices[choiceId]?.priceAdjustment;
        if (priceAdjustment) {
          // only want to add the price adjustment if it's greater than 0 for rewards
          // (otherwise it would show a negative price for the reward item which isn't allowed)
          if (item.birthdayReward && priceAdjustment <= 0) {
            continue;
          }

          price = price.add(new Decimal(priceAdjustment));
        }
      }
    }

    // if (item.discountId) {
    //   const discount = discounts[item.discountId];
    //   if (discount) {
    //     // Points/Birthday free rewards
    //     if (
    //       discount.name.includes("Points") ||
    //       discount.name.includes("Birthday")
    //     ) {
    //       continue;
    //     }

    //     if (discount.name === "10% off") {
    //       price = price.mul(0.9);
    //     } else if (discount.name === "20% off") {
    //       price = price.mul(0.8);
    //     }
    //     // Add additional discount logic as needed
    //   }
    // }

    price = price.mul(item.quantity);

    total = total.add(price);
  }

  return total.toNumber();
}
