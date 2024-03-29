import { addWeeks, subWeeks } from "date-fns";

export function isEligibleForBirthdayReward(
  birthdate: Date,
  birthdayRewardRedeemed: boolean,
  lastRewardRedemptionYear: number,
): boolean {
  const today: Date = new Date();
  const currentYear: number = today.getFullYear();
  const thisYearsBirthday: Date = new Date(birthdate);
  thisYearsBirthday.setFullYear(currentYear);

  // Calculate the start and end of the reward window
  const rewardWindowStart: Date = subWeeks(thisYearsBirthday, 2);
  const rewardWindowEnd: Date = addWeeks(thisYearsBirthday, 2);

  // Check if today falls within the reward window
  const isInRewardWindow: boolean =
    today >= rewardWindowStart && today <= rewardWindowEnd;

  // Check if the reward has not been redeemed this year
  const notRedeemedThisYear: boolean =
    !birthdayRewardRedeemed || lastRewardRedemptionYear < currentYear;

  return isInRewardWindow && notRedeemedThisYear;
}
