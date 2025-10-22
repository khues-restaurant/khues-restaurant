// Ensures the selected pickup time is at least twenty minutes from now so
// kitchen staff have the minimum prep window.

export function isAtLeast20MinsFromDatetime(
  targetDate: Date,
  currentDate: Date,
) {
  // Calculate the difference in time between targetDate and currentDate in milliseconds
  const differenceInMillis = targetDate.getTime() - currentDate.getTime();

  // Convert 30 minutes to milliseconds (20 minutes * 60 seconds per minute * 1000 milliseconds per second)
  const twentyMinutesInMillis = 20 * 60 * 1000;

  // Return true if the difference is greater than or equal to twentyMinutesInMillis
  return differenceInMillis >= twentyMinutesInMillis;
}
