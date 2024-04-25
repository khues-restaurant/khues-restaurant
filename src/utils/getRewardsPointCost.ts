import Decimal from "decimal.js";
import { type Item } from "~/stores/MainStore";

interface GetRewardsPointCost {
  items: Item[];
}

// this returns the number of points necessary to redeem the reward item
// in a user's cart. Currently this should only be one item max.

export function getRewardsPointCost({ items }: GetRewardsPointCost) {
  // find the item that is being redeemed
  const rewardItem = items.find((item) => item.pointReward);

  if (rewardItem) {
    const price = new Decimal(rewardItem.price);

    const points = price.div(0.005);

    return points.toNumber();
  }

  return 0;
}
