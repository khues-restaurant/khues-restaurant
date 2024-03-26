import { type CustomizationChoice } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IoIosArrowBack, IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { LuMinus, LuPlus } from "react-icons/lu";
import AnimatedPrice from "~/components/AnimatedPrice";
import { Button } from "~/components/ui/button";
import { DrawerFooter } from "~/components/ui/drawer";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import {
  type FullMenuItem,
  type StoreCustomizationCategory,
} from "~/server/api/routers/menuCategory";
import {
  useMainStore,
  type Item,
  type StoreCustomizations,
} from "~/stores/MainStore";
import { api } from "~/utils/api";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { formatPrice } from "~/utils/formatPrice";

function getDefaultCustomizationChoices(item: FullMenuItem) {
  return item.customizationCategory.reduce((acc, category) => {
    acc[category.id] = category.defaultChoiceId;
    return acc;
  }, {} as StoreCustomizations);
}

interface ItemCustomizationDrawer {
  setIsDrawerOpen?: Dispatch<SetStateAction<boolean>>;
  itemToCustomize: FullMenuItem;
  setItemToCustomize?: Dispatch<SetStateAction<FullMenuItem | null>>;
  itemOrderDetails?: Item;
  forCart?: boolean;
}

function ItemCustomizationDrawer({
  setIsDrawerOpen,
  itemToCustomize,
  setItemToCustomize,
  itemOrderDetails,
  forCart,
}: ItemCustomizationDrawer) {
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
    },
  );

  const initialItemState = itemOrderDetails;

  return (
    <motion.div
      key={itemToCustomize.name}
      initial={{ opacity: 0, translateX: "100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "100%" }}
      transition={{
        duration: 0.35,
      }}
      className="baseVertFlex max-h-[85dvh] w-full !justify-start overflow-y-auto"
    >
      {/* again probably make a separate "forCart" prop */}
      {forCart && (
        <Button
          variant="underline"
          size="sm"
          className="baseFlex absolute left-0 top-1 gap-2"
          onClick={() => {
            setItemToCustomize?.(null);
          }}
        >
          <IoIosArrowBack />
          Back
        </Button>
      )}

      <div className="baseVertFlex mt-8 w-full gap-2">
        <div className="baseFlex relative w-full !justify-between px-8">
          <p className="text-xl font-semibold underline underline-offset-2">
            {itemToCustomize.name}
          </p>

          {/* TODO: wrap the like button in a Popover to show "Only rewards members can favorite items" */}

          <AnimatePresence>
            {userFavoriteItemIds.includes(itemToCustomize.id) ? (
              <Button
                variant={"outline"}
                disabled={unfavoritingItem}
                size={"sm"}
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
                disabled={favoritingItem}
                size={"sm"}
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
        <div className="baseVertFlex imageFiller h-48 w-full max-w-80 rounded-md shadow-md" />
      </div>

      {/* TODO: really have no clue why pb-36 is necessary here, it's like the footer just still
          doesn't take up any space in dom? Making it relative helps, but it still is so damn weird */}
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

            {user && user.dietaryRestrictions.length > 0 && (
              <div className="baseFlex relative left-0 top-0 gap-2">
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

            <p className="relative left-0 top-0 gap-2 text-sm italic text-gray-400 tablet:text-base">
              *No price altering substitutions/additions allowed.
            </p>
          </div>
        </div>

        {/* Reviews */}
        {/* <div className="baseVertFlex w-full gap-2">
          </div> */}
      </div>
      <DrawerFooter>
        <div className="baseFlex w-full !justify-end bg-gray-200 px-4 py-2">
          <div className="baseFlex gap-4">
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
                {/* I think in an ideal world you do the input, but has some definite ux edgecases tied to it */}
                {/* <Input
                    value={localItemOrderDetails.quantity}
                    // look at autostrum for handling where you will allow whole input to be deleted,
                    // but placeholder will show "1", and price will still show the price of 1 item, so still
                    // able to be clicked

                    onChange={(e) =>
                      setLocalItemOrderDetails((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                    className="w-10 text-center font-semibold"
                  /> */}
                <div className="baseFlex h-full w-8 border-y-2 border-gray-500 bg-white text-sm font-semibold">
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
                    newOrderDetails.items[existingItemIndex] =
                      localItemOrderDetails;
                  }
                } else {
                  newOrderDetails.items.push(localItemOrderDetails);
                }

                updateOrder({
                  newOrderDetails,
                });

                setItemToCustomize?.(null);

                setIsDrawerOpen?.(false);
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
      </DrawerFooter>
    </motion.div>
  );
}

export default ItemCustomizationDrawer;

interface CustomizationGroup {
  category: StoreCustomizationCategory;
  localItemOrderDetails: Item;
  setLocalItemOrderDetails: Dispatch<SetStateAction<Item>>;
}

function CustomizationGroup({
  category,
  localItemOrderDetails,
  setLocalItemOrderDetails,
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
      <div className="baseFlex mt-2 w-full !justify-start gap-2">
        <RadioGroup
          value={localItemOrderDetails.customizations[category.id]}
          className="w-full max-w-lg"
        >
          {category.customizationChoice.map((choice) => (
            <CustomizationOption
              key={choice.id}
              choice={choice}
              isSelected={
                localItemOrderDetails.customizations[category.id] === choice.id
              }
              relativePrice={choice.priceAdjustment - priceOfSelectedChoiceId}
              setLocalItemOrderDetails={setLocalItemOrderDetails}
            />
          ))}
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

  console.log("isSelected", isSelected);

  return (
    <div
      key={choice.id}
      // style={{
      //   borderColor: isHovered ? "var(--color-primary)" : "var(--color-gray-300)",
      // }}
      className={`baseFlex relative w-full cursor-pointer !justify-start gap-4 rounded-md border-2 p-4 transition-all ${isHovered || isSelected ? "border-primary" : "border-gray-300"}`}
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
