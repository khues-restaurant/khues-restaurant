import { SignOutButton, useAuth } from "@clerk/nextjs";
// import { useLocalStorageValue } from "@react-hookz/web";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useState, type Dispatch, type SetStateAction, useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";
import { IoMdMore } from "react-icons/io";

import classes from "./DashboardDesktopHeader.module.css";
import DiscountManagement from "~/components/dashboard/DiscountManagement";
import DelayNewOrders from "~/components/dashboard/DelayNewOrders";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { type Socket } from "socket.io-client";

interface DashboardDesktopHeader {
  viewState: "orderManagement" | "customerChats" | "itemManagement" | "stats";
  setViewState: Dispatch<
    SetStateAction<
      "orderManagement" | "customerChats" | "itemManagement" | "stats"
    >
  >;
  socket: Socket;
}

function DashboardDesktopHeader({
  viewState,
  setViewState,
  socket,
}: DashboardDesktopHeader) {
  const { isSignedIn, signOut } = useAuth();
  const { asPath, push } = useRouter();
  const userId = useGetUserId();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { data: todaysOrders } = api.order.getTodaysOrders.useQuery();
  const { data: databaseChats, refetch: refetchChats } =
    api.chat.getAllMessages.useQuery();

  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState(0);
  const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(0);

  useEffect(() => {
    if (!todaysOrders) return;

    const activeOrders = todaysOrders.filter(
      (order) => order.orderCompletedAt === null,
    );

    setNumberOfActiveOrders(activeOrders.length);
  }, [todaysOrders]);

  useEffect(() => {
    if (!databaseChats) return;

    const unreadMessages = databaseChats.filter(
      (chat) => chat.dashboardHasUnreadMessages,
    );

    setNumberOfUnreadMessages(unreadMessages.length);
  }, [databaseChats]);

  useEffect(() => {
    console.log("listener ran on customerChats");

    socket.on("newDashboardMessage", (data) => {
      console.log("newDashboardMessage", data);

      void refetchChats();
    });
  }, [socket, refetchChats]);

  return (
    <nav
      id="header"
      className={`baseFlex fixed left-0 top-0 z-50 grid h-24 w-screen gap-4 bg-offwhite shadow-md`}
    >
      <div className={`${classes.mainLinks} baseFlex gap-4`}>
        <div className="relative">
          <Button
            variant={viewState === "orderManagement" ? "activeLink" : "link"}
            className="text-xl"
            onClick={() => setViewState("orderManagement")}
          >
            Order management
          </Button>

          {/* notification count */}
          {numberOfActiveOrders > 0 && (
            <div
              className={`absolute -top-2 rounded-full bg-primary px-2 py-0.5 text-offwhite
                ${numberOfActiveOrders < 10 ? "-right-2" : "-right-4"}
              `}
            >
              <AnimatedNumbers
                value={numberOfActiveOrders}
                fontSize={14}
                padding={6}
              />
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant={viewState === "customerChats" ? "activeLink" : "link"}
            className="text-xl"
            onClick={() => setViewState("customerChats")}
          >
            Customer chats
          </Button>

          {numberOfUnreadMessages > 0 && (
            <div
              className={`absolute -top-2 rounded-full bg-primary px-2 py-0.5 text-offwhite
                ${numberOfUnreadMessages < 10 ? "-right-2" : "-right-4"}
              `}
            >
              <AnimatedNumbers
                value={numberOfUnreadMessages}
                fontSize={14}
                padding={6}
              />
            </div>
          )}
        </div>

        <Button
          variant={viewState === "itemManagement" ? "activeLink" : "link"}
          className="text-xl"
          onClick={() => setViewState("itemManagement")}
        >
          Item management
        </Button>

        {/* TODO: explore wher the unique key prop error is coming from in
            this component */}
        {/* <DelayNewOrders /> */}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size={"icon"} className="baseFlex gap-2">
              <IoMdMore className="size-8 text-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <div className="baseVertFlex gap-2">
              <DiscountManagement />
              <div>TODO: Reviews</div>

              {user?.email === "ericxpham@gmail.com" && (
                <Button variant={"link"} onClick={() => setViewState("stats")}>
                  Stats
                </Button>
              )}

              <Button
                variant={"link"}
                onClick={async () => {
                  await signOut(async () => {
                    clearLocalStorage();
                    await push("/");
                  });
                }}
              >
                Log out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}

export default DashboardDesktopHeader;
