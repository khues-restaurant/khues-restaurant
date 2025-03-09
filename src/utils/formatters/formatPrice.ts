import Decimal from "decimal.js";

export function formatPrice(price: number, excludeCents = false) {
  const priceInCents = new Decimal(price);
  const priceInDollars = priceInCents.div(100).toNumber();

  return `${priceInDollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: excludeCents ? 0 : 2,
    maximumFractionDigits: excludeCents ? 0 : 2,
  })}`;
}
