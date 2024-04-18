import {
  type MenuItem,
  type CustomizationChoice,
  type Discount,
} from "@prisma/client";
import { useState, type Dispatch, type SetStateAction, useEffect } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";
import AnimatedPrice from "~/components/AnimatedPrice";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import useGetUserId from "~/hooks/useGetUserId";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import { AnimatePresence, motion } from "framer-motion";
import {
  type StoreCustomizationCategory,
  type FullMenuItem,
} from "~/server/api/routers/menuCategory";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "~/components/ui/use-toast";
import { ToastAction } from "~/components/ui/toast";

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
  return item.customizationCategories.reduce((acc, category) => {
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
  const { isSignedIn } = useAuth();
  const ctx = api.useUtils();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });
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

  const {
    orderDetails,
    customizationChoices,
    discounts,
    userFavoriteItemIds,
    getPrevOrderDetails,
    setPrevOrderDetails,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    userFavoriteItemIds: state.userFavoriteItemIds,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
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

  const [suggestedPairingsApi, setSuggestedPairingsApi] =
    useState<CarouselApi>();
  const [suggestedPairingsSlide, setSuggestedPairingsSlide] = useState(0);

  useEffect(() => {
    if (!suggestedPairingsApi) {
      return;
    }

    setSuggestedPairingsSlide(suggestedPairingsApi.selectedScrollSnap());

    suggestedPairingsApi.on("select", () => {
      setSuggestedPairingsSlide(suggestedPairingsApi.selectedScrollSnap());
    });

    suggestedPairingsApi.on("resize", () => {
      setSuggestedPairingsSlide(0);
      suggestedPairingsApi.scrollTo(0);
    });

    // eventually add proper cleanup functions here
  }, [suggestedPairingsApi]);

  const { toast } = useToast();

  return (
    <DialogContent className="max-w-4xl">
      <div
        className={`baseVertFlex relative w-full !justify-start overflow-y-auto pr-4 pt-4 tablet:h-[600px] 
        ${itemToCustomize.suggestedPairings.length > 0 || itemToCustomize.suggestedWith.length > 0 || itemToCustomize.customizationCategories.length > 0 ? "desktop:h-[700px]" : "desktop:h-[600px]"}
      `}
      >
        <div className="baseFlex relative h-72 w-full !justify-end rounded-md shadow-md">
          {/* red diagonal bg */}
          <div
            className="absolute left-0 top-0 h-full w-full rounded-md bg-primary"
            style={{
              maskImage:
                "linear-gradient(to bottom right, black 60%, transparent 50%)",
            }}
          ></div>

          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={itemToCustomize.name}
            width={240}
            height={240}
            className="z-10 my-4 mr-16 rounded-md"
          />

          <div className="baseFlex absolute bottom-0 left-4 gap-4 rounded-t-md bg-white px-4 py-2 text-xl font-semibold">
            <div className="baseFlex gap-2">
              {itemToCustomize.name}

              {itemToCustomize.chefsChoice && (
                <Image
                  src="/logo.svg"
                  alt="Khue's header logo"
                  width={18}
                  height={18}
                  priority
                  className="!size-[18px]"
                />
              )}
            </div>

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

        <div className="baseVertFlex w-full gap-12 p-8 pt-4">
          {/* Description */}
          <div className="baseVertFlex w-full !items-start gap-2">
            <p className="text-lg underline underline-offset-2">Description</p>
            <p className="max-w-96 text-wrap text-left text-gray-400 tablet:max-w-2xl">
              {itemToCustomize.description}
            </p>
          </div>

          {/* Customizations */}
          {itemToCustomize.customizationCategories.length > 0 && (
            <div className="baseVertFlex w-full !items-start gap-2">
              <p className="text-lg underline underline-offset-2">
                Customizations
              </p>

              <div className="baseVertFlex w-full gap-2">
                {itemToCustomize.customizationCategories.map((category) => (
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

          {itemToCustomize.suggestedPairings.length > 0 && (
            <div className="baseVertFlex w-full !items-start gap-2">
              <p className="text-lg underline underline-offset-2">
                Suggested Pairings
              </p>
              <Carousel
                setApi={setSuggestedPairingsApi}
                opts={{
                  skipSnaps: true,
                }}
                className="baseFlex w-full !justify-start"
              >
                <CarouselContent>
                  {itemToCustomize.suggestedPairings.map((pairing) => (
                    <CarouselItem
                      key={pairing.drinkMenuItem.id}
                      className="basis-1/3"
                    >
                      <SuggestedPairing
                        item={pairing.drinkMenuItem}
                        customizationChoices={customizationChoices}
                        discounts={discounts}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}

          {itemToCustomize.suggestedWith.length > 0 && (
            <div className="baseVertFlex w-full !items-start gap-2">
              <p className="text-lg underline underline-offset-2">
                Suggested Pairings
              </p>
              <Carousel
                setApi={setSuggestedPairingsApi}
                opts={{
                  skipSnaps: true,
                }}
                className="baseFlex w-full !justify-start"
              >
                <CarouselContent>
                  {itemToCustomize.suggestedWith.map((pairing) => (
                    <CarouselItem
                      key={pairing.foodMenuItem.id}
                      className="basis-1/3"
                    >
                      <SuggestedPairing
                        item={pairing.foodMenuItem}
                        customizationChoices={customizationChoices}
                        discounts={discounts}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}

          {/* Special instructions */}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={
              itemOrderDetails?.specialInstructions ? "open" : "closed"
            }
          >
            <AccordionItem
              value={"open"}
              className="w-[550px] rounded-md border px-4 py-1"
            >
              <AccordionTrigger className="baseFlex !justify-start gap-2 py-2 text-lg text-primary !no-underline">
                <div className="baseFlex gap-2 font-normal">
                  <p className="text-lg text-black underline underline-offset-2">
                    Special instructions
                  </p>
                  <span className="mt-1 text-sm italic text-gray-400">
                    - Optional
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="baseVertFlex relative mt-4 w-full !items-start gap-2 p-1">
                  {user && user.dietaryRestrictions.length > 0 && (
                    <div className="baseFlex gap-2 !self-start">
                      <Switch
                        id="allergySwitch"
                        checked={
                          localItemOrderDetails.includeDietaryRestrictions
                        }
                        onCheckedChange={(checked) =>
                          setLocalItemOrderDetails((prev) => ({
                            ...prev,
                            includeDietaryRestrictions: checked,
                          }))
                        }
                      />
                      <Label htmlFor="allergySwitch">
                        Include dietary preferences associated with your
                        account.
                      </Label>
                    </div>
                  )}

                  <Textarea
                    className="mt-2 h-full min-h-28 w-full resize-none rounded-md border-2 p-4"
                    placeholder="Let us know how you'd like your dish prepared."
                    value={localItemOrderDetails.specialInstructions}
                    onChange={(e) => {
                      if (e.target.value.length > 100) return;

                      setLocalItemOrderDetails({
                        ...localItemOrderDetails,
                        specialInstructions: e.target.value,
                      });
                    }}
                  />
                  <p className="pointer-events-none absolute bottom-9 right-4 text-xs text-gray-400">
                    {100 - localItemOrderDetails.specialInstructions.length}{" "}
                    characters remaining
                  </p>

                  <p className="relative left-0 top-0 gap-2 text-sm italic text-gray-400">
                    *No price altering substitutions/additions allowed.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Reviews */}
          {/* <div className="baseVertFlex w-full gap-2">
          </div> */}
        </div>
        <DialogFooter>
          <div
            className="baseFlex bottom-0 left-0 w-full !justify-end bg-gradient-to-br from-gray-200 
        to-gray-300/80 px-4 py-3 shadow-inner tablet:rounded-b-md"
          >
            <div className="baseFlex w-75 !justify-end gap-2 tablet:w-96 tablet:gap-6">
              {!itemOrderDetails?.birthdayReward &&
                !itemOrderDetails?.pointReward && (
                  <div className="baseFlex gap-2">
                    <span className="font-medium">Quantity</span>
                    <div className="baseFlex h-8 rounded-md border-2 border-gray-500">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={localItemOrderDetails.quantity <= 1}
                        className="size-7 rounded-r-none border-none p-0"
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

                      <div className="baseFlex h-full w-8 bg-white font-semibold">
                        {localItemOrderDetails.quantity}
                      </div>

                      <Button
                        variant="outline"
                        disabled={localItemOrderDetails.quantity > 99}
                        className="size-7 rounded-l-none border-none p-0"
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
                    // set prev order details so we can revert if necessary
                    // with toast's undo button
                    setPrevOrderDetails(orderDetails);

                    toast({
                      description: `${localItemOrderDetails.name} added to your order.`,
                      action: (
                        <ToastAction
                          altText={`Undo the addition of ${localItemOrderDetails.name} to your order.`}
                          onClick={() => {
                            updateOrder({
                              newOrderDetails: getPrevOrderDetails(),
                            });
                          }}
                        >
                          Undo
                        </ToastAction>
                      ),
                    });

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
      category.customizationChoices.find(
        (c) => c.id === localItemOrderDetails.customizations[category.id],
      )?.priceAdjustment ?? 0,
    );
  }, [
    localItemOrderDetails.customizations,
    category.customizationChoices,
    category.defaultChoiceId,
    category.id,
  ]);

  return (
    <div key={category.id} className="baseVertFlex w-full !items-start">
      <p className="text-lg font-semibold">{category.name}</p>
      <p className="text-gray-400">{category.description}</p>
      <div className="baseFlex mt-2 gap-2">
        <RadioGroup value={localItemOrderDetails.customizations[category.id]}>
          {category.customizationChoices.map((choice) => {
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

interface SuggestedPairing {
  item: MenuItem;
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
}

function SuggestedPairing({
  item,
  customizationChoices,
  discounts,
}: SuggestedPairing) {
  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const [showCheckmark, setShowCheckmark] = useState(false);

  // TODO: ah idk maybe need to also include the default itemization choice(s) in prisma query
  // since fetching them here feels a bit weird.

  const defaultItemConfig = {
    id: crypto.randomUUID(),
    name: item.name,
    customizations: {}, // getDefaultCustomizationChoices(item),
    specialInstructions: "",
    includeDietaryRestrictions: false,
    quantity: 1,
    price: item.price,
    itemId: item.id,
    discountId: item.activeDiscountId,
    pointReward: false,
    birthdayReward: false,
  };

  const { updateOrder } = useUpdateOrder();

  return (
    <div className="baseVertFlex min-w-56 gap-2 rounded-md border p-2">
      <Image
        src={"/menuItems/sampleImage.webp"}
        alt={item.name}
        width={96}
        height={96}
        className="rounded-md"
      />

      <p className="text-lg font-medium">{item.name}</p>

      <div className="baseFlex mt-2 gap-4 !self-center">
        {item.available ? (
          <Button
            disabled={showCheckmark}
            size="sm"
            onClick={() => {
              setShowCheckmark(true);

              updateOrder({
                newOrderDetails: {
                  ...orderDetails,
                  items: [...orderDetails.items, defaultItemConfig],
                },
              });

              setTimeout(() => {
                setShowCheckmark(false);
              }, 1000);
            }}
          >
            <AnimatePresence mode="wait">
              {showCheckmark ? (
                <motion.svg
                  key={`addPairingToOrderCheckmark-${item.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="size-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "tween",
                      ease: "easeOut",
                      duration: 0.3,
                    }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              ) : (
                <motion.p
                  key={`addPairingToOrder-${item.id}`}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="baseFlex gap-2"
                >
                  Add to order -
                  <p>
                    {formatPrice(
                      calculateRelativeTotal({
                        items: [defaultItemConfig],
                        customizationChoices,
                        discounts,
                      }),
                    )}
                  </p>
                </motion.p>
              )}
            </AnimatePresence>
          </Button>
        ) : (
          <div className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-400">
            <p className="text-xs italic">Currently unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
