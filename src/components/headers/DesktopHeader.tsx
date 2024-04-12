import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { FaMapSigns, FaUserAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";
import { SlPresent } from "react-icons/sl";
import { TfiReceipt } from "react-icons/tfi";
import CartButton from "~/components/cart/CartButton";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { IoMdMore } from "react-icons/io";
import { Separator } from "~/components/ui/separator";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { Button } from "../ui/button";
import { FaMapPin } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { TbLocation } from "react-icons/tb";
import classes from "./DesktopHeader.module.css";

function DesktopHeader() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { asPath, push, events } = useRouter();
  const userId = useGetUserId();

  const { resetStore } = useMainStore((state) => ({
    resetStore: state.resetStore,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const [showUserPopoverLinks, setShowUserPopoverLinks] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setShowUserPopoverLinks(false);
    };

    events.on("routeChangeStart", handleRouteChange);

    return () => {
      events.off("routeChangeStart", handleRouteChange);
    };
  }, [events]);

  // okay I want to not show rewards/auth buttons until user auth status is known,
  // however I *really* want to show the page as soon as possible, what options do I have here?

  return (
    <nav
      id="header"
      className={`${classes.desktopHeader} fixed left-0 top-0 z-50 grid h-28 w-full grid-cols-1 grid-rows-1 bg-white shadow-md`}
    >
      <Link href={"/"} className={`${classes.logo ?? ""}`}>
        <Image
          src="/logo.svg"
          alt="Khue's header logo"
          width={65}
          height={65}
          priority
          className="!size-[65px]"
        />
      </Link>

      <div className={`${classes.mainLinks} baseFlex 2xl:gap-2`}>
        <Button
          variant={asPath.includes("/menu") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/menu"} className="!text-xl">
            Menu
          </Link>
        </Button>

        <Button
          variant={asPath.includes("/order-now") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/order-now"} className="!text-xl">
            Order now
          </Link>
        </Button>

        <Button variant={"link"} asChild>
          <a href={"/resylink"} className="!text-xl">
            Reservations
          </a>
        </Button>

        {isLoaded && !isSignedIn && (
          <Button
            variant={asPath.includes("/rewards") ? "activeLink" : "link"}
            asChild
          >
            <Link href={"/rewards"} className="hidden !text-xl 2xl:flex">
              Rewards
            </Link>
          </Button>
        )}

        <Button
          variant={asPath.includes("/our-story") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/our-story"} className="!text-xl">
            Our story
          </Link>
        </Button>

        <Button
          variant={asPath.includes("/media") ? "activeLink" : "link"}
          asChild
        >
          <Link href={"/media"} className="hidden !text-xl 2xl:flex">
            Media
          </Link>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size={"icon"} className="baseFlex gap-2">
              <IoMdMore className="size-8 text-primary 2xl:hidden" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-auto">
            <div className="baseVertFlex !items-start gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant={"link"} className="text-xl">
                    Hours & Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px]">
                  <div className="baseFlex w-[850px] !items-start gap-8">
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

                    <Separator
                      orientation="vertical"
                      className="h-4/5 self-center"
                    />

                    <div className="baseVertFlex relative !items-start gap-4">
                      <div className="baseVertFlex !items-start gap-2">
                        <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                          <TbLocation />
                          Location
                        </div>
                        <p>
                          We are located just outside of the HarMar Mall in
                          Roseville, Minnesota.
                        </p>

                        <div className="baseFlex gap-2">
                          <TbLocation className="text-primary" />

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
                        src={"/homepage/heroTwo.webp"}
                        alt={"TODO: fill in w/ appropriate alt text"}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                        className="!relative !h-48 !w-full rounded-md"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {isLoaded && !isSignedIn && (
                <Button
                  variant={asPath.includes("/rewards") ? "activeLink" : "link"}
                  asChild
                >
                  <Link href={"/rewards"} className="!text-xl">
                    Rewards
                  </Link>
                </Button>
              )}

              <Button
                variant={asPath.includes("/media") ? "activeLink" : "link"}
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
      <div className={`${classes.authentication} baseFlex relative gap-4`}>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size={"sm"}
              className="absolute -top-[36px] left-[-174px] hidden rounded-t-none text-primary 2xl:block"
            >
              Hours & Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[900px]">
            <div className="baseFlex w-[850px] !items-start gap-8">
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

              <Separator orientation="vertical" className="h-4/5 self-center" />

              <div className="baseVertFlex relative !items-start gap-4">
                <div className="baseVertFlex !items-start gap-2">
                  <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                    <TbLocation />
                    Location
                  </div>
                  <p>
                    We are located just outside of the HarMar Mall in Roseville,
                    Minnesota.
                  </p>

                  <div className="baseFlex gap-2">
                    <TbLocation className="text-primary" />

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
                  src={"/homepage/heroTwo.webp"}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                  className="!relative !h-48 !w-full rounded-md"
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
            <SignUpButton
              mode="modal"
              afterSignUpUrl={`${
                process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
              }${asPath}`}
              afterSignInUrl={`${
                process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
              }${asPath}`}
            >
              <Button className="px-8">Sign up</Button>
            </SignUpButton>
            <SignInButton
              mode="modal"
              afterSignUpUrl={`${
                process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
              }${asPath}`}
              afterSignInUrl={`${
                process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
              }${asPath}`}
            >
              <Button variant={"secondary"}>Sign in</Button>
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
                {user.firstName}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end">
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
                    await signOut(async () => {
                      clearLocalStorage();
                      resetStore();
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

export default DesktopHeader;
