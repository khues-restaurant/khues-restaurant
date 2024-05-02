import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const blacklistedEmailRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        emailAddress: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const blacklistEntry = await ctx.prisma.blacklistedEmail.create({
        data: {
          emailAddress: input.emailAddress,
        },
      });

      // if user has an account, then we should update their email preferences
      // to not allow any emails
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.emailAddress,
        },
      });

      if (user) {
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            allowsEmailReceipts: false,
            allowsOrderCompleteEmails: false,
            allowsPromotionalEmails: false,
            allowsRewardAvailabilityReminderEmails: false,
          },
        });
      }

      return blacklistEntry;
    }),
});
