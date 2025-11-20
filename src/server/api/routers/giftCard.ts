import { z } from "zod";
import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  type GiftCard,
  type GiftCardTransaction,
  type User,
} from "@prisma/client";
import { stripe } from "~/server/api/routers/payment";
import { env } from "~/env";

import giftCardFront from "public/giftCards/giftCardFront.png";

export const giftCardRouter = createTRPCRouter({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        amount: z.number().min(500).max(50000),
        recipientEmail: z.string().email(),
        recipientName: z.string().min(1),
        senderName: z.string().min(1),
        message: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(giftCardFront.src);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Khue's Kichen Gift Card",
                description: `Gift card for ${input.recipientName} from ${input.senderName}`,
                images: ["http://localhost:3000/" + giftCardFront.src],
              },
              unit_amount: input.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "GIFT_CARD",
          amount: input.amount,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          senderName: input.senderName,
          message: input.message || "",
        },
        success_url: `${env.BASE_URL}/gift-cards/success`,
        cancel_url: `${env.BASE_URL}/gift-cards`,
      });

      console.log(session);

      return session.url;
    }),

  checkBalance: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.giftCard.findUnique({
        where: { code: input.code },
      });

      if (!card) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gift card not found",
        });
      }

      return card.balance;
    }),

  checkBalances: publicProcedure
    .input(z.object({ codes: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const cards = await ctx.prisma.giftCard.findMany({
        where: { code: { in: input.codes } },
      });

      return cards.map((card) => ({
        code: card.code,
        balance: card.balance,
      }));
    }),

  create: adminProcedure
    .input(
      z.object({
        code: z.string(),
        initialBalance: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingCard = await ctx.prisma.giftCard.findUnique({
        where: { code: input.code },
      });

      if (existingCard) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Gift card with this code already exists",
        });
      }

      const giftCard = await ctx.prisma.giftCard.create({
        data: {
          code: input.code,
          balance: input.initialBalance,
          transactions: {
            create: {
              amount: input.initialBalance,
              type: "ACTIVATION_IN_STORE", // Or maybe a new type 'INITIAL_BALANCE'? Using MANUAL_ADJUSTMENT for now as it fits "bookkeeping"
              note: "Initial creation",
            },
          },
        },
      });

      return giftCard;
    }),

  get: adminProcedure
    .input(
      z.object({
        code: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.code && !input.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either code or email must be provided",
        });
      }

      if (input.code) {
        const card = await ctx.prisma.giftCard.findUnique({
          where: { code: input.code },
          include: {
            user: true,
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });
        return card ? [card] : [];
      }

      if (input.email) {
        const user = await ctx.prisma.user.findUnique({
          where: { email: input.email },
          include: {
            giftCards: {
              include: {
                transactions: {
                  orderBy: { createdAt: "desc" },
                  take: 5,
                },
              },
            },
          },
        });
        return user?.giftCards ?? [];
      }

      return [];
    }),

  getRecentPurchases: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.prisma.giftCardTransaction.findMany({
        where: {
          type: {
            in: [
              "ACTIVATION_ONLINE",
              "ACTIVATION_IN_STORE",
              "REDEMPTION",
              "MANUAL_ADJUSTMENT",
              "RELOAD",
            ],
          },
        },
        include: {
          giftCard: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      });

      return transactions;
    }),

  addFunds: adminProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.giftCard.findUnique({
        where: { id: input.id },
      });

      if (!card) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gift card not found",
        });
      }

      return ctx.prisma.giftCard.update({
        where: { id: input.id },
        data: {
          balance: { increment: input.amount },
          transactions: {
            create: {
              amount: input.amount,
              type: "RELOAD",
            },
          },
        },
      });
    }),

  charge: adminProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.giftCard.findUnique({
        where: { id: input.id },
      });

      if (!card) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gift card not found",
        });
      }

      if (card.balance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient funds",
        });
      }

      return ctx.prisma.giftCard.update({
        where: { id: input.id },
        data: {
          balance: { decrement: input.amount },
          lastUsedAt: new Date(),
          transactions: {
            create: {
              amount: -input.amount,
              type: "REDEMPTION",
            },
          },
        },
      });
    }),

  replace: adminProcedure
    .input(
      z.object({
        oldCardId: z.string(),
        newCardCode: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const oldCard = await ctx.prisma.giftCard.findUnique({
        where: { id: input.oldCardId },
      });

      if (!oldCard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Old gift card not found",
        });
      }

      if (oldCard.isReplaced) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Card is already replaced",
        });
      }

      const existingNewCard = await ctx.prisma.giftCard.findUnique({
        where: { code: input.newCardCode },
      });

      if (existingNewCard) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "New gift card code already exists",
        });
      }

      const balanceToTransfer = oldCard.balance;

      // Transaction to handle the replacement atomically
      return ctx.prisma.$transaction(async (tx) => {
        // 1. Create new card
        const newCard = await tx.giftCard.create({
          data: {
            code: input.newCardCode,
            balance: balanceToTransfer,
            userId: oldCard.userId, // Transfer ownership
            transactions: {
              create: {
                amount: balanceToTransfer,
                type: "REPLACEMENT_CREDIT",
                note: `Replaced card ${oldCard.code}`,
              },
            },
          },
        });

        // 2. Update old card
        await tx.giftCard.update({
          where: { id: oldCard.id },
          data: {
            balance: 0,
            isReplaced: true,
            replacedBy: newCard.id,
            transactions: {
              create: {
                amount: -balanceToTransfer,
                type: "REPLACEMENT_DEBIT",
                note: `Replaced by card ${newCard.code}`,
              },
            },
          },
        });

        return newCard;
      });
    }),
});
