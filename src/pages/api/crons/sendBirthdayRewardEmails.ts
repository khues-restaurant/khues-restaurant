import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { env } from "~/env";
import { prisma } from "~/server/db";
import { waitUntil } from "@vercel/functions";
import { addMonths, addWeeks } from "date-fns";
import BirthdayReward from "emails/BirthdayReward";

// This is set to run at "0 6 * * *",
// meaning every first of the month at 6:00 AM, which
// allows for daylight savings time buffer

const resend = new Resend(env.RESEND_API_KEY);

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const birthdayRewards = await prisma.menuItem.findMany({
      where: {
        birthdayReward: true,
      },
    });

    // email should get sent if birthday is exactly 2 weeks from today
    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);
    const twoWeeksFromToday = addWeeks(todayAtMidnight, 2);

    const eligibleUsers = await prisma.user.findMany({
      where: {
        allowsRewardAvailabilityReminderEmails: true,
        birthday: {
          equals: twoWeeksFromToday,
        },
      },
      select: {
        userId: true,
        firstName: true,
        email: true,
        birthday: true,
      },
    });

    // loop through eligible users and send them an email
    for (const user of eligibleUsers) {
      // generate email unsubscription token
      const unsubscriptionToken = await prisma.emailUnsubscriptionToken.create({
        data: {
          expiresAt: addMonths(new Date(), 3),
          emailAddress: user.email,
        },
      });

      // send the email to the user
      try {
        waitUntil(
          resend.emails.send({
            from: "onboarding@resend.dev",
            to: "khues.dev@gmail.com", // user.email,
            subject: "Celebrate your birthday with a free dessert on us!",
            react: BirthdayReward({
              firstName: user.firstName,
              birthday: user.birthday,
              birthdayRewards,
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
