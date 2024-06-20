import { useAuth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CiGift } from "react-icons/ci";
import { LuCakeSlice } from "react-icons/lu";
import { LuCalendarClock } from "react-icons/lu";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getRewardsPointCost } from "~/utils/priceHelpers/getRewardsPointCost";
import { isEligibleForBirthdayReward } from "~/utils/dateHelpers/isEligibleForBirthdayReward";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";
import { useRouter } from "next/router";
import { MdOutlineHistory } from "react-icons/md";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import AnimatedLotus from "~/components/ui/AnimatedLotus";

import sampleImage from "/public/menuItems/sampleImage.webp";
import Link from "next/link";
import StaticLotus from "~/components/ui/StaticLotus";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import isEqual from "lodash.isequal";
import { format } from "date-fns";

// TODO: honestly the logic within here is very hit or miss, comb through this for sure

function Rewards() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();
  const { asPath } = useRouter();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { data: rewards } = api.menuCategory.getRewardsCategories.useQuery();

  const { data: activeDiscounts } = api.discount.getAll.useQuery();

  // const { data: activeRewards } = api.discount.getUserRewards.useQuery(userId);

  const { menuItems, orderDetails, viewportLabel } = useMainStore((state) => ({
    menuItems: state.menuItems,
    orderDetails: state.orderDetails,
    viewportLabel: state.viewportLabel,
  }));

  const [isElegibleForBirthdayReward, setIsElegibleForBirthdayReward] =
    useState<boolean | undefined>(undefined);

  const [rewardsPointsEarned, setRewardsPointsEarned] = useState(0);

  const [regularSelectedRewardId, setRegularSelectedRewardId] = useState<
    string | null
  >(null);
  const [birthdaySelectedRewardId, setBirthdaySelectedRewardId] = useState<
    string | null
  >(null);
  const [toBeDeductedRewardsPoints, setToBeDeductedRewardsPoints] = useState(0);

  // TODO: get rid of this right? just use user.rewardsPoints directly
  useEffect(() => {
    if (!user) return;

    setRewardsPointsEarned(user.rewardsPoints);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setIsElegibleForBirthdayReward(
      isEligibleForBirthdayReward(
        new Date(user.birthday),
        user.lastBirthdayRewardRedemptionYear,
      ),
    );
  }, [user]);

  useEffect(() => {
    let newRegularSelectedRewardId = null;

    for (const item of orderDetails.items) {
      if (item.pointReward) {
        newRegularSelectedRewardId = item.itemId;
        break;
      }
    }

    if (newRegularSelectedRewardId !== regularSelectedRewardId) {
      setRegularSelectedRewardId(newRegularSelectedRewardId);
    }
  }, [orderDetails, regularSelectedRewardId]);

  useEffect(() => {
    let newBirthdaySelectedRewardId = null;

    for (const item of orderDetails.items) {
      if (item.birthdayReward) {
        newBirthdaySelectedRewardId = item.itemId;
        break;
      }
    }

    if (newBirthdaySelectedRewardId !== birthdaySelectedRewardId) {
      setBirthdaySelectedRewardId(newBirthdaySelectedRewardId);
    }
  }, [orderDetails, birthdaySelectedRewardId]);

  useEffect(() => {
    const newToBeDeductedRewardsPoints = getRewardsPointCost({
      items: orderDetails.items,
    });

    if (newToBeDeductedRewardsPoints !== toBeDeductedRewardsPoints) {
      setToBeDeductedRewardsPoints(newToBeDeductedRewardsPoints);
    }
  }, [orderDetails.items, toBeDeductedRewardsPoints]);

  useLayoutEffect(() => {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 10);
  }, []);

  // need to extract the categories/items from menuItems,
  // and make a separate component below for rendering each menu item w/ it's "Select/Unselect" button + content

  // TODO: when changing to mobile-friendly bottom navigation for /profile links,
  // need the <Sticky> container for the header. Probably just avoid on tablet+ though since you would
  // have to make the actual content container scrollable, not the page as it is now.
  // - will first try to just use style prop to conditionally have flex direction be column or row
  // - then use layout prop from framer motion to animate the transition

  return (
    <motion.div
      key={"profile-rewards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex baseVertFlex relative mt-24
      h-full min-h-[calc(100dvh-6rem-81px)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem-120px)]"
    >
      <div className="baseFlex my-12 !hidden gap-4 rounded-lg border border-stone-400 bg-offwhite p-1 tablet:!flex">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "ghost"
          }
          asChild
        >
          <Link href="/profile/preferences" className="baseFlex w-full gap-2">
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/rewards") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/rewards" className="baseFlex w-full gap-2">
            <CiGift className="size-6" />
            Rewards
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/my-orders") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/my-orders" className="baseFlex w-full gap-2">
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {rewards === undefined ||
        user === undefined ||
        isElegibleForBirthdayReward === undefined ? (
          <motion.div
            key={"rewardsLoadingContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex h-full min-h-[calc(100dvh-6rem-81px)] w-full items-center justify-center tablet:min-h-[calc(100dvh-7rem-120px)] "
          >
            <AnimatedLotus className="size-16 fill-primary tablet:size-24" />
          </motion.div>
        ) : (
          <motion.div
            key={"rewardsLoadedContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex relative mb-24 w-full gap-8 bg-offwhite transition-all md:w-3/4 tablet:mb-32 tablet:mt-0 tablet:rounded-xl tablet:border tablet:shadow-md"
          >
            <div className="baseFlex relative h-56 w-full overflow-hidden bg-rewardsGradient shadow-md tablet:h-72 tablet:overflow-x-hidden tablet:rounded-t-lg">
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
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  y: 0,
                }}
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
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  x: 0,
                }}
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
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  y: 0,
                }}
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
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  y: 0,
                }}
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
                  className="!relative drop-shadow-md tablet:drop-shadow-lg"
                />
              </motion.div>

              <div className="baseVertFlex z-10 rounded-md bg-offwhite px-8 py-4 text-primary shadow-lg tablet:px-16 tablet:shadow-xl">
                <div className="mb-4 text-center text-lg font-semibold tablet:text-xl">
                  Khue&apos;s Rewards
                </div>

                <div className="baseFlex mb-4 gap-4 font-bold tracking-wider">
                  <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary" />

                  <div className="baseVertFlex">
                    <AnimatedNumbers
                      value={rewardsPointsEarned - toBeDeductedRewardsPoints}
                      fontSize={viewportLabel.includes("mobile") ? 18 : 24}
                      padding={0}
                    />
                    <p className="font-semibold tracking-normal">points</p>
                  </div>
                  <SideAccentSwirls className="h-5 fill-primary" />
                </div>

                <Separator className="mb-2 h-[1px] w-full bg-stone-400" />

                <RewardsHistory
                  userId={userId}
                  rewardsPointsEarned={rewardsPointsEarned}
                />
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
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  y: 0,
                }}
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
                initial={{
                  filter: "blur(5px)",
                  rotate: "90deg",
                  opacity: 0,
                  x: 125,
                }}
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  x: 0,
                }}
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
                  className="!relative drop-shadow-md tablet:drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                key={"rewardsTabletHeroImageThree"}
                initial={{
                  filter: "blur(5px)",
                  rotate: "90deg",
                  opacity: 0,
                  y: 125,
                }}
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  y: 0,
                }}
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
                animate={{
                  filter: "blur(0px)",
                  rotate: "0deg",
                  opacity: 1,
                  y: 0,
                }}
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
                  className="!relative drop-shadow-md tablet:drop-shadow-lg"
                />
              </motion.div>
            </div>

            {/* .map() of Your rewards */}
            <div className="baseVertFlex max-w-7xl gap-8 px-4 text-primary tablet:mt-4 tablet:gap-16">
              {/* Birthday reward options */}
              {isElegibleForBirthdayReward && (
                <div className="baseVertFlex mb-8 w-full gap-8">
                  <div className="baseFlex sm:gap-2">
                    <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary sm:h-5" />
                    <span className="w-48 text-center text-xl font-medium underline underline-offset-2 sm:w-auto sm:text-2xl">
                      Choose your birthday dessert
                    </span>
                    <SideAccentSwirls className="h-4 fill-primary sm:h-5" />
                  </div>

                  <div className="baseFlex w-full">
                    {/* Categories */}
                    {rewards.birthdayMenuCategories.map((category) => (
                      <div
                        key={category.id}
                        className="baseVertFlex w-full !items-start gap-4"
                      >
                        {/* Items */}
                        <div className="baseVertFlex gap-4 tablet:!flex-row">
                          {category.menuItems
                            .sort((a, b) => a.price - b.price)
                            .map((item, index) => (
                              <Fragment key={item.id}>
                                <RewardMenuItem
                                  menuItem={item}
                                  currentlySelectedRewardId={
                                    birthdaySelectedRewardId
                                  }
                                  userAvailablePoints={
                                    rewardsPointsEarned -
                                    toBeDeductedRewardsPoints
                                  }
                                  forBirthdayReward={true}
                                />
                                {index !== category.menuItems.length - 1 && (
                                  <Separator className="h-[1px] w-11/12 tablet:h-28 tablet:w-[1px]" />
                                )}
                              </Fragment>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="baseFlex gap-2">
                <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary sm:h-[18px]" />
                <span className="text-center text-xl font-medium text-primary underline underline-offset-2 sm:text-2xl">
                  Choose your reward
                </span>
                <SideAccentSwirls className="h-4 fill-primary sm:h-[18px]" />
              </div>

              {/* Regular reward options */}
              <div className="grid w-full grid-cols-1 gap-4 text-primary lg:grid-cols-2 lg:!place-items-start 2xl:grid-cols-3">
                {/* Categories */}
                {rewards.rewardMenuCategories.map((category) => (
                  <div
                    key={category.id}
                    className="baseVertFlex w-full !items-start gap-4"
                  >
                    <p className="text-lg font-semibold underline underline-offset-2">
                      {category.name}
                    </p>

                    {/* Items */}
                    <div className="baseVertFlex w-full">
                      {category.menuItems
                        .sort((a, b) => a.price - b.price)
                        .map((item, index) => (
                          <Fragment key={item.id}>
                            <RewardMenuItem
                              menuItem={item}
                              currentlySelectedRewardId={
                                regularSelectedRewardId
                              }
                              userAvailablePoints={
                                rewardsPointsEarned - toBeDeductedRewardsPoints
                              }
                              forBirthdayReward={false}
                            />
                            {index !== category.menuItems.length - 1 && (
                              <Separator className="h-[1px] w-11/12" />
                            )}
                          </Fragment>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm italic text-stone-400">
                * Only one reward is able to be redeemed per order.
              </p>
            </div>

            <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-offwhite">
              <div className="baseFlex gap-2">
                <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary sm:h-[18px]" />
                <span className="text-xl font-medium text-primary underline underline-offset-2 sm:text-2xl">
                  Member benefits
                </span>
                <SideAccentSwirls className="h-4 fill-primary sm:h-[18px]" />
              </div>

              <div className="baseVertFlex mx-8 mb-24 gap-8 3xl:!flex-row">
                <div className="baseVertFlex relative m-4 w-72 !items-start gap-2 overflow-hidden rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base md:w-[500px] 3xl:m-0 3xl:w-full 3xl:justify-start">
                  <StaticLotus className="absolute -right-16 -top-16 size-48 rotate-[-135deg] fill-gold/80" />

                  <CiGift className="ml-2 size-16 h-20 text-primary" />
                  <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
                  <div className="hyphens-auto p-4 text-left text-primary">
                    Earning rewards is as simple as enjoying your favorite
                    meals! Every dollar spent earns you points, which open the
                    door to a diverse selection of enticing rewards. Get started
                    earning points today!
                  </div>
                </div>

                <div className="baseVertFlex relative m-4 w-72 !items-start gap-2 overflow-hidden rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base md:w-[500px] 3xl:m-0 3xl:w-full 3xl:justify-start">
                  <StaticLotus className="absolute -right-24 -top-10 size-48 rotate-[0deg] fill-gold/80" />

                  <LuCakeSlice className="ml-4 h-20 w-[50px] stroke-[1.5px] text-primary" />
                  <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
                  <div className="hyphens-auto p-4 text-left text-primary">
                    Celebrate your birthday with a complimentary treat from us,
                    adding a touch of sweetness to your special day. Make sure
                    to share your birthday with us when you sign up, so we can
                    ensure your celebration is memorable.
                  </div>
                </div>

                <div className="baseVertFlex relative m-4 w-72 !items-start gap-2 overflow-hidden rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base md:w-[500px] 3xl:m-0 3xl:w-full 3xl:justify-start">
                  <StaticLotus className="absolute -right-24 -top-16 size-48 rotate-[180deg] fill-gold/80" />

                  <LuCalendarClock className="ml-2 size-12 h-20 shrink-0 stroke-[1.75px] text-primary" />
                  <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
                  <div className="hyphens-auto p-4 text-left text-primary">
                    As a member, you&apos;re first in line to experience our
                    newest menu items. Before these delicacies make their
                    official debut, you&apos;ll have the exclusive opportunity
                    to taste what&apos;s next on our culinary horizon. Stay
                    connected for these exciting previews!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="baseFlex sticky bottom-0 left-0 z-40 h-20 w-full gap-0 border-t border-stone-400 bg-offwhite tablet:hidden">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/preferences"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-20 w-[1px] bg-stone-400" />

        <Button
          variant={
            asPath.includes("/profile/rewards") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/rewards"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <CiGift className="size-6" />
            <span className="pb-0.5">Rewards</span>
          </Link>
        </Button>

        <Separator className="h-20 w-[1px] bg-stone-400" />

        <Button
          variant={
            asPath.includes("/profile/my-orders") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/my-orders"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default Rewards;

interface RewardMenuItem {
  menuItem: FullMenuItem;
  currentlySelectedRewardId: string | null;
  userAvailablePoints: number;
  forBirthdayReward: boolean;
}

function RewardMenuItem({
  menuItem,
  currentlySelectedRewardId,
  userAvailablePoints,
  forBirthdayReward,
}: RewardMenuItem) {
  // actually calls updateOrder() and shows toast(), but prob don't bother with the "undo" logic for this
  // right now

  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const { updateOrder } = useUpdateOrder();

  const { toast, dismiss: dismissToasts } = useToast();

  function isDisabled() {
    if (currentlySelectedRewardId === null) return false;

    if (
      currentlySelectedRewardId !== menuItem.id ||
      // conversion: item price (in cents) multiplied by 2
      userAvailablePoints < new Decimal(menuItem.price).mul(2).toNumber() ||
      !menuItem.available
    ) {
      return true;
    }

    return false;
  }

  return (
    <div className="relative w-full text-primary sm:max-w-96">
      <div className="baseFlex relative size-full !items-start gap-4 rounded-md p-4">
        <Image
          src={sampleImage}
          alt={menuItem.name}
          fill
          className="!relative !size-16 rounded-md drop-shadow-md tablet:!size-24 tablet:drop-shadow-lg"
        />

        <div className="baseVertFlex size-full !items-start !justify-between">
          <div className="baseVertFlex !items-start gap-2">
            <p className="text-lg font-medium underline underline-offset-2">
              {menuItem.name}
            </p>

            {/* Point cost for item */}
            {forBirthdayReward ? (
              <p className="max-w-48 text-wrap text-left text-stone-400">
                Free
              </p>
            ) : (
              <p className="max-w-48 text-wrap text-left text-stone-400">
                {new Decimal(menuItem.price)
                  .mul(2) // item price (in cents) multiplied by 2
                  .toNumber()}{" "}
                points
              </p>
            )}

            {!menuItem.available && (
              <div className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-400">
                <p className="text-xs italic">Currently unavailable</p>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          disabled={isDisabled()}
          className={`self-end`}
          onClick={async () => {
            if (currentlySelectedRewardId === menuItem.id) {
              const { items } = orderDetails;

              const updatedItems = [];

              for (const item of items) {
                // Check if this item should be excluded
                if (
                  item.itemId === menuItem.id &&
                  (item.birthdayReward || item.pointReward)
                ) {
                  continue;
                }

                // If the item doesn't match our criteria for removal, add it to the updatedItems array
                updatedItems.push(item);
              }

              dismissToasts();

              updateOrder({
                newOrderDetails: {
                  ...orderDetails,
                  items: updatedItems,
                },
              });

              return;
            }

            const rewardItemPointsCost = new Decimal(menuItem.price)
              .mul(2) // item price (in cents) multiplied by 2
              .toNumber();

            if (
              !forBirthdayReward &&
              userAvailablePoints < rewardItemPointsCost
            ) {
              toast({
                variant: "neutral",
                description: `You don't have enough points to redeem this item.`,
              });

              return;
            }

            updateOrder({
              newOrderDetails: {
                ...orderDetails,
                items: [
                  ...orderDetails.items,
                  {
                    id:
                      orderDetails.items.length === 0
                        ? 0
                        : orderDetails.items.at(-1)!.id + 1,
                    itemId: menuItem.id,
                    name: menuItem.name,
                    customizations: getDefaultCustomizationChoices(menuItem),
                    specialInstructions: "",
                    includeDietaryRestrictions: false,
                    quantity: 1,
                    price: menuItem.price,
                    discountId: null,
                    isChefsChoice: menuItem.isChefsChoice,
                    isAlcoholic: menuItem.isAlcoholic,
                    isVegetarian: menuItem.isVegetarian,
                    isVegan: menuItem.isVegan,
                    isGlutenFree: menuItem.isGlutenFree,
                    showUndercookedOrRawDisclaimer:
                      menuItem.showUndercookedOrRawDisclaimer,
                    birthdayReward: forBirthdayReward,
                    pointReward: !forBirthdayReward,
                  },
                ],
              },
            });

            const pluralize = (await import("pluralize")).default;
            const isPlural = pluralize.isPlural(menuItem.name);
            const contextAwarePlural = isPlural ? "were" : "was";

            toast({
              description: `${menuItem.name} ${contextAwarePlural} added to your order.`,
            });
          }}
        >
          {currentlySelectedRewardId === menuItem.id ? "Unselect" : "Select"}
        </Button>
      </div>
    </div>
  );
}

interface RewardSnippet {
  id: string;
  datetimeToPickup: Date;
  earnedRewardsPoints: number;
  spentRewardsPoints: number;
}

interface RewardsHistory {
  userId: string;
  rewardsPointsEarned: number;
}

function RewardsHistory({ userId, rewardsPointsEarned }: RewardsHistory) {
  const [sortedRewardsHistory, setSortedRewardsHistory] = useState<
    RewardSnippet[] | undefined
  >();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const {
    data: rewardsHistory,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.user.getInfiniteRewards.useInfiniteQuery(
    {
      userId,
      sortDirection,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const lastElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lastElementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.75,
      },
    );

    observer.observe(lastElementRef.current);

    const stableLastElementRef = lastElementRef.current;

    return () => {
      if (stableLastElementRef) {
        observer.unobserve(stableLastElementRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (rewardsHistory === undefined && sortedRewardsHistory === undefined) {
      setSortedRewardsHistory([]);
      return;
    }

    // this logic is reversed from what you'd expect because the list is rendered
    // with the first item in the array being rendered first. So to sort by the newest
    // orders, we need to sort in descending order actually.
    // (uses slice to avoid mutating the original array)

    const rewardsHistoryData = rewardsHistory?.pages.flatMap(
      (page) => page.rewards,
    );

    if (rewardsHistoryData === undefined) return;

    const localSortedRewardsHistory = rewardsHistoryData
      .slice()
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
        } else {
          return b.datetimeToPickup.getTime() - a.datetimeToPickup.getTime();
        }
      });

    if (
      localSortedRewardsHistory !== undefined &&
      !isEqual(localSortedRewardsHistory, sortedRewardsHistory)
    ) {
      setSortedRewardsHistory(localSortedRewardsHistory);
    }
  }, [rewardsHistory, sortedRewardsHistory, sortDirection]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"underline"}
          className="baseFlex mb-1 mt-1 h-5 gap-2 !p-0 text-sm sm:text-base"
        >
          <MdOutlineHistory className="size-4 tablet:size-5" />
          Point history
        </Button>
      </DialogTrigger>
      <DialogContent
        extraBottomSpacer={false}
        // idk about text-sm on mobile, let's see
        className="baseVertFlex gap-4 text-sm sm:text-base"
      >
        <div className="baseFlex w-full !justify-between border-b pb-4 pt-2">
          <div className="baseFlex gap-2 text-base font-medium tablet:text-lg">
            <MdOutlineHistory className="size-4 tablet:mt-0.5 tablet:size-5" />
            Point history
          </div>

          <div className="baseFlex gap-2">
            <Label htmlFor="sortDirection" className="text-nowrap">
              Sort by
            </Label>
            <Select
              value={sortDirection}
              onValueChange={(direction) =>
                setSortDirection(direction as "asc" | "desc")
              }
            >
              <SelectTrigger id={"sortDirection"}>
                <SelectValue placeholder="Sort direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort direction</SelectLabel>

                  <SelectItem value={"desc"}>
                    <div className="baseFlex gap-1">Newest</div>
                  </SelectItem>
                  <SelectItem value={"asc"}>
                    <div className="baseFlex gap-1">Oldest</div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {sortedRewardsHistory === undefined ? (
            <motion.div
              key={"rewardsHistoryLoadingContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseFlex size-full"
            >
              <AnimatedLotus className="size-16 fill-primary" />
            </motion.div>
          ) : (
            <motion.div
              key={"rewardsHistoryLoadedContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex h-72 w-4/5 !justify-start gap-4 overflow-y-auto pr-4"
            >
              {sortedRewardsHistory.map((reward, index) => (
                <div
                  key={reward.id}
                  ref={
                    index === sortedRewardsHistory.length - 1
                      ? lastElementRef
                      : null
                  }
                  className="baseFlex w-full !justify-between border-b pb-2 last:border-b-0"
                >
                  <p className="self-start font-medium">
                    {format(reward.datetimeToPickup, "MMMM do, yyyy")}
                  </p>

                  <div className="baseVertFlex !items-end">
                    <p className="font-semibold text-primary">
                      + {reward.earnedRewardsPoints} points
                    </p>

                    {reward.spentRewardsPoints > 0 && (
                      <p className="text-stone-400">
                        - {reward.spentRewardsPoints} points
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="baseFlex w-full gap-1 border-t pt-4">
          You currently have
          <span className="font-semibold">{rewardsPointsEarned}</span>
          points.
        </div>
      </DialogContent>
    </Dialog>
  );
}
