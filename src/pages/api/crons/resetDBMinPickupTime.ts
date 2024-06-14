import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { getMidnightCSTInUTC } from "~/utils/cstToUTCHelpers";

// This is set to run at "0 6 * * *"
// which runs every day at midnight/1 am CST,
// allows for daylight savings time buffer

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const startOfDayInChicagoUTC = getMidnightCSTInUTC();

    // Update the database with the correct time
    await prisma.minimumOrderPickupTime.update({
      where: {
        id: 1,
      },
      data: {
        value: startOfDayInChicagoUTC,
      },
    });

    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating minimumOrderPickupTime:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
