import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiTimer } from "react-icons/bi";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
import RevealFromTop from "~/components/ui/RevealFromTop";
import { Button } from "~/components/ui/button";
import { TabsContent } from "~/components/ui/tabs";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import useGetUserId from "~/hooks/useGetUserId";
import { StoreCustomizations, useMainStore } from "~/stores/MainStore";
import { isEligibleForBirthdayReward } from "~/utils/isEligibleForBirthdayReward";
import { api } from "~/utils/api";
import { FullMenuItem } from "~/server/api/routers/menuCategory";
import { getRewardsPointCost } from "~/utils/getRewardsPointCost";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { useToast } from "~/components/ui/use-toast";
import Decimal from "decimal.js";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { LuCalendarClock } from "react-icons/lu";

function Rewards() {
  const userId = useGetUserId();
  const { data: user } = api.user.get.useQuery(userId, {
    enabled: !!userId,
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

  return (
    <motion.div
      key={"profile-rewards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative w-full"
    >
      <TabsContent value="rewards">
        <div className="baseVertFlex relative mt-4 w-full p-4 transition-all tablet:my-8 tablet:p-8">
          <div className="baseVertFlex rewardsGoldBorder relative w-full gap-4 rounded-md text-yellow-500 shadow-md tablet:max-w-2xl">
            <p className="text-xl font-bold">K Reward Points</p>

            <div className="baseVertFlex text-xl font-bold tracking-wider">
              <AnimatedNumbers
                value={rewardsPointsEarned - toBeDeductedRewardsPoints}
                fontSize={viewportLabel.includes("mobile") ? 25 : 48}
                padding={0}
              />
              <p className="!text-base font-semibold tracking-normal tablet:text-lg">
                points
              </p>
            </div>

            {/* maybe just want the left/right flanking fancy swirls here? */}
          </div>

          {/* .map() of Your rewards */}
          <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-yellow-500">
            {/* Birthday reward options */}
            {true && (
              <div className="baseVertFlex w-full gap-8">
                <p className="text-xl font-medium underline underline-offset-2 tablet:text-2xl">
                  -.- Choose a special birthday treat -.-
                </p>
                <div className="grid w-full grid-cols-1 !place-items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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
                          .map((item) => (
                            <RewardMenuItem
                              key={item.id}
                              menuItem={item}
                              currentlySelectedRewardId={
                                regularSelectedRewardId
                              }
                              userAvailablePoints={
                                rewardsPointsEarned - toBeDeductedRewardsPoints
                              }
                              forBirthdayReward={true}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xl font-medium underline underline-offset-2 tablet:text-2xl">
              -.- Choose your reward -.-
            </p>

            {/* Regular reward options */}
            <div className="grid w-full grid-cols-1 !place-items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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
                  <div className="baseVertFlex gap-4">
                    {category.menuItems
                      .sort((a, b) => a.price - b.price)
                      .map((item) => (
                        <RewardMenuItem
                          key={item.id}
                          menuItem={item}
                          currentlySelectedRewardId={regularSelectedRewardId}
                          userAvailablePoints={
                            rewardsPointsEarned - toBeDeductedRewardsPoints
                          }
                          forBirthdayReward={false}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm italic text-gray-400">
              Only one reward is able to be redeemed per order.*
            </p>
          </div>

          <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-yellow-500">
            <p className="text-xl font-medium underline underline-offset-2 tablet:text-2xl">
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
                  diverse selection of enticing rewards. Get started earning
                  points today!
                </div>
              </div>

              <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
                <div className="baseFlex h-24 w-full">
                  <FaCakeCandles className="size-16 text-yellow-500" />
                </div>
                <div className="border-t border-yellow-500 p-4 text-center">
                  Celebrate your birthday with a complimentary treat from us,
                  adding a touch of sweetness to your special day. Make sure to
                  share your birthday with us when you sign up, so we can ensure
                  your celebration is memorable.
                </div>
              </div>

              <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[300px] tablet:w-full tablet:justify-start">
                <LuCalendarClock className="size-16 h-24 text-yellow-500" />
                <div className="border-t border-yellow-500 p-4 text-center">
                  As a member, you&apos;re first in line to experience our
                  newest menu items. Before these delicacies make their official
                  debut, you&apos;ll have the exclusive opportunity to taste
                  what&apos;s next on our culinary horizon. Stay connected for
                  these exciting previews!
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
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
      <div className="baseFlex h-full w-full !items-start gap-4 rounded-md border-2 p-4">
        <div className="imageFiller mt-2 size-16 rounded-md tablet:size-24"></div>

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
