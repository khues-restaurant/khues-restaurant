import { Fragment, useEffect, useState } from "react";
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
import useGetUserId from "~/hooks/useGetUserId";
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useMainStore } from "~/stores/MainStore";
import { useRouter } from "next/router";
import useGetVisibleFooterOffset from "~/hooks/useGetVisibleFooterOffset";

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
      void ctx.chat.getMessagesPerUser.invalidate();
    },
  });

  const { mutate: updateChatReadStatus } =
    api.chat.updateChatReadStatus.useMutation({
      onSettled: () => {
        void refetch();
      },
    });

  const [newMessageContent, setNewMessageContent] = useState("");

  const { visibleFooterOffset } = useGetVisibleFooterOffset();

  useEffect(() => {
    if (chatIsOpen && chat?.userHasUnreadMessages) {
      void updateChatReadStatus({ chatId: chat.id, forUser: true });
    }
  }, [chatIsOpen, chat, updateChatReadStatus]);

  return (
    // a little hacky, but somehow both the "X" and chat icon were showing at the same time
    // this just flushes out the component manually on change of chatIsOpen
    // ^ most likely due to zustand updating faster than react's reconciliation process?
    // could technically debounce but this should be fine
    <Fragment key={chatIsOpen ? "manualRerenderChat1" : "manualRerenderChat2"}>
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
                  bottom:
                    (asPath.includes("/profile") ? 100 : 24) +
                    visibleFooterOffset,
                }}
                className="fixed right-6 z-10 size-10 tablet:hidden"
              >
                <AlertDialogTrigger asChild>
                  <Button
                    className={`size-12 rounded-full shadow-md ${asPath.includes("/menu") ? "opacity-0 tablet:opacity-100" : ""}`}
                    onClick={() => {
                      setChatIsOpen(!chatIsOpen);
                    }}
                  >
                    <div
                      style={{
                        animationDuration: "2s",
                      }}
                      className={`absolute left-1 top-1 z-[-1] size-8 rounded-full bg-primary ${
                        chat?.userHasUnreadMessages ? "animate-ping" : ""
                      }`}
                    ></div>

                    <IoChatbox className="size-5 drop-shadow-md" />
                  </Button>
                </AlertDialogTrigger>
              </motion.div>
            )}
          </AnimatePresence>

          <AlertDialogContent className="baseVertFlex h-[70dvh] w-[90vw] rounded-lg border-none !p-0 shadow-xl sm:mr-4">
            {/* header */}
            <div className="baseVertFlex relative !items-start gap-2 rounded-t-lg bg-primary p-4">
              <p className="text-lg font-medium text-offwhite">
                Have a question?
              </p>
              <p className="text-sm text-stone-200">
                Send a message directly to our team and we will respond as soon
                as possible.
              </p>

              <Button
                variant={"text"}
                onClick={() => setChatIsOpen(false)}
                className="!absolute right-0 top-0"
              >
                <X className="size-4 text-offwhite" />
              </Button>
            </div>

            {/* scroll-y-auto messages container */}
            <div className="baseVertFlex relative !h-[500px] w-full !justify-start gap-2 overflow-y-auto bg-background p-2 sm:h-96 ">
              <Image
                src="/logo.svg"
                alt="Khue's header logo"
                width={85}
                height={85}
                priority
                // idk why the 47.5% was necessary to center the image... investigate later
                className="fixed left-[47.5%] top-1/2 !size-[85px] -translate-x-1/2 -translate-y-1/2 transform opacity-15 "
              />

              {chat?.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`baseVertFlex w-full
              ${message.senderId === userId ? "!items-end" : "!items-start"}
              `}
                >
                  <p
                    className={`text-xs text-stone-400 ${message.senderId === userId ? "mr-2" : "ml-2"}`}
                  >
                    {format(message.createdAt, "h:mm a")}
                  </p>
                  <div
                    className={`z-10 rounded-full px-4 py-2 ${message.senderId === userId ? "bg-primary text-offwhite" : "bg-secondary"}`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* input */}
            <div className="baseFlex w-full gap-4 rounded-b-lg bg-gradient-to-br from-stone-200 to-stone-300 p-2 px-4">
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
                className="max-h-12 flex-grow border-2 border-stone-500 bg-transparent placeholder-stone-400"
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
            style={{
              bottom: 32 + visibleFooterOffset,
            }}
            className="fixed right-8 z-10 hidden size-14 rounded-full shadow-md tablet:block"
          >
            <PopoverTrigger asChild>
              <Button className="size-14 rounded-full shadow-md">
                <div
                  style={{
                    animationDuration: "2s",
                  }}
                  className={`absolute left-0 top-0 z-[-1] size-14 rounded-full bg-primary ${
                    chat?.userHasUnreadMessages ? "animate-ping" : ""
                  }`}
                ></div>
                <AnimatePresence mode="popLayout">
                  {chatIsOpen ? (
                    <motion.div
                      key="closeChat"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-6 drop-shadow-md" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="openChatTablet+"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
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
            className="baseVertFlex w-full rounded-lg border-none !p-0 shadow-xl sm:mr-4 sm:max-w-sm"
          >
            {/* header */}
            <div className="baseVertFlex !items-start gap-2 rounded-t-lg bg-primary p-4">
              <p className="text-lg font-medium text-offwhite">
                Have a question?
              </p>
              <p className="text-sm text-stone-200">
                Send a message directly to our team and we will respond as soon
                as possible.
              </p>
            </div>

            {/* scroll-y-auto messages container */}
            <div className="baseVertFlex relative size-full !flex-col-reverse !justify-start gap-2 overflow-y-auto overscroll-y-contain bg-background p-2 sm:h-96 ">
              <Image
                src="/logo.svg"
                alt="Khue's header logo"
                width={85}
                height={85}
                priority
                // idk why the 47.5% was necessary to center the image... investigate later
                className="fixed left-[47.5%] top-1/2 !size-[85px] -translate-x-1/2 -translate-y-1/2 transform opacity-15 "
              />

              {chat?.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`baseVertFlex w-full
              ${message.senderId === userId ? "!items-end" : "!items-start"}
              `}
                >
                  <p
                    className={`text-xs text-stone-400 ${message.senderId === userId ? "mr-2" : "ml-2"}`}
                  >
                    {format(message.createdAt, "h:mm a")}
                  </p>
                  <div
                    className={`z-10 rounded-full px-4 py-2 ${message.senderId === userId ? "bg-primary text-offwhite" : "bg-secondary"}`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* input */}
            <div className="baseFlex w-full gap-4 rounded-b-lg bg-gradient-to-br from-stone-200 to-stone-300 p-2 px-4">
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
                className="max-h-12 flex-grow border-2 border-stone-500 bg-transparent placeholder-stone-400"
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
                <IoIosSend className="size-6 text-offwhite" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </Fragment>
  );
}

export default Chat;
