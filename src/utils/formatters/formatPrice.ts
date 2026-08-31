export function formatPrice(price: number, excludeCents = false) {
  const priceInDollars = price / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: excludeCents ? 0 : 2,
    maximumFractionDigits: excludeCents ? 0 : 2,
  }).format(priceInDollars);
}
