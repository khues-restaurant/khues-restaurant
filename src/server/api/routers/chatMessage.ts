import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendMessageThroughSocket } from "~/utils/sendMessageThroughSocket";

export const chatMessageRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        senderUserId: z.string(), // will be "Dashboard" when appropriate
        recipientUserId: z.string(), // will be "Dashboard" when appropriate
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.chatMessage.create({
        data: {
          senderId: input.senderUserId,
          recipientId: input.recipientUserId,
          content: input.message,
        },
      });

      // Emit the message through the socket
      sendMessageThroughSocket({
        senderUserId: input.senderUserId,
        recipientUserId: input.recipientUserId,
        message: input.message,
      });

      return message;
    }),

  getMessagesPerUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      return ctx.prisma.chatMessage.findMany({
        where: {
          OR: [
            {
              senderId: userId,
            },
            {
              recipientId: userId,
            },
          ],
        },

        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  getAllMessages: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chatMessage.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
});
