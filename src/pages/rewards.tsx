import React from "react";
import { motion } from "framer-motion";
import { BiTimer } from "react-icons/bi";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import { IoMdHeart } from "react-icons/io";
import { FaRedo } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

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
        className="baseFlex tablet:[125vw] relative h-56 w-full tablet:h-72"
      >
        <div className="baseFlex z-10 rounded-md bg-white p-2 text-yellow-500 shadow-lg">
          <div className="experimentalBorder baseFlex px-8 py-4 text-xl font-semibold tablet:text-2xl">
            Khue&apos;s Rewards
          </div>
          {/* prob subheading here */}
        </div>
      </div>
      {/* Intro */}
      <p className="max-w-72 text-yellow-500 tablet:max-w-xl">
        Welcome to Khue&apos;s Rewards — where every bite takes you closer to
        delightful rewards! As a token of our appreciation, we&apos;ve crafted
        an exclusive program designed to celebrate our loyal customers. Indulge
        in your favorite dishes, and watch the points pile up towards
        mouth-watering free meals, special treats, and unforgettable dining
        experiences. Because with us, your loyalty is rewarded with more than
        just a thank you.
      </p>
      TODO: lowkey might want to center everything on this page always, and then
      the Benefits and Personalized ordering sections can be flanked by the
      fancy swirls on either side, and also want to add the fancy swirls in
      between some of these sections/of course in the hero, where it will be
      animated as well!
      {/* Hook */}
      {/* <p className="max-w-xl text-yellow-500">
        Earning rewards is as simple as savoring your favorite meals! For every
        dollar spent, you earn points that accumulate towards delicious rewards.
        Reach 1500 points, and enjoy a meal on us — it&apos;s our way of saying
        &lsquo;Thank you&rsquo; for making us a part of your dining journey.
        Plus, your points will unlock exclusive offers and surprises along the
        way.
      </p> */}
      {/* Benefits (main) */}
      <div className="baseVertFlex max-w-7xl gap-2 text-yellow-500 tablet:!items-start">
        <p className="text-xl font-medium underline underline-offset-2">
          -.- Benefits -.-
        </p>

        <div className="baseVertFlex gap-8 tablet:!flex-row">
          <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md bg-yellow-50 shadow-md tablet:m-0 tablet:max-w-max">
            <div className="baseFlex h-24 w-full">
              <CiGift className="size-24 text-yellow-500" />
            </div>
            <div className="border-t border-yellow-500 p-4 text-center">
              Earning rewards is as simple as savoring your favorite meals! For
              every dollar spent, you earn points that accumulate towards
              delicious rewards. Reach 1500 points, and enjoy a meal on us —
              it&apos;s our way of saying &lsquo;Thank you&rsquo; for making us
              a part of your dining journey.
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md bg-yellow-50 shadow-md tablet:m-0 tablet:max-w-max">
            <div className="baseFlex h-24 w-full">
              <FaCakeCandles className="size-16 text-yellow-500" />
            </div>
            <div className="border-t border-yellow-500 p-4 text-center">
              Make your special day unforgettable with a complimentary birthday
              treat from us. It&apos;s our way of wishing you joy and
              deliciousness on your birthday. Just be sure to sign up and let us
              know when your big day is!
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md bg-yellow-50 shadow-md tablet:m-0 tablet:max-w-max">
            <BiTimer className="size-24 text-yellow-500" />
            <div className="border-t border-yellow-500 p-4 text-center">
              Exclusive offers just for you! As a member of our rewards program,
              you&apos;ll have access to special deals that make every visit a
              little more special. From 10% off your favorite appetizers to
              exclusive seasonal offers, there&apos;s always something to look
              forward to. Keep an eye out for our emails or check back here for
              the latest deals!
            </div>
          </div>
        </div>
      </div>
      {/* side benefits (Quicker ordering/Easy ordering/tailored ordering) */}
      <div className="baseVertFlex gap-2 text-yellow-500 tablet:!items-start">
        <p className="text-lg font-medium underline underline-offset-2">
          -.- Personalized ordering -.-
        </p>

        <div className="baseVertFlex gap-8 tablet:!flex-row">
          <div className="rewardsGoldBorder baseVertFlex max-w-72 gap-4 rounded-md bg-yellow-50 !p-4 shadow-md tablet:h-16 tablet:max-w-lg tablet:!flex-row">
            <FaRedo className="size-7 text-yellow-500" />
            <div className="border-yellow-500 text-center">
              Your previous orders will appear at the top of your menu for quick
              and easy reordering.
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex max-w-72 gap-2 rounded-md bg-yellow-50 !p-4 shadow-md tablet:h-16 tablet:max-w-lg tablet:!flex-row">
            <IoMdHeart className="size-8 text-yellow-500" />
            <div className="border-yellow-500 text-center">
              Favorite your most loved dishes for quick and easy access.
            </div>
          </div>
        </div>
      </div>
      {/* Join */}
      {/* TODO: figure out why rewardsGoldBorder doesn't apply at tablet viewport. maybe some kind of
      inherent tailwind restriction? */}
      <div className="baseVertFlex tablet:rewardsGoldBorder mb-16 max-w-xl gap-8  border-y-4 border-b-yellow-600 border-t-yellow-500 !p-8 text-yellow-500 shadow-md">
        <p>
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
      </div>
    </motion.div>
  );
}

export default Rewards;
