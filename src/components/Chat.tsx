import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { IoChatbox } from "react-icons/io5";
import { X } from "lucide-react";
import { IoIosSend } from "react-icons/io";
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

function Chat() {
  const userId = useGetUserId();
  const ctx = api.useUtils();

  const { data: messages, refetch } =
    api.chatMessage.getMessagesPerUser.useQuery(userId, {
      enabled: userId.length > 0,
    });

  const { mutate: sendMessage } = api.chatMessage.sendMessage.useMutation({
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
      void ctx.chatMessage.getMessagesPerUser.invalidate();
    },
  });

  const [showingChat, setShowingChat] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState("");

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
  }, [messages, refetch, userId]);

  console.log("messages", messages);

  return (
    <Popover
      open={showingChat}
      onOpenChange={(open) => {
        setShowingChat(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button className="fixed bottom-8 right-8 size-14 rounded-full shadow-md">
          <AnimatePresence mode="popLayout">
            {showingChat ? (
              <motion.div
                key="openChat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <X className="size-6" />
              </motion.div>
            ) : (
              <motion.div
                key="closeChat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <IoChatbox className="size-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={"top"}
        sideOffset={16}
        className="baseVertFlex w-full rounded-lg border-none !p-0 shadow-xl sm:mr-4 sm:max-w-sm"
      >
        {/* header */}
        <div className="baseVertFlex !items-start gap-2 rounded-t-lg bg-primary p-4">
          <p className="text-lg font-medium text-white">Have a question?</p>
          <p className="text-sm text-gray-200">
            Send a message directly to our team and we will respond as soon as
            possible.
          </p>
        </div>

        {/* scroll-y-auto messages container */}
        <div className="baseVertFlex relative h-full w-full !justify-between gap-2 overflow-y-auto bg-background p-2 sm:h-96 ">
          <Image
            src="/logo.svg"
            alt="Khue's header logo"
            width={85}
            height={85}
            priority
            className="fixed left-1/2 top-1/2 !size-[85px] -translate-x-1/2 -translate-y-1/2 transform opacity-15 "
          />

          {messages?.map((message) => (
            <div
              key={message.id}
              className={`baseVertFlex w-full
              ${message.senderId === userId ? "!items-end" : "!items-start"}
              `}
            >
              <p
                className={`text-xs text-gray-400 ${message.senderId === userId ? "mr-2" : "ml-2"}`}
              >
                {format(message.createdAt, "h:mm a")}
              </p>
              <div
                className={`rounded-full px-4 py-2 ${message.senderId === userId ? "bg-primary text-white" : "bg-secondary"}`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <div className="baseFlex w-full gap-4 rounded-b-lg bg-gradient-to-br from-gray-200 to-gray-300 p-2 px-4">
          <Textarea
            placeholder="Enter your message here"
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage({
                  senderUserId: userId,
                  recipientUserId: "dashboard",
                  message: newMessageContent,
                });
              }
            }}
            className="max-h-12 flex-grow border-2 border-gray-500 bg-transparent placeholder-gray-400"
          />
          <Button
            className="!p-2"
            onClick={() => {
              sendMessage({
                senderUserId: userId,
                recipientUserId: "dashboard",
                message: newMessageContent,
              });
            }}
          >
            <IoIosSend className="size-6 text-white" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Chat;
