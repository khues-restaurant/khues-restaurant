import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { CiCalendarDate, CiGift, CiLocationOn } from "react-icons/ci";
import { FaTrashAlt } from "react-icons/fa";
import { FaCakeCandles, FaRegClock } from "react-icons/fa6";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { LuMinus, LuPlus } from "react-icons/lu";
import { z } from "zod";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import AnimatedPrice from "~/components/AnimatedPrice";
import AvailablePickupTimes from "~/components/cart/AvailablePickupTimes";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { DrawerFooter } from "~/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { useMainStore, type Item } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { formatPrice } from "~/utils/formatPrice";
import { getDisabledDates } from "~/utils/getDisabledPickupDates";
import { cn } from "~/utils/shadcnuiUtils";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import useInitializeCheckout from "~/hooks/useInitializeCheckout";
import useGetUserId from "~/hooks/useGetUserId";
import { calculateTotalCartPrices } from "~/utils/calculateTotalCartPrices";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { mergeDateAndTime } from "~/utils/mergeDateAndTime";
import { is30MinsFromDatetime } from "~/utils/is30MinsFromDatetime";
import { getHoursAndMinutesFromDate } from "~/utils/getHoursAndMinutesFromDate";
import { getMidnightDate } from "~/utils/getMidnightDate";
import { selectedDateIsToday } from "~/utils/selectedDateIsToday";
import { X } from "lucide-react";
import isEqual from "lodash.isequal";
import Decimal from "decimal.js";
import { isAbleToRenderASAPTimeSlot } from "~/utils/isAbleToRenderASAPTimeSlot";
import Image from "next/image";

interface OrderCost {
  subtotal: number;
  tax: number;
  total: number;
}

interface CartDrawer {
  setShowCartDrawer: Dispatch<SetStateAction<boolean>>;
  setItemBeingModified: Dispatch<SetStateAction<FullMenuItem | null>>;
  setInitialItemState: Dispatch<SetStateAction<Item | undefined>>;
  setGuestCheckoutView: Dispatch<
    SetStateAction<"credentialsForm" | "mainView" | "notShowing">
  >;
  setShowRewardsDrawer: Dispatch<SetStateAction<boolean>>;
}

function CartDrawer({
  setShowCartDrawer,
  //^  prob only used if doing the "Close" underlined button in top right
  // (as a general drawer thing though, so maybe directly on <Drawer>?)
  setItemBeingModified,
  setInitialItemState,
  setGuestCheckoutView,
  setShowRewardsDrawer,
}: CartDrawer) {
  const { isSignedIn } = useAuth();
  const userId = useGetUserId();

  const {
    orderDetails,
    menuItems,
    customizationChoices,
    discounts,
    itemNamesRemovedFromCart,
    setItemNamesRemovedFromCart,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    menuItems: state.menuItems,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    itemNamesRemovedFromCart: state.itemNamesRemovedFromCart,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
  }));

  const [numberOfItems, setNumberOfItems] = useState(0);

  const [orderCost, setOrderCost] = useState<OrderCost>({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const [checkoutButtonText, setCheckoutButtonText] = useState(
    "Proceed to checkout",
  );

  const { updateOrder } = useUpdateOrder();

  const { data: minPickupTime } = api.minimumOrderPickupTime.get.useQuery();
  const { data: userRewards } = api.user.getRewards.useQuery(userId, {
    enabled: isSignedIn,
  });

  const { initializeCheckout } = useInitializeCheckout();

  const [regularItems, setRegularItems] = useState<Item[]>([]);
  const [rewardItems, setRewardItems] = useState<Item[]>([]);

  useEffect(() => {
    const filteredRegularItems = [];
    const filteredRewardItems = [];

    for (const item of orderDetails.items) {
      if (item.pointReward || item.birthdayReward) {
        filteredRewardItems.push(item);
      } else {
        filteredRegularItems.push(item);
      }
    }

    if (!isEqual(filteredRewardItems, rewardItems)) {
      setRewardItems(filteredRewardItems);
    }

    if (!isEqual(filteredRegularItems, regularItems)) {
      setRegularItems(filteredRegularItems);
    }
  }, [orderDetails, regularItems, rewardItems]);

  const mainFormSchema = z.object({
    dateToPickUp: z
      .date({
        required_error: "Pickup date must be specified",
      })
      .refine(
        (date) => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          // fyi: returns message if expression is false
          return date >= now;
        },
        {
          message: "The pickup date cannot be in the past.",
        },
      ),
    timeToPickUp: z
      .string({
        required_error: "Pickup time must be specified",
      })
      .refine((val) => val.trim().length > 0, {
        // Ensures the string is not just whitespace
        message: "Pickup time must be specified",
      })
      .refine(
        (time) => {
          if (minPickupTime === null || minPickupTime === undefined) {
            return false;
          }

          const minOrderPickupDatetime = minPickupTime.value;
          const now = new Date();

          // ASAP time slot validation
          if (orderDetails.isASAP) {
            return (
              isAbleToRenderASAPTimeSlot(new Date()) &&
              now >= minOrderPickupDatetime
            );
          }

          const datetimeToPickUp = mergeDateAndTime(
            mainForm.getValues().dateToPickUp,
            time,
          );

          if (!datetimeToPickUp) return false;

          // Regular pickup time validation
          return (
            datetimeToPickUp > now &&
            datetimeToPickUp > minOrderPickupDatetime &&
            is30MinsFromDatetime(datetimeToPickUp, new Date())
          );
        },
        {
          message:
            "Available pickup times have changed. Please select a new time.",
        },
      ),
  });

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    values: {
      dateToPickUp: getMidnightDate(orderDetails.datetimeToPickUp),
      timeToPickUp: orderDetails.isASAP
        ? "ASAP (~20 mins)"
        : getHoursAndMinutesFromDate(orderDetails.datetimeToPickUp),
    },
  });

  useEffect(() => {
    const subscription = mainForm.watch((value) => {
      if (value.dateToPickUp === undefined || value.timeToPickUp === undefined)
        return;

      const newDate =
        value.timeToPickUp === "ASAP (~20 mins)"
          ? value.dateToPickUp
          : mergeDateAndTime(value.dateToPickUp, value.timeToPickUp);

      if (newDate === undefined) return;

      // if the date was changed then just set the time to be midnight of w/e the new date is
      if (
        value.dateToPickUp.getDate() !==
          orderDetails.datetimeToPickUp.getDate() ||
        value.dateToPickUp.getMonth() !==
          orderDetails.datetimeToPickUp.getMonth() ||
        value.dateToPickUp.getFullYear() !==
          orderDetails.datetimeToPickUp.getFullYear()
      ) {
        newDate.setHours(0, 0, 0, 0);
      } else if (value.timeToPickUp === "ASAP (~20 mins)") {
        const newOrderDetails = structuredClone(orderDetails);
        newOrderDetails.datetimeToPickUp = newDate;
        newOrderDetails.isASAP = true;

        console.log("updating");

        updateOrder({
          newOrderDetails,
        });

        return;
      }

      // make sure that the new date isn't the same as the current orderDetails.datetimeToPickUp
      if (newDate.getTime() === orderDetails.datetimeToPickUp.getTime()) return;

      const newOrderDetails = structuredClone(orderDetails);
      newOrderDetails.datetimeToPickUp = newDate;
      newOrderDetails.isASAP = false;

      console.log("updating");

      updateOrder({
        newOrderDetails,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mainForm, orderDetails, updateOrder]);

  useEffect(() => {
    // add up all the quantities of the items in the order
    let sum = 0;
    orderDetails.items.forEach((item) => {
      sum += item.quantity;
    });

    if (orderDetails.rewardBeingRedeemed) {
      sum++;
    }

    setNumberOfItems(sum);
  }, [orderDetails.items, orderDetails.rewardBeingRedeemed]);

  useEffect(() => {
    const items = [...orderDetails.items];
    if (orderDetails.rewardBeingRedeemed) {
      items.push(orderDetails.rewardBeingRedeemed.item);
    }

    // maybe do an isEqual here before setting the state?

    setOrderCost(
      calculateTotalCartPrices({
        items,
        customizationChoices,
        discounts,
      }),
    );
  }, [
    orderDetails.items,
    orderDetails.rewardBeingRedeemed,
    customizationChoices,
    discounts,
  ]);

  async function onMainFormSubmit(values: z.infer<typeof mainFormSchema>) {
    if (isSignedIn) {
      setCheckoutButtonText("Loading");

      await initializeCheckout(); // TODO: await or void or what here
    } else {
      setGuestCheckoutView("mainView");
    }
  }

  return (
    <motion.div
      key="cartDrawer"
      initial={{ opacity: 0, translateX: "-100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "-100%" }}
      transition={{
        duration: 0.35,
      }}
      className="baseVertFlex relative w-full !justify-start overflow-y-auto"
    >
      <div className="baseVertFlex w-full !items-start gap-1 border-b-2 p-4">
        <div className="baseFlex !items-start gap-1">
          <LiaShoppingBagSolid className="h-6 w-6" />
          <p className="text-lg font-medium">Your order</p>
        </div>
        <p className="baseFlex ml-1 h-4 gap-1.5">
          <AnimatedNumbers value={numberOfItems} fontSize={16} padding={0} />

          {`item${numberOfItems > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* location + date & time picker  (TODO: why doesn't horizontal margin work here with w-full..) */}
      <div
        className="baseFlex my-4 w-[95%] flex-wrap !justify-start gap-1 rounded-md bg-gradient-to-br 
        from-gray-200 to-gray-300/80 p-4 shadow-sm"
      >
        <span>Your order will be available for pickup at</span>
        <div className="baseFlex gap-2">
          <CiLocationOn className="size-6" />
          <Button variant={"link"} className="h-6" asChild>
            <Link href="/googleMapsLink" className="!p-0">
              2100 Snelling Ave Roseville, MN 55113
            </Link>
          </Button>
        </div>

        <Form {...mainForm}>
          <form className="baseVertFlex mt-4 !items-start gap-2">
            <FormField
              control={mainForm.control}
              name="dateToPickUp"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-2">
                    <FormLabel className="font-semibold">Pickup date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[200px] justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CiCalendarDate className="mr-2 h-5 w-5" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          disabled={getDisabledDates()}
                          selected={field.value}
                          onSelect={(e) => {
                            if (e instanceof Date) {
                              field.onChange(e);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <AnimatePresence>
                    {invalid && (
                      <motion.div
                        key={"pickupDateError"}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        // className="absolute -bottom-6 left-0 right-0"
                      >
                        <FormMessage />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />

            <FormField
              control={mainForm.control}
              name="timeToPickUp"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-2">
                    <FormLabel className="font-semibold">Pickup time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-max gap-2 pl-4 pr-2">
                          <FaRegClock />
                          <SelectValue
                            placeholder="Select a time"
                            className="placeholder:!text-muted-foreground"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        side="bottom"
                        className={`${
                          selectedDateIsToday(
                            mainForm.getValues().dateToPickUp,
                          ) &&
                          mainForm.getValues().dateToPickUp.getHours() >= 22
                            ? ""
                            : "max-h-[300px]"
                        }`}
                      >
                        <AvailablePickupTimes
                          selectedDate={mainForm.getValues().dateToPickUp}
                          minPickupTime={minPickupTime?.value}
                        />
                      </SelectContent>
                    </Select>
                  </div>
                  <AnimatePresence>
                    {invalid && (
                      <motion.div
                        key={"pickupTimeError"}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        // className="absolute -bottom-6 left-0 right-0"
                      >
                        <FormMessage />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* summary of items in cart */}
      <div className="baseVertFlex w-full !items-start gap-2 p-4">
        <p className="text-lg font-semibold underline underline-offset-2">
          Items
        </p>

        <AnimatePresence>
          {itemNamesRemovedFromCart.length > 0 && (
            <motion.div
              key={"cartSheetRemovedItemsCard"}
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: `${100 + itemNamesRemovedFromCart.length * 24}px`,
              }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              style={{ overflow: "hidden" }}
              className="w-full"
            >
              <motion.div
                layout
                className="baseVertFlex relative w-full !items-start !justify-start gap-2 rounded-md bg-primary p-4 text-sm text-white"
              >
                <p className="font-semibold underline underline-offset-2">
                  Your order has been modified.
                </p>

                <p>
                  {itemNamesRemovedFromCart.length > 1
                    ? "These items are"
                    : "This item is"}{" "}
                  not currently available.
                </p>
                <ul className="list-disc pl-6">
                  {itemNamesRemovedFromCart.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>

                <Button
                  variant={"outline"} // prob diff variant or make a new one
                  // rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary
                  className="absolute right-2 top-2 size-6 bg-primary !p-0 text-white"
                  onClick={() => {
                    setItemNamesRemovedFromCart([]);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* summary of items in cart */}
        <AnimatePresence>
          {orderDetails.items.length === 0 ? (
            <motion.div
              key={"cartDrawerEmptyCartCard"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="baseVertFlex mt-8 w-full gap-4 p-4"
            >
              {/* TODO: definitely have some (probably paid for) asset of an empty plate or like
          an empty dish with chopsticks beside it? */}

              <p className="text-lg font-semibold">Your order is empty</p>
              <p className="w-64 text-center">
                Looks like you haven&apos;t added anything to your order yet.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={"cartDrawerItemsCard"}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="baseVertFlex w-full !items-start !justify-start gap-2"
            >
              <div className="baseVertFlex w-full">
                <AnimatePresence>
                  {regularItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        marginTop: "0.25rem",
                        marginBottom: "0.25rem",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                      transition={{
                        opacity: { duration: 0.1 },
                        height: { duration: 0.2 },
                        marginTop: { duration: 0.2 },
                        marginBottom: { duration: 0.2 },
                      }}
                      className="baseFlex w-full !items-start gap-4"
                    >
                      {/* preview image of item */}
                      <Image
                        src={"/menuItems/sampleImage.webp"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md"
                      />

                      <div className="baseFlex w-full !items-start !justify-between">
                        <div className="baseVertFlex !items-start">
                          {/* item name, dietary restrictions, and edit button */}
                          <div className="baseFlex gap-2">
                            <p className="text-lg">{item.name}</p>

                            {item.includeDietaryRestrictions && (
                              <div className="size-2 rounded-full bg-primary/25" />
                            )}
                          </div>

                          {/* quantity adjustment */}
                          <div className="baseFlex h-8">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-r-none border-2 border-r-0 border-gray-500 p-0"
                              onClick={() => {
                                const newOrderDetails =
                                  structuredClone(orderDetails);

                                const currentQuantity =
                                  newOrderDetails.items[idx]?.quantity;

                                if (currentQuantity === undefined) return;

                                if (currentQuantity > 1) {
                                  newOrderDetails.items[idx]!.quantity -= 1;
                                } else {
                                  newOrderDetails.items.splice(idx, 1);
                                }

                                updateOrder({
                                  newOrderDetails,
                                });
                              }}
                            >
                              {item.quantity === 1 ? (
                                <FaTrashAlt
                                  className="size-4"
                                  aria-label="Remove item"
                                />
                              ) : (
                                <LuMinus className="size-4" />
                              )}
                            </Button>
                            <div className="baseFlex h-full w-8 border-y-2 border-gray-500 bg-white font-semibold">
                              {item.quantity}
                            </div>
                            <Button
                              variant="outline"
                              disabled={item.quantity > 99}
                              className="size-8 rounded-l-none border-2 border-l-0 border-gray-500 p-0"
                              onClick={() => {
                                if (item.quantity > 99) return;
                                const newOrderDetails =
                                  structuredClone(orderDetails);

                                const currentQuantity =
                                  newOrderDetails.items[idx]?.quantity;

                                if (currentQuantity === undefined) return;

                                newOrderDetails.items[idx]!.quantity += 1;

                                updateOrder({
                                  newOrderDetails,
                                });
                              }}
                            >
                              <LuPlus className="size-4" />
                            </Button>
                          </div>

                          <div className="baseVertFlex mt-2 w-full !items-start text-sm">
                            {Object.values(item.customizations).map(
                              (choiceId, idx) => (
                                <p key={idx}>
                                  -{" "}
                                  {
                                    customizationChoices[choiceId]
                                      ?.customizationCategory.name
                                  }
                                  : {customizationChoices[choiceId]?.name}
                                </p>
                              ),
                            )}
                            {item.specialInstructions && (
                              <p>- {item.specialInstructions}</p>
                            )}
                          </div>
                        </div>

                        <div className="baseVertFlex !items-end">
                          <div className="baseFlex gap-2">
                            {item.discountId && (
                              <div className="baseFlex gap-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                                <p>{discounts[item.discountId]?.name}</p>
                              </div>
                            )}
                            <AnimatedPrice
                              price={formatPrice(
                                calculateRelativeTotal({
                                  items: [item],
                                  customizationChoices,
                                  discounts,
                                }),
                              )}
                            />
                          </div>

                          <Button
                            variant={"underline"}
                            size={"underline"}
                            onClick={() => {
                              setItemBeingModified(
                                menuItems[item.itemId] ?? null,
                              );
                              setInitialItemState(item);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* rewards item (if present) */}
              <AnimatePresence mode="wait">
                {rewardItems.length > 0 && (
                  <>
                    {rewardItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="baseFlex w-full !items-start gap-4"
                      >
                        {/* preview image of item */}
                        <Image
                          src={"/menuItems/sampleImage.webp"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md"
                        />

                        <div className="baseFlex w-full !items-start !justify-between">
                          <div className="baseVertFlex !items-start">
                            {/* item name, dietary restrictions, and edit button */}
                            <div className="baseFlex !items-start gap-2">
                              <p className="text-lg">{item.name}</p>

                              {item.includeDietaryRestrictions && (
                                <div className="size-2 rounded-full bg-primary/25" />
                              )}
                            </div>

                            {/* reward name + icon */}
                            <div className="baseFlex !items-start gap-2 rounded-md bg-primary px-1 py-0.5 text-sm font-semibold text-white">
                              {item.pointReward ? (
                                <CiGift className="size-5" />
                              ) : (
                                <FaCakeCandles className="size-5" />
                              )}
                              <p>
                                {item.pointReward ? (
                                  <>
                                    {new Decimal(item.price)
                                      .div(0.01)
                                      .toNumber()}{" "}
                                    point reward
                                  </>
                                ) : (
                                  "Birthday reward"
                                )}
                              </p>
                            </div>

                            <div className="baseVertFlex w-full !items-start text-sm">
                              {Object.values(item.customizations).map(
                                (choiceId, idx) => (
                                  <p key={idx}>
                                    -{" "}
                                    {
                                      customizationChoices[choiceId]
                                        ?.customizationCategory.name
                                    }
                                    : {customizationChoices[choiceId]?.name}
                                  </p>
                                ),
                              )}
                              {item.specialInstructions && (
                                <p>- {item.specialInstructions}</p>
                              )}

                              <Button
                                variant={"underline"}
                                size={"underline"}
                                onClick={() => {
                                  const { items } = orderDetails;

                                  const updatedItems = [];

                                  for (const orderItem of items) {
                                    // Check if this item should be excluded
                                    if (
                                      item.id === orderItem.id &&
                                      (orderItem.birthdayReward ||
                                        orderItem.pointReward)
                                    ) {
                                      continue;
                                    }

                                    // If the item doesn't match our criteria for removal, add it to the updatedItems array
                                    updatedItems.push(orderItem);
                                  }

                                  updateOrder({
                                    newOrderDetails: {
                                      ...orderDetails,
                                      items: updatedItems,
                                    },
                                  });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>

                          <div className="baseVertFlex !items-end">
                            <AnimatedPrice
                              price={formatPrice(
                                calculateRelativeTotal({
                                  items: [item],
                                  customizationChoices,
                                  discounts,
                                }),
                              )}
                            />
                            <Button
                              variant={"underline"}
                              size={"underline"}
                              onClick={() => {
                                setItemBeingModified(
                                  menuItems[item.itemId] ?? null,
                                );
                                setInitialItemState(item);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>

              <div className="baseVertFlex w-full !items-start gap-4">
                {/* dietary restrictions legend */}
                {/* is only rendered if there is an item with "includeDietaryRestrictions" */}
                {orderDetails.items.some(
                  (item) => item.includeDietaryRestrictions,
                ) && (
                  <div className="baseFlex gap-2">
                    <div className="size-2 rounded-full bg-primary/25" />
                    <p className="text-sm">
                      Item will be prepared according to your dietary
                      restrictions
                    </p>
                  </div>
                )}

                <div
                  style={{
                    justifyContent: isSignedIn ? "space-between" : "flex-start",
                  }}
                  className="baseFlex w-full gap-4"
                >
                  <div className="baseFlex gap-2">
                    <Switch
                      id="prefersNapkinsAndUtensilsSwitch"
                      checked={orderDetails.includeNapkinsAndUtensils}
                      onCheckedChange={(checked) =>
                        updateOrder({
                          newOrderDetails: {
                            ...orderDetails,
                            includeNapkinsAndUtensils: checked,
                          },
                        })
                      }
                    />
                    <Label
                      htmlFor="prefersNapkinsAndUtensilsSwitch"
                      className="text-xs"
                    >
                      Include napkins and utensils
                    </Label>
                  </div>
                  {isSignedIn && (
                    <Button
                      className="baseFlex gap-2 text-xs font-semibold"
                      onClick={() => {
                        setShowRewardsDrawer(true);
                      }}
                    >
                      <CiGift className="size-5" />
                      My rewards
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TODO: why does this scroll a bit along with body when drawer is scrolled? I believe it is
      a <Drawer> specific thing */}
      <DrawerFooter>
        <div
          className="baseVertFlex w-full border-t bg-gradient-to-br from-gray-200 to-gray-300
        p-4 shadow-inner"
        >
          <div className="baseFlex w-full !justify-between text-sm">
            <p>Subtotal</p>
            <AnimatedPrice price={formatPrice(orderCost.subtotal)} />
          </div>

          {/* TODO: ask eric if this threshold should apply based on subtotal or total */}
          {isSignedIn &&
            orderDetails.discountId &&
            orderCost.subtotal >= 35 &&
            discounts[orderDetails.discountId]?.name ===
              "Spend $35, Save $5" && (
              <div className="baseFlex w-full !justify-between text-sm text-primary">
                <p>Spend $35, Save $5</p>
                <AnimatedPrice price={formatPrice(-5)} />
              </div>
            )}

          <div className="baseFlex w-full !justify-between text-sm">
            <p>Tax</p>
            <AnimatedPrice price={formatPrice(orderCost.tax)} />
          </div>

          <div className="baseFlex mt-2 w-full !items-end !justify-between">
            <div className="baseFlex gap-2 text-lg font-semibold">
              <p>Total</p>
              <AnimatedPrice price={formatPrice(orderCost.total)} />
            </div>

            <Button
              variant="default"
              disabled={
                checkoutButtonText !== "Proceed to checkout" ||
                orderDetails.items.length === 0
              }
              className="text-xs font-semibold tablet:text-sm"
              onClick={() => void mainForm.handleSubmit(onMainFormSubmit)()}
            >
              <AnimatePresence mode={"popLayout"}>
                <motion.div
                  key={`cartSheet-${checkoutButtonText}`}
                  layout
                  // whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="baseFlex gap-2"
                >
                  {checkoutButtonText}
                  {checkoutButtonText === "Loading" && (
                    <div
                      className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
                      role="status"
                      aria-label="loading"
                    >
                      <span className="sr-only">Loading...</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </DrawerFooter>
    </motion.div>
  );
}

export default CartDrawer;
