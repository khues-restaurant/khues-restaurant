import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { CiCalendarDate } from "react-icons/ci";
import { MdAccessTime } from "react-icons/md";
import { SlPresent } from "react-icons/sl";
import { TbLocation } from "react-icons/tb";
import { TfiReceipt } from "react-icons/tfi";
import CartButton from "~/components/cart/CartButton";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { Button } from "../ui/button";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { getWeeklyHours } from "~/utils/dateHelpers/datesAndHoursOfOperation";
import classes from "./DesktopHeader.module.css";

import outsideOfRestaurant from "/public/homepage/heroTwo.webp";

function DesktopHeader() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { asPath, events } = useRouter();
  const userId = useGetUserId();

  const { resetStore, orderDetails } = useMainStore((state) => ({
    resetStore: state.resetStore,
    orderDetails: state.orderDetails,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const [showSmallViewportPopoverLinks, setShowSmallViewportPopoverLinks] =
    useState(false);
  const [showUserPopoverLinks, setShowUserPopoverLinks] = useState(false);
  const [numberOfItems, setNumberOfItems] = useState(0);

  useEffect(() => {
    // add up all the quantities of the items in the order
    let sum = 0;
    orderDetails.items.forEach((item) => {
      sum += item.quantity;
    });

    if (orderDetails.rewardBeingRedeemed) {
      sum++;
    }

    setNumberOfItems(sum);
  }, [orderDetails.items, orderDetails.rewardBeingRedeemed]);

  useEffect(() => {
    const handleRouteChange = () => {
      setShowUserPopoverLinks(false);
    };

    events.on("routeChangeStart", handleRouteChange);

    return () => {
      events.off("routeChangeStart", handleRouteChange);
    };
  }, [events]);

  return (
    <nav
      id="header"
      className={`${classes.desktopHeader} fixed left-0 top-0 z-50 grid h-28 w-screen bg-offwhite shadow-md
      `}
    >
      <Button variant="text" asChild>
        <Link
          href={"/"}
          className={`${classes.logo ?? ""} h-[55px] justify-self-start !p-0`}
        >
          {/* <p className="text-3xl font-semibold text-primary">Khue&apos;s</p> */}
          <Image
            src={"/logo.svg"}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            width={55}
            height={55}
            className="mr-4 !size-[55px]"
          />
        </Link>
      </Button>

      <div
        className={`${classes.mainLinks} baseFlex w-full !justify-start 2xl:gap-4`}
      >
        <Button
          variant={asPath.includes("/menu") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/menu"} className="!text-xl">
            Menu
          </Link>
        </Button>

        <Button
          variant={asPath.includes("/order") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/order"} className="!text-xl">
            Order
          </Link>
        </Button>

        <Button
          variant={asPath.includes("/reservations") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/reservations"} className="!text-xl">
            Reservations
          </Link>
        </Button>

        {isLoaded && !isSignedIn && (
          <Button
            variant={asPath.includes("/rewards") ? "activeLink" : "link"}
            asChild
          >
            <Link
              href={"/rewards"}
              className="block !text-xl smallDesktopHeader:hidden"
            >
              Rewards
            </Link>
          </Button>
        )}

        <Button
          variant={asPath.includes("/our-story") ? "activeLink" : "link"}
          asChild
        >
          <Link
            href={"/our-story"}
            className="block !text-xl smallDesktopHeader:hidden"
          >
            Our story
          </Link>
        </Button>

        <Button
          variant={asPath.includes("/media") ? "activeLink" : "link"}
          asChild
        >
          <Link
            href={"/media"}
            className="block !text-xl smallDesktopHeader:hidden"
          >
            Media
          </Link>
        </Button>

        <Popover
          open={showSmallViewportPopoverLinks}
          onOpenChange={(open) => setShowSmallViewportPopoverLinks(open)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size={"icon"}
              className="baseFlex !hidden gap-2 smallDesktopHeader:!flex"
            >
              <IoMdMore className="!hidden size-7 text-primary smallDesktopHeader:!flex" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-auto">
            <div className="baseVertFlex !items-start gap-2">
              {isLoaded && !isSignedIn && (
                <Button
                  variant={asPath.includes("/rewards") ? "activeLink" : "link"}
                  onClick={() => setShowSmallViewportPopoverLinks(false)}
                  asChild
                >
                  <Link href={"/rewards"} className="!text-xl">
                    Rewards
                  </Link>
                </Button>
              )}

              <Button
                variant={asPath.includes("/our-story") ? "activeLink" : "link"}
                onClick={() => setShowSmallViewportPopoverLinks(false)}
                asChild
              >
                <Link href={"/our-story"} className="!text-xl">
                  Our story
                </Link>
              </Button>

              <Button
                variant={asPath.includes("/media") ? "activeLink" : "link"}
                onClick={() => setShowSmallViewportPopoverLinks(false)}
                asChild
              >
                <Link href={"/media"} className="!text-xl">
                  Media
                </Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* order icon and auth buttons/user icon */}
      <div
        className={`${classes.authentication} baseFlex relative transition-all
        ${numberOfItems > 9 ? "gap-8" : "gap-4"}
      `}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="mr-4 !flex-nowrap gap-2 text-primary smallDesktopHeader:mr-0"
            >
              <HiOutlineInformationCircle className="size-4" />
              Hours & Location
            </Button>
          </DialogTrigger>
          <DialogContent extraBottomSpacer={false} className="max-w-[900px]">
            <div className="baseFlex w-[850px] !items-start">
              <div className="baseVertFlex w-64 !items-start gap-2">
                <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                  <MdAccessTime />
                  Hours
                </div>
                <div className="mt-1 grid w-full grid-cols-2">
                  <div className="baseVertFlex w-full !items-start gap-2">
                    <p>Monday</p>
                    <p>Tuesday</p>
                    <p>Wednesday</p>
                    <p>Thursday</p>
                    <p>Friday</p>
                    <p>Saturday</p>
                    <p>Sunday</p>
                  </div>
                  <div className="baseVertFlex w-full !items-start gap-2">
                    {getWeeklyHours()}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={"underline"} className="mt-2 !self-center">
                      Holiday hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="baseVertFlex w-full !items-start gap-4">
                      <div className="baseVertFlex w-full !items-start gap-2">
                        <div className="baseFlex w-full !justify-start gap-2">
                          <CiCalendarDate className="size-6" />
                          <p className="text-lg font-medium">
                            Our holiday hours
                          </p>
                        </div>

                        <Separator className="h-[1px] w-full" />
                      </div>

                      <div className="baseVertFlex !items-start gap-2">
                        <p className="font-medium underline underline-offset-2">
                          Thanksgiving
                        </p>
                        <p>
                          We are closed from Thursday, November 25th to
                          Saturday, November 27th.
                        </p>
                      </div>

                      <div className="baseVertFlex !items-start gap-2">
                        <p className="font-medium underline underline-offset-2">
                          Christmas
                        </p>
                        <p>
                          We are closed from Friday, December 24th to Sunday,
                          December 26th.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <p className="mt-2 text-center text-sm italic text-stone-400">
                  * Pickup orders must be placed at least 30 minutes before
                  closing.
                </p>
              </div>

              <Separator
                orientation="vertical"
                className="mx-4 h-4/5 self-center"
              />

              <div className="baseVertFlex relative ml-4 !items-start gap-4">
                <div className="baseVertFlex !items-start gap-2">
                  <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                    <TbLocation />
                    Location
                  </div>
                  <p className="w-[550px]">
                    We are conveniently located next to the Green Line light
                    rail, offering easy access for all visitors. Parking space
                    is also available for your convenience.
                  </p>

                  <div className="baseFlex gap-2">
                    <TbLocation className="text-primary" />

                    <Button variant={"link"} className="h-8 !p-0" asChild>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary"
                      >
                        799 University Ave W, St Paul, MN 55104
                      </a>
                    </Button>
                  </div>
                </div>

                <Image
                  src={outsideOfRestaurant}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  sizes="550px"
                  className="!relative !h-64 !w-full rounded-md object-cover shadow-md"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CartButton />

        {/* opting for double "&&" instead of ternary for better readability */}
        {!isSignedIn && (
          <div className={`${classes.authentication ?? ""} baseFlex gap-4`}>
            {/* how to maybe get colors to match theme + also have an option to specify username? */}
            <SignUpButton mode="modal">
              <Button className="px-8">Sign up</Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant={"outline"}>Sign in</Button>
            </SignInButton>
          </div>
        )}

        {isSignedIn && user && (
          <Popover
            open={showUserPopoverLinks}
            onOpenChange={(open) => {
              if (!open) setShowUserPopoverLinks(false);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="baseFlex gap-2"
                onClick={() => setShowUserPopoverLinks(true)}
              >
                <FaUserAlt />
                <span className="max-w-[105px] truncate">{user.firstName}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-64">
              <div className="baseVertFlex gap-2">
                <Button
                  variant={
                    asPath.includes("/profile/preferences")
                      ? "activeLink"
                      : "link"
                  }
                  asChild
                >
                  <Link
                    href={"/profile/preferences"}
                    className="baseFlex w-full !justify-between !text-lg"
                  >
                    Preferences
                    <IoSettingsOutline />
                  </Link>
                </Button>
                <Button
                  variant={
                    asPath.includes("/profile/rewards") ? "activeLink" : "link"
                  }
                  asChild
                >
                  <Link
                    href={"/profile/rewards"}
                    className="baseFlex w-full !justify-between !text-lg"
                  >
                    Rewards
                    <SlPresent />
                  </Link>
                </Button>
                <Button
                  variant={
                    asPath.includes("/profile/my-orders")
                      ? "activeLink"
                      : "link"
                  }
                  asChild
                >
                  <Link
                    href={"/profile/my-orders"}
                    className="baseFlex w-full !justify-between !text-lg"
                  >
                    My orders
                    <TfiReceipt />
                  </Link>
                </Button>

                <Button
                  variant={"link"}
                  className="mt-2 h-8"
                  onClick={async () => {
                    clearLocalStorage();
                    resetStore();
                    await signOut({ redirectUrl: "/" });
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

export default DesktopHeader;
