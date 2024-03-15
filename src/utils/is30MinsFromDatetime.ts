export function is30MinsFromDatetime(targetDate: Date, currentDate: Date) {
  // Calculate the difference in time between targetDate and currentDate in milliseconds
  const differenceInMillis = targetDate.getTime() - currentDate.getTime();

  // Convert 30 minutes to milliseconds (30 minutes * 60 seconds per minute * 1000 milliseconds per second)
  const thirtyMinutesInMillis = 30 * 60 * 1000;

  // Return true if the difference is greater than or equal to thirtyMinutesInMillis
  return differenceInMillis >= thirtyMinutesInMillis;
}
