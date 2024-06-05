import type { NextApiRequest, NextApiResponse } from "next";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "~/server/db";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const startOfDayInChicago = fromZonedTime(new Date(), "America/Chicago");

    await prisma.minimumOrderPickupTime.update({
      where: {
        id: 1,
      },
      data: {
        value: startOfDayInChicago,
      },
    });
    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating minimumOrderPickupTime:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
