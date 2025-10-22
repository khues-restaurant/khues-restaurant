import { useAuth } from "@clerk/nextjs";
import { type User } from "@prisma/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import AnimatedNumbers from "~/components/AnimatedNumbers";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { menuItemImagePaths } from "~/utils/menuItemImagePaths";

// import affogato from "/public/menuItems/affogato.png";
// import grilledSirloin from "/public/menuItems/grilled-sirloin.png";
// import roastPorkFriedRice from "/public/menuItems/roast-pork-fried-rice.png";
// import thaiTeaTresLeches from "/public/menuItems/thai-tea-tres-leches.png";

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

  const { rewards, orderDetails, viewportLabel } = useMainStore((state) => ({
    rewards: state.rewards,
    orderDetails: state.orderDetails,
    viewportLabel: state.viewportLabel,
  }));

  const [birthdaySelectedRewardId, setBirthdaySelectedRewardId] = useState<
    string | null
  >(null);

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

  if (!rewards) return null;

  return (
    <DialogContent
      extraBottomSpacer={false}
      className="w-[800px] max-w-[800px]"
    >
      <VisuallyHidden>
        <DialogTitle>Rewards selection</DialogTitle>
        <DialogDescription>
          Select a reward from the list below. Only one reward can be redeemed
          per order.
        </DialogDescription>
      </VisuallyHidden>

      <div className="baseVertFlex relative max-h-[85vh] w-full !justify-start gap-2">
        <div className="baseFlex relative h-48 w-full overflow-hidden rounded-md bg-rewardsGradient shadow-sm">
          {/* <motion.div
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
            className="absolute -left-8 -top-8"
          >
            <Image
              src={grilledSirloin}
              alt={"TODO: replace with proper alt tag text"}
              width={500}
              height={500}
              priority
              className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
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
            className="absolute -bottom-8 -left-8"
          >
            <Image
              src={roastPorkFriedRice}
              alt={"TODO: replace with proper alt tag text"}
              width={500}
              height={500}
              priority
              className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
            />
          </motion.div> */}

          <div className="baseVertFlex z-8 gap-4 rounded-md bg-offwhite px-8 py-4 text-primary shadow-lg">
            <div className="baseFlex gap-4 font-bold tracking-wider">
              <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary" />

              <div className="text-center text-lg font-semibold">
                Khue&apos;s Rewards
              </div>

              <SideAccentSwirls className="h-5 fill-primary" />
            </div>
          </div>

          {/* <motion.div
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
            className="absolute -right-8 -top-8"
          >
            <Image
              src={affogato}
              alt={"TODO: replace with proper alt tag text"}
              width={500}
              height={500}
              priority
              className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
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
            className="absolute -bottom-8 -right-8"
          >
            <Image
              src={thaiTeaTresLeches}
              alt={"TODO: replace with proper alt tag text"}
              width={500}
              height={500}
              priority
              className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
            />
          </motion.div> */}
        </div>

        <div className="baseFlex gap-4">
          <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary" />
          <p className="text-center font-semibold text-primary tablet:text-lg">
            Choose your reward
          </p>
          <SideAccentSwirls className="h-4 fill-primary" />
        </div>

        <div className="baseVertFlex relative !justify-start overflow-y-auto border-y pr-4 pt-2 text-primary tablet:h-[500px]">
          <div className="baseVertFlex w-full gap-8">
            {/* Birthday reward options */}
            <div className="grid w-full grid-cols-1 !place-items-start gap-4 ">
              {/* Categories */}
              {rewards.birthdayMenuCategories.map((category) => (
                <div
                  key={category.id}
                  className="baseVertFlex w-full !items-start"
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
                            key={item.id}
                            menuItem={item}
                            currentlySelectedRewardId={birthdaySelectedRewardId}
                            forBirthdayReward={true}
                            user={user}
                          />

                          {index !== category.menuItems.length - 1 && (
                            <Separator className="h-[1px] w-[96%]" />
                          )}
                        </Fragment>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm italic text-stone-400 desktop:mt-2">
          * Only one reward is able to be redeemed per order.
        </p>
      </div>
    </DialogContent>
  );
}

interface RewardMenuItem {
  menuItem: FullMenuItem;
  currentlySelectedRewardId: string | null;
  forBirthdayReward: boolean;
  user: User | null | undefined;
}

function RewardMenuItem({
  menuItem,
  currentlySelectedRewardId,
  forBirthdayReward,
  user,
}: RewardMenuItem) {
  // actually calls updateOrder() and shows toast(), but prob don't bother with the "undo" logic for this
  // right now

  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const { updateOrder } = useUpdateOrder();

  const { toast } = useToast();

  function isDisabled() {
    if (!menuItem.available) return true;

    if (
      currentlySelectedRewardId === null ||
      currentlySelectedRewardId === menuItem.id
    )
      return false;

    return false;
  }

  return (
    <div className="relative w-[400px]">
      <div className="baseFlex size-full !items-start gap-4 rounded-md py-4">
        {menuItemImagePaths[menuItem.name] && (
          <Image
            src={menuItemImagePaths[menuItem.name] ?? ""}
            alt={`${menuItem.name} at Khue's in St. Paul`}
            width={500}
            height={500}
            className="!size-20 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
          />
        )}

        <div className="baseVertFlex w-full !items-start">
          <div className="baseVertFlex size-full !items-start !justify-between">
            <div className="baseVertFlex !items-start gap-1">
              <p className="font-medium underline underline-offset-2">
                {menuItem.name}
              </p>

              {/* Point cost for item */}
              {!forBirthdayReward && (
                <p className="max-w-48 whitespace-normal text-left text-sm text-stone-400 supports-[text-wrap]:text-wrap">
                  {new Decimal(menuItem.price)
                    .mul(2) // item price (in cents) multiplied by 2
                    .toNumber()}{" "}
                  points
                </p>
              )}
            </div>
          </div>

          <div className="baseFlex w-full !justify-between">
            {!menuItem.available && (
              <div className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-400">
                <p className="text-xs italic">Currently unavailable</p>
              </div>
            )}

            <Button
              variant={"outline"}
              disabled={isDisabled()}
              className="ml-auto"
              onClick={() => {
                if (currentlySelectedRewardId === menuItem.id) {
                  const { items } = orderDetails;

                  const updatedItems = [];

                  for (const item of items) {
                    // Check if this item should be excluded
                    if (item.itemId === menuItem.id && item.birthdayReward) {
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
                        customizations:
                          getDefaultCustomizationChoices(menuItem),
                        specialInstructions: "",
                        includeDietaryRestrictions:
                          user?.autoApplyDietaryRestrictions ?? false,
                        quantity: 1,
                        price: menuItem.price,
                        discountId: null,
                        birthdayReward: forBirthdayReward,
                      },
                    ],
                  },
                });
              }}
            >
              {currentlySelectedRewardId === menuItem.id ? "Remove" : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
