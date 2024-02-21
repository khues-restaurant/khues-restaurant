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
        select: {},
      });

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
          .regex(/^\+?[0-9\s-]+$/),
        birthday: z.date(),
        specialInstructions: z.string().max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          ...input,
        },
      });
    }),

  // update: protectedProcedure

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

  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //   });
  // }),
});
