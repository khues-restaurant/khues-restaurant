import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { FaFacebook } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";
import { Clock, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import StaticLotus from "~/components/ui/StaticLotus";
import { useToast } from "~/components/ui/use-toast";
import { getWeeklyHours } from "~/utils/dateHelpers/datesAndHoursOfOperation";

import { Noto_Sans } from "next/font/google";
const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

import { STIX_Two_Text } from "next/font/google";
const stix = STIX_Two_Text({
  subsets: ["latin"],
});

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import outsideOfRestaurant from "/public/exterior/one.jpg";

const linkContainer = {
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.09,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: 25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

function MobileHeader() {
  const { asPath, events } = useRouter();

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
      className="baseFlex sticky left-0 top-0 z-50 h-20 w-full !justify-between bg-offwhite p-2 shadow-md"
    >
      <Button variant="text" asChild>
        <Link prefetch={false} href={"/"} className={`ml-3 !px-0 !py-8`}>
          <div className="baseVertFlex gap-0">
            <StaticLotus className="size-10 fill-primary" />

            <p className={`${stix.className} text-lg leading-4 text-black`}>
              KHUE&apos;S
            </p>
          </div>
        </Link>
      </Button>

      <div className="baseFlex gap-4">
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
          <SheetContent
            className={`${charis.className} baseVertFlex !h-dvh !justify-between gap-0 !overflow-auto p-6 pb-4`}
          >
            <VisuallyHidden>
              <DialogTitle>Navigation menu</DialogTitle>
              <DialogDescription>Our navigation menu</DialogDescription>
            </VisuallyHidden>

            <div className="baseVertFlex w-full !justify-start gap-2 overflow-y-auto">
              <motion.div
                variants={linkContainer}
                initial="hidden"
                animate="visible"
                className="baseVertFlex  w-full !justify-start gap-4 overflow-x-hidden pt-12"
              >
                <motion.div variants={linkVariants}>
                  <Button
                    variant={asPath.includes("/menu") ? "activeLink" : "link"}
                    asChild
                    className="mt-2"
                  >
                    <Link prefetch={false} href={"/menu"} className="!text-xl">
                      Menu
                    </Link>
                  </Button>
                </motion.div>

                {/* <motion.div variants={linkVariants}>
                  <Button
                    variant={asPath.includes("/order") ? "activeLink" : "link"}
                    asChild
                  >
                    <Link prefetch={false} href={"/order"} className="!text-xl">
                      Order
                    </Link>
                  </Button>
                </motion.div> */}

                <motion.div variants={linkVariants}>
                  <Button
                    variant={
                      asPath.includes("/reservations") ? "activeLink" : "link"
                    }
                    asChild
                  >
                    <a
                      href="https://tables.toasttab.com/restaurants/85812ed5-ec36-4179-a993-a278cfcbbc55/findTime"
                      className="!text-xl"
                    >
                      Reservations
                    </a>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants}>
                  <Button
                    variant={asPath.includes("/media") ? "activeLink" : "link"}
                    asChild
                  >
                    <Link prefetch={false} href={"/media"} className="!text-xl">
                      Media
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants} className="mb-auto w-full">
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
                      <AccordionContent
                        className={`${notoSans.className} pr-1 pt-2`}
                      >
                        <div className="baseVertFlex !items-start gap-8 rounded-md border bg-offwhite p-4 shadow-sm">
                          <div className="baseVertFlex !items-start gap-4">
                            <div className="baseFlex gap-2 text-lg font-semibold">
                              <Clock className="size-5" />
                              Hours
                            </div>
                            <div className="grid grid-cols-2 pr-4">
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

                            {/* <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant={"underline"}
                                  className="!self-center"
                                >
                                  Holiday hours
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <VisuallyHidden>
                                  <DialogTitle>Holiday hours</DialogTitle>
                                  <DialogDescription>
                                    Our holiday hours
                                  </DialogDescription>
                                </VisuallyHidden>

                                <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
                                <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

                                <div className="baseVertFlex h-full w-full !items-start gap-4">
                                  <div className="baseVertFlex w-full !items-start gap-2">
                                    <div className="baseFlex w-full !justify-start gap-2">
                                      <CiCalendarDate className="size-6 stroke-[0.25px]" />
                                      <p className="text-lg font-medium">
                                        Our holiday hours
                                      </p>
                                    </div>

                                    <Separator className="h-[1px] w-full" />
                                  </div>

                                  <div className="baseVertFlex !items-start gap-2 text-sm sm:text-base">
                                    <p className="font-medium underline underline-offset-2">
                                      Thanksgiving
                                    </p>
                                    <p>
                                      We are closed from Thursday, November 25th
                                      to Saturday, November 27th.
                                    </p>
                                  </div>

                                  <div className="baseVertFlex !items-start gap-2 text-sm sm:text-base">
                                    <p className="font-medium underline underline-offset-2">
                                      Christmas
                                    </p>
                                    <p>
                                      We are closed from Friday, December 24th
                                      to Sunday, December 26th.
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <p className=" text-center text-xs italic text-stone-400">
                              * Pickup orders must be placed at least 30 minutes
                              before closing.
                            </p> */}
                          </div>

                          <Separator className="w-4/5 self-center" />

                          <div className="baseVertFlex relative w-full !items-start gap-4">
                            <div className="baseVertFlex !items-start gap-4">
                              <div className="baseFlex gap-2 text-lg font-semibold">
                                <MapPin className="size-[22px]" />
                                Location
                              </div>
                              <p className="w-[55vw] sm:w-auto">
                                Close to University Avenue and the Raymond
                                Avenue Green Line Station, our restaurant is
                                well-connected to Minneapolis and downtown Saint
                                Paul. We offer a small on-site parking lot, with
                                additional street parking nearby.
                              </p>

                              <div className="baseFlex gap-2">
                                <MapPin className="size-5 shrink-0 text-primary" />

                                <Button
                                  variant={"link"}
                                  className="h-12 !rounded-t-none !p-0 xs:h-8"
                                  asChild
                                >
                                  <a
                                    href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="my-2 whitespace-normal text-primary supports-[text-wrap]:text-wrap"
                                  >
                                    693 Raymond Ave, St. Paul, MN 55114
                                  </a>
                                </Button>
                              </div>
                            </div>

                            <Image
                              src={outsideOfRestaurant}
                              alt={
                                "Interior view of Khue's, located on 693 Raymond Ave in St. Paul, MN"
                              }
                              sizes="(max-width: 640px) 60vw, 700px"
                              className="!relative !h-72 !w-full rounded-md object-cover shadow-sm"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              </motion.div>
            </div>

            <motion.div variants={linkVariants} className="relative bottom-0">
              <Separator className="mb-4 w-full" />

              <div className="baseFlex gap-2">
                <Button variant="ghost" asChild>
                  <a
                    aria-label="Visit our Instagram page"
                    href="https://www.instagram.com/khueskitchen/"
                  >
                    <IoLogoInstagram className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
                  </a>
                </Button>

                <Button variant="ghost" asChild>
                  <a
                    aria-label="Visit our Facebook page"
                    href="https://www.facebook.com/khueskitchen/"
                  >
                    <FaFacebook className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
                  </a>
                </Button>

                <Button variant="ghost" asChild>
                  <a
                    aria-label="Visit our Tiktok page"
                    href="https://www.tiktok.com/@khues_kitchen"
                  >
                    <SiTiktok className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default MobileHeader;
