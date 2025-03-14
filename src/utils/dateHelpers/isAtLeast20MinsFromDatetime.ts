// makes sure that for non-ASAP order pickup times, the selected time is at least
// 20 minutes from the current time, otherwise you would have both the ASAP (~20 mins)
// and a time slot that is roughly 20 minutes from the current time, which would be
// confusing to the user.

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
