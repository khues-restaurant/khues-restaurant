import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { Decimal } from "decimal.js";
import { type Discount } from "@prisma/client";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type Item } from "~/stores/MainStore";

interface CalculateTotalCartPrices {
  items: Item[];
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
}

export function calculateTotalCartPrices({
  items,
  customizationChoices,
  discounts,
}: CalculateTotalCartPrices) {
  const relativeTotal = calculateRelativeTotal({
    items,
    customizationChoices,
    discounts,
  });
  const tax = new Decimal(relativeTotal).mul(0.07);
  const total = new Decimal(relativeTotal).add(tax);

  return {
    subtotal: relativeTotal,
    tax: tax.toNumber(),
    total: total.toNumber(),
  };
}
