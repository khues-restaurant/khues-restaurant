import { SignOutButton, useAuth } from "@clerk/nextjs";
// import { useLocalStorageValue } from "@react-hookz/web";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { useTabStore } from "~/stores/TabStore";
import { FaUserAlt } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import DelayNewOrders from "~/components/dashboard/DelayNewOrders";
// import DiscountManagement from "~/components/dashboard/DiscountManagement";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";

interface DashboardMobileHeader {
  viewState: "orderManagement" | "customerChats" | "itemManagement" | "stats";
  setViewState: Dispatch<
    SetStateAction<
      "orderManagement" | "customerChats" | "itemManagement" | "stats"
    >
  >;
}

function DashboardMobileHeader({
  viewState,
  setViewState,
}: DashboardMobileHeader) {
  const [mobileHeaderIsOpen, setDashboardMobileHeaderIsOpen] = useState(false);

  const { isSignedIn, signOut } = useAuth();
  const userId = useGetUserId();
  const { asPath, events, push } = useRouter();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  const { data: todaysOrders } = api.order.getTodaysOrders.useQuery();

  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState(0);

  useEffect(() => {
    if (!todaysOrders) return;

    const activeOrders = todaysOrders.filter(
      (order) => order.orderCompletedAt === null,
    );

    setNumberOfActiveOrders(activeOrders.length);
  }, [todaysOrders]);

  return (
    <nav
      id="header"
      className="baseFlex fixed left-0 top-0 z-50 h-24 w-full !justify-between bg-offwhite p-2 shadow-md"
    >
      <div className="baseFlex gap-4">
        <Image
          src="/logos/logo.svg"
          alt="Khue's header logo"
          style={{
            filter: "drop-shadow(0px 1px 0.5px hsla(336, 84%, 17%, 0.25))", // keep this?
          }}
          width={100}
          height={50}
          priority
        />

        <div className="baseFlex gap-2 text-primary">
          <LuLayoutDashboard className="size-6" />
          <p className="text-2xl">Dashboard</p>
        </div>
      </div>

      <div className="baseFlex gap-4">
        <Sheet open={sheetIsOpen} onOpenChange={(open) => setSheetIsOpen(open)}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="relative mr-2">
              {/* TODO: need to have the absolute combined chats + orders notification number here */}

              <span
                aria-hidden="true"
                style={
                  {
                    // rotate: sheetIsOpen ? "45deg" : "0",
                    // transform: sheetIsOpen
                    //   ? "translateY(-1.5px)"
                    //   : "translateY(0)",
                  }
                }
                className="absolute top-[12px] block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
              ></span>
              <span
                aria-hidden="true"
                style={
                  {
                    // opacity: sheetIsOpen ? "0" : "1",
                  }
                }
                className="absolute block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
              ></span>
              <span
                aria-hidden="true"
                style={
                  {
                    // rotate: sheetIsOpen ? "-45deg" : "0",
                    // transform: sheetIsOpen
                    //   ? "translateY(1.5px)"
                    //   : "translateY(0)",
                  }
                }
                className="absolute top-[26px] block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
              ></span>

              {/* TODO: combine numberOfActiveOrders with unreadMessages */}
              <div className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-offwhite">
                <AnimatedNumbers
                  value={numberOfActiveOrders}
                  fontSize={14}
                  padding={6}
                />
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent className="!h-dvh !overflow-auto p-6">
            <div className="baseVertFlex !justify-start gap-4 overflow-y-scroll pt-12">
              {isSignedIn && user && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    {/* maybe need specific variant or just some custom code here to  */}
                    <AccordionTrigger className="baseFlex gap-2 py-2 text-lg text-primary !no-underline">
                      <FaUserAlt className="!rotate-0" />
                      {user.firstName}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="baseVertFlex gap-2">
                        {user.email === "ericxpham@gmail.com" && (
                          <Button
                            variant={"link"}
                            onClick={() => setViewState("stats")}
                          >
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <Separator className="mt-2 w-4/5 self-center" />

              <div className="relative">
                <Button
                  variant={"link"}
                  className=" text-lg"
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
                  variant={"link"}
                  className="text-lg"
                  onClick={() => {
                    setViewState("customerChats");
                    setSheetIsOpen(false);
                  }}
                >
                  Customer chats
                </Button>

                {/* unreadMessages > 0 && */}
                {false && (
                  <div className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-offwhite">
                    <AnimatedNumbers
                      value={numberOfActiveOrders}
                      fontSize={14}
                      padding={6}
                    />
                  </div>
                )}
              </div>

              <Button
                variant={"link"}
                className="text-lg"
                onClick={() => {
                  setViewState("itemManagement");
                  setSheetIsOpen(false);
                }}
              >
                Item management
              </Button>

              <DelayNewOrders />

              {/* <DiscountManagement /> */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default DashboardMobileHeader;
