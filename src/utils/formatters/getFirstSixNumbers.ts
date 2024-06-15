export function getFirstSixNumbers(orderUUID: string) {
  const allDigits = orderUUID.match(/\d/g); // This will return an array of all digits in the string
  if (allDigits && allDigits.length >= 6) {
    return allDigits.join("").slice(0, 6); // Join all digits into a string and slice the first six
  }
  return orderUUID.toUpperCase().substring(0, 6); // fallback just in case
}
