import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

// This is set to run at "0 6 * * *"
// which allows for daylight savings time buffer

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    await prisma.emailUnsubscriptionToken.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error(
      "Error updating bulkRemoveExpiredEmailUnsubscribeTokens:",
      error,
    );
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
