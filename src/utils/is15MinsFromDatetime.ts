// makes sure that for non-ASAP order pickup times, the selected time is at least
// 15 minutes from the current time, otherwise you would have both the ASAP (~15 mins)
// and a time slot that is roughly 15 minutes from the current time, which would be
// confusing to the user.

export function is15MinsFromDatetime(targetDate: Date, currentDate: Date) {
  // Calculate the difference in time between targetDate and currentDate in milliseconds
  const differenceInMillis = targetDate.getTime() - currentDate.getTime();

  // Convert 30 minutes to milliseconds (15 minutes * 60 seconds per minute * 1000 milliseconds per second)
  const fifteenMinutesInMillis = 15 * 60 * 1000;

  // Return true if the difference is greater than or equal to fifteenMinutesInMillis
  return differenceInMillis >= fifteenMinutesInMillis;
}
