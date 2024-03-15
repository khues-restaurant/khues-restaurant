import { type Discount } from "@prisma/client";
import { format, set } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type OrderDetails, useMainStore, type Item } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { rewardsItems } from "~/utils/rewardsItems";

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

  const { data: rewards } = api.user.getRewards.useQuery(userId);

  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const [itemPickerState, setItemPickerState] = useState<
    "points" | "birthday" | "notShowing"
  >("notShowing");

  const [pointsReward, setPointsReward] = useState<Discount | null>(null);
  const [birthdayReward, setBirthdayReward] = useState<Discount | null>(null);

  useEffect(() => {
    if (!rewards) return;

    // get the points reward & birthday reward that have the earliest expiration dates
    const sortedRewardsByExpirationDate = rewards
      .filter((r) => r.expirationDate > new Date())
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());

    const pointsReward = sortedRewardsByExpirationDate.find((r) =>
      r.name.includes("Points"),
    );

    const birthdayReward = sortedRewardsByExpirationDate.find((r) =>
      r.name.includes("Birthday"),
    );

    setPointsReward(pointsReward ?? null);
    setBirthdayReward(birthdayReward ?? null);
  }, [rewards]);

  return (
    <motion.div
      key="rewardsDrawerWrapper"
      initial={{ opacity: 0, translateX: "100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "100%" }}
      transition={{
        duration: 0.35,
      }}
      className="baseVertFlex relative h-full w-full !justify-start overflow-y-auto"
    >
      <AnimatePresence mode="popLayout">
        {itemPickerState !== "notShowing" ? (
          <motion.div
            key={"rewardItemRadioPicker"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="baseVertFlex mt-8 h-full w-full gap-4 p-4"
          >
            <div className="baseVertFlex gap-2 font-semibold">
              <span>Select your complementary </span>

              <div className="baseFlex gap-2">
                <div className="baseFlex gap-2 rounded-md bg-primary p-1 text-white ">
                  {itemPickerState === "points" ? (
                    <>
                      <CiGift className="size-6" />
                      1500 point reward
                    </>
                  ) : (
                    <>
                      <FaCakeCandles className="size-6" />
                      Birthday reward
                    </>
                  )}
                </div>
                <span>to redeem</span>
              </div>
            </div>
            {/* <p className="text-gray-400">{category.description}</p> */}
            <div className="baseFlex h-full gap-2">
              <RewardItemGroup
                rewardItems={
                  itemPickerState === "points"
                    ? rewardsItems.points
                    : rewardsItems.birthday
                }
                orderDetails={orderDetails}
                setShowRewardsDrawer={setShowRewardsDrawer}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={"mainRewardsRadioPicker"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="baseVertFlex mt-16 w-full"
          >
            <AnimatePresence>
              {pointsReward ?? birthdayReward ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="baseVertFlex gap-4"
                >
                  <p className="text-lg font-semibold">
                    Select your reward to redeem
                  </p>
                  <div className="baseFlex gap-2">
                    <RewardsGroup
                      rewards={[pointsReward, birthdayReward]}
                      orderDetails={orderDetails}
                      setItemPickerState={setItemPickerState}
                    />
                  </div>
                  <p className="text-sm italic text-gray-400">
                    * only one reward can be redeemed at a time per order.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={"rewardsDrawerSpinner"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block size-16 animate-spin rounded-full border-[4px] border-current border-t-transparent text-primary"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="underline"
        size="sm"
        className="baseFlex absolute left-0 top-1 gap-2"
        onClick={() => {
          if (itemPickerState === "notShowing") {
            setShowRewardsDrawer(false);
          } else {
            setItemPickerState("notShowing");
          }
        }}
      >
        <IoIosArrowBack />
        Back
      </Button>
    </motion.div>
  );
}

export default RewardsDrawer;

interface RewardsGroup {
  rewards: [Discount | null, Discount | null];
  orderDetails: OrderDetails;
  setItemPickerState: Dispatch<
    SetStateAction<"points" | "birthday" | "notShowing">
  >;
}

function RewardsGroup({
  rewards,
  orderDetails,
  setItemPickerState,
}: RewardsGroup) {
  return (
    <div className="baseVertFlex w-full !items-start">
      <div className="baseFlex mt-2 gap-2">
        <RadioGroup value={orderDetails.rewardBeingRedeemed?.reward.id}>
          {rewards[0] && (
            <RewardOption
              key={rewards[0].id}
              reward={rewards[0]}
              isSelected={
                orderDetails.rewardBeingRedeemed?.reward.id === rewards[0].id
              }
              orderDetails={orderDetails}
              setItemPickerState={setItemPickerState}
            />
          )}

          {rewards[1] && (
            <RewardOption
              key={rewards[1].id}
              reward={rewards[1]}
              isSelected={
                orderDetails.rewardBeingRedeemed?.reward.id === rewards[1].id
              }
              orderDetails={orderDetails}
              setItemPickerState={setItemPickerState}
            />
          )}

          {/* option to not select a reward */}
          <RewardOption
            reward={undefined}
            isSelected={
              orderDetails.rewardBeingRedeemed?.reward.id === undefined
            }
            orderDetails={orderDetails}
          />
        </RadioGroup>
      </div>
    </div>
  );
}

interface RewardOption {
  reward?: Discount;
  isSelected: boolean;
  orderDetails: OrderDetails;
  setItemPickerState?: Dispatch<
    SetStateAction<"points" | "birthday" | "notShowing">
  >;
}

function RewardOption({
  reward,
  isSelected,
  orderDetails,
  setItemPickerState,
}: RewardOption) {
  const [isHovered, setIsHovered] = useState(false);

  const { updateOrder } = useUpdateOrder();

  return (
    <div
      key={reward?.id ?? ""}
      style={{
        // borderColor: isHovered ? "var(--color-primary)" : "var(--color-gray-300)",
        flexDirection: (reward?.id ?? "") === "" ? "row" : "column",
      }}
      className={`baseVertFlex relative max-w-64 cursor-pointer !justify-start gap-4 rounded-md border-2 p-4 transition-all ${isHovered || isSelected ? "border-primary" : "border-gray-300"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchCancel={() => setIsHovered(false)}
      onClick={() => {
        const newOrderDetails = structuredClone(orderDetails);

        if (reward === undefined) {
          // update order to remove the reward
          updateOrder({
            newOrderDetails: {
              ...orderDetails,
              rewardBeingRedeemed: undefined,
            },
          });

          return;
        }

        // nothing to do because the reward is already selected
        if (newOrderDetails.rewardBeingRedeemed?.reward.id === reward.id) {
          return;
        }

        let defaultRewardItem;

        if (reward.name.includes("Points")) {
          defaultRewardItem = rewardsItems.defaultPointsItem;
        } else if (reward.name.includes("Birthday")) {
          defaultRewardItem = rewardsItems.defaultBirthdayItem;
        }

        if (!defaultRewardItem) return;

        updateOrder({
          newOrderDetails: {
            ...orderDetails,
            rewardBeingRedeemed: {
              reward,
              item: {
                id: crypto.randomUUID(),
                itemId: defaultRewardItem.id,
                name: defaultRewardItem.name,
                customizations: {},
                discountId: reward.id,
                specialInstructions: "",
                includeDietaryRestrictions: false, // TODO: is this correct ?
                quantity: 1,
                price: defaultRewardItem.price,
              },
            },
          },
        });
      }}
    >
      {!reward && <RadioGroupItem id={""} value={""} />}

      <div className="baseVertFlex w-full gap-6">
        {reward && (
          <AnimatePresence>
            {isSelected ? (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="baseFlex h-24 w-full gap-2 "
              >
                <div className="relative h-24 w-64 rounded-md">
                  <div className="imageFiller h-full w-full rounded-md" />
                  <div className="baseFlex absolute bottom-0 left-4 gap-2 rounded-t-md bg-white px-2">
                    {orderDetails.rewardBeingRedeemed && (
                      <p>{orderDetails.rewardBeingRedeemed.item.name}</p>
                    )}

                    <Button
                      variant={"underline"}
                      className="self-end text-xs font-semibold"
                      onClick={() => {
                        setItemPickerState?.(
                          reward.name.includes("Points")
                            ? "points"
                            : "birthday",
                        );
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${reward.id}fillerIcon`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="baseFlex h-24 w-full"
              >
                {reward.name.includes("Points") ? (
                  <CiGift className="size-8" />
                ) : (
                  <FaCakeCandles className="size-8" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <div className="baseVertFlex h-full w-full gap-2">
          <Label htmlFor={reward?.id ?? ""} className="self-start">
            {reward?.name ?? "Don't redeem a reward with this order."}
          </Label>
          {reward && (
            <>
              <p className="self-start text-gray-400">{reward.description}</p>
              <p className="self-start text-sm italic text-gray-400">
                Expires on: {format(reward.expirationDate, "PPP")}
              </p>
            </>
          )}
        </div>
      </div>

      {reward && (
        <RadioGroupItem id={reward?.id ?? ""} value={reward?.id ?? ""} />
      )}
    </div>
  );
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface RewardItemGroup {
  rewardItems: RewardItem[];
  orderDetails: OrderDetails;
  setShowRewardsDrawer: Dispatch<SetStateAction<boolean>>;
}

function RewardItemGroup({
  rewardItems,
  orderDetails,
  setShowRewardsDrawer,
}: RewardItemGroup) {
  const [selectedItemOption, setSelectedItemOption] = useState(
    orderDetails.rewardBeingRedeemed?.item,
  );

  const { updateOrder } = useUpdateOrder();

  console.log(
    selectedItemOption?.itemId,
    orderDetails.rewardBeingRedeemed?.item.itemId,
  );

  return (
    <div className="baseVertFlex relative h-full w-full !items-start gap-4">
      <div className="baseFlex mt-2 w-[90vw] snap-x snap-mandatory !justify-start overflow-x-auto py-2">
        <RadioGroup
          value={selectedItemOption?.itemId ?? ""}
          className="baseFlex w-full !justify-start gap-8"
        >
          {rewardItems.map((rewardItem) => (
            <RewardItemOption
              key={rewardItem.id}
              rewardItem={rewardItem}
              isSelected={(selectedItemOption?.itemId ?? "") === rewardItem.id}
              orderDetails={orderDetails}
              setSelectedItemOption={setSelectedItemOption}
            />
          ))}
        </RadioGroup>
      </div>

      <Button
        disabled={
          selectedItemOption?.itemId ===
          orderDetails.rewardBeingRedeemed?.item.itemId
        }
        className="self-center"
        onClick={() => {
          const rewardBeingRedeemed = orderDetails.rewardBeingRedeemed?.reward;
          if (!rewardBeingRedeemed || !selectedItemOption) return;

          updateOrder({
            newOrderDetails: {
              ...orderDetails,
              rewardBeingRedeemed: {
                reward: rewardBeingRedeemed,
                item: selectedItemOption,
              },
            },
          });

          setShowRewardsDrawer(false);
        }}
      >
        Confirm selection
      </Button>
    </div>
  );
}

interface RewardItemOption {
  rewardItem: RewardItem;
  isSelected: boolean;
  orderDetails: OrderDetails;
  setSelectedItemOption: Dispatch<SetStateAction<Item | undefined>>;
}

function RewardItemOption({
  rewardItem,
  isSelected,
  orderDetails,
  setSelectedItemOption,
}: RewardItemOption) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      key={rewardItem.id}
      className={`baseVertFlex relative max-w-min cursor-pointer snap-center !justify-start gap-4 rounded-md border-2 p-4 transition-all ${isHovered || isSelected ? "border-primary" : "border-gray-300"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchCancel={() => setIsHovered(false)}
      onClick={() => {
        setSelectedItemOption({
          id: crypto.randomUUID(),
          itemId: rewardItem.id,
          name: rewardItem.name,
          customizations: {},
          discountId: orderDetails.rewardBeingRedeemed!.reward.id, // TODO: should always be defined right?
          specialInstructions: "",
          includeDietaryRestrictions: false, // TODO: is this correct ?
          quantity: 1,
          price: rewardItem.price,
        });
      }}
    >
      <div className="imageFiller relative h-36 w-48 rounded-t-md shadow-md">
        <p className="absolute bottom-0 left-4 rounded-t-md bg-white px-4 py-2">
          {rewardItem.name}
        </p>
      </div>

      <p className="self-start text-gray-400">{rewardItem.description}</p>

      <RadioGroupItem id={rewardItem.id} value={rewardItem.id} />
    </motion.div>
  );
}

// vvv can prob still use this horizontal layout for mobile drawer layout!
// might even want to revert to using this layout for desktop too...

//  <div
//    key={rewardId}
//    // style={{
//    //   borderColor: isHovered ? "var(--color-primary)" : "var(--color-gray-300)",
//    // }}
//    className={`baseFlex relative min-w-96 cursor-pointer !justify-start gap-4 rounded-md border-2 p-4 transition-all ${isHovered || isSelected ? "border-primary" : "border-gray-300"}`}
//    onMouseEnter={() => setIsHovered(true)}
//    onMouseLeave={() => setIsHovered(false)}
//    onTouchStart={() => setIsHovered(true)}
//    onTouchEnd={() => setIsHovered(false)}
//    onTouchCancel={() => setIsHovered(false)}
//    onClick={() => {
//      const newOrderDetails = structuredClone(orderDetails);

//      if (reward === undefined) {
//        // update order to remove the reward
//        updateOrder({
//          newOrderDetails: {
//            ...orderDetails,
//            rewardBeingRedeemed: undefined,
//          },
//        });

//        setSelectedRewardId?.("");
//        return;
//      }

//      console.log(newOrderDetails.rewardBeingRedeemed?.reward.id, reward.id);

//      // nothing to do because the reward is already selected
//      if (newOrderDetails.rewardBeingRedeemed?.reward.id === reward.id) {
//        return;
//      }

//      let defaultRewardItem;

//      if (reward.name.includes("Points")) {
//        defaultRewardItem = rewardsItems.defaultPointsItem;
//      } else if (reward.name.includes("Birthday")) {
//        defaultRewardItem = rewardsItems.defaultBirthdayItem;
//      }

//      if (!defaultRewardItem) return;

//      updateOrder({
//        newOrderDetails: {
//          ...orderDetails,
//          rewardBeingRedeemed: {
//            reward,
//            item: {
//              id: crypto.randomUUID(),
//              itemId: defaultRewardItem.id,
//              name: defaultRewardItem.name,
//              customizations: [],
//              discountId: reward.id,
//              specialInstructions: "",
//              includeDietaryRestrictions: false, // TODO: is this correct ?
//              quantity: 1,
//              price: defaultRewardItem.price,
//            },
//          },
//        },
//      });
//    }}
//  >
//    <RadioGroupItem id={rewardId} value={rewardId} />
//    <div className="baseVertFlex h-full w-full gap-2">
//      <Label htmlFor={rewardId} className="self-start">
//        {reward?.name ?? "Don't redeem a reward with this order."}
//      </Label>
//      {reward && (
//        <>
//          <p className="max-w-64 self-start text-gray-400">
//            {reward.description}
//          </p>
//          <p className="self-start text-gray-400 text-sm">
//            Expires on: {format(reward.expirationDate, "PPP")}
//          </p>
//        </>
//      )}
//    </div>

//    {reward && (
//      <AnimatePresence>
//        {isSelected ? (
//          <motion.div
//            key={reward.id}
//            initial={{ opacity: 0 }}
//            animate={{ opacity: 1 }}
//            exit={{ opacity: 0 }}
//            transition={{ duration: 0.2 }}
//            className="baseFlexFlex !justify-end gap-2 "
//          >
//            <Button
//              variant={"underline"}
//              className="text-xs font-semibold"
//              onClick={() => {
//                setShowRewardItemPicker(true);
//              }}
//            >
//              Change
//            </Button>
//            <div className="imageFiller size-16 rounded-md" />
//            <p>{selectedRewardItem.name}</p>
//          </motion.div>
//        ) : (
//          <motion.div
//            key={`${reward.id}fillerIcon`}
//            initial={{ opacity: 0 }}
//            animate={{ opacity: 1 }}
//            exit={{ opacity: 0 }}
//            transition={{ duration: 0.2 }}
//          >
//            {reward.name.includes("Points") ? (
//              <CiGift className="size-8" />
//            ) : (
//              <FaCakeCandles className="size-8" />
//            )}
//          </motion.div>
//        )}
//      </AnimatePresence>
//    )}
//  </div>;
