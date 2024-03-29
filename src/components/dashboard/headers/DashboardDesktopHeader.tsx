import { SignOutButton, useAuth } from "@clerk/nextjs";
// import { useLocalStorageValue } from "@react-hookz/web";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaUserAlt } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useState, type Dispatch, type SetStateAction, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";

import classes from "./DashboardDesktopHeader.module.css";
import DiscountManagement from "~/components/dashboard/DiscountManagement";
import DelayNewOrders from "~/components/dashboard/DelayNewOrders";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import { clearLocalStorage } from "~/utils/clearLocalStorage";

interface DashboardDesktopHeader {
  viewState: "orderManagement" | "customerChats" | "itemManagement" | "stats";
  setViewState: Dispatch<
    SetStateAction<
      "orderManagement" | "customerChats" | "itemManagement" | "stats"
    >
  >;
}

function DashboardDesktopHeader({
  viewState,
  setViewState,
}: DashboardDesktopHeader) {
  const { isSignedIn, signOut } = useAuth();
  const { asPath, push } = useRouter();
  const userId = useGetUserId();

  const { data: user } = api.user.get.useQuery(userId);

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
      className={`${classes.desktopHeader} fixed left-0 top-0 z-50 grid h-32 w-full grid-cols-1 grid-rows-1 bg-white shadow-md`}
    >
      <div className={`${classes.logo} baseFlex gap-4`}>
        <Image
          src="/logo.webp"
          alt="Khue's header logo"
          style={{
            filter: "drop-shadow(0px 1px 0.5px hsla(336, 84%, 17%, 0.25))", // keep this?
          }}
          width={200}
          height={185}
          priority
        />

        <div className="baseFlex gap-2 text-primary">
          <LuLayoutDashboard className="size-6" />
          <p className="text-2xl">Dashboard</p>
        </div>
      </div>

      <div className={`${classes.mainLinks} baseFlex gap-2`}>
        <div className="relative">
          <Button
            variant={"link"}
            className="text-xl"
            onClick={() => setViewState("orderManagement")}
          >
            Order management
          </Button>

          {/* notification count */}
          {numberOfActiveOrders > 0 && (
            <div className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-white">
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
            className="text-xl"
            onClick={() => setViewState("customerChats")}
          >
            Customer chats
          </Button>

          {/* unreadMessages > 0 && */}
          {false && (
            <div className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-white">
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
          className="text-xl"
          onClick={() => setViewState("itemManagement")}
        >
          Item management
        </Button>

        <DelayNewOrders />

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
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* order icon and auth buttons/user icon */}
      <div className={`${classes.authentication} baseFlex gap-4`}>
        {isSignedIn && user && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="baseFlex gap-2">
                <FaUserAlt />
                {user.firstName}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end">
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
            </PopoverContent>
          </Popover>
        )}
      </div>
    </nav>
  );
}

export default DashboardDesktopHeader;
