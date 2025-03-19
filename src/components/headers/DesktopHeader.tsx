import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CartButton from "~/components/cart/CartButton";
import { CiCalendarDate } from "react-icons/ci";
import { Clock, MapPin } from "lucide-react";
import { SlPresent } from "react-icons/sl";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { IoMdMore } from "react-icons/io";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { getWeeklyHours } from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { Button } from "../ui/button";
import classes from "./DesktopHeader.module.css";
import { STIX_Two_Text } from "next/font/google";
import { Charis_SIL } from "next/font/google";
import StaticLotus from "~/components/ui/StaticLotus";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { TfiReceipt } from "react-icons/tfi";
import { clearLocalStorage } from "~/utils/clearLocalStorage";

import outsideOfRestaurant from "/public/interior/ten.jpg";

const stix = STIX_Two_Text({
  subsets: ["latin"],
});

const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
      className={`${classes.desktopHeader} sticky left-0 top-0 z-50 grid h-24 w-full bg-offwhite shadow-md
      `}
    >
      <Button variant="text" asChild>
        <Link href={"/"} className={`${classes.logo ?? ""} mr-4 !px-0 !py-8`}>
          <div className="baseVertFlex gap-0">
            <StaticLotus className="size-10 fill-primary" />

            <p className={`${stix.className} text-lg leading-5 text-black`}>
              KHUE&apos;S
            </p>
          </div>
        </Link>
      </Button>

      <div
        className={`${classes.mainLinks} ${charis.className} baseFlex w-full !justify-start gap-2`}
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
          <a
            href="https://www.exploretock.com/khues-kitchen-at-midcity-kitchen-saint-paul"
            className="block !text-xl smallDesktopHeader:hidden"
          >
            Reservations
          </a>
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
          <Link href={"/our-story"} className="block !text-xl">
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
              <Button
                variant={
                  asPath.includes("/reservations") ? "activeLink" : "link"
                }
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
        className={`${classes.authentication} baseFlex relative gap-4 transition-all`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="mr-4 !flex-nowrap gap-2 text-primary smallDesktopHeader:mr-0"
            >
              <HiOutlineInformationCircle className="size-[17px]" />
              Hours & Location
            </Button>
          </DialogTrigger>
          <DialogContent extraBottomSpacer={false} className="max-w-[900px]">
            <VisuallyHidden>
              <DialogTitle>
                Hours of operation and location information
              </DialogTitle>
              <DialogDescription>
                Our hours of operation and location information
              </DialogDescription>
            </VisuallyHidden>

            <div className="baseFlex w-[850px] !items-start">
              <div className="baseVertFlex w-[273px] !items-start gap-2">
                <div className="baseFlex gap-2 text-lg font-semibold">
                  <Clock className="size-5" />
                  Hours
                </div>
                <div className="baseFlex mt-1 w-full">
                  <div className="baseVertFlex w-full !items-start gap-2">
                    <p>Monday</p>
                    <p>Tuesday</p>
                    <p>Wednesday</p>
                    <p>Thursday</p>
                    <p>Friday</p>
                    <p>Saturday</p>
                    <p>Sunday</p>
                  </div>
                  <div className="baseVertFlex w-full !items-start gap-2 pr-4">
                    {getWeeklyHours()}
                  </div>
                </div>

                {/* <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={"underline"} className="mt-2 !self-center">
                      Holiday hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <VisuallyHidden>
                      <DialogTitle>Holiday hours</DialogTitle>
                      <DialogDescription>Our holiday hours</DialogDescription>
                    </VisuallyHidden>
                    <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
                    <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

                    <div className="baseVertFlex w-full !items-start gap-4">
                      <div className="baseVertFlex w-full !items-start gap-2">
                        <div className="baseFlex w-full !justify-start gap-2">
                          <CiCalendarDate className="size-6 stroke-[0.25px]" />
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
                 */}

                <p className="mt-2 w-[273px] text-center text-sm italic text-stone-400">
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
                  <div className="baseFlex gap-2 text-lg font-semibold">
                    <MapPin className="size-5" />
                    Location
                  </div>
                  <p className="w-[536px]">
                    Close to University Avenue and the Raymond Avenue Green Line
                    Station, our restaurant is well-connected to Minneapolis and
                    downtown Saint Paul. We offer a small on-site parking lot,
                    with additional street parking nearby.
                  </p>

                  <div className="baseFlex gap-2">
                    <MapPin className="size-5 text-primary" />

                    <Button variant={"link"} className="h-8 !p-0" asChild>
                      <a
                        href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary"
                      >
                        693 Raymond Ave, St. Paul, MN 55114
                      </a>
                    </Button>
                  </div>
                </div>

                <Image
                  src={outsideOfRestaurant}
                  alt={
                    "Exterior view of Khue's, located on 799 University Ave W in St. Paul, MN"
                  }
                  sizes="550px"
                  className="!relative !h-52 !w-full rounded-md object-cover shadow-md"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className={`baseFlex ${numberOfItems > 9 ? "gap-8" : "gap-6"}`}>
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
                  <span className="max-w-[105px] truncate">
                    {user.firstName}
                  </span>
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
                      className="baseFlex w-48 !justify-start gap-4 !text-lg"
                    >
                      <IoSettingsOutline
                        className={`${asPath.includes("/profile/preferences") ? "[&>path]:stroke-[55px]" : "[&>path]:stroke-[40px]"}`}
                      />
                      Preferences
                    </Link>
                  </Button>
                  <Button
                    variant={
                      asPath.includes("/profile/rewards")
                        ? "activeLink"
                        : "link"
                    }
                    asChild
                  >
                    <Link
                      href={"/profile/rewards"}
                      className="baseFlex w-48 !justify-start gap-4 !text-lg"
                    >
                      <SlPresent
                        className={`${asPath.includes("/profile/rewards") ? "[&>path]:stroke-[30px]" : ""}`}
                      />
                      Rewards
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
                      className="baseFlex w-48 !justify-start gap-4 !text-lg"
                    >
                      <TfiReceipt
                        className={`${asPath.includes("/profile/my-orders") ? "[&>path]:stroke-[0.5px]" : ""}`}
                      />
                      My orders
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
      </div>
    </nav>
  );
}

export default DesktopHeader;
