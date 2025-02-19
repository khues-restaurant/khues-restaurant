import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { IoMdMore } from "react-icons/io";
import { MdAccessTime } from "react-icons/md";
import { TbLocation } from "react-icons/tb";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";
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

import StaticLotus from "~/components/ui/StaticLotus";
import outsideOfRestaurant from "/public/exterior/one.webp";

function DesktopHeader() {
  const { asPath } = useRouter();
  const [showSmallViewportPopoverLinks, setShowSmallViewportPopoverLinks] =
    useState(false);

  return (
    <nav
      id="header"
      className={`${classes.desktopHeader} sticky left-0 top-0 z-50 grid h-28 w-full bg-offwhite shadow-md
      `}
    >
      <Button variant="text" asChild>
        <Link
          href={"/"}
          className={`${classes.logo ?? ""} mr-4 !size-[55px] justify-self-start !p-0`}
        >
          {/* <p className="text-3xl font-semibold text-primary">Khue&apos;s</p> */}
          <Image
            src={"/logos/logo.svg"}
            alt={"Khue's logo"}
            priority
            width={55}
            height={55}
            className="!size-[55px]"
          />
        </Link>
      </Button>

      <div
        className={`${classes.mainLinks} baseFlex w-full !justify-start gap-2 2xl:gap-4`}
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
          <Link
            href={"/reservations"}
            className="block !text-xl smallDesktopHeader:hidden"
          >
            Reservations
          </Link>
        </Button>

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
              <div className="baseVertFlex w-max !items-start gap-2">
                <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                  <MdAccessTime />
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

                <Dialog>
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
                  <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                    <TbLocation />
                    Location
                  </div>
                  <p className="w-[536px]">
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
                  alt={
                    "Exterior view of Khue's, located on 799 University Ave W in St. Paul, MN"
                  }
                  sizes="550px"
                  className="!relative !h-64 !w-full rounded-md object-cover shadow-md"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="baseFlex gap-2">
          <Button variant="ghost" asChild>
            <a aria-label="Visit our Tiktok page" href="https://instagram.com">
              <SiTiktok className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a
              aria-label="Visit our Instagram page"
              href="https://instagram.com"
            >
              <IoLogoInstagram className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a aria-label="Visit our Facebook page" href="https://facebook.com">
              <FaFacebook className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a aria-label="Visit our Twitter page" href="https://twitter.com">
              <FaXTwitter className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default DesktopHeader;
