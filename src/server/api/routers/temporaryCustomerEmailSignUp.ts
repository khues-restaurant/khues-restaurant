import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const temporaryCustomerEmailSignUp = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        emailAddress: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if email is already in use
      const existingUser =
        await ctx.prisma.temporaryCustomerEmailSignUp.findUnique({
          where: {
            emailAddress: input.emailAddress,
          },
        });

      if (existingUser) {
        throw new Error("Email already in use");
      }

      return ctx.prisma.temporaryCustomerEmailSignUp.create({
        data: {
          emailAddress: input.emailAddress,
        },
      });
    }),
});
