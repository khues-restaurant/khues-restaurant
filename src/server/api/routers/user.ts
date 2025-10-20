import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { orderDetailsSchema } from "~/stores/MainStore";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import Stripe from "stripe";
import { env } from "~/env";
import { addMonths } from "date-fns";
import { Resend } from "resend";
import Welcome from "emails/Welcome";

const resend = new Resend(env.RESEND_API_KEY);

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

export const userRouter = createTRPCRouter({
  isUserRegistered: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          userId,
        },
        select: {
          userId: true, // prisma throws runtime error if select is empty
        },
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
          .regex(/^\(\d{3}\) \d{3}-\d{4}$/),
        birthday: z.date(),
        dietaryRestrictions: z.string().max(100),
        autoApplyDietaryRestrictions: z.boolean().default(false),
        currentOrder: orderDetailsSchema,
        orderIdBeingRedeemed: z.string().optional(),
        rewardsPointsBeingRedeemed: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        userId,
        email,
        firstName,
        lastName,
        phoneNumber,
        birthday,
        dietaryRestrictions,
        autoApplyDietaryRestrictions,
        currentOrder,
        orderIdBeingRedeemed,
        rewardsPointsBeingRedeemed,
      } = input;

      const customer = await stripe.customers.create({
        email: email,
        name: `${firstName} ${lastName}`,
        phone: phoneNumber,
      });

      // create email unsubscription token + send welcome email
      const unsubscriptionToken =
        await ctx.prisma.emailUnsubscriptionToken.create({
          data: {
            expiresAt: addMonths(new Date(), 3),
            emailAddress: email,
          },
        });

      try {
        const { data, error } = await resend.emails.send({
          from: "onboarding@resend.dev", // FYI: can format as "Khue's <support@khueskitchen.com"> for production
          to: "khues.dev@gmail.com", // TODO: email,
          subject: "Welcome to Khue's Reward Program! 🎉",
          react: Welcome({
            firstName: firstName,
            unsubscriptionToken: unsubscriptionToken.id,
          }),
        });

        if (error) {
          // res.status(400).json({ error });
          console.error(error);
        }

        // res.status(200).json({ data });
        console.log("went through", data);
      } catch (error) {
        // res.status(400).json({ error });
        console.error(error);
      }

      // if user's email existed in BlacklistedEmail model,
      // then initialize their email preferences all to be false

      const blacklistedEmail = await ctx.prisma.blacklistedEmail.findFirst({
        where: {
          emailAddress: email,
        },
      });

      const initialEmailPreferences = blacklistedEmail
        ? {
            allowsEmailReceipts: false,
            allowsOrderCompleteEmails: false,
            allowsPromotionalEmails: false,
            allowsRewardAvailabilityReminderEmails: false,
          }
        : {
            allowsEmailReceipts: true,
            allowsOrderCompleteEmails: true,
            allowsPromotionalEmails: true,
            allowsRewardAvailabilityReminderEmails: true,
          };

      return ctx.prisma.user.create({
        data: {
          stripeUserId: customer.id,
          userId,
          email,
          firstName,
          lastName,
          phoneNumber,
          birthday,
          dietaryRestrictions,
          autoApplyDietaryRestrictions,
          currentOrder,
          ...initialEmailPreferences,
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

  updateOrder: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        currentOrder: orderDetailsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      return ctx.prisma.user.update({
        where: {
          userId: input.userId,
        },
        data: {
          currentOrder: input.currentOrder,
        },
      });
    }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(100),
        firstName: z
          .string({
            required_error: "First name cannot be empty",
          })
          .min(1, { message: "At least 1 character required" })
          .max(30, { message: "Maximum 30 characters allowed" })
          .refine((value) => /^[A-Za-z'-]+$/.test(value), {
            message:
              "Only English characters, hyphens, and apostrophes are allowed",
          })
          .refine((value) => !/[^\u0000-\u007F]/.test(value), {
            message: "No non-ASCII characters are allowed",
          })
          .refine((value) => !/[\p{Emoji}]/u.test(value), {
            message: "No emojis are allowed",
          })
          .transform((value) => value.trim()) // Remove leading and trailing whitespace
          .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,
        lastName: z
          .string({
            required_error: "Last name cannot be empty",
          })
          .min(1, { message: "At least 1 character required" })
          .max(30, { message: "Maximum 30 characters allowed" })
          .refine((value) => /^[A-Za-z'-]+$/.test(value), {
            message:
              "Only English characters, hyphens, and apostrophes are allowed",
          })
          .refine((value) => !/[^\u0000-\u007F]/.test(value), {
            message: "No non-ASCII characters are allowed",
          })
          .refine((value) => !/[\p{Emoji}]/u.test(value), {
            message: "No emojis are allowed",
          })
          .transform((value) => value.trim()) // Remove leading and trailing whitespace
          .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,
        phoneNumber: z
          .string({
            required_error: "Phone number cannot be empty",
          })
          .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Invalid phone number format"),
        dietaryRestrictions: z
          .string()
          .max(100, { message: "Maximum 100 characters allowed" })
          .refine(
            (value) => /^[A-Za-z0-9\s\-';.,!?:"(){}\[\]/\\_@]*$/.test(value),
            {
              message: "Invalid characters were found",
            },
          )
          .refine((value) => !/[^\u0000-\u007F]/.test(value), {
            message: "No non-ASCII characters are allowed",
          })
          .transform((value) => value.trim()) // Remove leading and trailing whitespace
          .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,,
        autoApplyDietaryRestrictions: z.boolean(),

        allowsEmailReceipts: z.boolean(),
        allowsOrderCompleteEmails: z.boolean(),
        allowsPromotionalEmails: z.boolean(),
        allowsRewardAvailabilityReminderEmails: z.boolean(),

        // these fields will be disabled but just to be safe
        email: z.string().email(),
        birthday: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

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
      if (userId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      // Delete user's favorite items
      await ctx.prisma.favoriteItem.deleteMany({
        where: {
          userId,
        },
      });

      // Delete user's chat messages
      await ctx.prisma.chatMessage.deleteMany({
        where: {
          senderId: userId,
        },
      });

      // Delete user's transient order (ideally should just be delete, but
      // currently prisma throws an error if try to delete a row that doesn't exist)
      await ctx.prisma.transientOrder.deleteMany({
        where: {
          userId,
        },
      });

      // Anonymize user's personal information in each of their orders
      await ctx.prisma.order.updateMany({
        where: {
          userId,
        },
        data: {
          userId: null,
          email: "Anonymous",
          firstName: "Anonymous",
          lastName: "Anonymous",
          phoneNumber: "Anonymous",
        },
      });

      // discounts aren't currently part of the prod plan, so omitting here

      const user = await ctx.prisma.user.findFirst({
        where: {
          userId,
        },
      });

      if (user) await stripe.customers.del(user.stripeUserId);

      await (await clerkClient()).users.deleteUser(userId);

      // deleteMany instead of delete because prisma throws an error if the row doesn't exist
      return ctx.prisma.user.deleteMany({
        where: {
          userId,
        },
      });
    }),
});
