import { useAuth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import { motion } from "framer-motion";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import { LuCalendarClock } from "react-icons/lu";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type StoreCustomizations, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getRewardsPointCost } from "~/utils/getRewardsPointCost";
import { type GetServerSideProps } from "next";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { PrismaClient, type User } from "@prisma/client";
import isEqual from "lodash.isequal";
import { isEligibleForBirthdayReward } from "~/utils/isEligibleForBirthdayReward";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";

import sampleImage from "/public/menuItems/sampleImage.webp";
import Head from "next/head";

// TODO: honestly the logic within here is very hit or miss, comb through this for sure

function Rewards({
  isElegibleForBirthdayReward,
  initUserData,
  initRewardsData,
}: {
  isElegibleForBirthdayReward: boolean;
  initUserData: User;
  initRewardsData: {
    rewardMenuCategories: FullMenuItem[]; // TODO: blatantly wrong, make proper type for this later
    birthdayMenuCategories: FullMenuItem[]; // TODO: blatantly wrong, make proper type for this later
  };
}) {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();

  const { data: currentUserData } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { menuItems, orderDetails, viewportLabel } = useMainStore((state) => ({
    menuItems: state.menuItems,
    orderDetails: state.orderDetails,
    viewportLabel: state.viewportLabel,
  }));

  const { data: currentRewardsData } =
    api.menuCategory.getRewardsCategories.useQuery();

  const [user, setUser] = useState<User | null>(initUserData);
  const [rewards, setRewards] = useState(initRewardsData);

  useEffect(() => {
    if (
      currentUserData === undefined ||
      currentUserData === null ||
      isEqual(initUserData, currentUserData)
    )
      return;

    setUser(currentUserData);
  }, [initUserData, currentUserData]);

  useEffect(() => {
    if (
      currentRewardsData === undefined ||
      currentRewardsData === null ||
      isEqual(initRewardsData, currentRewardsData)
    )
      return;

    setRewards(currentRewardsData); // TODO: I'm assuming this type error is legit?
  }, [initRewardsData, currentRewardsData]);

  const { data: activeDiscounts } = api.discount.getAll.useQuery();
  // const { data: activeRewards } = api.discount.getUserRewards.useQuery(userId);

  const [rewardsPointsEarned, setRewardsPointsEarned] = useState(0);

  const [regularSelectedRewardId, setRegularSelectedRewardId] = useState<
    string | null
  >(null);
  const [birthdaySelectedRewardId, setBirthdaySelectedRewardId] = useState<
    string | null
  >(null);
  const [toBeDeductedRewardsPoints, setToBeDeductedRewardsPoints] = useState(0);

  // get rid of this, see no need for this bs
  useEffect(() => {
    if (!user) return;

    setRewardsPointsEarned(user.rewardsPoints);
  }, [user]);

  console.log(
    user?.rewardsPoints,
    rewardsPointsEarned,
    toBeDeductedRewardsPoints,
  );

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
      className="baseVertFlex relative mb-16 w-full"
    >
      <Head>
        <title>Rewards | Khue&apos;s</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="Rewards | Khue's"></meta>
        <meta
          property="og:url"
          content="www.khueskitchen.com/profile/rewards"
        />
        <meta property="og:type" content="website" />
      </Head>

      <div className="baseVertFlex relative w-full gap-8 transition-all">
        <div
          style={{
            backgroundImage:
              "linear-gradient(to right bottom, oklch(0.9 0.13 87.8) 0%, oklch(0.75 0.13 87.8) 100%)",
          }}
          className="baseFlex relative h-56 w-full overflow-hidden tablet:h-72 tablet:overflow-x-hidden tablet:rounded-t-lg"
        >
          {/* mobile images */}
          <motion.div
            key={"rewardsHeroMobileImageOne"}
            initial={{ opacity: 0, y: -125, x: -125 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsHeroMobileImageTwo"}
            initial={{ opacity: 0, y: 125, x: -125 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
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
              className="!relative"
            />
          </motion.div>

          {/* tablet+ images */}
          <motion.div
            key={"rewardsTabletHeroImageOne"}
            initial={{ opacity: 0, y: -150 }}
            animate={{ opacity: 1, y: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsTabletHeroImageTwo"}
            initial={{ opacity: 0, x: -125 }}
            animate={{ opacity: 1, x: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsTabletHeroImageThree"}
            initial={{ opacity: 0, y: 125 }}
            animate={{ opacity: 1, y: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsTabletHeroImageFour"}
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: 1, y: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <div className="baseVertFlex z-10 gap-4 rounded-md bg-offwhite px-8 py-4 text-primary shadow-lg">
            <div className="text-center text-lg font-semibold tablet:text-xl">
              Khue&apos;s Rewards
            </div>

            <div className="baseFlex gap-4 font-bold tracking-wider">
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
          </div>

          {/* mobile images */}
          <motion.div
            key={"rewardsHeroMobileImageThree"}
            initial={{ opacity: 0, y: -125, x: 125 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsHeroMobileImageFour"}
            initial={{ opacity: 0, y: 125, x: 125 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
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
              className="!relative"
            />
          </motion.div>

          {/* tablet+ images */}
          <motion.div
            key={"rewardsHeroImageOne"}
            initial={{ opacity: 0, y: -150 }}
            animate={{ opacity: 1, y: 0 }}
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
            key={"rewardsHeroImageTwo"}
            initial={{ opacity: 0, x: 125 }}
            animate={{ opacity: 1, x: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsHeroImageThree"}
            initial={{ opacity: 0, y: 125 }}
            animate={{ opacity: 1, y: 0 }}
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
              className="!relative"
            />
          </motion.div>

          <motion.div
            key={"rewardsHeroImageFour"}
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: 1, y: 0 }}
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
              className="!relative"
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

              <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:!place-items-start 2xl:grid-cols-3">
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
                                regularSelectedRewardId
                              }
                              userAvailablePoints={
                                rewardsPointsEarned - toBeDeductedRewardsPoints
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
                className="baseVertFlex !items-start gap-4"
              >
                <p className="text-lg font-semibold underline underline-offset-2">
                  {category.name}
                </p>

                {/* Items */}
                <div className="baseVertFlex">
                  {category.menuItems
                    .sort((a, b) => a.price - b.price)
                    .map((item, index) => (
                      <Fragment key={item.id}>
                        <RewardMenuItem
                          menuItem={item}
                          currentlySelectedRewardId={regularSelectedRewardId}
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
            Only one reward is able to be redeemed per order.*
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

          <div className="baseVertFlex gap-8 xl:!flex-row">
            <div className="baseVertFlex m-4 w-72 !items-start gap-2 rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base xl:m-0 xl:w-full xl:justify-start">
              <CiGift className="ml-2 size-16 h-20 text-primary" />
              <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
              <div className="hyphens-auto p-4 text-left text-primary">
                Earning rewards is as simple as enjoying your favorite meals!
                Every dollar spent earns you points, which open the door to a
                diverse selection of enticing rewards. Get started earning
                points today!
              </div>
            </div>

            <div className="baseVertFlex m-4 w-72 !items-start gap-2 rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base xl:m-0 xl:w-full xl:justify-start">
              <FaCakeCandles className="ml-4 size-10 h-20 text-primary" />
              <Separator className="ml-4 h-[2px] w-[120px] bg-gold" />
              <div className="hyphens-auto p-4 text-left text-primary">
                Celebrate your birthday with a complimentary treat from us,
                adding a touch of sweetness to your special day. Make sure to
                share your birthday with us when you sign up, so we can ensure
                your celebration is memorable.
              </div>
            </div>

            <div className="baseVertFlex m-4 w-72 !items-start gap-2 rounded-sm border-y-4 border-y-gold bg-offwhite p-3 text-sm shadow-lg sm:h-[300px] sm:w-96 sm:text-base xl:m-0 xl:w-full xl:justify-start">
              <LuCalendarClock className="ml-2 size-12 h-20 shrink-0 text-primary" />
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
      </div>
    </motion.div>
  );
}

Rewards.PageLayout = TopProfileNavigationLayout;

export default Rewards;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { props: {} };

  const prisma = new PrismaClient();

  const initUserData = await prisma.user.findUnique({
    where: {
      userId,
    },
  });

  if (!initUserData) return { props: {} };

  // Check if the user is eligible for the birthday reward
  const isEligibleForBirthdayRewardValue = isEligibleForBirthdayReward(
    new Date(initUserData.birthday),
    initUserData.lastBirthdayRewardRedemptionYear,
  );

  const menuCategories = await prisma.menuCategory.findMany({
    where: {
      active: true,
    },
    include: {
      activeDiscount: true,
      menuItems: {
        include: {
          activeDiscount: true,
          customizationCategories: {
            include: {
              customizationChoices: {
                orderBy: {
                  listOrder: "asc",
                },
              },
            },
          },
          suggestedPairings: {
            include: {
              drinkMenuItem: true,
            },
          },
          suggestedWith: {
            include: {
              foodMenuItem: true,
            },
          },
        },
      },
    },
  });

  let rewardMenuCategories = menuCategories.filter((category) => {
    return category.menuItems.some(
      (item) => item.isRewardItem && category.name !== "Desserts",
    );
  });

  // filter further to only include the relevant reward items from each category
  rewardMenuCategories = rewardMenuCategories.map((category) => {
    return {
      ...category,
      menuItems: category.menuItems.filter((item) => item.isRewardItem),
    };
  });

  let birthdayMenuCategories = menuCategories.filter((category) => {
    return category.menuItems.some(
      (item) => item.isRewardItem && category.name === "Desserts",
    );
  });

  // filter further to only include the relevant reward items from each category
  birthdayMenuCategories = birthdayMenuCategories.map((category) => {
    return {
      ...category,
      menuItems: category.menuItems.filter(
        (item) => item.isRewardItem && category.name === "Desserts",
      ),
    };
  });

  const initRewardsData = {
    rewardMenuCategories,
    birthdayMenuCategories,
  };

  return {
    props: {
      isElegibleForBirthdayReward: isEligibleForBirthdayRewardValue,
      initUserData,
      initRewardsData,
      ...buildClerkProps(ctx.req),
    },
  };
};

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
      userAvailablePoints < new Decimal(menuItem.price).div(0.005).toNumber() ||
      !menuItem.available ||
      currentlySelectedRewardId !== menuItem.id
    ) {
      return true;
    }

    return false;
  }

  return (
    <div className="relative w-full max-w-80 text-primary sm:max-w-96">
      <div className="baseFlex relative size-full !items-start gap-4 rounded-md p-4">
        <Image
          src={sampleImage}
          alt={menuItem.name}
          fill
          className="!relative !size-16 rounded-md tablet:!size-24"
        />

        <div className="baseVertFlex h-full w-48 !items-start !justify-between">
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
                {new Decimal(menuItem.price).div(0.005).toNumber()} points
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
          onClick={() => {
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

            if (
              !forBirthdayReward &&
              userAvailablePoints <
                new Decimal(menuItem.price).div(0.005).toNumber()
            ) {
              toast({
                variant: "default",
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

            toast({
              description: `${menuItem.name} added to your order.`,
            });
          }}
        >
          {currentlySelectedRewardId === menuItem.id ? "Unselect" : "Select"}
        </Button>
      </div>
    </div>
  );
}
