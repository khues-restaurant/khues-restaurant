import { format, isSameDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IoIosSend } from "react-icons/io";
import { IoChatbox } from "react-icons/io5";
import { type Socket, io } from "socket.io-client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { env } from "~/env";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";

import khuesKitchenLogo from "/public/logos/khuesKitchenLogo.png";

function containsLetterOrNumber(str: string) {
  const regex = /[a-zA-Z0-9]/;
  return regex.test(str);
}

// FYI: when we made this we were aware that it is conservative by nature, and is only
// connecting to the socket.io server once the Chat has been opened for the first time.

// ^ a small qol bump would maybe be to connect if the last message sent in the message chain
// was by the user, and of course the most "ideal" (but also highest server load) would be
// to have a persistent connection to the server at all times that the user is on the site.

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

function Chat() {
  const userId = useGetUserId();
  const { asPath } = useRouter();

  const {
    viewportLabel,
    mobileHeroThresholdInView,
    chatIsOpen,
    setChatIsOpen,
  } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
    mobileHeroThresholdInView: state.mobileHeroThresholdInView,
    chatIsOpen: state.chatIsOpen,
    setChatIsOpen: state.setChatIsOpen,
  }));

  const ctx = api.useUtils();

  const { data: chat, refetch } = api.chat.getMessagesPerUser.useQuery(userId, {
    enabled: userId.length > 0,
  });

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
        console.log("message sent", newMessage);

        socket?.emit("userSentNewMessage", {
          userId: newMessage.recipientId,
          message: newMessage.content,
        });
      },
      // After mutation is resolved, refetch the messages
      onSettled() {
        setNewMessageContent("");
        setLocalMessageIsBeingSent(false);
        // Sync with server once mutation has settled
        void ctx.chat.getMessagesPerUser.invalidate();
      },
    });

  const { mutate: updateChatReadStatus } =
    api.chat.updateChatReadStatus.useMutation({
      onSettled: () => {
        void refetch();
      },
    });

  const [prevTotalChatMessages, setPrevTotalChatMessages] = useState(0);

  // autoscroll to bottom of chat when new message is sent/received
  useEffect(() => {
    if (chat?.messages) {
      if (chat.messages.length !== prevTotalChatMessages) {
        setTimeout(() => {
          if (scrollableChatContainerRef.current) {
            scrollableChatContainerRef.current.scrollTop =
              scrollableChatContainerRef.current.scrollHeight;
          }
        }, 150); // kind of arbitrary, play around with this more
      }

      setPrevTotalChatMessages(chat.messages.length);
    }
  }, [chat?.messages, prevTotalChatMessages]);

  const [localMessageIsBeingSent, setLocalMessageIsBeingSent] = useState(false);
  const [chatHasBeenInitiallyOpened, setChatHasBeenInitiallyOpened] =
    useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const scrollableChatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatIsOpen || chatHasBeenInitiallyOpened || userId === "") return;
    setChatHasBeenInitiallyOpened(true);
    void refetch();

    console.log("connecting to socket.io server");

    const socket = io(env.NEXT_PUBLIC_SOCKET_IO_URL, {
      query: {
        userId,
      },
      secure: env.NEXT_PUBLIC_SOCKET_IO_URL.includes("https") ? true : false,
      retries: 3,
    });

    socket.on(`newUserMessage`, (message) => {
      console.log("received message from server", message);

      void refetch();

      if (scrollableChatContainerRef.current) {
        scrollableChatContainerRef.current.scrollTop =
          scrollableChatContainerRef.current.scrollHeight;
      }
    });

    setSocket(socket);
  }, [chatIsOpen, chatHasBeenInitiallyOpened, userId, refetch]);

  const [newMessageContent, setNewMessageContent] = useState("");
  const [dateLabeledMessages, setDateLabeledMessages] =
    useState<CombinedMessagesAndDateLabels>([]);

  useEffect(() => {
    if (chatIsOpen && chat?.userHasUnreadMessages) {
      void updateChatReadStatus({ chatId: chat.id, forUser: true });
    }
  }, [chatIsOpen, chat, updateChatReadStatus]);

  // autoscroll to bottom of chat when chat is opened
  useLayoutEffect(() => {
    if (chatIsOpen) {
      setTimeout(() => {
        if (scrollableChatContainerRef.current) {
          scrollableChatContainerRef.current.scrollTop =
            scrollableChatContainerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [chatIsOpen]);

  useEffect(() => {
    if (chat?.messages) {
      const transformedMessages: CombinedMessagesAndDateLabels = [];
      let lastDate: Date | null = null;

      chat.messages.forEach((message) => {
        const messageDate = new Date(message.createdAt);
        if (!lastDate || !isSameDay(lastDate, messageDate)) {
          transformedMessages.push(messageDate);
          lastDate = messageDate;
        }
        transformedMessages.push({ ...message, type: "message" });
      });

      setDateLabeledMessages(transformedMessages);
    }
  }, [chat?.messages]);

  return (
    // a little hacky, but somehow both the "X" and chat icon were showing at the same time
    // this just flushes out the component manually on change of chatIsOpen
    // ^ most likely due to zustand updating faster than react's reconciliation process?
    // could technically debounce but this should be fine
    <div
      // key={chatIsOpen ? "manualRerenderChat1" : "manualRerenderChat2"}
      className="baseFlex !sticky bottom-0 z-20 h-0 w-full !justify-end pr-6 tablet:pr-8"
    >
      {viewportLabel.includes("mobile") ? (
        <AlertDialog open={chatIsOpen}>
          <AnimatePresence mode="popLayout">
            {!chatIsOpen && (
              <motion.div
                key="openChat"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: mobileHeroThresholdInView ? 0 : 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  paddingBottom: asPath.includes("/profile") ? "18rem" : "8rem",
                }}
                className="relative z-20 size-10 tablet:hidden"
              >
                <AlertDialogTrigger asChild>
                  <Button
                    aria-label="Toggle chat visibility"
                    className={`size-12 rounded-full shadow-md ${asPath.includes("/menu") ? "pointer-events-none opacity-0 tablet:pointer-events-auto tablet:opacity-100" : ""}`}
                    onClick={() => {
                      setChatIsOpen(!chatIsOpen);
                    }}
                  >
                    <div
                      style={{
                        animationDuration: "2s",
                      }}
                      className={`absolute left-1 top-1 z-[-1] size-8 rounded-full bg-primary ${
                        !chatIsOpen && chat?.userHasUnreadMessages
                          ? "animate-ping"
                          : ""
                      }`}
                    ></div>

                    <IoChatbox className="size-5 drop-shadow-md" />
                  </Button>
                </AlertDialogTrigger>
              </motion.div>
            )}
          </AnimatePresence>

          <AlertDialogContent className="baseVertFlex h-[90dvh] max-h-[750px] w-[90vw] !gap-0 rounded-xl border-none !p-0 shadow-xl">
            {/* header */}
            <div className="baseFlex relative z-20 w-full gap-4 rounded-t-xl bg-primary p-4 shadow-md sm:gap-6 sm:pl-6">
              <Image
                src={khuesKitchenLogo}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                className="h-[101.33px] w-[53.67px] drop-shadow-md"
              />

              <div className="baseVertFlex w-full !items-start gap-2">
                <p className="text-lg font-medium text-offwhite">
                  Have a question?
                </p>
                <p className="max-w-72 text-sm text-stone-200">
                  Send a message directly to our team and we will respond as
                  soon as possible.
                </p>
              </div>

              <Button
                variant={"text"}
                onClick={() => setChatIsOpen(false)}
                className="!absolute right-0 top-0"
              >
                <X className="size-4 text-offwhite" />
              </Button>
            </div>

            {/* scroll-y-auto messages container */}
            <div
              ref={scrollableChatContainerRef}
              className="baseVertFlex relative !h-full w-full !justify-start gap-2 overflow-y-auto bg-background p-2 sm:h-96 "
            >
              {dateLabeledMessages.map((message) => (
                <Fragment
                  key={
                    message instanceof Date ? message.toString() : message.id
                  }
                >
                  {message instanceof Date ? (
                    <p className="pt-4 text-center text-xs text-stone-400">
                      {format(message, "EEEE, MMMM do")}
                    </p>
                  ) : (
                    <div
                      className={`baseVertFlex w-full
                                  ${message.senderId === userId ? "!items-end" : "!items-start"}
                               `}
                    >
                      <p
                        className={`mb-0.5 text-xs text-stone-400 ${message.senderId === userId ? "mr-2" : "ml-2"}`}
                      >
                        {format(message.createdAt, "h:mm a")}
                      </p>
                      <div
                        className={`z-10 rounded-lg px-4 py-2 ${message.senderId === userId ? "bg-primary text-offwhite" : "bg-secondary"}`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* input */}
            <div className="baseFlex w-full gap-4 rounded-b-xl bg-gradient-to-br from-stone-200 to-stone-300 px-4 py-3 shadow-inner">
              <Textarea
                placeholder="Enter your message here..."
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
                      senderUserId: userId,
                      recipientUserId: "dashboard",
                      message: newMessageContent,
                    });
                  }
                }}
                className="max-h-12 flex-grow border-2 border-stone-500 bg-transparent placeholder-stone-400"
              />
              <Button
                disabled={
                  !containsLetterOrNumber(newMessageContent) || isSendingMessage
                }
                className="!p-2"
                onClick={() => {
                  sendMessage({
                    senderUserId: userId,
                    recipientUserId: "dashboard",
                    message: newMessageContent,
                  });
                }}
              >
                <IoIosSend className="size-6 text-offwhite" />
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Popover
          open={chatIsOpen}
          onOpenChange={(open) => {
            setChatIsOpen(open);
          }}
        >
          <motion.div
            key="openChatContainerTablet"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{ duration: 0.2 }}
            className="relative z-20 mb-[120px] hidden size-14 rounded-full shadow-md tablet:block"
          >
            <PopoverTrigger asChild>
              <Button
                aria-label="Toggle chat visibility"
                className="size-14 rounded-full shadow-md"
              >
                <div
                  style={{
                    animationDuration: "2s",
                  }}
                  className={`absolute left-0 top-0 z-[-1] size-14 rounded-full bg-primary ${
                    !chatIsOpen && chat?.userHasUnreadMessages
                      ? "animate-ping"
                      : ""
                  }`}
                ></div>

                {/* split into two because framer motion has a bug where quick unmount -> remount
                    can cause both of the icons to show at once. */}
                <AnimatePresence mode="popLayout">
                  {chatIsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-6 drop-shadow-md" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                  {!chatIsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      transition={{ duration: 0.15 }}
                    >
                      <IoChatbox className="size-6 drop-shadow-md" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </PopoverTrigger>
          </motion.div>

          <PopoverContent
            side={"top"}
            sideOffset={16}
            showArrow={false}
            className="baseVertFlex w-full !rounded-xl border-none !p-0 shadow-xl sm:mr-4 sm:max-w-sm"
          >
            {/* header */}
            <div className="baseFlex z-20 gap-5 rounded-t-lg bg-primary p-4 shadow-md">
              <Image
                src={khuesKitchenLogo}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                className="ml-1 h-[101.33px] w-[53.67px] drop-shadow-md"
              />

              <div className="baseVertFlex !items-start gap-2">
                <p className="text-lg font-medium text-offwhite">
                  Have a question?
                </p>
                <p className="text-sm text-stone-200">
                  Send a message directly to our team and we will respond as
                  soon as possible.
                </p>
              </div>
            </div>

            {/* scroll-y-auto messages container */}
            <div
              ref={scrollableChatContainerRef}
              className="baseVertFlex relative size-full h-64 !justify-start gap-2 overflow-y-auto overscroll-y-contain bg-background p-2 shadow-inner tall:h-96"
            >
              {dateLabeledMessages.map((message) => (
                <Fragment
                  key={
                    message instanceof Date ? message.toString() : message.id
                  }
                >
                  {message instanceof Date ? (
                    <p className="pt-4 text-center text-xs text-stone-400">
                      {format(message, "EEEE, MMMM do")}
                    </p>
                  ) : (
                    <div
                      className={`baseVertFlex w-full
                                  ${message.senderId === userId ? "!items-end" : "!items-start"}
                               `}
                    >
                      <p
                        className={`mb-0.5 text-xs text-stone-400 ${message.senderId === userId ? "mr-2" : "ml-2"}`}
                      >
                        {format(message.createdAt, "h:mm a")}
                      </p>
                      <div
                        className={`z-10 rounded-lg px-4 py-2 ${message.senderId === userId ? "bg-primary text-offwhite" : "bg-secondary"}`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* input */}
            <div className="baseFlex w-full gap-4 rounded-b-lg bg-gradient-to-br from-stone-200 to-stone-300 px-4 py-3 shadow-inner">
              <Textarea
                placeholder="Enter your message here..."
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
                      senderUserId: userId,
                      recipientUserId: "dashboard",
                      message: newMessageContent,
                    });
                  }
                }}
                className="max-h-12 flex-grow border-2 border-stone-500 bg-transparent placeholder-stone-400"
              />
              <Button
                disabled={
                  !containsLetterOrNumber(newMessageContent) || isSendingMessage
                }
                className="!p-2"
                onClick={() => {
                  sendMessage({
                    senderUserId: userId,
                    recipientUserId: "dashboard",
                    message: newMessageContent,
                  });
                }}
              >
                <IoIosSend className="size-6 text-offwhite" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default Chat;
