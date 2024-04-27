import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { IoChatbox } from "react-icons/io5";
import { X } from "lucide-react";
import { IoIosArrowBack, IoIosSend } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { socket } from "~/pages/_app";
import useGetUserId from "~/hooks/useGetUserId";
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";
import { format } from "date-fns";
import { type Chat, type ChatMessage } from "@prisma/client";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";

// TODO: still have to implement the total # of unread chat messages

function CustomerChats() {
  const userId = useGetUserId();
  const ctx = api.useUtils();

  const { data: databaseChats, refetch } = api.chat.getAllMessages.useQuery();

  const { mutate: sendMessage } = api.chat.sendMessage.useMutation({
    // When mutation is initiated, perform an optimistic update
    onMutate: async (newMessage) => {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      // await ctx.chatMessage.getMessagesPerUser.cancel();
      // // Get the data from the queryCache
      // const prevMessages = ctx.chatMessage.getMessagesPerUser.getData();
      // // Optimistically update the data with our new message
      // ctx.chatMessage.getMessagesPerUser.setData(
      //   ctx.chatMessage.getMessagesPerUser,
      //   (
      //     old:
      //       | {
      //           id: string;
      //           createdAt: Date;
      //           senderId: string;
      //           recipientId: string;
      //           content: string;
      //         }[]
      //       | undefined,
      //   ) => [
      //     ...(old ?? []),
      //     {
      //       id: Date.now(),
      //       createdAt: Date.now(),
      //       senderId: userId,
      //       recipientId: "dashboard",
      //       content: newMessage.message,
      //     },
      //   ],
      // );
      // // Return the previous data so we can revert if something goes wrong
      // return { prevMessages };
    },
    onError(err) {
      console.error(err);
    },
    // After mutation is resolved, refetch the messages
    onSettled() {
      setNewMessageContent("");

      // Sync with server once mutation has settled
      void ctx.chat.getAllMessages.invalidate();
    },
  });

  const { mutate: updateChatReadStatus } =
    api.chat.updateChatReadStatus.useMutation();

  const [chats, setMessages] = useState<
    (Chat & {
      messages: ChatMessage[];
    })[]
  >([]);

  const viewportLabel = useGetViewportLabel();

  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // useEffect(() => {
  //   if (!databaseMessages) return;

  //   const groupedMessages = databaseMessages.reduce(
  //     (acc, message) => {
  //       // Ensure there is an array for every senderId, including 'dashboard'
  //       if (!acc[message.senderId] && message.senderId !== "dashboard") {
  //         acc[message.senderId] = [];
  //       }

  //       // Ensure there is an array for every recipientId when the sender is 'dashboard'
  //       if (message.senderId === "dashboard") {
  //         if (!acc[message.recipientId]) {
  //           acc[message.recipientId] = [];
  //         }
  //         acc[message.recipientId]?.push(message);
  //       } else {
  //         // For other senders, just add the message to the respective senderId
  //         acc[message.senderId]?.push(message);
  //       }

  //       return acc;
  //     },
  //     {} as Record<string, ChatMessage[]>,
  //   );

  //   setMessages(groupedMessages);
  // }, [databaseMessages]);

  useEffect(() => {
    if (!databaseChats) return;

    // Sort databaseChats by the updatedAt timestamp in descending order
    const sortedChats = databaseChats.sort(
      (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
    );

    setMessages(sortedChats); // Assuming `setMessages` now expects an array of Chat objects
  }, [databaseChats]);

  useEffect(() => {
    if (selectedUserId) {
      const selectedChat = databaseChats?.find(
        (chat) => chat.userId === selectedUserId,
      );

      if (!selectedChat) return;

      if (selectedChat.dashboardHasUnreadMessages) {
        void updateChatReadStatus({ chatId: selectedChat.id, forUser: false });
      }
    }
  }, [selectedUserId, databaseChats, updateChatReadStatus]);

  useEffect(() => {
    function refetchMessages({
      senderUserId,
      recipientUserId,
      message,
    }: {
      senderUserId: string;
      recipientUserId: string;
      message: string;
    }) {
      if (recipientUserId !== userId) return;
      void refetch();
    }

    socket.on("newMessageSent", refetchMessages);

    return () => {
      socket.off("newMessageSent", refetchMessages);
    };
  }, [refetch, userId]);

  // vv obv improve this vv
  if (!chats) return <p>Loading...</p>;

  // TODO: most likely just have mobile be standard list of users (names if present, otherwise guest),
  // and the last message in that chain

  return (
    <motion.div
      key={"customerChats"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseFlex mt-32 size-full tablet:mt-48"
    >
      {((viewportLabel.includes("mobile") && !selectedUserId) ||
        !viewportLabel.includes("mobile")) && (
        <div className="baseVertFlex h-[560px] w-full tablet:w-64 tablet:border-r tablet:border-gray-600">
          <div className="w-full rounded-l bg-gray-200 p-4 text-center text-lg font-semibold">
            Chats
          </div>

          <div className="baseVertFlex size-full !justify-start overflow-y-auto">
            {chats.map((chat) => {
              const lastMessage = chat.messages?.at(-1);

              return (
                <Button
                  key={userId}
                  variant={userId === selectedUserId ? "default" : "secondary"}
                  className="baseFlex w-full !justify-between rounded-none p-4"
                  onClick={() => {
                    setSelectedUserId(userId);

                    setNewMessageContent("");
                  }}
                >
                  <div className="baseVertFlex gap-2">
                    <p
                      className={`font-semibold ${userId === selectedUserId ? "text-offwhite" : "text-gray-400"}`}
                    >
                      Guest
                    </p>
                    <p className="text-xs text-gray-200">
                      &ldquo;{lastMessage?.content}&rdquo;
                    </p>
                  </div>

                  <IoIosArrowBack className="rotate-180 tablet:hidden" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {((viewportLabel.includes("mobile") && selectedUserId) ||
        !viewportLabel.includes("mobile")) && (
        // TODO: you CAN have an optional relation to the user model to be able to get the user's name
        // but I think it's really low prio rn.
        <div className="baseVertFlex w-full sm:max-w-xl">
          <div className="baseVertFlex relative w-full gap-2 rounded-t-md bg-gray-200 p-4 tablet:rounded-tr-md">
            <div className="text-lg font-semibold">Guest Placeholder</div>
            <Button
              variant={"link"}
              className="baseFlex !absolute left-0 top-2 gap-2 tablet:hidden"
              onClick={() => setSelectedUserId("")}
            >
              <IoIosArrowBack />
              Back
            </Button>
          </div>

          {/* scroll-y-auto messages container */}
          <div className="baseVertFlex relative size-full !justify-start gap-2 overflow-y-auto bg-background p-2 sm:h-96 ">
            <Image
              src="/logo.svg"
              alt="Khue's header logo"
              width={85}
              height={85}
              priority
              className="fixed left-1/2 top-1/2 !size-[85px] -translate-x-1/2 -translate-y-1/2 transform opacity-15"
            />

            {selectedUserId ? (
              <>
                {chats
                  .find((chat) => chat.userId === selectedUserId)
                  ?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`baseVertFlex w-full
                ${message.senderId === "dashboard" ? "!items-end" : "!items-start"}
                `}
                    >
                      <p
                        className={`text-xs text-gray-400 ${message.senderId === "dashboard" ? "mr-2" : "ml-2"}`}
                      >
                        {format(message.createdAt, "h:mm a")}
                      </p>
                      <div
                        className={`rounded-full px-4 py-2 ${message.senderId === "dashboard" ? "text-offwhite bg-primary" : "bg-secondary"}`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div className="baseVertFlex gap-2">
                <div className="text-lg font-semibold">No chat selected</div>

                <div>Select a customer&apos;s chat to view messages</div>
              </div>
            )}
          </div>

          <div className="baseFlex w-full gap-4 rounded-md rounded-t-none border-2 p-4">
            <Textarea
              placeholder="Enter your message here"
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage({
                    senderUserId: "dashboard",
                    recipientUserId: selectedUserId,
                    message: newMessageContent,
                  });
                }
              }}
              className="max-h-12 flex-grow border-2 border-gray-500 bg-transparent placeholder-gray-400"
            />
            <Button
              className="!p-2"
              disabled={!newMessageContent || !selectedUserId}
              onClick={() => {
                sendMessage({
                  senderUserId: "dashboard",
                  recipientUserId: selectedUserId,
                  message: newMessageContent,
                });
              }}
            >
              <IoIosSend className="text-offwhite size-6" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default CustomerChats;
