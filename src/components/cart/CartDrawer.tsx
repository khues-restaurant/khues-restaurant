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
import { TbLocation } from "react-icons/tb";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";

interface OrderCost {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface CartDrawer {
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  setItemOrderDetails: Dispatch<SetStateAction<Item | undefined>>;
  setShowRewardsDrawer: Dispatch<SetStateAction<boolean>>;
  pickupName: string;
  setPickupName: Dispatch<SetStateAction<string>>;
}

function CartDrawer({
  setItemToCustomize,
  setItemOrderDetails,
  setShowRewardsDrawer,
  pickupName,
  setPickupName,
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
    tip: 0,
    total: 0,
  });

  const [checkoutButtonText, setCheckoutButtonText] = useState(
    "Proceed to checkout",
  );

  const { updateOrder } = useUpdateOrder();

  const { data: minPickupTime } = api.minimumOrderPickupTime.get.useQuery();
  const { data: userRewards } = api.user.getRewards.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { initializeCheckout } = useInitializeCheckout({
    setCheckoutButtonText,
  });

  const [regularItems, setRegularItems] = useState<Item[]>([]);
  const [rewardItems, setRewardItems] = useState<Item[]>([]);

  const [showCustomTipInput, setShowCustomTipInput] = useState(false);

  useEffect(() => {
    const filteredRewardItems = [];
    const filteredRegularItems = [];

    for (const item of orderDetails.items) {
      if (item.pointReward || item.birthdayReward) {
        filteredRewardItems.push(item);
      } else {
        filteredRegularItems.push(item);
      }
    }

    const sortedRewardsItems = filteredRewardItems.sort((a, b) => {
      return a.id - b.id;
    });
    const sortedRegularItems = filteredRegularItems.sort((a, b) => {
      return a.id - b.id;
    });

    if (!isEqual(sortedRewardsItems, rewardItems)) {
      setRewardItems(sortedRewardsItems);
    }

    if (!isEqual(sortedRegularItems, regularItems)) {
      setRegularItems(sortedRegularItems);
    }
  }, [orderDetails, regularItems, rewardItems]);

  const mainFormSchema = z.object({
    dateToPickup: z
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
    timeToPickup: z
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

          const datetimeToPickup = mergeDateAndTime(
            mainForm.getValues().dateToPickup,
            time,
          );

          if (!datetimeToPickup) return false;

          // Regular pickup time validation
          return (
            datetimeToPickup > now &&
            datetimeToPickup > minOrderPickupDatetime &&
            is30MinsFromDatetime(datetimeToPickup, new Date())
          );
        },
        {
          message:
            "Available pickup times have changed. Please select a new time.",
        },
      ),
    pickupName: z.string().min(1, {
      message: "Pickup name must be specified",
    }),
  });

  const decimalTipSchema = z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid tip format") // Allows empty string, digits, and up to two decimal places
    .refine(
      (val) => {
        if (val.trim() === "") return true; // Allow empty input (will be handled separately)
        const decimalValue = new Decimal(val);
        return (
          decimalValue.greaterThanOrEqualTo(0) &&
          decimalValue.lessThanOrEqualTo(100)
        );
      },
      {
        message: "Custom tip must be between 0 and 100",
      },
    );

  const tipFormSchema = z.object({
    tipValue: decimalTipSchema.refine(
      (tipValue) => {
        if (tipValue.trim() === "") return true; // Allow empty input
        const decimalValue = new Decimal(tipValue);

        return (
          decimalValue.greaterThanOrEqualTo(0) &&
          decimalValue.lessThanOrEqualTo(100)
        );
      },
      {
        message: "Custom tip must be between 0 and 100",
      },
    ),
  });

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    values: {
      dateToPickup: getMidnightDate(orderDetails.datetimeToPickup),
      timeToPickup: orderDetails.isASAP
        ? "ASAP (~20 mins)"
        : getHoursAndMinutesFromDate(orderDetails.datetimeToPickup),
      pickupName,
    },
  });

  const tipForm = useForm<z.infer<typeof tipFormSchema>>({
    resolver: zodResolver(tipFormSchema),
    values: {
      tipValue: getStringifiedTipValue(orderDetails.tipValue),
    },
  });

  function getStringifiedTipValue(tipValue: number) {
    return tipValue.toString();
  }

  function getNumericTipValue(tipValue: string) {
    if (tipValue.trim() === "") {
      return 0; // Return 0 if the input is empty
    }
    const parsedResult = decimalTipSchema.safeParse(tipValue);
    if (!parsedResult.success) {
      return null; // Return null if validation fails
    }

    try {
      return new Decimal(parsedResult.data).toNumber();
    } catch (error) {
      return null; // Return null if Decimal throws an error
    }
  }

  useEffect(() => {
    const subscription = mainForm.watch((value) => {
      if (value.dateToPickup === undefined || value.timeToPickup === undefined)
        return;

      const newDate =
        value.timeToPickup === "ASAP (~20 mins)"
          ? value.dateToPickup
          : mergeDateAndTime(value.dateToPickup, value.timeToPickup);

      if (newDate === undefined) return;

      // if the date was changed then just set the time to be midnight of w/e the new date is
      if (
        value.dateToPickup.getDate() !==
          orderDetails.datetimeToPickup.getDate() ||
        value.dateToPickup.getMonth() !==
          orderDetails.datetimeToPickup.getMonth() ||
        value.dateToPickup.getFullYear() !==
          orderDetails.datetimeToPickup.getFullYear()
      ) {
        newDate.setHours(0, 0, 0, 0);
      } else if (value.timeToPickup === "ASAP (~20 mins)") {
        const newOrderDetails = structuredClone(orderDetails);
        newOrderDetails.datetimeToPickup = newDate;
        newOrderDetails.isASAP = true;

        console.log("updating");

        updateOrder({
          newOrderDetails,
        });

        return;
      }

      // make sure that the new date isn't the same as the current orderDetails.datetimeToPickup
      if (newDate.getTime() === orderDetails.datetimeToPickup.getTime()) return;

      const newOrderDetails = structuredClone(orderDetails);
      newOrderDetails.datetimeToPickup = newDate;
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

  // pickupName form field
  useEffect(() => {
    // technically don't want/need to be watching the whole form for this
    const subscription = mainForm.watch((value) => {
      if (typeof value.pickupName !== "string") return;

      setPickupName(value.pickupName);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mainForm, setPickupName]);

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
        tipPercentage: orderDetails.tipPercentage,
        tipValue: orderDetails.tipValue,
        customizationChoices,
        discounts,
      }),
    );
  }, [
    orderDetails.items,
    orderDetails.tipPercentage,
    orderDetails.tipValue,
    orderDetails.rewardBeingRedeemed,
    customizationChoices,
    discounts,
  ]);

  async function onMainFormSubmit(values: z.infer<typeof mainFormSchema>) {
    setCheckoutButtonText("Loading");

    await initializeCheckout(values.pickupName);
  }
  return (
    <motion.div
      key="cartDrawer"
      initial={{ opacity: 0, translateX: "-100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "-100%" }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className="baseVertFlex relative size-full !justify-start overflow-y-auto"
    >
      <div className="baseVertFlex w-full !items-start gap-1 border-b-2 p-4">
        <div className="baseFlex !items-start gap-1">
          <LiaShoppingBagSolid className="h-6 w-6" />
          <p className="text-lg font-medium">Your order</p>
        </div>
        <p className="baseFlex ml-1 h-4 gap-1.5">
          <AnimatedNumbers value={numberOfItems} fontSize={16} padding={0} />

          {`item${numberOfItems === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* location + date & time picker  (TODO: why doesn't horizontal margin work here with w-full..) */}
      <div
        className="baseVertFlex my-4 max-w-md !justify-start gap-1 rounded-md border border-stone-300 bg-gradient-to-br
        from-stone-200 to-stone-300/80 px-6 py-4 shadow-sm"
      >
        <span className="text-sm">
          Your order will be available for pickup at
        </span>
        <div className="baseFlex gap-2">
          <TbLocation className="text-primary" />

          <Button variant={"link"} className="h-6" asChild>
            <Link href="/googleMapsLink" className="!p-0 !text-sm">
              2100 Snelling Ave Roseville, MN 55113
            </Link>
          </Button>
        </div>

        <Form {...mainForm}>
          <form className="baseVertFlex mt-4 !items-start gap-2">
            <FormField
              control={mainForm.control}
              name="dateToPickup"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-4">
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
              name="timeToPickup"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-4">
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
                            mainForm.getValues().dateToPickup,
                          ) &&
                          mainForm.getValues().dateToPickup.getHours() >= 22
                            ? ""
                            : "max-h-[300px]"
                        }`}
                      >
                        <AvailablePickupTimes
                          selectedDate={mainForm.getValues().dateToPickup}
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
              name="pickupName"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-2">
                    <FormLabel className="text-nowrap font-semibold">
                      Pickup name
                    </FormLabel>
                    <Input
                      {...field}
                      placeholder="John Smith"
                      className="w-[200px]"
                    />
                  </div>
                  <AnimatePresence>
                    {invalid && (
                      <motion.div
                        key={"pickupNameError"}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
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
      <div className="baseVertFlex size-full max-w-md !items-start !justify-start gap-2">
        <p className="px-4 text-lg font-semibold underline underline-offset-2">
          Items
        </p>

        <AnimatePresence>
          {itemNamesRemovedFromCart.length > 0 && (
            <motion.div
              key={"cartDrawerRemovedItemsCard"}
              initial={{
                opacity: 0,
                height: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}
              animate={{
                opacity: 1,
                height: `${100 + itemNamesRemovedFromCart.length * 24}px`,
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
              }}
              exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              style={{ overflow: "hidden" }}
              className="w-full shrink-0 px-8"
            >
              <motion.div
                layout={"position"}
                className="baseVertFlex relative w-full !items-start !justify-start gap-2 rounded-md bg-primary p-4 text-sm text-offwhite"
              >
                <p className="font-semibold underline underline-offset-2">
                  Your order has been modified.
                </p>

                <p className="italic">
                  {itemNamesRemovedFromCart.length > 1
                    ? "These items are"
                    : "This item is"}{" "}
                  not currently available.
                </p>
                <ul className="list-disc pl-6">
                  {itemNamesRemovedFromCart.map((name, idx) => (
                    <li key={idx} className="italic">
                      {name}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={"outline"} // prob diff variant or make a new one
                  // rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary
                  className="absolute right-2 top-2 size-6 bg-primary !p-0 text-offwhite"
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
        <AnimatePresence mode="wait">
          {orderDetails.items.length === 0 ? (
            <motion.div
              key={"cartDrawerEmptyCartCard"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="baseVertFlex my-8 w-full gap-4 p-4"
            >
              <p className="text-lg font-semibold">Your order is empty</p>
              <p className="w-64 text-center">
                It looks like you haven&apos;t added anything to your order yet.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={"cartDrawerItemsCard"}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="baseVertFlex w-full !items-start !justify-start gap-2 px-4 pb-24"
            >
              <div className="baseVertFlex w-full !justify-start">
                <AnimatePresence>
                  {regularItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
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
                        height: { duration: 0.25 },
                        marginTop: { duration: 0.25 },
                        marginBottom: { duration: 0.25 },
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
                              <div className="size-2 shrink-0 rounded-full bg-primary/75" />
                            )}
                          </div>

                          {/* quantity adjustment */}
                          <div className="baseFlex h-8 overflow-hidden rounded-md border-2 border-stone-500">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7 rounded-none border-none p-0"
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
                            <div className="baseFlex h-full w-8 bg-offwhite font-semibold">
                              {item.quantity}
                            </div>
                            <Button
                              variant="outline"
                              disabled={item.quantity > 99}
                              className="size-7 rounded-none border-none p-0"
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
                              <div className="baseFlex gap-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-offwhite">
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
                              setItemToCustomize(
                                menuItems[item.itemId] ?? null,
                              );
                              setItemOrderDetails(item);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* rewards item (if present) */}
                  <AnimatePresence>
                    {rewardItems.length > 0 && (
                      <>
                        {rewardItems.map((item, idx) => (
                          <motion.div
                            key={`rewards${item.id}`}
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
                              height: { duration: 0.25 },
                              marginTop: { duration: 0.25 },
                              marginBottom: { duration: 0.25 },
                            }}
                            className="baseFlex w-full !items-start gap-4"
                          >
                            {/* preview image of item */}
                            <div className="goldBorder !size-16 min-h-16 min-w-16 rounded-md !p-1">
                              <Image
                                src={"/menuItems/sampleImage.webp"}
                                alt={item.name}
                                width={56}
                                height={56}
                                className="!size-14 rounded-md"
                              />
                            </div>

                            <div className="baseFlex w-full !items-start !justify-between">
                              <div className="baseVertFlex !items-start">
                                {/* item name, dietary restrictions, and edit button */}
                                <div className="baseFlex !items-start gap-2">
                                  <p className="text-lg">{item.name}</p>

                                  {item.includeDietaryRestrictions && (
                                    <div className="size-2 shrink-0 rounded-full bg-primary/75" />
                                  )}
                                </div>

                                <div className="my-1 rounded-md border border-primary !px-2 !py-1 text-xs text-primary">
                                  {item.pointReward ? (
                                    <>
                                      {new Decimal(item.price)
                                        .div(0.005)
                                        .toNumber()}{" "}
                                      points
                                    </>
                                  ) : (
                                    "Birthday reward"
                                  )}
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
                                    setItemToCustomize(
                                      menuItems[item.itemId] ?? null,
                                    );
                                    setItemOrderDetails(item);
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
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* dietary restrictions legend */}
        {/* is only rendered if there is an item with "includeDietaryRestrictions" */}
        {orderDetails.items.some((item) => item.includeDietaryRestrictions) && (
          <div className="baseFlex mb-2 w-full gap-2">
            <div className="size-2 shrink-0 rounded-full bg-primary/75" />
            <p className="text-nowrap text-xs">
              Item will be prepared according to your dietary restrictions
            </p>
          </div>
        )}

        <div className="baseVertFlex mt-auto w-full border-t">
          <div className="baseVertFlex w-full gap-4 p-4">
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
                  variant={"rewards"}
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

          <div
            className="baseVertFlex min-h-24 w-full gap-2 overflow-hidden border-t
        bg-gradient-to-br from-stone-200 to-stone-300 p-4 py-2 shadow-inner"
          >
            {/* tip form */}
            <div
              className={`baseFlex w-full !justify-start gap-4 transition-all
            ${tipForm.formState.errors.tipValue ? "pb-6" : ""}
          `}
            >
              <span className="font-medium">Tip</span>

              <div className="baseFlex gap-2">
                {showCustomTipInput ? (
                  <Form {...tipForm}>
                    <form className="baseVertFlex gap-2">
                      <FormField
                        control={tipForm.control}
                        name="tipValue"
                        render={({
                          field: { onChange, onBlur, value, ref },
                          fieldState: { invalid },
                        }) => (
                          <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                            <div className="baseVertFlex relative !items-start gap-2">
                              {/* TODO: doesn't feel great to comment this out, but not sure of other
                            best ui option to keep everything low-profile.. */}
                              {/* <FormLabel className="font-semibold">Tip</FormLabel> */}
                              <Input
                                ref={ref}
                                value={value}
                                autoFocus={true}
                                onChange={(e) => {
                                  const inputValue = e.target.value.replace(
                                    /[^0-9.]/g,
                                    "",
                                  );
                                  onChange(inputValue);

                                  const numericValue =
                                    getNumericTipValue(inputValue);
                                  if (numericValue !== null) {
                                    updateOrder({
                                      newOrderDetails: {
                                        ...orderDetails,
                                        tipPercentage: null,
                                        tipValue: numericValue,
                                      },
                                    });
                                  }
                                }}
                                onBlur={onBlur}
                                placeholder="0"
                                className="w-[77px] pl-5"
                              />
                              <div className="absolute bottom-0 left-0 top-0 flex items-center pl-2">
                                $
                              </div>
                            </div>
                            <AnimatePresence>
                              {invalid && (
                                <motion.div
                                  key={"tipValueError"}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute -bottom-6 left-0 right-0 w-[262px]"
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
                ) : (
                  <Button
                    variant={
                      orderDetails.tipPercentage === null
                        ? "default"
                        : "outline"
                    }
                    className="text-xs font-semibold"
                    onClick={() => {
                      setShowCustomTipInput(true);
                      updateOrder({
                        newOrderDetails: {
                          ...orderDetails,
                          tipPercentage: null,
                          tipValue: 0,
                        },
                      });
                    }}
                    onFocus={() => {
                      setShowCustomTipInput(true);
                      updateOrder({
                        newOrderDetails: {
                          ...orderDetails,
                          tipPercentage: null,
                          tipValue: 0,
                        },
                      });
                    }}
                  >
                    Custom
                  </Button>
                )}
                <Button
                  variant={
                    orderDetails.tipPercentage === 10 ? "default" : "outline"
                  }
                  className="text-xs font-semibold"
                  onClick={() => {
                    setShowCustomTipInput(false);
                    updateOrder({
                      newOrderDetails: {
                        ...orderDetails,
                        tipPercentage: 10,
                        tipValue: 0,
                      },
                    });
                  }}
                >
                  10%
                </Button>
                <Button
                  variant={
                    orderDetails.tipPercentage === 15 ? "default" : "outline"
                  }
                  className="text-xs font-semibold"
                  onClick={() => {
                    setShowCustomTipInput(false);
                    updateOrder({
                      newOrderDetails: {
                        ...orderDetails,
                        tipPercentage: 15,
                        tipValue: 0,
                      },
                    });
                  }}
                >
                  15%
                </Button>
                <Button
                  variant={
                    orderDetails.tipPercentage === 20 ? "default" : "outline"
                  }
                  className="text-xs font-semibold"
                  onClick={() => {
                    setShowCustomTipInput(false);
                    updateOrder({
                      newOrderDetails: {
                        ...orderDetails,
                        tipPercentage: 20,
                        tipValue: 0,
                      },
                    });
                  }}
                >
                  20%
                </Button>
              </div>
            </div>
            <Separator
              orientation="horizontal"
              className="h-[1px] w-full bg-stone-400"
            />

            <div className="baseFlex w-full !justify-between">
              <div className="baseVertFlex w-1/2">
                <div className="baseFlex w-full !justify-between text-sm">
                  <p>Subtotal</p>
                  <AnimatedPrice price={formatPrice(orderCost.subtotal)} />
                </div>

                {/* TODO: ask eric if this threshold should apply based on subtotal or total */}
                {/* {isSignedIn &&
                  orderDetails.discountId &&
                  orderCost.subtotal >= 35 &&
                  discounts[orderDetails.discountId]?.name ===
                    "Spend $35, Save $5" && (
                    <div className="baseFlex w-full !justify-between text-sm text-primary">
                      <p>Spend $35, Save $5</p>
                      <AnimatedPrice
                        price={formatPrice(-5)}
                      />
                    </div>
                  )} */}

                <div className="baseFlex w-full !justify-between text-sm">
                  <p>Tax</p>
                  <AnimatedPrice price={formatPrice(orderCost.tax)} />
                </div>

                <div className="baseFlex w-full !justify-between text-sm">
                  <p>{`Tip${orderDetails.tipPercentage !== null ? ` (${orderDetails.tipPercentage}%)` : ""}`}</p>
                  <AnimatedPrice price={formatPrice(orderCost.tip)} />
                </div>

                <div className="baseFlex w-full !justify-between gap-2 text-lg font-semibold">
                  <p>Total</p>
                  <AnimatedPrice price={formatPrice(orderCost.total)} />
                </div>
              </div>

              <Separator
                orientation="vertical"
                className="h-16 w-[1px] bg-stone-400"
              />

              <Button
                variant="default"
                disabled={
                  checkoutButtonText !== "Proceed to checkout" ||
                  orderDetails.items.length === 0
                }
                className="text-xs font-semibold tablet:text-sm"
                onClick={() => {
                  void mainForm.handleSubmit((mainFormData) => {
                    void tipForm.handleSubmit((tipFormData) => {
                      void onMainFormSubmit(mainFormData);
                    })();
                  })();
                }}
              >
                <AnimatePresence mode={"popLayout"}>
                  <motion.div
                    key={`cartDrawer-${checkoutButtonText}`}
                    // layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.25,
                    }}
                    // static width to prevent layout shift
                    className="baseFlex w-[119.48px] gap-2"
                  >
                    {checkoutButtonText}
                    {checkoutButtonText === "Loading" && (
                      <div
                        className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
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
        </div>
      </div>
    </motion.div>
  );
}

export default CartDrawer;
