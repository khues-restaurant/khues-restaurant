import { useAuth, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { SlPresent } from "react-icons/sl";
import { TfiReceipt } from "react-icons/tfi";
import { CiCalendarDate } from "react-icons/ci";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import CartButton from "~/components/cart/CartButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { TbLocation } from "react-icons/tb";
import { motion } from "framer-motion";

import outsideOfRestaurant from "/public/homepage/heroTwo.webp";
import { useToast } from "~/components/ui/use-toast";
import { getWeeklyHours } from "~/utils/dateHelpers/datesAndHoursOfOperation";

const linkContainer = {
  visible: {
    transition: {
      delayChildren: 0.25,
      staggerChildren: 0.1,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: 25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

function MobileHeader() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const userId = useGetUserId();
  const { asPath, events } = useRouter();
  const { openSignUp, openSignIn } = useClerk();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { resetStore } = useMainStore((state) => ({
    resetStore: state.resetStore,
  }));

  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  const [hoursAndLocationAccordionOpen, setHoursAndLocationAccordionOpen] =
    useState(false);
  const hoursAndLocationAccordionRef = useRef<HTMLDivElement>(null);

  const { dismiss: dismissToasts } = useToast();

  useEffect(() => {
    const handleRouteChange = () => {
      setSheetIsOpen(false);

      setTimeout(() => {
        setHoursAndLocationAccordionOpen(false);
      }, 275);
    };

    events.on("routeChangeStart", handleRouteChange);

    return () => {
      events.off("routeChangeStart", handleRouteChange);
    };
  }, [events]);

  return (
    <nav
      id="header"
      className="baseFlex fixed left-0 top-0 z-50 h-24 w-full !justify-between bg-offwhite p-2 shadow-md"
    >
      <Button variant="text" asChild>
        <Link href={"/"}>
          {/* <p className="text-2xl font-semibold text-primary">Khue&apos;s</p> */}
          <Image
            src={"/logo.svg"}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            width={45}
            height={45}
            className="!size-[45px]"
          />
        </Link>
      </Button>

      <div className="baseFlex gap-4">
        <CartButton />

        <Sheet
          open={sheetIsOpen}
          onOpenChange={(open) => {
            setSheetIsOpen(open);

            if (open === true) {
              dismissToasts();
            }

            if (open === false) {
              setTimeout(() => {
                setHoursAndLocationAccordionOpen(false);
              }, 275);
            }
          }}
        >
          <SheetTrigger asChild>
            <Button variant="ghost" size={"icon"} className="relative mx-2">
              <span
                aria-hidden="true"
                className="absolute top-[12px] block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
              ></span>
              <span
                aria-hidden="true"
                className="absolute block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
              ></span>
              <span
                aria-hidden="true"
                className="absolute top-[26px] block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
              ></span>
            </Button>
          </SheetTrigger>
          <SheetContent className="!h-dvh !overflow-auto p-6">
            <div className="baseVertFlex !justify-start gap-4 overflow-y-auto pt-12">
              {!isSignedIn && (
                <div className="baseFlex gap-4">
                  <Button
                    className="px-8"
                    onClick={() => {
                      setSheetIsOpen(false);

                      setTimeout(() => {
                        setHoursAndLocationAccordionOpen(false);
                      }, 275);

                      // overflow: hidden would stay stuck on <body>
                      // unless we wait for the sheet to fully close first
                      setTimeout(() => {
                        openSignUp();
                      }, 350);
                    }}
                  >
                    Sign up
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setSheetIsOpen(false);

                      setTimeout(() => {
                        setHoursAndLocationAccordionOpen(false);
                      }, 275);

                      // overflow: hidden would stay stuck on <body>
                      // unless we wait for the sheet to fully close first
                      setTimeout(() => {
                        openSignIn();
                      }, 350);
                    }}
                  >
                    Sign in
                  </Button>
                </div>
              )}

              {isSignedIn && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="baseFlex gap-4 py-2 text-xl font-semibold text-primary !no-underline">
                      <FaUserAlt className="!rotate-0" />
                      <span className="max-w-[60%] truncate">
                        {user?.firstName}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-2">
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
                            className="baseFlex w-52 !justify-between !text-lg"
                          >
                            Preferences
                            <IoSettingsOutline />
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
                            className="baseFlex w-52 !justify-between !text-lg"
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
                            className="baseFlex w-52 !justify-between !text-lg"
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <Separator className="mt-2 w-4/5 self-center bg-stone-300" />

              <motion.div
                variants={linkContainer}
                initial="hidden"
                animate="visible"
                className="baseVertFlex w-full gap-4 overflow-x-hidden"
              >
                <motion.div variants={linkVariants}>
                  <Button
                    variant={asPath.includes("/menu") ? "activeLink" : "link"}
                    asChild
                  >
                    <Link href={"/menu"} className="!text-xl">
                      Menu
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants}>
                  <Button
                    variant={asPath.includes("/order") ? "activeLink" : "link"}
                    asChild
                  >
                    <Link href={"/order"} className="!text-xl">
                      Order
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants}>
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
                </motion.div>
                {isLoaded && !isSignedIn && (
                  <motion.div variants={linkVariants}>
                    <Button
                      variant={
                        asPath.includes("/rewards") ? "activeLink" : "link"
                      }
                      asChild
                    >
                      <Link href={"/rewards"} className="!text-xl">
                        Rewards
                      </Link>
                    </Button>
                  </motion.div>
                )}

                <motion.div variants={linkVariants}>
                  <Button
                    variant={
                      asPath.includes("/our-story") ? "activeLink" : "link"
                    }
                    asChild
                  >
                    <Link href={"/our-story"} className="!text-xl">
                      Our story
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants}>
                  <Button
                    variant={asPath.includes("/media") ? "activeLink" : "link"}
                    asChild
                  >
                    <Link href={"/media"} className="!text-xl">
                      Media
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants} className="w-full">
                  <Accordion
                    value={hoursAndLocationAccordionOpen ? "item-1" : ""}
                    onValueChange={(value) => {
                      setHoursAndLocationAccordionOpen(value === "item-1");
                    }}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem
                      ref={hoursAndLocationAccordionRef}
                      value="item-1"
                      className="scroll-m-4 border-none"
                      onClick={() => {
                        if (hoursAndLocationAccordionOpen) return;

                        setTimeout(() => {
                          hoursAndLocationAccordionRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }, 275);
                      }}
                    >
                      <AccordionTrigger className="baseFlex py-2 text-xl text-primary !no-underline">
                        Hours & Location
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="baseVertFlex !items-start gap-8 rounded-md border bg-offwhite p-4 shadow-sm">
                          <div className="baseVertFlex w-full !items-start gap-4">
                            <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                              <MdAccessTime />
                              Hours
                            </div>
                            <div className="grid w-full max-w-[250px] grid-cols-2">
                              <div className="baseVertFlex w-full !items-start">
                                <p>Monday</p>
                                <p>Tuesday</p>
                                <p>Wednesday</p>
                                <p>Thursday</p>
                                <p>Friday</p>
                                <p>Saturday</p>
                                <p>Sunday</p>
                              </div>
                              <div className="baseVertFlex w-full !items-start">
                                {getWeeklyHours()}
                              </div>
                            </div>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant={"underline"}
                                  className=" !self-center"
                                >
                                  Holiday hours
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <div className="baseVertFlex !items-start gap-4">
                                  <div className="baseFlex mb-2 gap-2">
                                    <CiCalendarDate className="size-6" />
                                    <p className="text-lg font-medium">
                                      Our holiday hours
                                    </p>
                                  </div>

                                  <p className="font-medium underline underline-offset-2">
                                    Thanksgiving
                                  </p>
                                  <p>
                                    We are closed from Thursday, November 25th
                                    to Saturday, November 27th.
                                  </p>

                                  <p className="font-medium underline underline-offset-2">
                                    Christmas
                                  </p>
                                  <p>
                                    We are closed from Friday, December 24th to
                                    Sunday, December 26th.
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <p className=" text-center text-xs italic text-stone-400">
                              * Pickup orders must be placed at least 30 minutes
                              before closing.
                            </p>
                          </div>

                          <Separator className="w-4/5 self-center" />

                          <div className="baseVertFlex relative w-full !items-start gap-4">
                            <div className="baseVertFlex !items-start gap-4">
                              <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                                <TbLocation />
                                Location
                              </div>
                              <p className="w-[55vw] sm:w-auto">
                                We are conveniently located next to the Green
                                Line light rail, offering easy access for all
                                visitors. Parking space is also available for
                                your convenience.
                              </p>

                              <div className="baseFlex gap-2">
                                <TbLocation className="size-6 text-primary sm:size-4" />

                                <Button
                                  variant={"link"}
                                  className="h-12 !rounded-t-none !p-0 xs:h-8"
                                  asChild
                                >
                                  <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="my-2 text-wrap text-primary"
                                  >
                                    799 University Ave W, St Paul, MN 55104
                                  </a>
                                </Button>
                              </div>
                            </div>

                            <Image
                              src={outsideOfRestaurant}
                              alt={"TODO: fill in w/ appropriate alt text"}
                              sizes="(max-width: 640px) 60vw, 700px"
                              className="!relative !h-48 !w-full rounded-md object-cover shadow-sm"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              </motion.div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default MobileHeader;
