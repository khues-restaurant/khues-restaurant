import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { env } from "~/env";
import { prisma } from "~/server/db";
import { waitUntil } from "@vercel/functions";
import { addMonths } from "date-fns";
import RewardsExpiringThisMonth from "emails/RewardsExpiringThisMonth";

// This is set to run at "0 6 1 * *",
// meaning every first of the month at 6:00 AM, which
// allows for daylight savings time buffer

const resend = new Resend(env.RESEND_API_KEY);

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const eligibleUsers = await prisma.user.findMany({
      where: {
        allowsRewardAvailabilityReminderEmails: true,
      },
      select: {
        userId: true,
        firstName: true,
        email: true,
        rewardsPoints: true, // do we want/need to show this in the email?
      },
    });

    // loop through eligible users and send them an email w/ the rewards they
    // have earned that are expiring sometime this month
    for (const user of eligibleUsers) {
      const rewardsExpiringThisMonth = await prisma.reward.findMany({
        where: {
          userId: user.userId,
          value: {
            gt: 0,
          },
          expired: false,
          expiresAt: {
            gte: new Date(),
            lt: addMonths(new Date(), 1),
          },
        },
      });

      // generate email unsubscription token
      const unsubscriptionToken = await prisma.emailUnsubscriptionToken.create({
        data: {
          expiresAt: addMonths(new Date(), 3),
          emailAddress: user.email,
        },
      });

      const currentMonth = new Date().toLocaleString("en-US", {
        month: "long",
      });

      // send the email to the user
      try {
        waitUntil(
          resend.emails.send({
            from: "onboarding@resend.dev",
            to: "khues.dev@gmail.com", // user.email,
            subject: `Don't miss out: Check your rewards expiring this ${currentMonth}!`,
            react: RewardsExpiringThisMonth({
              rewardsExpiringThisMonth,
              firstName: user.firstName,
              userPoints: user.rewardsPoints,
              unsubscriptionToken: unsubscriptionToken.id,
            }),
          }),
        );
      } catch (error) {
        // res.status(400).json({ error });
        console.error(error);
      }
    }

    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating sendCloseToARewardEmails:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
