import { type CustomizationChoice } from "@prisma/client";
import { useState, type Dispatch, type SetStateAction, useEffect } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";
import AnimatedPrice from "~/components/AnimatedPrice";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import {
  useMainStore,
  type Item,
  type StoreCustomizations,
} from "~/stores/MainStore";
import { api } from "~/utils/api";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { formatPrice } from "~/utils/formatPrice";
import isEqual from "lodash.isequal";
import { AnimatePresence, motion } from "framer-motion";
import {
  type StoreCustomizationCategory,
  type FullMenuItem,
} from "~/server/api/routers/menuCategory";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";

interface ItemCustomizationDialog {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  itemToCustomize: FullMenuItem | null;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  itemOrderDetails?: Item;
  forCart?: boolean;
}

function ItemCustomizationDialog({
  isDialogOpen,
  setIsDialogOpen,
  itemToCustomize,
  setItemToCustomize,
  itemOrderDetails,
  forCart,
}: ItemCustomizationDialog) {
  return (
    <Dialog
      open={Boolean(isDialogOpen && itemToCustomize)}
      onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setTimeout(() => {
            setItemToCustomize(null);
          }, 300);
        }
      }}
    >
      {itemToCustomize && (
        <ItemCustomizerDialogContent
          itemToCustomize={itemToCustomize}
          setIsDialogOpen={setIsDialogOpen}
          itemOrderDetails={itemOrderDetails}
          forCart={forCart}
        />
      )}
    </Dialog>
  );
}

export default ItemCustomizationDialog;

function getDefaultCustomizationChoices(item: FullMenuItem) {
  return item.customizationCategory.reduce((acc, category) => {
    acc[category.id] = category.defaultChoiceId;
    return acc;
  }, {} as StoreCustomizations);
}

interface ItemCustomizerDialogContent {
  itemToCustomize: FullMenuItem;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  itemOrderDetails?: Item;
  forCart?: boolean;
}

function ItemCustomizerDialogContent({
  itemToCustomize,
  setIsDialogOpen,
  itemOrderDetails,
  forCart,
}: ItemCustomizerDialogContent) {
  const userId = useGetUserId();
  const ctx = api.useUtils();

  const { data: user } = api.user.get.useQuery(userId);
  const { mutate: favoriteItem, isLoading: favoritingItem } =
    api.favorite.addFavoriteItem.useMutation({
      onSuccess: () => {
        void ctx.favorite.getFavoriteItemIds.invalidate();
      },
    });

  const { mutate: unfavoriteItem, isLoading: unfavoritingItem } =
    api.favorite.removeFavoriteItem.useMutation({
      onSuccess: () => {
        void ctx.favorite.getFavoriteItemIds.invalidate();
      },
    });

  const { orderDetails, customizationChoices, discounts, userFavoriteItemIds } =
    useMainStore((state) => ({
      orderDetails: state.orderDetails,
      customizationChoices: state.customizationChoices,
      discounts: state.discounts,
      userFavoriteItemIds: state.userFavoriteItemIds,
    }));

  const { updateOrder } = useUpdateOrder();

  const [localItemOrderDetails, setLocalItemOrderDetails] = useState(
    itemOrderDetails ?? {
      id: crypto.randomUUID(),
      name: itemToCustomize.name,
      customizations: getDefaultCustomizationChoices(itemToCustomize),
      specialInstructions: "",
      includeDietaryRestrictions: false,
      quantity: 1,
      price: itemToCustomize.price,
      itemId: itemToCustomize.id,
      discountId: itemToCustomize.activeDiscountId,
      pointReward: false,
      birthdayReward: false,
    },
  );

  const initialItemState = itemOrderDetails;

  return (
    <DialogContent className="max-w-4xl">
      <div className="baseVertFlex relative w-full !justify-start overflow-y-auto tablet:h-[600px] desktop:h-[700px]">
        <div className="baseVertFlex imageFiller relative min-h-72 w-full rounded-md shadow-md">
          {/* veryyy out there but maybe could maybe have the left side of the image blurred
                  a bit so you could read the name of the item without the need of the
                  bg-white stuff? Not sure how good it would look */}

          <div className="baseFlex absolute bottom-0 left-4 gap-4 rounded-md bg-white px-4 py-2 text-xl font-semibold">
            {itemToCustomize.name}

            {/* TODO: wrap the like button in a Popover to show "Only rewards members can favorite items" */}

            <AnimatePresence>
              {userFavoriteItemIds.includes(itemToCustomize.id) ? (
                <Button
                  variant={"outline"}
                  size={"sm"}
                  disabled={unfavoritingItem}
                  onClick={() => {
                    unfavoriteItem({
                      userId,
                      menuItemId: itemToCustomize.id,
                    });
                  }}
                >
                  <motion.div
                    key={`${itemToCustomize.id}DislikeButton`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="baseFlex gap-2 text-primary"
                  >
                    <IoMdHeart />
                    Favorited
                  </motion.div>
                </Button>
              ) : (
                <Button
                  variant={"outline"}
                  size={"sm"}
                  disabled={favoritingItem}
                  onClick={() => {
                    favoriteItem({
                      userId,
                      menuItemId: itemToCustomize.id,
                    });
                  }}
                >
                  <motion.div
                    key={`${itemToCustomize.id}LikeButton`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="baseFlex gap-2 text-primary"
                  >
                    <IoMdHeartEmpty />
                    Favorite
                  </motion.div>
                </Button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="baseVertFlex w-full gap-12 p-8 pb-36 pt-4">
          {/* Description */}
          <div className="baseVertFlex w-full !items-start gap-2">
            <p className="text-lg underline underline-offset-2">Description</p>
            <p className="max-w-96 text-wrap text-left text-gray-400 tablet:max-w-2xl">
              {itemToCustomize.description}
            </p>
          </div>

          {/* Customizations */}
          {itemToCustomize.customizationCategory.length > 0 && (
            <div className="baseVertFlex w-full !items-start gap-2">
              <p className="text-lg underline underline-offset-2">
                Customizations
              </p>

              <div className="baseVertFlex w-full gap-2">
                {itemToCustomize.customizationCategory.map((category) => (
                  <CustomizationGroup
                    key={category.id}
                    category={category}
                    localItemOrderDetails={localItemOrderDetails}
                    setLocalItemOrderDetails={setLocalItemOrderDetails}
                    forReward={
                      itemOrderDetails?.pointReward ??
                      itemOrderDetails?.birthdayReward ??
                      false
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="baseVertFlex w-full !items-start gap-2">
            <div className="baseFlex gap-2">
              <p className="text-lg underline underline-offset-2">
                Special instructions
              </p>
              <span className="text-sm italic text-gray-400">- Optional</span>
            </div>

            <div className="relative h-32 w-full">
              {user && user.dietaryRestrictions.length > 0 && (
                <div className="baseFlex absolute -top-8 right-0 gap-2">
                  <Switch
                    id="allergySwitch"
                    checked={localItemOrderDetails.includeDietaryRestrictions}
                    onCheckedChange={(checked) =>
                      setLocalItemOrderDetails((prev) => ({
                        ...prev,
                        includeDietaryRestrictions: checked,
                      }))
                    }
                  />
                  <Label htmlFor="allergySwitch">
                    Include dietary preferences associated with your account.
                  </Label>
                </div>
              )}

              <Textarea
                className="h-full w-full resize-none rounded-md border-2 p-4"
                placeholder="Detail out any special instructions for this item."
                value={localItemOrderDetails.specialInstructions}
                onChange={(e) => {
                  if (e.target.value.length > 100) return;

                  setLocalItemOrderDetails({
                    ...localItemOrderDetails,
                    specialInstructions: e.target.value,
                  });
                }}
              />
              <p className="pointer-events-none absolute bottom-2 right-4 text-xs text-gray-400 tablet:bottom-1">
                {100 - localItemOrderDetails.specialInstructions.length}{" "}
                characters remaining
              </p>

              <p className="relative left-0 top-0 gap-2 text-sm italic text-gray-400 tablet:text-base">
                *No price altering substitutions/additions allowed.
              </p>
            </div>
          </div>

          {/* Reviews */}
          {/* <div className="baseVertFlex w-full gap-2">
          </div> */}
        </div>
        <DialogFooter>
          <div className="baseFlex bottom-0 left-0 w-full !justify-end border-t-2 bg-gray-200 px-4 py-2 tablet:rounded-b-md">
            <div className="baseFlex w-75 !justify-end gap-2 tablet:w-96 tablet:gap-6">
              {!itemOrderDetails?.birthdayReward &&
                !itemOrderDetails?.pointReward && (
                  <div className="baseFlex gap-2">
                    Quantity
                    <div className="baseFlex h-8">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={localItemOrderDetails.quantity <= 1}
                        className="size-8 rounded-r-none border-2 border-r-0 border-gray-500 p-0"
                        onClick={() => {
                          if (localItemOrderDetails.quantity <= 1) return;

                          setLocalItemOrderDetails((prev) => ({
                            ...prev,
                            quantity: prev.quantity - 1,
                          }));
                        }}
                      >
                        <LuMinus className="size-4" />
                      </Button>

                      <div className="baseFlex h-full w-8 border-y-2 border-gray-500 bg-white font-semibold">
                        {localItemOrderDetails.quantity}
                      </div>

                      <Button
                        variant="outline"
                        disabled={localItemOrderDetails.quantity > 99}
                        className="size-8 rounded-l-none border-2 border-l-0 border-gray-500 p-0"
                        onClick={() => {
                          if (localItemOrderDetails.quantity > 99) return;

                          setLocalItemOrderDetails((prev) => ({
                            ...prev,
                            quantity: prev.quantity + 1,
                          }));
                        }}
                      >
                        <LuPlus className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}

              <Button
                variant="default"
                disabled={isEqual(localItemOrderDetails, initialItemState)}
                className="text-xs font-semibold tablet:text-sm"
                onClick={() => {
                  const newOrderDetails = structuredClone(orderDetails);

                  // just need to update the existing item
                  if (forCart) {
                    const existingItemIndex = newOrderDetails.items.findIndex(
                      (i) => i.name === itemToCustomize.name,
                    );

                    if (existingItemIndex !== -1) {
                      newOrderDetails.items[existingItemIndex] = {
                        ...localItemOrderDetails,
                        pointReward: itemOrderDetails?.pointReward ?? false,
                        birthdayReward:
                          itemOrderDetails?.birthdayReward ?? false,
                      };
                    }
                  } else {
                    newOrderDetails.items.push(localItemOrderDetails);
                  }

                  updateOrder({
                    newOrderDetails,
                  });

                  setIsDialogOpen?.(false);
                }}
              >
                <div className="baseFlex gap-2">
                  <span>{itemOrderDetails ? "Update" : "Add to order"}</span>
                  -
                  <AnimatedPrice
                    price={formatPrice(
                      calculateRelativeTotal({
                        items: [localItemOrderDetails],
                        customizationChoices,
                        discounts,
                      }),
                    )}
                  />
                </div>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

interface CustomizationGroup {
  category: StoreCustomizationCategory;
  localItemOrderDetails: Item;
  setLocalItemOrderDetails: Dispatch<SetStateAction<Item>>;
  forReward: boolean;
}

function CustomizationGroup({
  category,
  localItemOrderDetails,
  setLocalItemOrderDetails,
  forReward,
}: CustomizationGroup) {
  const [priceOfSelectedChoiceId, setPriceOfSelectedChoiceId] = useState(0);

  useEffect(() => {
    setPriceOfSelectedChoiceId(
      category.customizationChoice.find(
        (c) => c.id === localItemOrderDetails.customizations[category.id],
      )?.priceAdjustment ?? 0,
    );
  }, [
    localItemOrderDetails.customizations,
    category.customizationChoice,
    category.defaultChoiceId,
    category.id,
  ]);

  return (
    <div key={category.id} className="baseVertFlex w-full !items-start">
      <p className="text-lg font-semibold">{category.name}</p>
      <p className="text-gray-400">{category.description}</p>
      <div className="baseFlex mt-2 gap-2">
        <RadioGroup value={localItemOrderDetails.customizations[category.id]}>
          {category.customizationChoice.map((choice) => {
            // Determine if the current choice is the default choice.
            const isDefaultChoice = choice.id === category.defaultChoiceId;
            // Define a variable to hold the calculated relative price or the direct price adjustment.
            let displayPrice;

            if (forReward) {
              if (choice.priceAdjustment > 0) {
                // For positively priced customizations when forReward is true, show its regular price.
                displayPrice = choice.priceAdjustment;
              } else if (isDefaultChoice) {
                // If it's the default choice and forReward is true, set displayPrice to 0.
                displayPrice = 0;
              } else {
                // Otherwise, for non-positive adjustments or non-default choices, calculate relative price.
                displayPrice = Math.max(
                  0,
                  choice.priceAdjustment - priceOfSelectedChoiceId,
                );
              }
            } else {
              // When forReward is false, use the existing relative price calculation.
              displayPrice = choice.priceAdjustment - priceOfSelectedChoiceId;
            }

            return (
              <CustomizationOption
                key={choice.id}
                choice={choice}
                isSelected={
                  localItemOrderDetails.customizations[category.id] ===
                  choice.id
                }
                relativePrice={displayPrice}
                setLocalItemOrderDetails={setLocalItemOrderDetails}
              />
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}

interface CustomizationOption {
  choice: CustomizationChoice;
  isSelected: boolean;
  relativePrice: number;
  setLocalItemOrderDetails: Dispatch<SetStateAction<Item>>;
}

function CustomizationOption({
  choice,
  isSelected,
  relativePrice,
  setLocalItemOrderDetails,
}: CustomizationOption) {
  // const [choiceIsSelected, setChoiceIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      key={choice.id}
      // style={{
      //   borderColor: isHovered ? "var(--color-primary)" : "var(--color-gray-300)",
      // }}
      className={`baseFlex relative min-w-96 cursor-pointer !justify-start gap-4 rounded-md border-2 p-4 transition-all ${isHovered || isSelected ? "border-primary" : "border-gray-300"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchCancel={() => setIsHovered(false)}
      onClick={() => {
        setLocalItemOrderDetails((prev) => {
          const newCustomizations = {
            ...prev.customizations,
            [choice.customizationCategoryId]: choice.id,
          };

          return {
            ...prev,
            customizations: newCustomizations,
          };
        });
      }}
    >
      <RadioGroupItem id={choice.id} value={choice.id} />
      <div className="baseVertFlex h-full w-full gap-2">
        <Label htmlFor={choice.id} className="self-start">
          {choice.name}
        </Label>
        <p className="self-start text-gray-400">{choice.description}</p>
        <AnimatePresence>
          {!isSelected && (
            <motion.p
              key={choice.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-2 right-4"
            >
              {formatPrice(relativePrice)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
