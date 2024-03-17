import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import ScrollSnapContainer from "~/components/ui/ScrollSnapContainer";
import Image from "next/image";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useState } from "react";
import { MdOutlineMoneyOff } from "react-icons/md";
import { BsSpeedometer2 } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/router";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import LeftAccentSwirls from "~/components/ui/LeftAccentSwirls";
import RightAccentSwirls from "~/components/ui/RightAccentSwirls";

export default function Home() {
  const { asPath } = useRouter();
  const [reviewBeingViewed, setReviewBeingViewed] = useState(0);

  return (
    <motion.div
      key={"tracking"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {/* Hero */}
      {/*  hmm what does the calc trick look like here? might be what you want sometimes instead of
      h-full */}

      <div className="baseVertFlex w-full tablet:!hidden">
        <div className="imageFiller baseFlex size-full h-[65dvh]">
          Image of probably three plates of food here arranged in a triangle
          (one on top, two on bottom) on a table, probably with some fancy
          lighting going on too. alternatively we could do one dish in main area
          here, and have an image selector below, but not as big of a fan of
          this approach
        </div>
        <div className="baseVertFlex gap-1 p-8">
          <h1 className="text-3xl font-bold">Welcome to Khue&apos;s</h1>
          <h2 className="text-center text-xl">
            A modern take on classic Vietnamese cuisine.
          </h2>
          <Button asChild className="mt-4">
            <Link href="/order-now">Order now</Link>
          </Button>
        </div>
      </div>

      <div className="baseFlex relative !hidden w-full tablet:!flex tablet:h-[calc(100dvh-8rem)]">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-black/50 to-transparent"></div>

        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
          <div className="imageFiller size-full" />
          <div className="imageFiller size-full" />
          <div className="imageFiller size-full" />
          <div className="imageFiller size-full" />
        </div>

        <div className="baseVertFlex absolute top-0 h-full tablet:left-24">
          <div className="baseVertFlex !items-start gap-1 rounded-md bg-white p-8 shadow-md">
            <h1 className="text-4xl font-bold">Welcome to Khue&apos;s</h1>
            <h2 className="text-2xl">
              A modern take on classic Vietnamese cuisine.
            </h2>
            <Button asChild className="mt-4">
              <Link href="/order-now">Order now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Press Reviews */}
      {/* scroll-snap-x on overflow/mobile, otherwise just three down here w/ logo of company + a sentence */}
      <div className="baseVertFlex w-full gap-2 border-y-2 pb-4 tablet:border-0">
        <ScrollSnapContainer>
          <div
            id={"pressReview1"}
            className="baseVertFlex gap-4 rounded-md p-4"
          >
            <Image
              src="/press/StarTribune.png"
              alt="Star Tribune"
              width={200}
              height={85}
            />
            <p className="text-sm italic tablet:text-base">
              &ldquo;Khue&apos;s is a must-visit for anyone in the Twin
              Cities.&rdquo;
            </p>
          </div>
          <div
            id={"pressReview2"}
            className="baseVertFlex gap-4 rounded-md p-4"
          >
            <Image
              src="/press/StarTribune.png"
              alt="Star Tribune"
              width={200}
              height={85}
            />
            <p className="text-sm italic tablet:text-base">
              &ldquo;Khue&apos;s is a must-visit for anyone in the Twin
              Cities.&rdquo;
            </p>
          </div>
          <div
            id={"pressReview3"}
            className="baseVertFlex gap-4 rounded-md p-4"
          >
            <Image
              src="/press/StarTribune.png"
              alt="Star Tribune"
              width={200}
              height={85}
            />
            <p className="text-sm italic tablet:text-base">
              &ldquo;Khue&apos;s is a must-visit for anyone in the Twin
              Cities.&rdquo;
            </p>
          </div>
        </ScrollSnapContainer>

        {/* (mobile-only) dots to show which review is being viewed at the moment */}
        <div className="baseFlex gap-2 tablet:hidden">
          <Button asChild>
            <div
              className={`!size-2 rounded-full !p-0 ${reviewBeingViewed === 0 ? "!bg-primary" : "!bg-gray-300"}`}
              onClick={() => {
                setReviewBeingViewed(0);

                const review1 = document.getElementById("pressReview1");
                review1?.scrollIntoView({
                  behavior: "smooth",
                  inline: "start",
                });
              }}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 rounded-full !p-0 ${reviewBeingViewed === 1 ? "!bg-primary" : "!bg-gray-300"}`}
              onClick={() => {
                setReviewBeingViewed(1);

                const review2 = document.getElementById("pressReview2");
                review2?.scrollIntoView({
                  behavior: "smooth",
                  inline: "start",
                });
              }}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 rounded-full !p-0 ${reviewBeingViewed === 2 ? "!bg-primary" : "!bg-gray-300"}`}
              onClick={() => {
                setReviewBeingViewed(2);

                const review3 = document.getElementById("pressReview3");
                review3?.scrollIntoView({
                  behavior: "smooth",
                  inline: "start",
                });
              }}
            />
          </Button>
        </div>
      </div>

      {/* wrapping (prob just for padding?) container of promo sections below */}
      <div className="baseVertFlex w-full gap-8 p-8">
        {/* masonry (w/ slight gap + rounded images) of food items + inside the restaurant. Don't be afraid to
          crop images how you feel suits them if need be */}

        {/* <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}> */}
        {/* <Masonry columnsCount={3} gutter="10px" className="max-w-[550px]">
          <div className="imageFiller h-64 w-32" />
          <div className="imageFiller h-32 w-64" />
          <div className="imageFiller h-32 w-48" />
          <div className="imageFiller h-48 w-96" />
          <div className="imageFiller h-24 w-48" />
          <div className="imageFiller h-32 w-32" />
          <div className="imageFiller h-32 w-32" />
        </Masonry> */}
        {/* </ResponsiveMasonry> */}

        {/* "Order directly through us" promo section */}
        <div className="baseVertFlex w-full rounded-md shadow-md tablet:hidden">
          <div className="imageFiller h-60 w-full tablet:h-72 tablet:w-72"></div>
          <div className="baseVertFlex gap-4 p-4">
            <p className="text-lg font-medium">
              Order directly through us to receive mouthwatering benefits
            </p>
            <div className="baseVertFlex !items-start gap-2 pl-4">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6" />
                <p>Shop our lowest prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6" />
                <p>Get your order made with priority</p>
              </div>
              <div className="baseFlex gap-4">
                <TfiReceipt className="size-6" />
                <p className="max-w-52">
                  Rewards members earn points for their orders, which build up
                  to free meals
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order-now">Order now</Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-8 py-8 tablet:!flex">
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">
              Order directly through us to receive mouthwatering benefits
            </p>
            <div className="baseVertFlex !items-start gap-2 pl-8">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6" />
                <p>Shop our lowest prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6" />
                <p>Get your order made with priority</p>
              </div>
              <div className="baseFlex gap-4">
                <TfiReceipt className="size-6" />
                <p className="max-w-lg">
                  Rewards members earn points for their orders, which build up
                  to free meals
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order-now" className="self-center">
                Order now
              </Link>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            <div className="imageFiller absolute left-0 top-0 h-full w-full rounded-md shadow-md"></div>
            <div className="absolute left-4 top-4 z-[-1] h-full w-full rounded-md bg-primary"></div>
          </div>
        </div>

        {/* Meet the chef promo section */}
        <div className="baseVertFlex w-full rounded-md shadow-md tablet:hidden">
          <div className="imageFiller h-60 w-full tablet:h-72 tablet:w-72"></div>
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">Meet the chef</p>

            <p>
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} asChild>
              <Link href="/about-us">Read more</Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-8 py-8  tablet:!flex">
          <div className="baseFlex relative size-72">
            <div className="imageFiller absolute left-0 top-0 h-full w-full rounded-md shadow-md"></div>
            <div className="absolute left-4 top-4 z-[-1] h-full w-full rounded-md bg-primary"></div>
          </div>

          <div className="baseVertFlex max-w-3xl !items-start gap-4 p-4">
            <p className="text-lg font-medium">Meet the chef</p>

            <p>
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} asChild>
              <Link href="/about-us">Read more</Link>
            </Button>
          </div>
        </div>

        {/* Reservation promo section */}
        <div className="baseVertFlex w-full rounded-md shadow-md tablet:hidden">
          <div className="imageFiller h-60 w-full tablet:h-72 tablet:w-72">
            image of an empty table w/ full silverware layed out, kind of angled
            down shot at the table
          </div>
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">
              Planning a birthday dinner or get together with your friends?
            </p>

            <p>Secure your seats ahead of time by placing a reservation.</p>

            <Button asChild>
              <a href="/resyLink">Place a reservation</a>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-8 py-8  tablet:!flex">
          <div className="baseVertFlex max-w-3xl gap-4 p-4">
            <p className="text-lg font-medium">
              Planning a birthday dinner or get together with your friends?
            </p>

            <p>Secure your seats ahead of time by placing a reservation.</p>

            <Button asChild>
              <a href="/resyLink">Place a reservation</a>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            <div className="imageFiller absolute left-0 top-0 h-full w-full rounded-md shadow-md">
              image of an empty table w/ full silverware layed out, kind of
              angled down shot at the table
            </div>
            <div className="absolute left-4 top-4 z-[-1] h-full w-full rounded-md bg-primary"></div>
          </div>
        </div>

        {/* masonry but prob more of just inside/outside the restaurant */}
        {/* <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}> */}
        {/* <Masonry columnsCount={3} gutter="10px" className="max-w-[550px]">
          <div className="imageFiller h-64 w-32" />
          <div className="imageFiller h-32 w-64" />
          <div className="imageFiller h-32 w-48" />
          <div className="imageFiller h-48 w-96" />
          <div className="imageFiller h-24 w-48" />
          <div className="imageFiller h-32 w-32" />
          <div className="imageFiller h-32 w-32" />
        </Masonry> */}
        {/* </ResponsiveMasonry> */}

        {/* Rewards program promo section */}
        <div
          style={{
            background:
              "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%)",
          }}
          className="baseVertFlex w-full max-w-3xl gap-4 rounded-md p-4 text-white shadow-md tablet:p-8"
        >
          <div className="baseFlex gap-4">
            <LeftAccentSwirls />
            <p className="text-lg font-medium">
              Join our rewards program today!
            </p>
            <RightAccentSwirls />
          </div>
          <p>
            As valued customers, members gain access to exclusive, limited time
            discounts, can build up to earn free meals, and get a free birthday
            dessert of their choice!
          </p>

          <WideFancySwirls />

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
        </div>

        {/* Explore Our Favorites section (hardcoded for seo) */}
        {/* <div className="baseVertFlex gap-4 tablet:max-w-2xl">
          <p className="text-lg font-medium">Explore Our Favorites</p>

          <div className="baseFlex max-w-md rounded-md border">
            <ScrollSnapContainer>
              <div className="baseVertFlex !items-start gap-4 rounded-md p-4">
                <div className="imageFiller h-36 w-48"></div>
                <p className="font-semibold">Appetizer One</p>
                <p className="max-w-52 text-sm">
                  Silky ricotta, signature red sauce, Italian sausage,
                  mozzarella & parmesan cheeses.
                </p>
              </div>

              <div className="baseVertFlex !items-start gap-4 rounded-md p-4">
                <div className="imageFiller h-36 w-48"></div>

                <p className="font-semibold">Appetizer One</p>
                <p className="max-w-52 text-sm">
                  Silky ricotta, signature red sauce, Italian sausage,
                  mozzarella & parmesan cheeses.
                </p>
              </div>

              <div className="baseVertFlex !items-start gap-4 rounded-md p-4">
                <div className="imageFiller h-36 w-48"></div>
                <p className="font-semibold">Appetizer One</p>
                <p className="max-w-52 text-sm">
                  Silky ricotta, signature red sauce, Italian sausage,
                  mozzarella & parmesan cheeses.
                </p>
              </div>
            </ScrollSnapContainer>
          </div>
        </div> */}

        {/* maybe a gallary/slideshow section? Prob not though */}
      </div>
    </motion.div>
  );
}
