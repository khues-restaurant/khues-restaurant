import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  isUserRegistered: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          userId,
        },
      });

      console.log("user", user, Boolean(user));

      return Boolean(user);
    }),

  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        email: z.string().email(),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        phoneNumber: z
          .string()
          .min(10)
          .max(20)
          .regex(/^\(\d{3}\) \d{3}-\d{4}$/),
        birthday: z.date(),
        dietaryRestrictions: z.string().max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          ...input,
        },
      });
    }),

  get: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      return ctx.prisma.user.findFirst({
        where: {
          userId,
        },
      });
    }),

  getRewards: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      console.log(userId, "userId");

      const rewards = await ctx.prisma.user.findFirst({
        where: {
          userId,
        },
        select: {
          discounts: {
            where: {
              expirationDate: {
                gt: new Date(),
              },
              active: true,
              userId: {
                equals: userId,
              },
            },
          },
        },
      });

      console.log("rewards", rewards?.discounts);

      return rewards?.discounts;
    }),

  update: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        email: z.string().email(),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        phoneNumber: z
          .string()
          .min(10)
          .max(20)
          .regex(/^\+?[0-9\s-]+$/),
        birthday: z.date(),
        dietaryRestrictions: z.string().max(100),
        currentOrder: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          userId: input.userId,
        },
        data: {
          ...input,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: userId }) => {
      await clerkClient.users.deleteUser(userId);

      return ctx.prisma.user.delete({
        where: {
          userId,
        },
      });
    }),
});
