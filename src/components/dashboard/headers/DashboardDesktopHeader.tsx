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
import { api } from "~/utils/api";

// import DiscountManagement from "~/components/dashboard/DiscountManagement";
import { addDays } from "date-fns";
import { type Socket } from "socket.io-client";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import DelayNewOrders from "~/components/dashboard/DelayNewOrders";
import PickupTimeslotCapacity from "~/components/dashboard/PickupTimeslotCapacity";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import {
  CHICAGO_TIME_ZONE,
  getMidnightCSTInUTC,
} from "~/utils/dateHelpers/cstToUTCHelpers";
import { type DashboardViewStates } from "~/pages/dashboard";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { formatTimeString } from "~/utils/formatters/formatTimeString";
import { useMainStore } from "~/stores/MainStore";
import { getOpenTimesForDay } from "~/utils/dateHelpers/datesAndHoursOfOperation";
import type { DayOfWeek } from "~/types/operatingHours";

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
  const { signOut } = useAuth();
  const { push } = useRouter();

  const { hoursOfOperation } = useMainStore((state) => ({
    hoursOfOperation: state.hoursOfOperation,
  }));

  const { data: orders } = api.order.getDashboardOrders.useQuery();
  const { data: databaseChats, refetch: refetchChats } =
    api.chat.getAllMessages.useQuery();
  const { data: statusReport } = api.dashboard.getHeaderStatusReport.useQuery();

  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState(0);
  const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(0);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [onLineStatus, setOnlineStatus] = useState<"online" | "offline">(
    typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline",
  );

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

  useEffect(() => {
    function updateOnlineStatus() {
      setOnlineStatus(navigator.onLine ? "online" : "offline");
    }
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  function timeIsEqualToStoreCloseTime(time: string) {
    if (!hoursOfOperation.length) return false;

    const chicagoCurrentDate = toZonedTime(new Date(), CHICAGO_TIME_ZONE);

    const storeCloseTime = getOpenTimesForDay({
      dayOfWeek: chicagoCurrentDate.getDay() as DayOfWeek,
      hoursOfOperation,
    }).slice(-1)[0];

    if (!storeCloseTime) return false;

    return time === formatTimeString(storeCloseTime);
  }

  return (
    <nav
      id="header"
      className={`baseVertFlex sticky left-0 top-0 z-50 grid h-24 w-full gap-3 bg-offwhite shadow-md`}
    >
      <div className="baseFlex gap-4">
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

              <Button
                variant={"link"}
                className="!text-xl"
                onClick={() => {
                  setViewState("hoursOfOperation");
                  setPopoverIsOpen(false);
                }}
              >
                Hours of operation
              </Button>

              <Button
                variant={"link"}
                className="!text-xl"
                onClick={() => {
                  setViewState("holidays");
                  setPopoverIsOpen(false);
                }}
              >
                Holidays
              </Button>

              <PickupTimeslotCapacity />

              <Button
                variant={viewState === "refunds" ? "activeLink" : "link"}
                className="text-xl"
                onClick={() => setViewState("refunds")}
              >
                Refunds
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

      {/* status report */}
      <div className="baseFlex flex-wrap gap-4">
        {/* Online/offline status indicator */}
        {onLineStatus === "offline" && (
          <Badge variant="destructive">Offline mode</Badge>
        )}

        {/* Min order pickup time */}
        {statusReport && statusReport.minOrderPickupTime !== 0 && (
          <Badge
            variant={"secondary"}
            className="bg-yellow-300/50 text-yellow-800"
          >
            Online ordering is paused until{" "}
            {timeIsEqualToStoreCloseTime(
              formatInTimeZone(
                statusReport.minOrderPickupTime,
                CHICAGO_TIME_ZONE,
                "p",
              ),
            )
              ? "tomorrow"
              : formatInTimeZone(
                  statusReport.minOrderPickupTime,
                  CHICAGO_TIME_ZONE,
                  "p",
                )}
          </Badge>
        )}

        {/* Number of currently 86'd items */}
        {statusReport && statusReport.totalDisabledMenuItems > 0 && (
          <Badge className="bg-yellow-300/50 text-yellow-800">
            {statusReport.totalDisabledMenuItems} item
            {statusReport.totalDisabledMenuItems > 1 ? "s" : ""} 86&apos;d
          </Badge>
        )}
      </div>
    </nav>
  );
}

export default DashboardDesktopHeader;
