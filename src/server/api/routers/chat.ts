import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        senderUserId: z.string(),
        recipientUserId: z.string(),
        message: z.string(),
        chatId: z.string().optional(), // Optional chatId input
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if a chatId is provided or find an existing chat
      let chat = input.chatId
        ? await ctx.prisma.chat.findUnique({
            where: { id: input.chatId },
          })
        : await ctx.prisma.chat.findFirst({
            where: {
              OR: [
                { userId: input.senderUserId },
                { userId: input.recipientUserId },
              ],
            },
          });

      // If no chat exists, create a new one
      if (!chat) {
        // check if the userId is associated with a current user, if so fetch that user's
        // first and last name to add to the chat
        const user = await ctx.prisma.user.findUnique({
          where: {
            userId: input.senderUserId,
          },
          select: {
            firstName: true,
            lastName: true,
          },
        });

        chat = await ctx.prisma.chat.create({
          data: {
            userId: input.senderUserId, // Assuming the sender initializes the chat
            userFullName: user
              ? `${user.firstName} ${user.lastName}`
              : "Customer",
            // Other default fields like userHasUnreadMessages can be set here
          },
        });
      }

      // update the opposite party's unread messages status to true
      const updatedReadStatus =
        input.recipientUserId === "dashboard"
          ? { dashboardHasUnreadMessages: true }
          : { userHasUnreadMessages: true };

      await ctx.prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: updatedReadStatus,
      });

      // Create a message in the existing or new chat
      const message = await ctx.prisma.chatMessage.create({
        data: {
          senderId: input.senderUserId,
          recipientId: input.recipientUserId,
          content: input.message,
          chatId: chat.id, // Use the found or newly created chat ID
        },
      });

      // Update the updatedAt timestamp of the Chat when a new message is added
      await ctx.prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return message;
    }),

  updateChatReadStatus: publicProcedure
    .input(z.object({ chatId: z.string(), forUser: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const updatedReadStatus = input.forUser
        ? { userHasUnreadMessages: false }
        : { dashboardHasUnreadMessages: false };

      return ctx.prisma.chat.update({
        where: {
          id: input.chatId,
        },
        data: updatedReadStatus,
      });
    }),

  getMessagesPerUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      return ctx.prisma.chat.findUnique({
        where: {
          userId,
        },

        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    }),

  getAllMessages: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chat.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }),
});
