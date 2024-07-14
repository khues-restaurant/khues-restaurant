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
    await prisma.reward.updateMany({
      where: {
        value: {
          gt: 0,
        },
        expired: false,
        expiresAt: {
          lte: new Date(),
        },
      },
      data: {
        value: 0,
      },
    });
    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating bulkRemoveExpiredRewards:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
