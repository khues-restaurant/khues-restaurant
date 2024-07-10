import React from "react";
import { motion } from "framer-motion";
import { LuCalendarClock } from "react-icons/lu";
import { CiGift } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { FaRedo } from "react-icons/fa";
import { IoToggle } from "react-icons/io5";
import { Button } from "~/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import { LuCakeSlice } from "react-icons/lu";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";

import sampleImage from "/public/menuItems/sampleImage.webp";
import StaticLotus from "~/components/ui/StaticLotus";

function Rewards() {
  return (
    <motion.div
      key={"rewards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-6rem)] w-full !justify-start gap-8 pb-24 tablet:min-h-[calc(100dvh-7rem)] tablet:pb-8"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-rewardsGradient shadow-md tablet:h-72 tablet:overflow-x-hidden">
        {/* mobile images */}
        <motion.div
          key={"rewardsHeroMobileImageOne"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: -125,
            x: -125,
          }}
          animate={{
            filter: "blur(0px)",
            rotate: "0deg",
            opacity: 1,
            y: 0,
            x: 0,
          }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.5,
          }}
          className="absolute -left-10 -top-10 tablet:hidden"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={96}
            height={96}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsHeroMobileImageTwo"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: 125,
            x: -125,
          }}
          animate={{
            filter: "blur(0px)",
            rotate: "0deg",
            opacity: 1,
            y: 0,
            x: 0,
          }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.75,
          }}
          className="absolute -bottom-10 -left-10 tablet:hidden"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={96}
            height={96}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        {/* tablet+ images */}
        <motion.div
          key={"rewardsHeroImageOne"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: -150,
          }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.5,
          }}
          className="absolute -top-1 left-24 hidden tablet:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsHeroImageTwo"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            x: -125,
          }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, x: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.15,
          }}
          className="absolute -left-16 bottom-10 hidden tablet:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsHeroImageThree"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: 125,
          }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.6,
          }}
          className="absolute -bottom-14 left-36 hidden tablet:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsHeroImageFour"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: -200,
          }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.75,
          }}
          className="absolute left-72 top-14 hidden xl:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <div className="baseFlex z-10 rounded-md bg-offwhite text-primary shadow-lg tablet:p-2 tablet:shadow-xl">
          <div className="baseVertFlex text-xl font-semibold tablet:text-2xl">
            <WideFancySwirls className="h-12 rotate-180 fill-primary tablet:h-16" />
            <h1>Khue&apos;s Rewards</h1>
            <WideFancySwirls className="h-12 fill-primary tablet:h-16" />
          </div>
        </div>

        {/* mobile images */}
        <motion.div
          key={"rewardsHeroMobileImageThree"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: -125,
            x: 125,
          }}
          animate={{
            filter: "blur(0px)",
            rotate: "0deg",
            opacity: 1,
            y: 0,
            x: 0,
          }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.95,
          }}
          className="absolute -right-10 -top-10 tablet:hidden"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={96}
            height={96}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsHeroMobileImageFour"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: 125,
            x: 125,
          }}
          animate={{
            filter: "blur(0px)",
            rotate: "0deg",
            opacity: 1,
            y: 0,
            x: 0,
          }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.6,
          }}
          className="absolute -bottom-10 -right-10 tablet:hidden"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={96}
            height={96}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        {/* tablet+ images */}
        <motion.div
          key={"rewardsTabletHeroImageOne"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: -150,
          }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.5,
          }}
          className="absolute -top-1 right-24 hidden tablet:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            className="!relative "
          />
        </motion.div>

        <motion.div
          key={"rewardsTabletHeroImageTwo"}
          initial={{ filter: "blur(5px)", rotate: "90deg", opacity: 0, x: 125 }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, x: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.15,
          }}
          className="absolute -right-16 bottom-10 hidden tablet:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsTabletHeroImageThree"}
          initial={{ filter: "blur(5px)", rotate: "90deg", opacity: 0, y: 125 }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.6,
          }}
          className="absolute -bottom-14 right-36 hidden tablet:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          key={"rewardsTabletHeroImageFour"}
          initial={{
            filter: "blur(5px)",
            rotate: "90deg",
            opacity: 0,
            y: -200,
          }}
          animate={{ filter: "blur(0px)", rotate: "0deg", opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.2 },
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.75,
          }}
          className="absolute right-72 top-14 hidden xl:flex"
        >
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            width={144}
            height={144}
            priority
            className="!relative drop-shadow-md tablet:drop-shadow-lg"
          />
        </motion.div>
      </div>

      {/* Intro */}
      <p className="max-w-72 text-sm leading-7 text-primary xs:max-w-96 sm:max-w-xl sm:text-base md:max-w-2xl md:font-medium md:leading-8">
        Welcome to Khue&apos;s Rewards — where every bite takes you closer to
        delightful rewards! As a token of our appreciation, we&apos;ve crafted
        an exclusive program designed to celebrate our loyal customers. Indulge
        in your favorite dishes, and watch your points pile up towards
        mouth-watering free meals, special treats, and unforgettable dining
        experiences. Because with us, your loyalty is rewarded with more than
        just a thank you.
      </p>

      <WideFancySwirls className="h-16 fill-primary" />

      {/* Benefits (main) */}
      <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-offwhite">
        <div className="baseFlex gap-2">
          <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary sm:h-5" />
          <span className="text-xl font-medium text-primary underline underline-offset-2 sm:text-2xl">
            Member benefits
          </span>
          <SideAccentSwirls className="h-4 fill-primary sm:h-5" />
        </div>

        <div className="baseVertFlex gap-8 xl:!flex-row">
          <div className="baseVertFlex relative m-4 w-72 !items-start gap-2 overflow-hidden rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base xl:m-0 xl:w-full xl:justify-start">
            {/* <StaticLotus className="absolute -right-24 -top-10 size-48 rotate-[0deg] fill-gold/80" /> */}
            <StaticLotus className="absolute -right-16 -top-16 size-48 rotate-[-135deg] fill-gold/80" />

            <CiGift className="ml-2 size-16 h-20 text-primary" />
            <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
            <div className="hyphens-auto p-4 text-left text-primary">
              Earning rewards is as simple as enjoying your favorite meals!
              Every dollar spent earns you points, which open the door to a
              diverse selection of enticing rewards. Get started earning points
              today!
            </div>
          </div>

          <div className="baseVertFlex relative m-4 w-72 !items-start gap-2 overflow-hidden rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base xl:m-0 xl:w-full xl:justify-start">
            <StaticLotus className="absolute -right-24 -top-10 size-48 rotate-[0deg] fill-gold/80" />

            <LuCakeSlice className="ml-4 h-20 w-[50px] stroke-[1.5px] text-primary" />
            <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
            <div className="hyphens-auto p-4 text-left text-primary">
              Celebrate your birthday with a complimentary treat from us, adding
              a touch of sweetness to your special day. Make sure to share your
              birthday with us when you sign up, so we can ensure your
              celebration is memorable.
            </div>
          </div>

          <div className="baseVertFlex relative m-4 w-72 !items-start gap-2 overflow-hidden rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base xl:m-0 xl:w-full xl:justify-start">
            <StaticLotus className="absolute -right-24 -top-16 size-48 rotate-[180deg] fill-gold/80" />

            <LuCalendarClock className="ml-2 size-12 h-20 shrink-0 stroke-[1.75px] text-primary" />
            <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
            <div className="hyphens-auto p-4 text-left text-primary">
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
      <div className="baseVertFlex relative my-8 gap-12 text-primary lg:my-28 lg:!flex-row lg:gap-28">
        <div className="baseVertFlex gap-4 tablet:gap-6">
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            sizes="(max-width: 1000px) 192px, 256px"
            className="!relative size-48 rounded-md drop-shadow-xl tablet:size-64"
          />

          <div className="baseVertFlex">
            <p className="text-lg font-semibold">Egg Rolls</p>
            <p>1600 points</p>
          </div>
        </div>

        <div className="baseVertFlex gap-4 tablet:gap-6">
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            sizes="(max-width: 1000px) 192px, 256px"
            className="!relative size-48 rounded-md drop-shadow-xl tablet:size-64"
          />

          <div className="baseVertFlex">
            <p className="text-lg font-semibold">Chili Crunch Wings</p>
            <p>2400 points</p>
          </div>
        </div>

        <div className="baseVertFlex gap-4 tablet:gap-6">
          <Image
            src={sampleImage}
            alt={"TODO: replace with proper alt tag text"}
            sizes="(max-width: 1000px) 192px, 256px"
            className="!relative size-48 rounded-md drop-shadow-xl tablet:size-64"
          />

          <div className="baseVertFlex">
            <p className="text-lg font-semibold">Chicken Sandwich</p>
            <p>3800 points</p>
          </div>
        </div>
      </div>

      {/* side benefits (Quicker ordering/Easy ordering/tailored ordering) */}
      <div className="baseVertFlex gap-8 text-gold">
        <div className="baseFlex gap-2">
          <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary sm:h-5" />
          <span className="text-xl font-medium text-primary underline underline-offset-2 sm:text-2xl">
            Personalized ordering
          </span>
          <SideAccentSwirls className="h-4 fill-primary sm:h-5" />
        </div>

        <div className="baseVertFlex gap-8 tablet:!flex-row">
          <div className="baseVertFlex relative max-w-72 gap-4 overflow-hidden rounded-sm border-y-4 border-y-borderGold bg-offwhite !p-4 shadow-lg tablet:h-36 tablet:w-96">
            <StaticLotus className="absolute -right-5 -top-5 size-14 rotate-[-135deg] fill-gold/80" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-14 rotate-[45deg] fill-gold/80" />

            <FaRedo className="size-6 text-primary" />
            <div className="text-center text-sm text-primary sm:text-base">
              Effortless one-tap reordering of your previous orders.
            </div>
          </div>

          <div className="baseVertFlex relative max-w-72 gap-2 overflow-hidden rounded-sm border-y-4 border-y-borderGold bg-offwhite !p-4 shadow-lg tablet:h-36 tablet:w-96">
            <StaticLotus className="absolute -left-5 -top-5 size-14 rotate-[135deg] fill-gold/80" />
            <StaticLotus className="absolute -bottom-5 -right-5 size-14 rotate-[-45deg] fill-gold/80" />

            <IoMdHeart className="size-8 text-primary" />
            <div className="text-center text-sm text-primary sm:text-base tablet:max-w-64">
              Favorite your most loved dishes for quick and easy access.
            </div>
          </div>

          <div className="baseVertFlex relative max-w-72 gap-2 overflow-hidden rounded-sm border-y-4 border-y-borderGold bg-offwhite !p-4 shadow-lg tablet:h-36 tablet:w-96">
            <StaticLotus className="absolute -right-5 -top-5 size-14 rotate-[-135deg] fill-gold/80" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-14 rotate-[45deg] fill-gold/80" />

            <IoToggle className="size-9 text-primary" />
            <div className="text-center text-sm text-primary sm:text-base tablet:max-w-64">
              Easily add your account&apos;s dietary preferences to your orders.
            </div>
          </div>
        </div>
      </div>

      {/* Join */}
      <div className="baseVertFlex relative mb-16 mt-16 max-w-xl gap-4 overflow-hidden border-y-4 border-b-borderGold border-t-borderGold bg-offwhite !p-6 !pt-8 text-primary shadow-md sm:rounded-sm sm:!p-8 sm:!pb-6">
        <StaticLotus className="absolute right-[-21px] top-[-21px] size-16 rotate-[-135deg] fill-gold/80" />
        <StaticLotus className="absolute left-[-21px] top-[-21px] size-16 rotate-[135deg] fill-gold/80" />
        <StaticLotus className="absolute bottom-[-21px] right-[-21px] size-16 rotate-[-45deg] fill-gold/80" />
        <StaticLotus className="absolute bottom-[-21px] left-[-21px] size-16 rotate-[45deg] fill-gold/80" />

        <p className="mt-4 text-center text-sm sm:mt-2 sm:text-base">
          Joining Khue&apos;s Rewards is easy! Simply create an account with us
          and start earning points with every order. Plus, you&apos;ll receive
          exclusive offers and surprises along the way.
        </p>

        <SignUpButton mode="modal">
          <Button
            variant={"rewards"}
            size={"lg"}
            className="mt-5 text-base shadow-md"
          >
            Join now
          </Button>
        </SignUpButton>

        <WideFancySwirls className="h-14 fill-primary sm:h-16" />
      </div>
    </motion.div>
  );
}

export default Rewards;
