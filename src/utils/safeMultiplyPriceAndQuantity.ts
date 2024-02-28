export function safeMultiplyPriceAndQuantity(price1: number, price2: number) {
  // Convert prices to integers by assuming two decimal places
  const scaleFactor = 100;
  const intPrice1 = Math.round(price1 * scaleFactor);
  const intPrice2 = Math.round(price2 * scaleFactor);

  // Perform multiplication using integers
  const product = (intPrice1 * intPrice2) / scaleFactor ** 2;

  // Return the product as a floating-point number
  // Optionally, round the result to two decimal places if necessary
  return Math.round(product * 100) / 100;
}
