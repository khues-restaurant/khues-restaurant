import { useAuth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Fragment,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { IoIosArrowBack } from "react-icons/io";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type StoreCustomizations, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
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
  const { isSignedIn } = useAuth();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { menuItems, orderDetails, viewportLabel } = useMainStore((state) => ({
    menuItems: state.menuItems,
    orderDetails: state.orderDetails,
    viewportLabel: state.viewportLabel,
  }));

  const { data: rewards } = api.menuCategory.getRewardsCategories.useQuery();

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

  useEffect(() => {
    if (!user) return;

    setRewardsPointsEarned(user.rewardsPoints);
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

  if (!rewards) return null;

  return (
    <motion.div
      key="rewardsDrawerWrapper"
      initial={{ opacity: 0, translateX: "100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "100%" }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className="baseVertFlex relative size-full !justify-start"
    >
      <div className="baseVertFlex relative mt-10 w-full !justify-start overflow-y-auto ">
        <div
          style={{
            backgroundImage:
              "linear-gradient(to right bottom, oklch(0.9 0.13 87.8) 0%, oklch(0.75 0.13 87.8) 100%)",
          }}
          className="baseFlex relative mt-2 !h-40 w-full shrink-0 overflow-hidden shadow-sm"
        >
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
            className="absolute -left-10 -top-10"
          >
            <Image
              src={"/menuItems/sampleImage.webp"}
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
            className="absolute -bottom-10 -left-10"
          >
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              width={96}
              height={96}
              className="!relative drop-shadow-md tablet:drop-shadow-lg"
            />
          </motion.div>

          <div className="baseVertFlex z-10 gap-4 rounded-md bg-offwhite px-8 py-4 text-primary shadow-lg">
            <div className="text-center text-lg font-semibold">
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
            className="absolute -right-10 -top-10"
          >
            <Image
              src={"/menuItems/sampleImage.webp"}
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
            className="absolute -bottom-10 -right-10"
          >
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={"TODO: replace with proper alt tag text"}
              width={96}
              height={96}
              className="!relative drop-shadow-md tablet:drop-shadow-lg"
            />
          </motion.div>
        </div>

        <div className="baseFlex sticky top-[-2px] z-10 w-full gap-2 border-b bg-offwhite p-2 shadow-sm">
          <SideAccentSwirls className="h-[14px] scale-x-[-1] fill-primary" />
          <p className="text-center font-semibold text-primary">
            Choose your reward
          </p>
          <SideAccentSwirls className="h-[14px] fill-primary" />
        </div>

        {/* TODO: come back to this.. I feel like a higher dvh value should work but on shorter height viewports content is being cut off... just a css understanding gap, maybe you need some kind of calc trickery here? */}
        <div className="baseVertFlex relative !justify-start px-4 pb-24 pt-4 text-primary">
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
                  <div className="baseVertFlex gap-0">
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
          </div>
        </div>
        <p className="baseFlex fixed bottom-0 left-0 w-full border-t bg-offwhite py-3 text-center text-sm italic text-stone-400">
          * Only one reward is able to be redeemed per order.
        </p>
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
    if (currentlySelectedRewardId === null) return false;

    if (
      // conversion: item price (in cents) multiplied by 2
      userAvailablePoints < new Decimal(menuItem.price).mul(2).toNumber() ||
      !menuItem.available ||
      currentlySelectedRewardId !== menuItem.id
    ) {
      return true;
    }

    return false;
  }

  return (
    <div className="relative w-full max-w-96">
      <div className="baseFlex size-full !items-start gap-4 rounded-md p-4">
        <Image
          src={"/menuItems/sampleImage.webp"}
          alt={menuItem.name}
          width={64}
          height={64}
          className="rounded-md drop-shadow-md tablet:drop-shadow-lg"
        />

        <div className="baseVertFlex h-full w-48 !items-start !justify-between">
          <div className="baseVertFlex !items-start gap-2">
            <p className="text-lg font-medium underline underline-offset-2">
              {menuItem.name}
            </p>

            {/* Point cost for item */}
            {!forBirthdayReward && (
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
          variant={"outline"}
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

            const rewardItemPointsCost = new Decimal(menuItem.price)
              .mul(2) // item price (in cents) multiplied by 2
              .toNumber();

            if (userAvailablePoints < rewardItemPointsCost) {
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
          }}
        >
          {currentlySelectedRewardId === menuItem.id ? "Unselect" : "Select"}
        </Button>
      </div>
    </div>
  );
}
