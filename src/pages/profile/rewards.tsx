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
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type StoreCustomizations, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getRewardsPointCost } from "~/utils/getRewardsPointCost";
import { buildClerkProps } from "@clerk/nextjs/server";
import { type GetServerSideProps } from "next";
import UserIsNotAuthenticated from "~/components/UserIsNotAuthenticated";

function Rewards() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { menuItems, orderDetails } = useMainStore((state) => ({
    menuItems: state.menuItems,
    orderDetails: state.orderDetails,
  }));

  const { data: rewards } = api.menuCategory.getRewardsCategories.useQuery();

  const { data: activeDiscounts } = api.discount.getAll.useQuery();
  // const { data: activeRewards } = api.discount.getUserRewards.useQuery(userId);

  const [rewardsPointsEarned, setRewardsPointsEarned] = useState(0);

  const [rewardsPointsTimerSet, setRewardsPointsTimerSet] = useState(false);

  const [regularSelectedRewardId, setRegularSelectedRewardId] = useState<
    string | null
  >(null);
  const [birthdaySelectedRewardId, setBirthdaySelectedRewardId] = useState<
    string | null
  >(null);
  const [toBeDeductedRewardsPoints, setToBeDeductedRewardsPoints] = useState(0);

  const viewportLabel = useGetViewportLabel();

  useEffect(() => {
    if (!user || rewardsPointsTimerSet) return;

    setTimeout(() => {
      if (user) {
        setRewardsPointsEarned(user.rewardsPoints);
      }
    }, 1500);

    setRewardsPointsTimerSet(true);
  }, [user, rewardsPointsTimerSet]);

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

  if (!rewards) return null;
  // ^ should be fine since we are eventually going to get all
  // reward data passed in as props from getServerSideProps

  if (!isSignedIn) {
    return <UserIsNotAuthenticated />;
  }

  return (
    <motion.div
      key={"profile-rewards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative mb-16 w-full"
    >
      <div className="baseVertFlex relative w-full gap-8 transition-all">
        <div
          style={{
            backgroundImage:
              "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%)",
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              width={144}
              height={144}
              className="!relative"
            />
          </motion.div>

          <div className="baseVertFlex z-10 gap-4 rounded-md bg-white px-8 py-4 text-yellow-500 shadow-lg">
            <div className="text-center text-lg font-semibold tablet:text-xl">
              Khue&apos;s Rewards
            </div>

            <div className="baseFlex gap-4 font-bold tracking-wider">
              <SideAccentSwirls className="h-5 scale-x-[-1] fill-yellow-500" />

              <div className="baseVertFlex">
                <AnimatedNumbers
                  value={rewardsPointsEarned - toBeDeductedRewardsPoints}
                  fontSize={viewportLabel.includes("mobile") ? 18 : 24}
                  padding={0}
                />
                <p className="font-semibold tracking-normal">points</p>
              </div>
              <SideAccentSwirls className="h-5 fill-yellow-500" />
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
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
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              width={144}
              height={144}
              className="!relative"
            />
          </motion.div>
        </div>

        {/* .map() of Your rewards */}
        <div className="baseVertFlex mt-8 max-w-7xl gap-8 px-4 text-yellow-500 tablet:gap-16">
          {/* Birthday reward options */}
          {true && (
            <div className="baseVertFlex mb-8 w-full gap-8">
              <div className="baseFlex sm:gap-2">
                <SideAccentSwirls className="h-4 scale-x-[-1] fill-yellow-500 sm:h-5" />
                <span className="w-48 text-center text-xl font-medium underline underline-offset-2 sm:w-auto sm:text-2xl">
                  Choose your birthday dessert
                </span>
                <SideAccentSwirls className="h-4 fill-yellow-500 sm:h-5" />
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
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-yellow-500 sm:h-5" />
            <span className="text-center text-xl font-medium underline underline-offset-2 sm:text-2xl">
              Choose your reward
            </span>
            <SideAccentSwirls className="h-4 fill-yellow-500 sm:h-5" />
          </div>

          {/* Regular reward options */}
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:!place-items-start 2xl:grid-cols-3">
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

          <p className="text-sm italic text-gray-400">
            Only one reward is able to be redeemed per order.*
          </p>
        </div>

        <div className="baseVertFlex mt-8 max-w-7xl gap-8 px-4 text-yellow-500">
          <div className="baseFlex gap-2">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-yellow-500 sm:h-5" />
            <span className="text-xl font-medium underline underline-offset-2 sm:text-2xl">
              Member benefits
            </span>
            <SideAccentSwirls className="h-4 fill-yellow-500 sm:h-5" />
          </div>

          <div className="baseVertFlex gap-8 2xl:!flex-row">
            <div className="rewardsGoldBorder baseVertFlex m-4 w-72 !items-start gap-2 rounded-md text-sm shadow-md sm:h-[300px] sm:w-96 sm:text-base 2xl:m-0 2xl:w-full 2xl:justify-start">
              <CiGift className="ml-2 size-16 h-24 text-yellow-500 sm:ml-0 sm:size-20" />
              <Separator className="ml-4 h-[2px] w-[120px] bg-yellow-500" />
              <div className="hyphens-auto p-4 text-left">
                Earning rewards is as simple as enjoying your favorite meals!
                Every dollar spent earns you points, which open the door to a
                diverse selection of enticing rewards. Get started earning
                points today!
              </div>
            </div>

            <div className="rewardsGoldBorder baseVertFlex m-4 w-72 !items-start gap-2 rounded-md text-sm shadow-md sm:h-[300px] sm:w-96 sm:text-base 2xl:m-0 2xl:w-full 2xl:justify-start">
              <FaCakeCandles className="ml-4 size-12 h-24 text-yellow-500" />
              <Separator className="ml-4 h-[2px] w-[120px] bg-yellow-500" />
              <div className="hyphens-auto p-4 text-left">
                Celebrate your birthday with a complimentary treat from us,
                adding a touch of sweetness to your special day. Make sure to
                share your birthday with us when you sign up, so we can ensure
                your celebration is memorable.
              </div>
            </div>

            <div className="rewardsGoldBorder baseVertFlex m-4 w-72 !items-start gap-2 rounded-md text-sm shadow-md sm:h-[300px] sm:w-96 sm:text-base 2xl:m-0 2xl:w-full 2xl:justify-start">
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
      </div>
    </motion.div>
  );
}

Rewards.PageLayout = TopProfileNavigationLayout;

export default Rewards;

// TODO: eventually add this below, can also combine with getting the reward items too so you don't
// have to worry about loading skeletons if you want

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Extract user information (e.g., from session, cookie, or context params)
//   const userId = /* Your mechanism to get userId from the context */;
//      ^^ this will be through clerk, then use id to query for user row in db
//   const user = await getUserDetails(userId);

//   // Check if the user is eligible for the birthday reward
//   const isEligible = isEligibleForBirthdayReward(
//     new Date(user.birthdate),
//     user.birthdayRewardRedeemed,
//     user.lastRewardRedemptionYear
//   );

//   // Pass eligibility status to the page as props
//   return {
//     props: {
//       isEligible,
//       // any other props you need
//     },
//   };
// };

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return { props: { ...buildClerkProps(ctx.req) } };
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

  const { toast } = useToast();

  function isDisabled() {
    if (currentlySelectedRewardId === menuItem.id) return false;

    if (
      userAvailablePoints < new Decimal(menuItem.price).div(0.01).toNumber() ||
      !menuItem.available
    ) {
      return true;
    }
  }

  return (
    <div className="relative w-full max-w-80 sm:max-w-96">
      <div className="baseFlex relative size-full !items-start gap-4 rounded-md p-4">
        {/* <div className="imageFiller mt-2 size-16 rounded-md tablet:size-24"></div> */}
        <Image
          src={"/menuItems/sampleImage.webp"}
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
              <p className="max-w-48 text-wrap text-left text-gray-400">Free</p>
            ) : (
              <p className="max-w-48 text-wrap text-left text-gray-400">
                {new Decimal(menuItem.price).div(0.01).toNumber()} points
              </p>
            )}

            {!menuItem.available && (
              <div className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-400">
                <p className="text-xs italic">Currently unavailable</p>
              </div>
            )}
          </div>
        </div>
        <Button
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

              updateOrder({
                newOrderDetails: {
                  ...orderDetails,
                  items: updatedItems,
                },
              });

              return;
            }

            if (
              userAvailablePoints <
              new Decimal(menuItem.price).div(0.01).toNumber()
            ) {
              toast({
                variant: "default",
                description: `You don't have enough points to redeem this item.`,
              });

              return;
            }

            function getDefaultCustomizationChoices(item: FullMenuItem) {
              return item.customizationCategories.reduce((acc, category) => {
                acc[category.id] = category.defaultChoiceId;
                return acc;
              }, {} as StoreCustomizations);
            }

            updateOrder({
              newOrderDetails: {
                ...orderDetails,
                items: [
                  ...orderDetails.items,
                  {
                    id: crypto.randomUUID(),
                    itemId: menuItem.id,
                    name: menuItem.name,
                    customizations: getDefaultCustomizationChoices(menuItem),
                    specialInstructions: "",
                    includeDietaryRestrictions: false,
                    quantity: 1,
                    price: menuItem.price,
                    discountId: null,
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
