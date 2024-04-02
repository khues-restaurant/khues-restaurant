import Decimal from "decimal.js";
import { motion } from "framer-motion";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IoIosArrowBack } from "react-icons/io";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { FullMenuItem } from "~/server/api/routers/menuCategory";
import { StoreCustomizations, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getRewardsPointCost } from "~/utils/getRewardsPointCost";

// okay so we kinda spliced together some basic structure here, just look through it
// and complete this fully before moving onto backend dashboard improvements

interface RewardsDrawer {
  showRewardsDrawer: boolean;
  setShowRewardsDrawer: Dispatch<SetStateAction<boolean>>;
}

function RewardsDrawer({
  showRewardsDrawer,
  setShowRewardsDrawer,
}: RewardsDrawer) {
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

  if (!rewards) return null;

  return (
    <motion.div
      key="rewardsDrawerWrapper"
      initial={{ opacity: 0, translateX: "100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "100%" }}
      transition={{
        duration: 0.35,
      }}
      className="baseVertFlex relative h-full w-full !justify-start"
    >
      <div className="baseVertFlex relative mt-8 w-full !justify-start gap-2">
        <div className="baseVertFlex w-full max-w-md gap-2 p-4">
          <div className="baseVertFlex rewardsGoldBorder relative z-50 w-full gap-4 rounded-md text-yellow-500 shadow-md tablet:max-w-md">
            <p className="text-lg font-bold">K Reward Points</p>

            <div className="baseVertFlex font-bold tracking-wider">
              <AnimatedNumbers
                value={rewardsPointsEarned - toBeDeductedRewardsPoints}
                fontSize={viewportLabel.includes("mobile") ? 18 : 24}
                padding={0}
              />
              <p className="font-semibold tracking-normal">points</p>
            </div>
          </div>
          <p className="text-lg font-medium text-yellow-500 underline underline-offset-2">
            -.- Choose your reward -.-
          </p>
        </div>

        {/* TODO: come back to this.. I feel like a higher dvh value should work but on shorter height viewports
    content is being cut off... just a css understanding gap */}
        <div className="baseVertFlex relative h-[50dvh] !justify-start overflow-y-auto px-4 pb-4 text-yellow-500">
          {/* .map() of Your rewards */}
          <div className="baseVertFlex w-full gap-8 ">
            {/* Birthday reward options */}
            {/* {true && (

            )} */}

            {/* Regular reward options */}
            <div className="grid w-full grid-cols-1 !place-items-start gap-4 ">
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
          </div>
        </div>
      </div>

      <Button
        variant="underline"
        size="sm"
        className="baseFlex absolute left-0 top-1 gap-2"
        onClick={() => {
          setShowRewardsDrawer(false);
        }}
      >
        <IoIosArrowBack />
        Back
      </Button>
    </motion.div>
  );
}

export default RewardsDrawer;

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
        <div className="imageFiller mt-2 size-16 rounded-md"></div>

        <div className="baseVertFlex h-full w-48 !items-start !justify-between">
          <div className="baseVertFlex !items-start gap-2">
            <p className="text-lg font-medium underline underline-offset-2">
              {menuItem.name}
            </p>

            {/* Point cost for item */}
            {!forBirthdayReward && (
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
          }}
        >
          {currentlySelectedRewardId === menuItem.id ? "Unselect" : "Select"}
        </Button>
      </div>
    </div>
  );
}
