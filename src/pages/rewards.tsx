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
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import { Parallax } from "react-scroll-parallax";

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
        <div className="absolute left-24 top-8 hidden size-36 tablet:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>

        <div className="absolute -left-16 bottom-8 hidden size-36 tablet:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>

        <div className="absolute -bottom-16 left-36 hidden size-36 tablet:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>

        {/* unsure about this last one */}
        <div className="absolute left-72 top-20 hidden size-36 xl:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
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

        <div className="absolute right-24 top-8 hidden size-36 tablet:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>

        <div className="absolute -right-16 bottom-8 hidden size-36 tablet:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>

        <div className="absolute -bottom-16 right-36 hidden size-36 tablet:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>

        {/* unsure about this last one */}
        <div className="absolute right-72 top-20 hidden size-36 xl:flex">
          <Parallax speed={8}>
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              fill
              className="!relative !size-full"
            />
          </Parallax>
        </div>
      </div>

      {/* Intro */}
      {/* may need an xs viewport as well at like ~400 or 425px width so it doesn't stay scrunched
      for so long. Also would be used on the member benefit cards too */}
      <p className="max-w-72 leading-7 text-yellow-500 sm:max-w-xl md:max-w-2xl tablet:font-medium tablet:leading-8">
        Welcome to Khue&apos;s Rewards — where every bite takes you closer to
        delightful rewards! As a token of our appreciation, we&apos;ve crafted
        an exclusive program designed to celebrate our loyal customers. Indulge
        in your favorite dishes, and watch your points pile up towards
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
          <div className="rewardsGoldBorder baseVertFlex m-4 !items-start gap-2 rounded-md shadow-md sm:w-96 tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
            <CiGift className="size-20 h-24 text-yellow-500" />
            <Separator className="ml-4 h-[2px] w-[120px] bg-yellow-500" />
            <div className="hyphens-auto p-4 text-left">
              Earning rewards is as simple as enjoying your favorite meals!
              Every dollar spent earns you points, which open the door to a
              diverse selection of enticing rewards. Get started earning points
              today!
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex m-4 !items-start gap-2 rounded-md shadow-md sm:w-96 tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
            <FaCakeCandles className="ml-4 size-12 h-24 text-yellow-500" />
            <Separator className="ml-4 h-[2px] w-[120px] bg-yellow-500" />
            <div className="hyphens-auto p-4 text-left">
              Celebrate your birthday with a complimentary treat from us, adding
              a touch of sweetness to your special day. Make sure to share your
              birthday with us when you sign up, so we can ensure your
              celebration is memorable.
            </div>
          </div>

          <div className="rewardsGoldBorder baseVertFlex m-4 !items-start gap-2 rounded-md shadow-md sm:w-96 tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
            <LuCalendarClock className="ml-2 size-14 h-24 text-yellow-500" />
            <Separator className="ml-4 h-[2px] w-[120px] bg-yellow-500" />
            <div className="hyphens-auto p-4 text-left">
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
      <div className="baseVertFlex relative my-8 gap-8 text-yellow-500 tablet:my-28 tablet:!flex-row tablet:gap-28">
        <div className="baseVertFlex gap-4">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: replace with proper alt tag text"}
            fill
            sizes="(min-width: 1000px) 256px, 192px"
            className="!relative rounded-md"
          />

          <div className="baseVertFlex">
            <p className="text-lg font-semibold">Appetizer One</p>
            <p>950 points</p>
          </div>
        </div>

        <div className="baseVertFlex gap-4">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: replace with proper alt tag text"}
            fill
            sizes="(min-width: 1000px) 256px, 192px"
            className="!relative rounded-md"
          />

          <div className="baseVertFlex">
            <p className="text-lg font-semibold">Entree One</p>
            <p>1250 points</p>
          </div>
        </div>

        <div className="baseVertFlex gap-4">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: replace with proper alt tag text"}
            fill
            sizes="(min-width: 1000px) 256px, 192px"
            className="!relative rounded-md"
          />

          <div className="baseVertFlex">
            <p className="text-lg font-semibold">Entree Two</p>
            <p>1600 points</p>
          </div>
        </div>
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
      <div className="baseVertFlex mb-16 mt-8 max-w-xl gap-8 border-y-4 border-b-yellow-600 border-t-yellow-500 !p-6 text-yellow-500 shadow-md sm:!p-8">
        <p className="text-center">
          Joining Khue&apos;s Rewards is easy! Simply create an account with us
          and start earning points with every order. Plus, you&apos;ll receive
          exclusive offers and surprises along the way.
        </p>

        <SignUpButton
          mode="modal"
          // TODO: make sure that this redirects to homepage instead of back to /rewards
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
