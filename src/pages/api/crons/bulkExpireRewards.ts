import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    await prisma.reward.updateMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
      data: {
        expired: true,
      },
    });
    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating bulkRemoveExpiredRewards:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
