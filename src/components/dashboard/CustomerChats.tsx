import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import useGetUserId from "~/hooks/useGetUserId";
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";
import { format, isSameDay } from "date-fns";
import { type Chat, type ChatMessage } from "@prisma/client";
import { useMainStore } from "~/stores/MainStore";
import { type Socket } from "socket.io-client";
import { FaRedo } from "react-icons/fa";
import { useToast } from "~/components/ui/use-toast";

function containsLetterOrNumber(str: string) {
  const regex = /[a-zA-Z0-9]/;
  return regex.test(str);
}

type CombinedMessagesAndDateLabels = (
  | Date
  | {
      id: string;
      type: "message";
      content: string;
      createdAt: Date;
      senderId: string;
      recipientId: string;
    }
)[];

interface CustomerChats {
  socket: Socket;
}

function CustomerChats({ socket }: CustomerChats) {
  const userId = useGetUserId();
  const ctx = api.useUtils();

  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

  const { data: databaseChats, refetch: refetchChats } =
    api.chat.getAllMessages.useQuery();

  const { mutate: sendMessage, isLoading: isSendingMessage } =
    api.chat.sendMessage.useMutation({
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
      onSuccess(newMessage) {
        console.log("newMessage", newMessage);

        socket.emit("dashboardSentNewMessage", {
          userId: newMessage.recipientId,
          message: newMessage.content,
        });
      },
      // After mutation is resolved, refetch the messages
      onSettled() {
        setNewMessageContent("");
        setLocalMessageIsBeingSent(false);

        // Sync with server once mutation has settled
        void ctx.chat.getAllMessages.invalidate();
      },
    });

  const { mutate: updateChatReadStatus } =
    api.chat.updateChatReadStatus.useMutation({
      onSettled() {
        void ctx.chat.getAllMessages.invalidate();
      },
    });

  const [chats, setMessages] = useState<
    (Chat & {
      messages: ChatMessage[];
    })[]
  >([]);

  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [dateLabeledMessages, setDateLabeledMessages] =
    useState<CombinedMessagesAndDateLabels>([]);

  const [localMessageIsBeingSent, setLocalMessageIsBeingSent] = useState(false);
  const [manuallyRefreshingChats, setManuallyRefreshingChats] = useState(false);

  const scrollableChatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!databaseChats) return;

    // Sort databaseChats by the updatedAt timestamp in descending order
    const sortedChats = databaseChats.sort(
      (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
    );

    setMessages(sortedChats); // Assuming `setMessages` now expects an array of Chat objects
  }, [databaseChats]);

  useEffect(() => {
    if (selectedUserId === "") return;
    const selectedChat = databaseChats?.find(
      (chat) => chat.userId === selectedUserId,
    );

    if (!selectedChat) return;

    if (selectedChat.dashboardHasUnreadMessages) {
      void updateChatReadStatus({ chatId: selectedChat.id, forUser: false });
    }
  }, [selectedUserId, databaseChats, updateChatReadStatus]);

  useEffect(() => {
    if (selectedUserId === "") return;
    const transformedMessages: CombinedMessagesAndDateLabels = [];
    let lastDate: Date | null = null;
    const chat = chats.find((chat) => chat.userId === selectedUserId);

    if (!chat) return;

    chat.messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      if (!lastDate || !isSameDay(lastDate, messageDate)) {
        transformedMessages.push(messageDate);
        lastDate = messageDate;
      }
      transformedMessages.push({ ...message, type: "message" });
    });

    setDateLabeledMessages(transformedMessages);
  }, [chats, selectedUserId]);

  // autoscroll to bottom of chat when chat is opened
  useLayoutEffect(() => {
    if (selectedUserId !== "") {
      setTimeout(() => {
        if (scrollableChatContainerRef.current) {
          scrollableChatContainerRef.current.scrollTop =
            scrollableChatContainerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [selectedUserId]);

  const { toast } = useToast();

  console.log(selectedUserId);

  // vv obv improve this vv
  if (!chats) return <p>Loading...</p>;

  return (
    <motion.div
      key={"customerChats"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 w-full gap-4 border-t-0 tablet:mt-28"
    >
      <div className="baseFlex rounded-lg border border-t-0">
        {((viewportLabel.includes("mobile") && !selectedUserId) ||
          !viewportLabel.includes("mobile")) && (
          <div className="baseVertFlex h-[557px] w-full rounded-bl-lg bg-offwhite tablet:!w-[500px] tablet:border-r tablet:border-stone-600">
            <div className="w-full rounded-tl-lg border-b border-stone-600 bg-stone-200 p-4 text-center text-lg font-semibold">
              Chats
            </div>

            <div className="baseVertFlex size-full !justify-start overflow-y-auto">
              {chats.map((chat) => {
                const lastMessage = chat.messages?.at(-1);

                return (
                  <Button
                    key={chat.userId}
                    variant={
                      chat.userId === selectedUserId ? "default" : "secondary"
                    }
                    className="baseFlex !h-auto w-full !justify-between rounded-none border-b border-stone-400 !px-4 !py-2"
                    onClick={() => {
                      setSelectedUserId(chat.userId);
                      setNewMessageContent("");
                    }}
                  >
                    <div className="baseVertFlex !items-start gap-2">
                      <p
                        className={`font-semibold ${chat.userId === selectedUserId ? "text-offwhite" : "text-stone-500"}`}
                      >
                        {chat.userFullName}
                      </p>

                      <div
                        className={`baseFlex line-clamp-1 text-xs
                      ${chat.userId === selectedUserId ? "text-offwhite" : "text-stone-400"}`}
                      >
                        Sent at{" "}
                        {lastMessage
                          ? format(lastMessage.createdAt, "h:mm a")
                          : "N/A"}
                        <p className="ml-1 max-w-40 truncate">
                          - &ldquo;{lastMessage?.content}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div
                      className={`${chat.dashboardHasUnreadMessages ? "bg-primary" : ""} size-3 rounded-full`}
                    ></div>

                    <IoIosArrowBack className="rotate-180 tablet:hidden" />
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {((viewportLabel.includes("mobile") && selectedUserId) ||
          !viewportLabel.includes("mobile")) && (
          <div className="baseVertFlex w-full sm:max-w-xl">
            <div className="baseVertFlex relative h-[61px] w-full gap-2 rounded-tr-md border-b border-stone-600 bg-stone-200 p-4 shadow-md tablet:rounded-tr-md">
              <div className="text-lg font-semibold">
                {
                  chats.find((chat) => chat.userId === selectedUserId)
                    ?.userFullName
                }
              </div>
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
            <div
              ref={scrollableChatContainerRef}
              className="baseVertFlex relative size-full !justify-start gap-2 overflow-y-auto bg-background p-2 sm:h-96 "
            >
              {dateLabeledMessages ? (
                <>
                  {dateLabeledMessages.map((message) => (
                    <>
                      {message instanceof Date ? (
                        <p
                          key={message.toString()}
                          className="text-center text-xs text-stone-400"
                        >
                          {format(message, "EEEE, MMMM do")}
                        </p>
                      ) : (
                        <div
                          key={message.id}
                          className={`baseVertFlex w-full
                                  ${message.senderId === "dashboard" ? "!items-end" : "!items-start"}
                               `}
                        >
                          <p
                            className={`text-xs text-stone-400 ${message.senderId === "dashboard" ? "mr-2" : "ml-2"}`}
                          >
                            {format(message.createdAt, "h:mm a")}
                          </p>
                          <div
                            className={`z-10 rounded-full px-4 py-2 ${message.senderId === "dashboard" ? "bg-primary text-offwhite" : "bg-secondary"}`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                </>
              ) : (
                <div className="baseVertFlex h-full gap-2">
                  <div className="text-lg font-semibold">No chat selected</div>

                  <div>Select a customer&apos;s chat to view messages</div>
                </div>
              )}
            </div>

            <div className="baseFlex w-full gap-4 rounded-br-lg bg-gradient-to-br from-stone-200 to-stone-300 p-4 shadow-inner">
              <Textarea
                placeholder="Enter your message here"
                minLength={1}
                maxLength={500}
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !localMessageIsBeingSent &&
                    containsLetterOrNumber(newMessageContent)
                  ) {
                    setLocalMessageIsBeingSent(true);
                    e.preventDefault();
                    sendMessage({
                      senderUserId: "dashboard",
                      recipientUserId: selectedUserId,
                      message: newMessageContent,
                    });
                  }
                }}
                className="max-h-12 flex-grow border border-stone-500 bg-transparent placeholder-stone-400"
              />
              <Button
                className="!p-2"
                disabled={
                  !containsLetterOrNumber(newMessageContent) ||
                  isSendingMessage ||
                  !selectedUserId
                }
                onClick={() => {
                  sendMessage({
                    senderUserId: "dashboard",
                    recipientUserId: selectedUserId,
                    message: newMessageContent,
                  });
                }}
              >
                <IoIosSend className="size-6 text-offwhite" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        disabled={manuallyRefreshingChats}
        className="baseFlex gap-2"
        onClick={() => {
          setManuallyRefreshingChats(true);

          void refetchChats().then((e) => {
            if (e.isSuccess) {
              toast({
                description: "Customer chats have been refreshed.",
              });

              setManuallyRefreshingChats(false);
            }
          });
        }}
      >
        <FaRedo className="size-4" />
        Refresh Chats
      </Button>
    </motion.div>
  );
}

export default CustomerChats;
