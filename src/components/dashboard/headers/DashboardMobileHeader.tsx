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
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";

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

  const { data: orders } = api.order.getDashboardOrders.useQuery();
  const { data: databaseChats, refetch: refetchChats } =
    api.chat.getAllMessages.useQuery();

  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState(0);
  const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(0);

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
      className="baseFlex sticky left-0 top-0 z-50 h-24 w-full bg-offwhite p-2 shadow-md"
    >
      <div className="baseFlex w-full !justify-between gap-4">
        {/* currently selected page title */}
        <p className="ml-2 text-lg font-semibold">
          {viewState === "orderManagement" && "Order management"}
          {viewState === "customerChats" && "Customer chats"}
          {viewState === "itemManagement" && "Item management"}
          {viewState === "refunds" && "Refunds"}
          {viewState === "stats" && "Stats"}
          {viewState === "reviews" && "Customer reviews"}
          {viewState === "hoursOfOperation" && "Hours of operation"}
          {viewState === "holidays" && "Holidays"}
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
                  Order management
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
                className="text-lg"
                onClick={() => {
                  setViewState("itemManagement");
                  setSheetIsOpen(false);
                }}
              >
                Item management
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
                variant={viewState === "reviews" ? "activeLink" : "link"}
                className="text-lg"
                onClick={() => {
                  setViewState("reviews");
                  setSheetIsOpen(false);
                }}
              >
                Reviews
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
                Hours of operation
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
    </nav>
  );
}

export default DashboardMobileHeader;
