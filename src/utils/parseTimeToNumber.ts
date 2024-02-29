export function parseTimeToNumber(timeStr: string): number {
  // Extract the parts of the time string
  const parts = timeStr.match(/(\d+):(\d+)(AM|PM)/i);

  if (!parts) {
    throw new Error("Invalid time format");
  }

  const [_, hours, minutes, period] = parts;

  if (!hours || !minutes || !period) {
    throw new Error("Invalid time format");
  }

  // Convert hours and minutes to numbers
  let hoursNum = parseInt(hours, 10);
  const minutesNum = parseInt(minutes, 10);

  // Convert to 24-hour format if necessary
  if (period?.toUpperCase() === "PM" && hoursNum < 12) {
    hoursNum += 12;
  } else if (period?.toUpperCase() === "AM" && hoursNum === 12) {
    hoursNum = 0;
  }

  // Special handling to convert hours to a proper number in the format
  if (hoursNum === 0 || hoursNum === 12) {
    hoursNum *= 100; // Convert 12 or 0 into 1200 or 0 for proper formatting
  } else if (hoursNum < 10) {
    hoursNum *= 100; // Ensure single-digit hours are properly formatted
  } else {
    hoursNum = hoursNum * 100 + minutesNum; // Combine hours and minutes for other cases
  }

  // Ensure the result is in HHMM format without leading zeroes for hours < 10
  return hoursNum < 1000 ? hoursNum : hoursNum + minutesNum;
}
