import React from "react";
import { motion } from "framer-motion";
import { LuCalendarClock } from "react-icons/lu";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import { IoMdHeart } from "react-icons/io";
import { FaRedo } from "react-icons/fa";
import { IoToggle } from "react-icons/io5";
import { Button } from "~/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import WideFancySwirls from "~/components/ui/wideFancySwirls";

function Rewards() {
  return (
    <motion.div
      key={"rewards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start gap-8 tablet:mt-32"
    >
      {/* Hero */}
      <div
        style={{
          backgroundImage:
            "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%)",
        }}
        className="baseFlex relative h-56 w-full overflow-hidden tablet:h-72 tablet:overflow-x-hidden"
      >
        <div className="baseFlex mr-12 hidden w-full gap-8 tablet:flex">
          <div className="imageFiller rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
          <div className="imageFiller rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
          <div className="imageFiller rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
        </div>
        <div className="baseFlex z-10 rounded-md bg-white p-2 text-yellow-500 shadow-lg">
          <div className="baseVertFlex text-xl font-semibold tablet:text-2xl">
            <div className="rotate-180">
              <WideFancySwirls />
            </div>
            Khue&apos;s Rewards
            <WideFancySwirls />
          </div>
        </div>
        <div className="baseFlex ml-12 hidden w-full gap-8 tablet:flex">
          <div className="imageFiller rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
          <div className="imageFiller rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
          <div className="imageFiller rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
        </div>
      </div>

      {/* Intro */}
      <p className="max-w-72 text-yellow-500 tablet:max-w-3xl tablet:font-medium">
        Welcome to Khue&apos;s Rewards — where every bite takes you closer to
        delightful rewards! As a token of our appreciation, we&apos;ve crafted
        an exclusive program designed to celebrate our loyal customers. Indulge
        in your favorite dishes, and watch the points pile up towards
        mouth-watering free meals, special treats, and unforgettable dining
        experiences. Because with us, your loyalty is rewarded with more than
        just a thank you.
      </p>

      <WideFancySwirls />

      {/* Benefits (main) */}
      <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-yellow-500">
        <p className="text-2xl font-medium underline underline-offset-2">
          -.- Member benefits -.-
        </p>

        <div className="baseVertFlex gap-8 tablet:!flex-row">
          <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
            <div className="baseFlex h-24 w-full">
              <CiGift className="size-24 text-yellow-500" />
            </div>
            <div className="border-t border-yellow-500 p-4 text-center">
              Earning rewards is as simple as enjoying your favorite meals!
              Every dollar spent earns you points, which open the door to a
              diverse selection of enticing rewards. Get started earning points
              today!
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
            <div className="baseFlex h-24 w-full">
              <FaCakeCandles className="size-16 text-yellow-500" />
            </div>
            <div className="border-t border-yellow-500 p-4 text-center">
              Celebrate your birthday with a complimentary treat from us, adding
              a touch of sweetness to your special day. Make sure to share your
              birthday with us when you sign up, so we can ensure your
              celebration is memorable.
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
            <LuCalendarClock className="size-16 h-24 text-yellow-500" />
            <div className="border-t border-yellow-500 p-4 text-center">
              As a member, you&apos;re first in line to experience our newest
              menu items. Before these delicacies make their official debut,
              you&apos;ll have the exclusive opportunity to taste what&apos;s
              next on our culinary horizon. Stay connected for these exciting
              previews!
            </div>
          </div>
        </div>
      </div>

      {/* filler images to break up the monotony */}
      <div className="baseVertFlex gap-4 tablet:!flex-row tablet:gap-16">
        {/* could have these be smaller + in a row on mobile too */}
        <div className="imageFiller size-64 rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
        <div className="imageFiller size-64 rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
        <div className="imageFiller size-64 rounded-md shadow-md tablet:h-48 tablet:w-64"></div>
      </div>

      {/* side benefits (Quicker ordering/Easy ordering/tailored ordering) */}
      <div className="baseVertFlex gap-8 text-yellow-500">
        <p className="text-2xl font-medium underline underline-offset-2">
          -.- Personalized ordering -.-
        </p>

        <div className="baseVertFlex gap-8 tablet:!flex-row">
          <div className="rewardsGoldBorder baseVertFlex max-w-72 gap-4 rounded-md !p-4 shadow-md tablet:h-36 tablet:w-96">
            <FaRedo className="size-6 text-yellow-500" />
            <div className="border-yellow-500 text-center">
              Effortless one-tap reordering of your previous orders.
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex max-w-72 gap-2 rounded-md !p-4 shadow-md tablet:h-36 tablet:w-96">
            <IoMdHeart className="size-8 text-yellow-500" />
            <div className="border-yellow-500 text-center tablet:max-w-64">
              Favorite your most loved dishes for quick and easy access.
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex max-w-72 gap-2 rounded-md !p-4 shadow-md tablet:h-36 tablet:w-96">
            <IoToggle className="size-9 text-yellow-500" />
            <div className="border-yellow-500 text-center tablet:max-w-64">
              Easily add your profile&apos;s dietary preferences to your orders.
            </div>
          </div>
        </div>
      </div>

      {/* Join */}
      {/* TODO: figure out why rewardsGoldBorder doesn't apply at tablet viewport. maybe some kind of
        inherent tailwind restriction? */}
      <div className="baseVertFlex tablet:rewardsGoldBorder mb-16 mt-8 max-w-xl gap-8 border-y-4 border-b-yellow-600 border-t-yellow-500 !p-8 text-yellow-500 shadow-md">
        <p className="text-center">
          Joining Khue&apos;s Rewards is easy! Simply create an account with us
          and start earning points with every order. Plus, you&apos;ll receive
          exclusive offers and surprises along the way.
        </p>

        <SignUpButton
          mode="modal"
          afterSignUpUrl={`${
            process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
          }/postSignUpRegistration`}
          afterSignInUrl={`${process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""}`}
        >
          <Button
            variant={"rewards"}
            size={"lg"}
            // size={"lg"}
            // onClick={() => {
            //   if (asPath.includes("/create")) {
            //     localStorageTabData.set(getStringifiedTabData());
            //   }

            //   // technically can sign in from signup page and vice versa
            //   if (!userId) localStorageRedirectRoute.set(asPath);
            //   // ^^ but technically could just append it onto the postSignupRegistration route right?
            // }}
            className="text-lg shadow-md"
          >
            Join Now
          </Button>
        </SignUpButton>

        <WideFancySwirls />
      </div>
    </motion.div>
  );
}

export default Rewards;
