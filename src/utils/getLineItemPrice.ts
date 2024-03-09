import { type Discount } from "@prisma/client";

export function getLineItemPrice(
  itemPrice: number,
  quantity: number,
  discount?: Discount | null,
) {
  // TODO: discount implementation

  const scaleFactor = 100;
  // Correctly scale the itemPrice to mitigate floating point precision issues.
  const scaledPrice = Math.round(itemPrice * scaleFactor);
  // Multiply the scaled price by the quantity (quantity remains unchanged).
  const scaledProduct = scaledPrice * quantity;
  // Adjust the scale of the product back and round to two decimal places.
  return scaledProduct / scaleFactor;
}
