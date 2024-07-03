import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        senderUserId: z.string(),
        recipientUserId: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { senderUserId, recipientUserId, message } = input;

      // Check if a chatId is provided or find an existing chat
      let chat = await ctx.prisma.chat.findFirst({
        where: {
          userId: senderUserId === "dashboard" ? recipientUserId : senderUserId,
        },
      });

      // If no chat exists, create a new one
      if (!chat) {
        // check if the userId is associated with a current user, if so fetch that user's
        // first and last name to add to the chat
        const user = await ctx.prisma.user.findUnique({
          where: {
            userId: senderUserId,
          },
          select: {
            firstName: true,
            lastName: true,
          },
        });

        chat = await ctx.prisma.chat.create({
          data: {
            userId: senderUserId, // Assuming the sender initializes the chat
            userFullName: user
              ? `${user.firstName} ${user.lastName}`
              : "Customer",
            // Other default fields like userHasUnreadMessages can be set here
          },
        });
      }

      // update the opposite party's unread messages status to true
      const updatedReadStatus =
        recipientUserId === "dashboard"
          ? { dashboardHasUnreadMessages: true }
          : { userHasUnreadMessages: true };

      await ctx.prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: updatedReadStatus,
      });

      // Create a message in the existing or new chat
      const newMessage = await ctx.prisma.chatMessage.create({
        data: {
          senderId: senderUserId,
          recipientId: recipientUserId,
          content: message,
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

      return newMessage;
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

  // revisit whether this should throw an error if userId doesn't match
  // ctx.auth.userId, unsure of if it would potentially cause issues with a
  // optimistic UI refactor later
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

  getAllMessages: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chat.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),
});
