import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IoMdMore } from "react-icons/io";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";

import classes from "./DashboardDesktopHeader.module.css";
// import DiscountManagement from "~/components/dashboard/DiscountManagement";
import { addDays } from "date-fns";
import { type Socket } from "socket.io-client";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import DelayNewOrders from "~/components/dashboard/DelayNewOrders";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import { type DashboardViewStates } from "~/pages/dashboard";
import { Separator } from "~/components/ui/separator";

interface DashboardDesktopHeader {
  viewState: DashboardViewStates;
  setViewState: Dispatch<SetStateAction<DashboardViewStates>>;
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

  const { data: orders } = api.order.getDashboardOrders.useQuery();
  const { data: databaseChats, refetch: refetchChats } =
    api.chat.getAllMessages.useQuery();

  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState(0);
  const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(0);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);

  useEffect(() => {
    if (!orders) return;

    const futureDate = addDays(getMidnightCSTInUTC(new Date()), 1);

    const activeOrders = orders.filter(
      (order) =>
        order.orderCompletedAt === null && order.datetimeToPickup < futureDate,
    );

    setNumberOfActiveOrders(activeOrders.length);
  }, [orders]);

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

        <DelayNewOrders />

        <Popover
          open={popoverIsOpen}
          onOpenChange={(open) => {
            setPopoverIsOpen(open);
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size={"icon"} className="baseFlex gap-2">
              <IoMdMore className="size-8 text-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <div className="baseVertFlex gap-2">
              {/* <DiscountManagement /> */}

              <Button
                variant={"link"}
                className="!text-xl"
                onClick={() => {
                  setViewState("stats");
                  setPopoverIsOpen(false);
                }}
              >
                Stats
              </Button>

              <Button
                variant={"link"}
                className="!text-xl"
                onClick={() => {
                  setViewState("reviews");
                  setPopoverIsOpen(false);
                }}
              >
                Reviews
              </Button>

              <Separator className="mt-2 h-[1px] w-full" />

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
