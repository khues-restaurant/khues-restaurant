import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import Decimal from "decimal.js";
import { type Discount } from "@prisma/client";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type Item } from "~/stores/MainStore";
import { type DBOrderSummaryItem } from "~/server/api/routers/order";

interface CalculateTotalCartPrices {
  items: Item[] | DBOrderSummaryItem[];
  tipPercentage: number | null;
  tipValue: number;
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
}

export function calculateTotalCartPrices({
  items,
  tipPercentage,
  tipValue,
  customizationChoices,
  discounts,
}: CalculateTotalCartPrices) {
  const subtotal = new Decimal(
    calculateRelativeTotal({
      items,
      customizationChoices,
      discounts,
    }),
  );

  // if "Spend X, Save Y" exists, apply it here
  // if (
  //   Object.values(discounts).some(
  //     (discount) => discount.name === "Spend $35, Save $5",
  //   )
  // ) {
  //   const spendXSaveY = new Decimal(5);
  //   const spendX = new Decimal(35);

  //   if (subtotal.gte(spendX)) {
  //     subtotal = subtotal.sub(spendXSaveY);
  //   }
  // }

  let calculatedTipValue = new Decimal(tipValue).mul(100); // convert to cents

  // if tip is a percentage, calculate it here
  if (tipPercentage !== null) {
    const decimalTipPercentage = new Decimal(tipPercentage).div(100);

    calculatedTipValue = subtotal.mul(decimalTipPercentage);
  }

  const tax = subtotal.mul(0.08375);
  const total = subtotal.add(tax).add(calculatedTipValue);

  return {
    subtotal: subtotal.toNumber(),
    tax: tax.toNumber(),
    tip: calculatedTipValue.toNumber(),
    total: total.toNumber(),
  };
}
