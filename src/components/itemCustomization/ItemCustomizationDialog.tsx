import {
  type MenuItem,
  type CustomizationChoice,
  type Discount,
} from "@prisma/client";
import {
  useState,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
} from "react";
import { LuMinus, LuPlus, LuVegan } from "react-icons/lu";
import AnimatedPrice from "~/components/AnimatedPrice";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { formatPrice } from "~/utils/formatters/formatPrice";
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
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "~/components/ui/use-toast";
import { ToastAction } from "~/components/ui/toast";
import { SiLeaflet } from "react-icons/si";
import { Separator } from "~/components/ui/separator";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ItemCustomizationDialog {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  itemToCustomize: FullMenuItem | null;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  itemOrderDetails?: Item;
  setItemOrderDetails?: Dispatch<SetStateAction<Item | undefined>>;
  forCart?: boolean;
}

function ItemCustomizationDialog({
  isDialogOpen,
  setIsDialogOpen,
  itemToCustomize,
  setItemToCustomize,
  itemOrderDetails,
  setItemOrderDetails,
  forCart,
}: ItemCustomizationDialog) {
  return (
    <Dialog
      open={Boolean(isDialogOpen && itemToCustomize)}
      onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);

          // also does same setTimeout inside on update/add to order button click
          setTimeout(() => {
            setItemToCustomize(null);
            setItemOrderDetails?.(undefined);
          }, 150);
        }
      }}
    >
      {itemToCustomize && (
        <ItemCustomizerDialogContent
          itemToCustomize={itemToCustomize}
          setIsDialogOpen={setIsDialogOpen}
          itemOrderDetails={itemOrderDetails}
          setItemToCustomize={setItemToCustomize}
          setItemOrderDetails={setItemOrderDetails}
          forCart={forCart}
        />
      )}
    </Dialog>
  );
}

export default ItemCustomizationDialog;

interface ItemCustomizerDialogContent {
  itemToCustomize: FullMenuItem;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  itemOrderDetails?: Item;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  setItemOrderDetails?: Dispatch<SetStateAction<Item | undefined>>;
  forCart?: boolean;
}

function ItemCustomizerDialogContent({
  itemToCustomize,
  setIsDialogOpen,
  itemOrderDetails,
  setItemToCustomize,
  setItemOrderDetails,
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
      id:
        orderDetails.items.length === 0 ? 0 : orderDetails.items.at(-1)!.id + 1,
      name: itemToCustomize.name,
      customizations: getDefaultCustomizationChoices(itemToCustomize),
      specialInstructions: "",
      includeDietaryRestrictions: false,
      quantity: 1,
      price: itemToCustomize.price,
      itemId: itemToCustomize.id,
      discountId: itemToCustomize.activeDiscountId,
      isChefsChoice: itemToCustomize.isChefsChoice,
      isAlcoholic: itemToCustomize.isAlcoholic,
      isVegetarian: itemToCustomize.isVegetarian,
      isVegan: itemToCustomize.isVegan,
      isGlutenFree: itemToCustomize.isGlutenFree,
      showUndercookedOrRawDisclaimer:
        itemToCustomize.showUndercookedOrRawDisclaimer,
      pointReward: false,
      birthdayReward: false,
    },
  );

  const initialItemState = itemOrderDetails;

  const [accordionIsOpen, setAccordionIsOpen] = useState<"open" | "closed">(
    itemOrderDetails?.specialInstructions ? "open" : "closed",
  );
  const customizationAccordionRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  return (
    <DialogContent className="max-w-4xl">
      <VisuallyHidden>
        <DialogTitle>
          {itemOrderDetails ? "Update" : "Customize"} {itemToCustomize.name}
        </DialogTitle>
        <DialogDescription>
          Customize this item by selecting from the available options.
        </DialogDescription>
      </VisuallyHidden>

      <div className="baseVertFlex relative w-full !justify-start overflow-y-auto pr-4 pt-4 tablet:max-h-[75vh]">
        <div className="baseFlex relative h-72 w-full !justify-end rounded-md bg-offwhite shadow-md">
          {/* primary diagonal bg */}
          <div
            className="absolute left-0 top-0 size-full rounded-md bg-primary"
            style={{
              clipPath: "polygon(100% 0, 100% 24%, 32% 100%, 0 100%, 0 0)",
            }}
          ></div>

          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={itemToCustomize.name}
            width={240}
            height={240}
            className="z-10 my-4 mr-16 rounded-md drop-shadow-xl"
          />

          <div className="baseFlex absolute bottom-0 left-4 gap-4 rounded-t-md border border-b-0 bg-offwhite px-4 py-2 text-xl font-semibold">
            <div className="baseFlex gap-2">{itemToCustomize.name}</div>

            {isSignedIn && (
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
            )}
          </div>
        </div>

        <div className="baseVertFlex w-full gap-12 p-8 pt-4">
          {/* Description */}
          <div className="baseVertFlex w-full !items-start gap-2">
            <p className="text-lg underline underline-offset-2">Description</p>
            <p className="max-w-96 whitespace-normal text-left text-stone-400 supports-[text-wrap]:text-wrap tablet:max-w-2xl">
              {itemToCustomize.description}
            </p>

            <div className="baseFlex mt-2 w-full flex-wrap !justify-start gap-2 text-sm text-stone-400">
              {itemToCustomize.isChefsChoice && (
                <div className="baseFlex gap-2 rounded-md p-1 outline outline-[1px]">
                  <p className="baseFlex size-4 rounded-full border border-stone-400 bg-offwhite p-2">
                    K
                  </p>
                  -<p>Chef&apos;s Choice</p>
                </div>
              )}

              {itemToCustomize.isVegetarian && (
                <div className="baseFlex gap-2 rounded-md p-1 outline outline-[1px]">
                  <SiLeaflet className="size-4" />
                  <p>Vegetarian</p>
                </div>
              )}

              {itemToCustomize.isVegan && (
                <div className="baseFlex gap-2 rounded-md p-1 outline outline-[1px]">
                  <LuVegan className="size-4" />-<p>Vegan</p>
                </div>
              )}

              {itemToCustomize.isGlutenFree && (
                <div className="baseFlex gap-2 rounded-md p-1 outline outline-[1px]">
                  <span>GF</span>-<span>Gluten Free</span>
                </div>
              )}
            </div>
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

          {/* Special instructions */}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={accordionIsOpen}
            onValueChange={(value) => {
              setAccordionIsOpen(value === "open" ? "open" : "closed");
            }}
            // TODO: come back and fix this jerky behavior
            // (should be fine on tablet-ish viewports or on items with
            // enough content to already render scrollbar on container)
            onAnimationEnd={() => {
              if (accordionIsOpen === "open") {
                customizationAccordionRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
          >
            <AccordionItem
              ref={customizationAccordionRef}
              value={"open"}
              className="w-[550px] rounded-md border px-4 py-1"
            >
              <AccordionTrigger className="baseFlex !justify-start gap-2 py-2 text-lg text-primary !no-underline">
                <div className="baseFlex gap-2 font-normal">
                  <p className="text-lg text-black underline underline-offset-2">
                    Special instructions
                  </p>
                  <span className="mt-1 text-sm italic text-stone-400">
                    - Optional
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="baseVertFlex relative w-full !items-start gap-2 p-1">
                  {user && user.dietaryRestrictions.length > 0 && (
                    <div className="baseFlex mt-4 gap-2 !self-start">
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
                      <Label htmlFor="allergySwitch" className="font-normal">
                        Include your account&apos;s dietary preferences.
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
                  <p className="pointer-events-none absolute bottom-9 right-4 text-xs text-stone-400">
                    {100 - localItemOrderDetails.specialInstructions.length}{" "}
                    characters remaining
                  </p>

                  <p className="relative left-0 top-0 gap-2 text-sm italic text-stone-400">
                    * No price altering substitutions/additions are allowed.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {itemToCustomize.showUndercookedOrRawDisclaimer && (
            <p className="text-center text-xs italic text-stone-400">
              * Consuming raw or undercooked meats, poultry, seafood, shellfish,
              or eggs may increase your risk of foodborne illness.
            </p>
          )}

          {/* Reviews */}
          {/* <div className="baseVertFlex w-full gap-2">
          </div> */}
        </div>

        <DialogFooter>
          <div
            className="baseFlex bottom-0 left-0 w-full !justify-end bg-gradient-to-br from-stone-200 
        to-stone-300 px-4 py-3 shadow-inner tablet:rounded-b-md"
          >
            <div className="baseFlex w-75 !justify-end gap-2 tablet:w-96 tablet:gap-6">
              {!itemOrderDetails?.birthdayReward &&
                !itemOrderDetails?.pointReward && (
                  <div className="baseFlex gap-2">
                    <span className="font-medium">Quantity</span>
                    <div className="baseFlex h-8 rounded-md border-2 border-stone-500">
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

                      <div className="baseFlex h-full w-8 bg-offwhite font-semibold">
                        {localItemOrderDetails.quantity}
                      </div>

                      <Button
                        variant="outline"
                        disabled={localItemOrderDetails.quantity > 20}
                        className="size-7 rounded-l-none border-none p-0"
                        onClick={() => {
                          if (localItemOrderDetails.quantity > 20) return;

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
                onClick={async () => {
                  const newOrderDetails = structuredClone(orderDetails);

                  // just need to update the existing item
                  if (forCart) {
                    const itemIndex = newOrderDetails.items.findIndex(
                      (item) => item.id === localItemOrderDetails.id,
                    );

                    newOrderDetails.items[itemIndex] = {
                      ...localItemOrderDetails,
                    };
                  } else {
                    // set prev order details so we can revert if necessary
                    // with toast's undo button
                    setPrevOrderDetails(orderDetails);

                    const pluralize = (await import("pluralize")).default;
                    const isPlural = pluralize.isPlural(
                      localItemOrderDetails.name,
                    );
                    const contextAwarePlural =
                      localItemOrderDetails.quantity > 1 || isPlural
                        ? "were"
                        : "was";

                    setTimeout(() => {
                      toast({
                        description: `${localItemOrderDetails.quantity > 1 ? `${localItemOrderDetails.quantity}x` : ""} ${localItemOrderDetails.name} ${contextAwarePlural} added to your order.`,
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
                    }, 150); // bit shorter than duration of the dialog close animation

                    newOrderDetails.items.push(localItemOrderDetails);
                  }

                  updateOrder({
                    newOrderDetails,
                  });

                  setIsDialogOpen?.(false);

                  setTimeout(() => {
                    setItemToCustomize(null);
                    setItemOrderDetails?.(undefined);
                  }, 150);
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
      <p className="font-medium">{category.name}</p>
      <p className="text-sm text-stone-400">{category.description}</p>
      <div className="baseFlex mt-2 gap-2">
        <RadioGroup
          value={localItemOrderDetails.customizations[category.id]}
          className="grid grid-cols-1 tablet:grid-cols-2"
        >
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
      style={{
        order: choice.listOrder,
      }}
      className={`baseFlex relative w-full min-w-96 !justify-start gap-4 rounded-md border-2 p-4 transition-all tablet:min-w-80 ${(isHovered || isSelected) && choice.isAvailable ? "border-primary" : "border-stone-300"}
      ${choice.isAvailable ? "cursor-pointer" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchCancel={() => setIsHovered(false)}
      onClick={() => {
        if (!choice.isAvailable) return;

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
      <RadioGroupItem
        id={choice.id}
        value={choice.id}
        disabled={!choice.isAvailable}
      />
      <div
        className={`baseVertFlex size-full gap-1
        ${!choice.isAvailable ? "opacity-55" : ""}
      `}
      >
        <Label htmlFor={choice.id} className="self-start">
          {choice.name}
        </Label>

        {/* conditional pr-12 to provide room for the conditional price */}
        <p
          className={`${!isSelected && relativePrice !== 0 ? "pr-12" : ""} w-64 self-start text-sm text-stone-400`}
        >
          {choice.description}
        </p>

        {!choice.isAvailable && (
          <div className="absolute right-4 top-2 rounded-md bg-stone-200 px-2 py-0.5 text-stone-600">
            <p className="text-xs italic">Currently unavailable</p>
          </div>
        )}

        <div className="absolute bottom-2 right-4">
          <AnimatePresence>
            {!isSelected && relativePrice !== 0 && (
              <AnimatedPrice
                price={formatPrice(relativePrice)}
                excludeAnimatePresence={true}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
