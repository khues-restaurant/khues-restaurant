import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { Decimal } from "decimal.js";
import { type Discount } from "@prisma/client";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type Item } from "~/stores/MainStore";
import { DBOrderSummaryItem } from "~/server/api/routers/order";

interface CalculateTotalCartPrices {
  items: Item[] | DBOrderSummaryItem[];
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
}

export function calculateTotalCartPrices({
  items,
  customizationChoices,
  discounts,
}: CalculateTotalCartPrices) {
  let relativeTotal = new Decimal(
    calculateRelativeTotal({
      items,
      customizationChoices,
      discounts,
    }),
  );

  // if "Spend X, Save Y" exists, apply it here
  if (
    Object.values(discounts).some(
      (discount) => discount.name === "Spend $35, Save $5",
    )
  ) {
    const spendXSaveY = new Decimal(5);
    const spendX = new Decimal(35);

    if (relativeTotal.gte(spendX)) {
      relativeTotal = relativeTotal.sub(spendXSaveY);
    }
  }

  const tax = relativeTotal.mul(0.07);
  const total = relativeTotal.add(tax);

  return {
    subtotal: relativeTotal.toNumber(),
    tax: tax.toNumber(),
    total: total.toNumber(),
  };
}
