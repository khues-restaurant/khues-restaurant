import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
// import { useLocalStorageValue } from "@react-hookz/web";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaGuitar, FaMapSigns } from "react-icons/fa";
import { IoSettingsOutline, IoTelescopeOutline } from "react-icons/io5";
// import { useTabStore } from "~/stores/TabStore";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";
import { MdAccessTime } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { FaUserAlt } from "react-icons/fa";
import { SlPresent } from "react-icons/sl";
import { TfiReceipt } from "react-icons/tfi";
import useGetUserId from "~/hooks/useGetUserId";
import CartButton from "~/components/cart/CartButton";

function MobileHeader() {
  const [mobileHeaderIsOpen, setMobileHeaderIsOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const userId = useGetUserId();
  const { asPath, events } = useRouter();

  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  // const localStorageTabData = useLocalStorageValue("tabData");
  // const localStorageRedirectRoute = useLocalStorageValue("redirectRoute");

  // const { getStringifiedTabData, mobileHeaderModal, setMobileHeaderModal } =
  //   useTabStore((state) => ({
  //     getStringifiedTabData: state.getStringifiedTabData,
  //     mobileHeaderModal: state.mobileHeaderModal,
  //     setMobileHeaderModal: state.setMobileHeaderModal,
  //   }));

  // useEffect(() => {
  //   if (!mobileHeaderModal.showing) {
  //     setMobileHeaderIsOpen(false);
  //   }
  // }, [mobileHeaderModal]);

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
      className="baseFlex fixed left-0 top-0 z-50 h-24 w-full !justify-between bg-white p-2 shadow-md"
    >
      <Link
        href={"/"}
        className="baseFlex h-12 pl-2 transition-[filter] hover:brightness-[1.05] active:brightness-[0.95]"
      >
        <Image
          src="/logo.webp"
          alt="Khue's header logo"
          style={{
            filter: "drop-shadow(0px 1px 0.5px hsla(336, 84%, 17%, 0.25))", // keep this?
          }}
          width={100}
          height={50}
          priority
        />
      </Link>

      <div className="baseFlex gap-4">
        <CartButton />

        <Sheet open={sheetIsOpen} onOpenChange={(open) => setSheetIsOpen(open)}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="relative mr-2"
              // TODO: come back to trying to get this to stay on top of <Sheet> component.
              // maybe have to use portals?
            >
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
            </Button>
          </SheetTrigger>
          <SheetContent className="!h-dvh !overflow-auto p-6">
            <div className="baseVertFlex !justify-start gap-4 overflow-y-scroll pt-12">
              {!isSignedIn && (
                <div className="baseFlex gap-4">
                  {/* how to maybe get colors to match theme + also have an option to specify username? */}
                  <SignUpButton
                    mode="modal"
                    afterSignUpUrl={`${
                      process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                    }/postSignUpRegistration`}
                    afterSignInUrl={`${
                      process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                    }${asPath}`}
                  >
                    <Button
                    // size={"lg"}
                    // onClick={() => {
                    //   if (asPath.includes("/create")) {
                    //     localStorageTabData.set(getStringifiedTabData());
                    //   }

                    //   // technically can sign in from signup page and vice versa
                    //   if (!userId) localStorageRedirectRoute.set(asPath);
                    //   // ^^ but technically could just append it onto the postSignupRegistration route right?
                    // }}
                    >
                      Sign up
                    </Button>
                  </SignUpButton>
                  <SignInButton
                    mode="modal"
                    afterSignUpUrl={`${
                      process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                    }/postSignUpRegistration`}
                    afterSignInUrl={`${
                      process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                    }${asPath}`}
                  >
                    <Button
                      variant={"secondary"}
                      // className="h-11"
                      // onClick={() => {
                      //   if (asPath.includes("/create")) {
                      //     localStorageTabData.set(getStringifiedTabData());
                      //   }

                      //   // technically can sign in from signup page and vice versa
                      //   if (!userId) localStorageRedirectRoute.set(asPath);
                      //   // ^^ but technically could just append it onto the postSignupRegistration route right?
                      // }}
                    >
                      Sign in
                    </Button>
                  </SignInButton>
                </div>
              )}

              {isSignedIn && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    {/* maybe need specific variant or just some custom code here to  */}
                    <AccordionTrigger className="baseFlex gap-2 py-2 text-xl text-primary !no-underline">
                      <FaUserAlt className="!rotate-0" />
                      Firstname
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="baseVertFlex gap-2">
                        <Button
                          variant={"link"}
                          asChild
                          style={{
                            backgroundColor: asPath.includes("/explore")
                              ? "#be185d"
                              : undefined,
                            color: asPath.includes("/explore")
                              ? "#fbcfe8"
                              : undefined,
                          }}
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
                          variant={"link"}
                          asChild
                          style={{
                            backgroundColor: asPath.includes("/explore")
                              ? "#be185d"
                              : undefined,
                            color: asPath.includes("/explore")
                              ? "#fbcfe8"
                              : undefined,
                          }}
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
                          variant={"link"}
                          asChild
                          style={{
                            backgroundColor: asPath.includes("/explore")
                              ? "#be185d"
                              : undefined,
                            color: asPath.includes("/explore")
                              ? "#fbcfe8"
                              : undefined,
                          }}
                        >
                          <Link
                            href={"/profile/recent-orders"}
                            className="baseFlex w-full !justify-between !text-lg"
                          >
                            Recent orders
                            <TfiReceipt />
                          </Link>
                        </Button>

                        <SignOutButton>
                          <Button variant={"link"}>Log out</Button>
                        </SignOutButton>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <Separator className="mt-2 w-4/5 self-center" />

              <Button
                variant={"link"}
                asChild
                style={{
                  backgroundColor: asPath.includes("/explore")
                    ? "#be185d"
                    : undefined,
                  color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
                }}
              >
                <Link href={"/menu"} className="!text-xl">
                  Menu
                </Link>
              </Button>

              <Button
                variant={"link"}
                asChild
                style={{
                  backgroundColor: asPath.includes("/explore")
                    ? "#be185d"
                    : undefined,
                  color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
                }}
              >
                <Link href={"/order-now"} className="!text-xl">
                  Order now
                </Link>
              </Button>

              <Button
                variant={"link"}
                asChild
                style={{
                  backgroundColor: asPath.includes("/explore")
                    ? "#be185d"
                    : undefined,
                  color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
                }}
              >
                <a
                  href={"/resylink"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xl"
                >
                  Reservations
                </a>
              </Button>

              <Button
                variant={"link"}
                asChild
                style={{
                  backgroundColor: asPath.includes("/explore")
                    ? "#be185d"
                    : undefined,
                  color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
                }}
              >
                <Link href={"/rewards"} className="!text-xl">
                  Rewards
                </Link>
              </Button>

              <Button
                variant={"link"}
                asChild
                style={{
                  backgroundColor: asPath.includes("/explore")
                    ? "#be185d"
                    : undefined,
                  color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
                }}
              >
                <Link href={"/our-story"} className="!text-xl">
                  Our story
                </Link>
              </Button>

              <Button
                variant={"link"}
                asChild
                style={{
                  backgroundColor: asPath.includes("/explore")
                    ? "#be185d"
                    : undefined,
                  color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
                }}
              >
                <Link href={"/media"} className="!text-xl">
                  Media
                </Link>
              </Button>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                  {/* maybe need specific variant or just some custom code here to  */}
                  <AccordionTrigger className="baseFlex py-2 text-xl text-primary !no-underline">
                    Hours & Location
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="baseVertFlex !items-start gap-8 rounded-md border bg-white p-4 shadow-sm">
                      <div className="baseVertFlex w-full !items-start gap-2">
                        <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                          <MdAccessTime />
                          Hours
                        </div>
                        <div className="grid w-full grid-cols-2">
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
                            <p>3pm-10pm</p>
                            <p>3pm-10pm</p>
                            <p>3pm-10pm</p>
                            <p>3pm-10pm</p>
                            <p>3pm-10pm</p>
                            <p>Closed</p>
                          </div>
                        </div>
                        {/* any special hours for holidays would go here */}
                      </div>

                      <Separator className="w-4/5 self-center" />

                      {/* maybe worthwhile to do textual introduction like "We are located just outside of the HarMar Mall in Roseville, Minnesota." */}
                      <div className="baseVertFlex !items-start">
                        <div className="baseVertFlex w-full !items-start gap-2">
                          <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                            <CiLocationOn />
                            Location
                          </div>
                          <p>
                            We are located just outside of the HarMar Mall in
                            Roseville, Minnesota.
                          </p>

                          <div className="baseFlex gap-2">
                            <FaMapSigns className="size-6" />
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

                        <div className="baseFlex imageFiller mt-4 h-48 w-full">
                          <div className="bg-white p-1">
                            image of outside of restaurant here
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default MobileHeader;
