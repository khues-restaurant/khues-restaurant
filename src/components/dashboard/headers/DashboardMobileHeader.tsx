import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { api } from "~/utils/api";

// import DiscountManagement from "~/components/dashboard/DiscountManagement";
import { addDays } from "date-fns";
import { type Socket } from "socket.io-client";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import DelayNewOrders from "~/components/dashboard/DelayNewOrders";
import PickupTimeslotCapacity from "~/components/dashboard/PickupTimeslotCapacity";
import { Separator } from "~/components/ui/separator";
import { type DashboardViewStates } from "~/pages/dashboard";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import {
  CHICAGO_TIME_ZONE,
  getMidnightCSTInUTC,
} from "~/utils/dateHelpers/cstToUTCHelpers";
import { Badge } from "~/components/ui/badge";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { formatTimeString } from "~/utils/formatters/formatTimeString";
import { useMainStore } from "~/stores/MainStore";
import { getOpenTimesForDay } from "~/utils/dateHelpers/datesAndHoursOfOperation";
import type { DayOfWeek } from "~/types/operatingHours";

interface DashboardMobileHeader {
  viewState: DashboardViewStates;
  setViewState: Dispatch<SetStateAction<DashboardViewStates>>;
  socket: Socket;
}

function DashboardMobileHeader({
  viewState,
  setViewState,
  socket,
}: DashboardMobileHeader) {
  const { signOut } = useAuth();
  const { push } = useRouter();

  const { hoursOfOperation } = useMainStore((state) => ({
    hoursOfOperation: state.hoursOfOperation,
  }));

  const { data: orders } = api.order.getDashboardOrders.useQuery();
  const { data: databaseChats, refetch: refetchChats } =
    api.chat.getAllMessages.useQuery();
  const { data: statusReport } = api.dashboard.getHeaderStatusReport.useQuery();

  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState(0);
  const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(0);
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
      className="baseVertFlex sticky left-0 top-0 z-50 h-24 w-full gap-4 bg-offwhite p-2 shadow-md"
    >
      <div className="baseFlex w-full !justify-between gap-4">
        {/* currently selected page title */}
        <p className="ml-2 text-lg font-semibold">
          {viewState === "orderManagement" && "Order management"}
          {viewState === "customerChats" && "Customer chats"}
          {viewState === "itemManagement" && "Item management"}
          {viewState === "refunds" && "Refunds"}
          {viewState === "stats" && "Stats"}
          {viewState === "hoursOfOperation" && "Hours of operation"}
          {viewState === "holidays" && "Holidays"}
          {viewState === "giftCards" && "Gift Cards"}
        </p>

        <Sheet open={sheetIsOpen} onOpenChange={(open) => setSheetIsOpen(open)}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="relative mr-2">
              <span
                aria-hidden="true"
                className="ease-in-out absolute top-[12px] block h-0.5 w-6 bg-current transition duration-500"
              ></span>
              <span
                aria-hidden="true"
                className="ease-in-out absolute block h-0.5 w-6 bg-current transition duration-500"
              ></span>
              <span
                aria-hidden="true"
                className="ease-in-out absolute top-[26px] block h-0.5 w-6 bg-current transition duration-500"
              ></span>
            </Button>
          </SheetTrigger>
          <SheetContent className="!h-dvh !overflow-auto p-6">
            <VisuallyHidden>
              <DialogTitle>Dashboard links</DialogTitle>
              <DialogDescription>
                Sheet containing dashboard links
              </DialogDescription>
            </VisuallyHidden>

            <div className="baseVertFlex !justify-start gap-6 overflow-y-scroll pt-12">
              <div className="relative">
                <Button
                  variant={
                    viewState === "orderManagement" ? "activeLink" : "link"
                  }
                  className="text-lg"
                  onClick={() => {
                    setViewState("orderManagement");
                    setSheetIsOpen(false);
                  }}
                >
                  Order Management
                </Button>

                {/* notification count */}
                {numberOfActiveOrders > 0 && (
                  <div className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-offwhite">
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
                  variant={
                    viewState === "customerChats" ? "activeLink" : "link"
                  }
                  className="text-lg"
                  onClick={() => {
                    setViewState("customerChats");
                    setSheetIsOpen(false);
                  }}
                >
                  Customer Chats
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
                className="text-lg"
                onClick={() => {
                  setViewState("itemManagement");
                  setSheetIsOpen(false);
                }}
              >
                Item Management
              </Button>

              <DelayNewOrders />

              <Separator className="mt-2 w-4/5 self-center" />

              <Button
                variant={viewState === "stats" ? "activeLink" : "link"}
                className="text-lg"
                onClick={() => {
                  setViewState("stats");
                  setSheetIsOpen(false);
                }}
              >
                Stats
              </Button>

              <Button
                variant={
                  viewState === "hoursOfOperation" ? "activeLink" : "link"
                }
                className="text-lg"
                onClick={() => {
                  setViewState("hoursOfOperation");
                  setSheetIsOpen(false);
                }}
              >
                Hours of Operation
              </Button>

              <Button
                variant={viewState === "holidays" ? "activeLink" : "link"}
                className="text-lg"
                onClick={() => {
                  setViewState("holidays");
                  setSheetIsOpen(false);
                }}
              >
                Holidays
              </Button>

              <PickupTimeslotCapacity />

              <Button
                variant={viewState === "giftCards" ? "activeLink" : "link"}
                className="text-lg"
                onClick={() => {
                  setViewState("giftCards");
                  setSheetIsOpen(false);
                }}
              >
                Gift Cards
              </Button>

              <Button
                variant={viewState === "refunds" ? "activeLink" : "link"}
                className="text-lg"
                onClick={() => {
                  setViewState("refunds");
                  setSheetIsOpen(false);
                }}
              >
                Refunds
              </Button>

              <Separator className="mt-2 w-4/5 self-center" />

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

              {/* <DiscountManagement /> */}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* status report */}
      <div className="baseFlex flex-wrap gap-4">
        {/* Online/offline status indicator */}
        {onLineStatus === "offline" && (
          <Badge variant="destructive">Offline mode</Badge>
        )}

        {/* Min order pickup time */}
        {statusReport &&
          statusReport.minOrderPickupTime.getTime() > new Date().getTime() && (
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

export default DashboardMobileHeader;
