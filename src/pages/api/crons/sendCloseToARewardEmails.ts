import Decimal from "decimal.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { env } from "~/env";
import { prisma } from "~/server/db";
import { waitUntil } from "@vercel/functions";
import { addMonths } from "date-fns";
import CloseToAReward from "emails/CloseToAReward";

// This is set to run at "0 6 * * 1",
// meaning every Monday at 6:00 AM, which
// allows for daylight savings time buffer

const resend = new Resend(env.RESEND_API_KEY);

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const pointRewards = await prisma.menuItem.findMany({
      where: {
        pointReward: true,
      },
      orderBy: {
        price: "asc",
      },
    });

    if (pointRewards.length === 0) {
      return response.status(200).json({ completed: true });
    }

    const minimumPointPrice = new Decimal(pointRewards[0]?.price ?? 0);
    const minimumPointRewardThreshold = minimumPointPrice
      .mul(2)
      .sub(500)
      .toNumber();

    const eligibleUsers = await prisma.user.findMany({
      where: {
        allowsRewardAvailabilityReminderEmails: true,
        orderHasBeenPlacedSinceLastCloseToRewardEmail: true,
        rewardsPoints: {
          gte: minimumPointRewardThreshold - 500,
        },
      },
      select: {
        userId: true,
        firstName: true,
        email: true,
        rewardsPoints: true,
      },
    });

    // loop through eligible users and send them an email w/ the rewards they
    // can already redeem, and the rewards they are close to redeeming if they
    // spend a little more
    for (const user of eligibleUsers) {
      const ableToRedeem = pointRewards
        .filter((reward) => {
          const rewardPointCost = new Decimal(reward.price).mul(2);

          return rewardPointCost.lte(user.rewardsPoints);
        })
        .sort((a, b) => a.price - b.price);

      // being "close to redeeming" means they are within 500 points of an item
      const closeToRedeeming = pointRewards
        .filter((reward) => {
          // don't add the same reward to both lists
          if (ableToRedeem.some((r) => r.id === reward.id)) {
            return false;
          }

          const rewardPointCost = new Decimal(reward.price).mul(2);

          return rewardPointCost.lte(user.rewardsPoints + 500);
        })
        .sort((a, b) => a.price - b.price);

      // generate email unsubscription token
      const unsubscriptionToken = await prisma.emailUnsubscriptionToken.create({
        data: {
          expiresAt: addMonths(new Date(), 3),
          emailAddress: user.email,
        },
      });

      let dynamicSubject =
        "You're almost there! Earn more points for delicious rewards.";

      if (ableToRedeem.length > 0) {
        dynamicSubject = "Redeem your rewards and earn more soon!";
      } else if (ableToRedeem.length > 0 && closeToRedeeming.length === 0) {
        dynamicSubject = "Your rewards are ready to redeem!";
      }

      // send the email to the user
      try {
        waitUntil(
          resend.emails.send({
            from: "onboarding@resend.dev",
            to: "khues.dev@gmail.com", // user.email,
            subject: dynamicSubject,
            react: CloseToAReward({
              ableToRedeem,
              closeToRedeeming,
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

      // update user to indicate that they have been sent an email
      waitUntil(
        prisma.user.update({
          where: {
            userId: user.userId,
          },
          data: {
            orderHasBeenPlacedSinceLastCloseToRewardEmail: false,
          },
        }),
      );
    }

    return response.status(200).json({ completed: true });
  } catch (error) {
    console.error("Error updating sendCloseToARewardEmails:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
