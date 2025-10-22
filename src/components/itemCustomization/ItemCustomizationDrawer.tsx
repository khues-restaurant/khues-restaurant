import { useAuth } from "@clerk/nextjs";
import { type CustomizationChoice } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { IoIosArrowBack, IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { LuMinus, LuPlus, LuVegan } from "react-icons/lu";
import { SiLeaflet } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { SheetFooter } from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import {
  type FullMenuItem,
  type StoreCustomizationCategory,
} from "~/server/api/routers/menuCategory";
import { useMainStore, type Item } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";
import { menuItemImagePaths } from "~/utils/menuItemImagePaths";

function getSafeAreaInsetBottom() {
  // Create a temporary element to get the CSS variable
  const testElement = document.createElement("div");
  testElement.style.cssText = "padding-bottom: env(safe-area-inset-bottom, 0);";
  document.body.appendChild(testElement);
  const safeAreaInsetBottom = parseFloat(
    getComputedStyle(testElement).paddingBottom,
  );
  document.body.removeChild(testElement);
  return safeAreaInsetBottom;
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
  const { isSignedIn } = useAuth();
  const ctx = api.useUtils();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });
  const { mutate: favoriteItem, isLoading: favoritingItem } =
    api.favorite.addFavoriteItem.useMutation({
      onSuccess: () => {
        // not my favorite, I guess alternative is to fetch user's favorites
        // again, and then storeDBQueries.setData({ ...data, userFavoriteItemIds: fetchedData})?
        void ctx.storeDBQueries.getAll.invalidate();
      },
    });

  const { mutate: unfavoriteItem, isLoading: unfavoritingItem } =
    api.favorite.removeFavoriteItem.useMutation({
      onSuccess: () => {
        // not my favorite, I guess alternative is to fetch user's favorites
        // again, and then storeDBQueries.setData({ ...data, userFavoriteItemIds: fetchedData})?
        void ctx.storeDBQueries.getAll.invalidate();
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
      birthdayReward: false,
    },
  );

  // need to do this in async fashion since the user object isn't immediately available
  // when initializing the localItemOrderDetails state
  const [
    initIncludeDietaryRestrictionsComplete,
    setInitIncludeDietaryRestrictionsComplete,
  ] = useState(false);

  useEffect(() => {
    if (initIncludeDietaryRestrictionsComplete || !user) return;

    setLocalItemOrderDetails((prev) => ({
      ...prev,
      includeDietaryRestrictions: user.autoApplyDietaryRestrictions,
    }));

    setInitIncludeDietaryRestrictionsComplete(true);
  }, [user, initIncludeDietaryRestrictionsComplete]);

  const initialItemState = itemOrderDetails;

  const { toast } = useToast();

  const [accordionIsOpen, setAccordionIsOpen] = useState<"open" | "closed">(
    itemOrderDetails?.specialInstructions ? "open" : "closed",
  );
  const customizationAccordionRef = useRef<HTMLDivElement>(null);

  const [paddingBottom, setPaddingBottom] = useState("0.75rem");

  useEffect(() => {
    const safeAreaInsetBottom = getSafeAreaInsetBottom();

    if (safeAreaInsetBottom > 0) {
      setPaddingBottom(`${safeAreaInsetBottom}px`);
    } else {
      setPaddingBottom("0.75rem");
    }
  }, []);

  return (
    <motion.div
      key={itemToCustomize.name}
      initial={{ opacity: 0, translateX: forCart ? "100%" : "0%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: forCart ? "100%" : "0%" }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className="baseVertFlex h-[85dvh] w-full !justify-start"
    >
      <div className="baseVertFlex relative h-full w-full max-w-xl !justify-start overflow-y-auto pb-16">
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
        <div
          className={`baseVertFlex relative w-full gap-3 px-8 ${forCart ? "mt-12" : "mt-8"}`}
        >
          <div className="baseVertFlex relative w-full !items-start gap-2">
            <div className="baseFlex gap-2">
              <p className="text-lg font-semibold">
                {itemToCustomize.name}
                {itemToCustomize.showUndercookedOrRawDisclaimer && "*"}
              </p>
            </div>

            {isSignedIn && (
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
            )}
          </div>

          {menuItemImagePaths[itemToCustomize.name] && (
            <Image
              src={menuItemImagePaths[itemToCustomize.name] ?? ""}
              alt="Spicy Chicken Sandwich at Khue's in St. Paul"
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="h-64 w-full rounded-lg object-cover object-center shadow-md"
            />
          )}
        </div>

        <div className="baseVertFlex w-full gap-4 px-8 py-4">
          {/* Description */}
          {itemToCustomize.description && (
            <div className="baseVertFlex w-full !items-start gap-1">
              <p className="font-medium">Description</p>
              <p className="max-w-96 whitespace-normal text-left text-sm text-stone-500 supports-[text-wrap]:text-wrap tablet:max-w-2xl">
                {itemToCustomize.description}
              </p>

              <div className="baseFlex mt-2 w-full flex-wrap !justify-start gap-3 text-sm text-stone-500">
                {itemToCustomize.isChefsChoice && (
                  <div className="baseFlex gap-2 rounded-md px-2 py-1 outline outline-[1px]">
                    <p className="baseFlex size-4 rounded-full border border-stone-500 bg-offwhite p-2">
                      K
                    </p>
                    -<p>Chef&apos;s Choice</p>
                  </div>
                )}

                {itemToCustomize.isVegetarian && (
                  <div className="baseFlex gap-2 rounded-md px-2 py-1 outline outline-[1px]">
                    <SiLeaflet className="size-4" />
                    <p>Vegetarian</p>
                  </div>
                )}

                {itemToCustomize.isVegan && (
                  <div className="baseFlex gap-2 rounded-md px-2 py-1 outline outline-[1px]">
                    <LuVegan className="size-4" />-<p>Vegan</p>
                  </div>
                )}

                {itemToCustomize.isGlutenFree && (
                  <div className="baseFlex gap-2 rounded-md px-2 py-1 outline outline-[1px]">
                    <span>GF</span>-<span>Gluten Free</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customizations */}
          {itemToCustomize.customizationCategories.length > 0 && (
            <div className="baseVertFlex w-full !items-start gap-2">
              <p className="font-medium">Customizations</p>

              <div className="baseVertFlex w-full gap-2">
                {itemToCustomize.customizationCategories.map((category) => (
                  <CustomizationGroup
                    key={category.id}
                    category={category}
                    localItemOrderDetails={localItemOrderDetails}
                    setLocalItemOrderDetails={setLocalItemOrderDetails}
                    forReward={itemOrderDetails?.birthdayReward ?? false}
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
            onAnimationEnd={() => {
              if (accordionIsOpen === "open") {
                customizationAccordionRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
            value={accordionIsOpen}
            onValueChange={(value) => {
              setAccordionIsOpen(value === "open" ? "open" : "closed");
            }}
          >
            <AccordionItem
              ref={customizationAccordionRef}
              value={"open"}
              className="w-full max-w-[550px] rounded-md border px-4 py-1"
            >
              <AccordionTrigger className="baseFlex !justify-start gap-2 py-2 text-lg text-primary !no-underline">
                <div className="baseFlex gap-2 font-normal">
                  <p className="text-base font-medium text-black ">
                    Special instructions
                  </p>
                  <div className="baseFlex gap-2 text-sm italic text-stone-500">
                    -<span>Optional</span>
                  </div>
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
                      <Label
                        htmlFor="allergySwitch"
                        className="text-xs font-normal"
                      >
                        Include your account&apos;s dietary preferences.
                      </Label>
                    </div>
                  )}

                  <div className="baseFlex relative w-full">
                    <Textarea
                      className="relative mt-4 h-full min-h-36 w-full resize-none rounded-md border-2 p-4 text-base tablet:text-sm"
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

                    <p className="pointer-events-none absolute bottom-4 right-4 text-xs text-stone-500">
                      {100 - localItemOrderDetails.specialInstructions.length}{" "}
                      characters remaining
                    </p>
                  </div>

                  <p className="pl-1 text-xs italic text-stone-500">
                    * No price altering substitutions/additions are allowed.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="baseVertFlex mt-4 w-full gap-2">
            {itemToCustomize.showUndercookedOrRawDisclaimer && (
              <p className="text-center text-xs italic text-stone-500">
                * Consuming raw or undercooked meats, poultry, seafood,
                shellfish, or eggs may increase your risk of foodborne illness.
              </p>
            )}
          </div>

          {/* Reviews */}
          {/* <div className="baseVertFlex w-full gap-2">
          </div> */}
        </div>
      </div>

      <SheetFooter>
        <div
          style={{
            paddingBottom,
          }}
          className={`baseFlex w-full bg-gradient-to-br from-stone-200 
        to-stone-300 px-4 py-3 shadow-inner ${
          itemOrderDetails?.birthdayReward ? "!justify-end" : "!justify-between"
        }`}
        >
          {!itemOrderDetails?.birthdayReward && (
            <div className="baseFlex gap-2">
              <span className="text-sm font-medium">Quantity</span>
              <div className="baseFlex h-8 overflow-hidden rounded-md border-2 border-stone-500">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={localItemOrderDetails.quantity <= 1}
                  className="size-7 rounded-none !border-none p-0"
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

                <div className="baseFlex h-full w-8 bg-offwhite text-sm font-semibold">
                  {localItemOrderDetails.quantity}
                </div>

                <Button
                  variant="outline"
                  disabled={localItemOrderDetails.quantity > 20}
                  className="size-7 rounded-none !border-none p-0"
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
                const isPlural = pluralize.isPlural(localItemOrderDetails.name);
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
                }, 650); // bit shorter than duration of the drawer close animation

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
              <span>{itemOrderDetails ? "Update" : "Add to order"}</span>-
              <p>
                {formatPrice(
                  calculateRelativeTotal({
                    items: [localItemOrderDetails],
                    customizationChoices,
                    discounts,
                  }),
                )}
              </p>
            </div>
          </Button>
        </div>
      </SheetFooter>
    </motion.div>
  );
}

export default ItemCustomizationDrawer;

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
      <p className="text-base">{category.name}</p>
      <p className="text-sm text-stone-500">{category.description}</p>
      <div className="baseFlex mt-2 w-full !justify-start gap-2">
        <RadioGroup
          value={localItemOrderDetails.customizations[category.id]}
          className="w-full"
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
      className={`baseFlex relative w-full cursor-pointer !justify-start gap-4 rounded-md border-2 p-4 transition-all 
      ${(isHovered || isSelected) && choice.isAvailable ? "border-primary" : "border-stone-300"}
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
          className={`${!isSelected && relativePrice !== 0 ? "pr-12" : ""} w-64 self-start text-sm text-stone-500`}
        >
          {choice.description}
        </p>

        {!choice.isAvailable && (
          <div className="absolute right-4 top-2 rounded-md bg-stone-200 px-2 py-0.5 text-stone-600">
            <p className="text-xs italic">Currently unavailable</p>
          </div>
        )}

        <div className="absolute bottom-2 right-4 text-sm">
          {!isSelected && relativePrice !== 0 && (
            <p>{formatPrice(relativePrice)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
