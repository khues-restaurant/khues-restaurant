export function isAbleToRenderASAPTimeSlot(currentDate: Date) {
  // if currentDate hours is earlier than opening time, return false
  if (currentDate.getHours() < 12) {
    return false;
  }

  // if currentDate hours is later than 21:10 (9:10 PM), return false
  if (currentDate.getHours() >= 21 && currentDate.getMinutes() >= 10) {
    return false;
  }

  return true;
}
