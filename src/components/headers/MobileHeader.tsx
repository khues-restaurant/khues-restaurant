import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { SlPresent } from "react-icons/sl";
import { TfiReceipt } from "react-icons/tfi";
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

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { resetStore } = useMainStore((state) => ({
    resetStore: state.resetStore,
  }));

  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setSheetIsOpen(false);
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
      <Link
        href={"/"}
        className="baseFlex h-12 pl-2 transition-[filter] hover:brightness-[1.05] active:brightness-[0.95]"
      >
        <Image
          src="/logo.svg"
          alt="Khue's header logo"
          width={50}
          height={50}
          priority
          className="!size-[50px]"
        />
      </Link>

      <div className="baseFlex gap-4">
        <CartButton />

        <Sheet open={sheetIsOpen} onOpenChange={(open) => setSheetIsOpen(open)}>
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
            <div className="baseVertFlex !justify-start gap-4 overflow-y-scroll pt-12">
              {!isSignedIn && (
                <div className="baseFlex gap-4">
                  {/* how to maybe get colors to match theme + also have an option to specify username? */}
                  <SignUpButton mode="modal">
                    <Button
                      className="px-8"
                      onClick={() => {
                        setSheetIsOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button
                      variant={"secondary"}
                      onClick={() => {
                        setSheetIsOpen(false);
                      }}
                    >
                      Sign in
                    </Button>
                  </SignInButton>
                </div>
              )}

              {isSignedIn && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="baseFlex gap-4 py-2 text-xl font-semibold text-primary !no-underline">
                      <FaUserAlt className="!rotate-0" />
                      {user?.firstName}
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
                      Order now
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={linkVariants}>
                  <Button variant={"link"} asChild>
                    <a
                      href={"/resylink"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xl"
                    >
                      Reservations
                    </a>
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
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="baseFlex py-2 text-xl text-primary !no-underline">
                        Hours & Location
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="baseVertFlex !items-start gap-8 rounded-md border bg-offwhite p-4 shadow-sm">
                          <div className="baseVertFlex w-full !items-start gap-2">
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
                                <p>Closed</p>
                                <p>3PM - 10PM</p>
                                <p>3PM - 10PM</p>
                                <p>3PM - 10PM</p>
                                <p>3PM - 10PM</p>
                                <p>3PM - 10PM</p>
                                <p>Closed</p>
                              </div>
                            </div>
                            {/* any special hours for holidays would go here */}
                          </div>

                          <Separator className="w-4/5 self-center" />

                          <div className="baseVertFlex relative !items-start gap-4">
                            <div className="baseVertFlex !items-start gap-2">
                              <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                                <TbLocation />
                                Location
                              </div>
                              <p>
                                We are located just outside of the HarMar Mall
                                in Roseville, Minnesota.
                              </p>

                              <div className="baseFlex gap-2">
                                <TbLocation className="size-6 text-primary sm:size-4" />

                                <a
                                  href="https://facebook.com"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary"
                                >
                                  1234 Lorem Ipsum Dr. Roseville, MN 12345
                                </a>
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
