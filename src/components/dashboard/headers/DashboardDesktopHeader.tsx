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

import { type Dispatch, type SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";
import { LuLayoutDashboard } from "react-icons/lu";
import classes from "./DashboardDesktopHeader.module.css";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

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
  const { isSignedIn } = useAuth();
  const { asPath } = useRouter();
  const userId = useGetUserId();

  const { data: user } = api.user.get.useQuery(userId);

  // const localStorageTabData = useLocalStorageValue("tabData");
  // const localStorageRedirectRoute = useLocalStorageValue("redirectRoute");

  // okay I want to not show rewards/auth buttons until user auth status is known,
  // however I *really* want to show the page as soon as possible, what options do I have here?

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
        <Button
          variant={"link"}
          className="relative text-xl"
          onClick={() => setViewState("orderManagement")}
        >
          Order management
        </Button>

        <Button
          variant={"link"}
          className="relative text-xl"
          onClick={() => setViewState("customerChats")}
        >
          Customer chats
        </Button>

        <Button
          variant={"link"}
          className="text-xl"
          onClick={() => setViewState("itemManagement")}
        >
          Item management
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"link"} className="text-xl">
              Delay new orders
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>Delay new orders</AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delay new orders?
            </AlertDialogDescription>

            {/* "Delay length: " and select w/ dropdown for times */}

            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="secondary">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button>Delay</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

                <SignOutButton>
                  <Button variant={"link"}>Log out</Button>
                </SignOutButton>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </nav>
  );
}

export default DashboardDesktopHeader;
