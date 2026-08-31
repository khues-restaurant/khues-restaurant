import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { Charis_SIL, STIX_Two_Text } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaFacebook } from "react-icons/fa";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { IoLogoInstagram } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import StaticLotus from "~/components/ui/StaticLotus";
import { Separator } from "~/components/ui/separator";
import { getWeeklyHours } from "~/utils/dateHelpers/datesAndHoursOfOperation";
import { Button } from "../ui/button";
import classes from "./DesktopHeader.module.css";

import outsideOfRestaurant from "public/interior/ten.jpg";

const stix = STIX_Two_Text({
  subsets: ["latin"],
});

const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function DesktopHeader() {
  const { asPath } = useRouter();

  return (
    <nav
      id="header"
      className={`${classes.desktopHeader} sticky left-0 top-0 z-50 grid h-24 w-full bg-offwhite shadow-md`}
    >
      <Button variant="text" asChild>
        <Link
          prefetch={false}
          href={"/"}
          className={`${classes.logo ?? ""} mr-4 !px-0 !py-8`}
        >
          <div className="baseVertFlex h-[60px] w-[65.39px] gap-0">
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
          <Link prefetch={false} href={"/menu"} className="!text-xl">
            Menu
          </Link>
        </Button>

        <Button variant={"link"} asChild>
          <a
            href="https://tables.toasttab.com/restaurants/85812ed5-ec36-4179-a993-a278cfcbbc55/findTime"
            className="block !text-xl"
          >
            Reservations
          </a>
        </Button>

        <Button
          variant={asPath.includes("/media") ? "activeLink" : "link"}
          asChild
        >
          <Link prefetch={false} href={"/media"} className="block !text-xl">
            Media
          </Link>
        </Button>

        <Button variant={"link"} asChild>
          <a
            href="https://order.toasttab.com/egiftcards/khues-kitchen"
            className="block !text-xl"
          >
            Gift Cards
          </a>
        </Button>
      </div>

      {/* hours dialog and social links */}
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

            <div className="baseFlex relative !items-start">
              <StaticLotus className="absolute -bottom-20 -left-20 size-36 rotate-[-315deg] fill-primary/50" />

              <div className="baseVertFlex w-[273px] !shrink-0 !items-start gap-2">
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
                    "Interior view of Khue's, located on 693 Raymond Ave in St. Paul, MN"
                  }
                  sizes="550px"
                  className="!relative !h-52 !w-full rounded-md object-cover shadow-md"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
      </div>
    </nav>
  );
}

export default DesktopHeader;
