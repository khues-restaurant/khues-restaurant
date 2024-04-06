import { useAuth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import Image from "next/image";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type StoreCustomizations, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getRewardsPointCost } from "~/utils/getRewardsPointCost";

interface RewardsDialog {
  showRewardsDialog: boolean;
  setShowRewardsDialog: Dispatch<SetStateAction<boolean>>;
}

function RewardsDialog({
  showRewardsDialog,
  setShowRewardsDialog,
}: RewardsDialog) {
  return (
    <Dialog
      open={showRewardsDialog}
      onOpenChange={(open) => {
        if (!open) {
          setShowRewardsDialog(false);
        }
      }}
    >
      <RewardsDialogContent
        showRewardsDialog={showRewardsDialog}
        setShowRewardsDialog={setShowRewardsDialog}
      />
    </Dialog>
  );
}

export default RewardsDialog;

interface RewardsDialogContent {
  showRewardsDialog: boolean;
  setShowRewardsDialog: Dispatch<SetStateAction<boolean>>;
}

function RewardsDialogContent({
  showRewardsDialog,
  setShowRewardsDialog,
}: RewardsDialogContent) {
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

  if (!rewards) return null;

  return (
    <DialogContent
      extraBottomSpacer={false}
      className="w-[800px] max-w-[800px]"
    >
      <div className="baseVertFlex relative w-full !justify-start gap-2">
        <div className="baseVertFlex w-full gap-2">
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

        <div className="baseVertFlex relative !justify-start overflow-y-auto pr-4 text-yellow-500 tablet:h-[500px]">
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
    </DialogContent>
  );
}

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
    <div className="relative w-full max-w-96">
      <div className="baseFlex h-full w-full !items-start gap-4 rounded-md border-2 p-4">
        <Image
          src={"/menuItems/sampleImage.webp"}
          alt={menuItem.name}
          width={64}
          height={64}
          className="rounded-md"
        />

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
