import Decimal from "decimal.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

// This is set to run at "0 6 * * *"
// meaning every day at midnight/1 am CST,
// which allows for daylight savings time buffer

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    // Step 1: Fetch all rewards that need to be expired along with the users they belong to
    const rewardsToExpire = await prisma.reward.findMany({
      where: {
        value: {
          gt: 0,
        },
        expired: false,
        expiresAt: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        value: true,
        userId: true,
      },
    });

    // Step 2: Aggregate the points to deduct for each user
    const pointsToDeduct: Record<string, Decimal> = {};

    rewardsToExpire.forEach((reward) => {
      if (pointsToDeduct[reward.userId] !== undefined) {
        pointsToDeduct[reward.userId] = pointsToDeduct[reward.userId]!.add(
          reward.value,
        );
      } else {
        pointsToDeduct[reward.userId] = new Decimal(reward.value);
      }
    });

    // Step 3: Decrement rewardsPoints for each user, ensuring it doesn't go below zero
    const updateUserPromises = Object.entries(pointsToDeduct).map(
      async ([userId, points]) => {
        // Fetch current rewardsPoints for the user
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { rewardsPoints: true },
        });

        if (user) {
          // Calculate the new rewardsPoints after decrement
          const currentPoints = new Decimal(user.rewardsPoints);
          const newPoints = currentPoints.sub(points);

          // Ensure rewardsPoints does not go below zero
          const finalPoints = Decimal.max(newPoints, 0);

          // Decrement rewardsPoints accordingly
          return prisma.user.update({
            where: { userId },
            data: {
              rewardsPoints: finalPoints.toNumber(),
            },
          });
        }
      },
    );

    const results = await Promise.allSettled(updateUserPromises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Failed to update user ${Object.keys(pointsToDeduct)[index]}:`,
          result.reason,
        );
      }
    });

    // Step 4: Set the rewards to 0 and mark them as expired
    const rewardIds = rewardsToExpire.map((reward) => reward.id);

    await prisma.reward.updateMany({
      where: {
        id: {
          in: rewardIds,
        },
      },
      data: {
        value: 0,
        expired: true,
      },
    });

    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating bulkRemoveExpiredRewards:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
