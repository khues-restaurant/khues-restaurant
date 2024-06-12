import type { NextApiRequest, NextApiResponse } from "next";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { prisma } from "~/server/db";
import { getMidnightCSTInUTC } from "~/utils/cstToUTCHelpers";

// This is set to run at "0 6 * * *"
// which allows for daylight savings time buffer

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    // // Get the current date in the "America/Chicago" time zone
    // const nowInChicago = fromZonedTime(new Date(), "America/Chicago");

    // // Set the time to midnight in the "America/Chicago" time zone
    // nowInChicago.setHours(0, 0, 0, 0);

    // // Convert the "America/Chicago" midnight time back to UTC
    // const startOfDayInChicagoUTC = formatInTimeZone(
    //   nowInChicago,
    //   "UTC",
    //   "yyyy-MM-dd HH:mm:ssXXX",
    // );

    // FYI: this one is experimental: since the above code did in fact seem
    // to work w/in the Railway date preview
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
