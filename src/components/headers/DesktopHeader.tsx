import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
// import { useLocalStorageValue } from "@react-hookz/web";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaUserAlt } from "react-icons/fa";
import { IoSettingsOutline, IoTelescopeOutline } from "react-icons/io5";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CiLocationOn } from "react-icons/ci";
import { MdAccessTime } from "react-icons/md";
import { FaMapSigns } from "react-icons/fa";
import { Separator } from "~/components/ui/separator";
import { SlPresent } from "react-icons/sl";
import { TfiReceipt } from "react-icons/tfi";

import classes from "./DesktopHeader.module.css";
import useGetUserId from "~/hooks/useGetUserId";

function DesktopHeader() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { asPath } = useRouter();
  const userId = useGetUserId();

  // const localStorageTabData = useLocalStorageValue("tabData");
  // const localStorageRedirectRoute = useLocalStorageValue("redirectRoute");

  // okay I want to not show rewards/auth buttons until user auth status is known,
  // however I *really* want to show the page as soon as possible, what options do I have here?

  return (
    <nav
      className={`${classes.desktopHeader} fixed left-0 top-0 grid h-32 w-full grid-cols-1 grid-rows-1 shadow-md`}
    >
      <Link href={"/"} className={`${classes.logo ?? ""}`}>
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
      </Link>

      <div className={`${classes.mainLinks} baseFlex gap-2`}>
        <Button
          variant={"link"}
          asChild
          style={{
            backgroundColor: asPath.includes("/explore")
              ? "#be185d"
              : undefined,
            color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
          }}
          className={classes.explore}
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
          className={classes.explore}
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
          className={classes.explore}
        >
          <a href={"/resylink"} className="!text-xl">
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
          className={classes.explore}
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
          className={classes.explore}
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
          className={classes.explore}
        >
          <Link href={"/media"} className="!text-xl">
            Media
          </Link>
        </Button>
      </div>

      {/* order icon and auth buttons/user icon */}
      <div className={`${classes.authentication} baseFlex gap-4`}>
        <Button
          variant={"outline"}
          style={{
            backgroundColor: asPath.includes("/explore")
              ? "#be185d"
              : undefined,
            color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
          }}
          className="baseFlex"
        >
          <LiaShoppingBagSolid className="h-6 w-6" />
        </Button>

        {/* opting for double "&&" instead of ternary for better readability */}
        {!isSignedIn && (
          <div className={`${classes.authentication ?? ""} baseFlex gap-4`}>
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
                className="px-8"
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

        {true && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="baseFlex gap-2">
                <FaUserAlt />
                Firstname
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end">
              <div className="baseVertFlex gap-2">
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
                    color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
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
                    color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
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
            </PopoverContent>
          </Popover>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="absolute right-[15%] top-0 text-primary"
          >
            Hours & Location
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[900px]">
          {/* <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader> */}
          <div className="baseFlex w-[850px] !items-start gap-8">
            <div className="baseVertFlex w-64 !items-start gap-2">
              <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                <MdAccessTime />
                Hours
              </div>
              <div className="mt-1 grid w-full grid-cols-2">
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

            <Separator orientation="vertical" className="h-4/5 self-center" />

            {/* maybe worthwhile to do textual introduction like "We are located just outside of the HarMar Mall in Roseville, Minnesota." */}
            <div className="baseVertFlex !items-start">
              <div className="baseVertFlex !items-start gap-2">
                <div className="baseFlex gap-2 text-lg font-semibold underline underline-offset-2">
                  <CiLocationOn />
                  Location
                </div>
                <p>
                  We are located just outside of the HarMar Mall in Roseville,
                  Minnesota.
                </p>

                <div className="baseFlex gap-2">
                  <FaMapSigns />
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
                <p className="bg-white p-1">
                  image of outside of restaurant here
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div></div>
    </nav>
  );
}

export default DesktopHeader;
