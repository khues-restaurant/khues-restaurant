import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isToday, parseISO } from "date-fns";
import Decimal from "decimal.js";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import { X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { CiCalendarDate, CiGift } from "react-icons/ci";
import { FaRegClock, FaTrashAlt } from "react-icons/fa";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { LuCakeSlice, LuMinus, LuPlus } from "react-icons/lu";
import { TbLocation } from "react-icons/tb";
import { z } from "zod";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import AnimatedPrice from "~/components/AnimatedPrice";
import AvailablePickupDays from "~/components/cart/AvailablePickupDays";
import AvailablePickupTimes from "~/components/cart/AvailablePickupTimes";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import StaticLotus from "~/components/ui/StaticLotus";
import { Switch } from "~/components/ui/switch";
import useGetUserId from "~/hooks/useGetUserId";
import useInitializeCheckout from "~/hooks/useInitializeCheckout";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore, type Item } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import { getHoursAndMinutesFromDate } from "~/utils/dateHelpers/getHoursAndMinutesFromDate";
import { isSelectedTimeSlotValid } from "~/utils/dateHelpers/isSelectedTimeSlotValid";
import { mergeDateAndTime } from "~/utils/dateHelpers/mergeDateAndTime";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";
import { calculateTotalCartPrices } from "~/utils/priceHelpers/calculateTotalCartPrices";

interface OrderCost {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface CartSheet {
  setShowCartSheet: Dispatch<SetStateAction<boolean>>;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  setItemOrderDetails: Dispatch<SetStateAction<Item | undefined>>;
  setIsEditingItem: Dispatch<SetStateAction<boolean>>;
  setShowRewardsDialog: Dispatch<SetStateAction<boolean>>;
  pickupName: string;
  setPickupName: Dispatch<SetStateAction<string>>;
}

function CartSheet({
  setShowCartSheet,
  setItemToCustomize,
  setItemOrderDetails,
  setIsEditingItem,
  setShowRewardsDialog,
  pickupName,
  setPickupName,
}: CartSheet) {
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
  // const { data: userRewards } = api.user.getRewards.useQuery(userId, {
  //   enabled: Boolean(userId && isSignedIn),
  // });

  const { initializeCheckout } = useInitializeCheckout({
    setCheckoutButtonText,
  });

  const [regularItems, setRegularItems] = useState<Item[]>([]);
  const [rewardItems, setRewardItems] = useState<Item[]>([]);

  const customTipInputRef = useRef<HTMLInputElement>(null);
  const [showCustomTipInput, setShowCustomTipInput] = useState(false);
  const [tipValueInitialized, setTipValueInitialized] = useState(false);

  // hacky, but should work for effect you want
  useEffect(() => {
    if (tipValueInitialized) return;

    if (orderDetails.tipValue !== 0) {
      setShowCustomTipInput(true);
      setTipValueInitialized(true);
    } else {
      setTipValueInitialized(true);
    }
  }, [orderDetails, tipValueInitialized]);

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
        required_error: "Invalid pickup date",
      })
      .refine(
        (date) => {
          const todayAtMidnight = getMidnightCSTInUTC();

          // fyi: returns message if expression is false
          return date >= todayAtMidnight;
        },
        {
          message: "Invalid pickup date",
        },
      ),
    timeToPickup: z
      .string({
        required_error: "Invalid pickup time",
      })
      .refine((val) => val.trim().length > 0, {
        // Ensures the string is not just whitespace (the default of midnight is "")
        message: "Invalid pickup time",
      })
      .refine(
        (time) => {
          if (minPickupTime === null || minPickupTime === undefined) {
            return false;
          }

          const minOrderPickupDatetime = minPickupTime.value;
          const now = new Date();
          const selectedDate = mainForm.getValues().dateToPickup;

          const isASAP = time === "ASAP (~20 mins)" || orderDetails.isASAP;

          const pickupTimeIsValid = isSelectedTimeSlotValid({
            isASAP,
            datetimeToPickup: orderDetails.isASAP
              ? now
              : mergeDateAndTime(selectedDate, time) || now,
            minPickupDatetime: minOrderPickupDatetime,
          });

          return pickupTimeIsValid;
        },
        {
          message:
            "Available pickup times have changed. Please select a new time.",
        },
      ),
    pickupName: z
      .string()
      .min(1, {
        message: "Pickup name is required",
      })
      // 61 here since valid first and last name are 30 characters each
      // and allowing a space in between
      .max(61, {
        message: "Invalid pickup name length",
      })
      .refine((value) => /^[A-Za-z\s'-]+$/.test(value), {
        message: "Invalid characters found",
      })
      .refine((value) => !/[^\u0000-\u007F]/.test(value), {
        message: "Invalid characters found",
      })
      .refine((value) => !/[\p{Emoji}]/u.test(value), {
        message: "Invalid characters found",
      })
      .transform((value) => value.trim()) // Remove leading and trailing whitespace
      .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,
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
        message: "Custom tip must be between $0 and $100",
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
        message: "Custom tip must be between $0 and $100",
      },
    ),
  });

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    values: {
      dateToPickup: orderDetails.datetimeToPickup,
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

  function trimLeadingZeros(value: string): string {
    return value.replace(/^0+(?=\d)/, "");
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

  // dynamically updating datetimeToPickup based on changes to date/time inputs
  useEffect(() => {
    const subscription = mainForm.watch((value) => {
      if (value.dateToPickup === undefined || value.timeToPickup === undefined)
        return;

      let newDate =
        value.timeToPickup === "ASAP (~20 mins)"
          ? value.dateToPickup
          : mergeDateAndTime(value.dateToPickup, value.timeToPickup);

      if (newDate === undefined) return;

      // if the day was changed then just set the time to be midnight of w/e the new day is
      if (
        value.dateToPickup.getDate() !==
          orderDetails.datetimeToPickup.getDate() ||
        value.dateToPickup.getMonth() !==
          orderDetails.datetimeToPickup.getMonth() ||
        value.dateToPickup.getFullYear() !==
          orderDetails.datetimeToPickup.getFullYear()
      ) {
        newDate = getMidnightCSTInUTC(value.dateToPickup);
      } else if (
        value.timeToPickup === "ASAP (~20 mins)" &&
        !orderDetails.isASAP
      ) {
        newDate = getMidnightCSTInUTC(value.dateToPickup);

        const newOrderDetails = structuredClone(orderDetails);
        newOrderDetails.datetimeToPickup = newDate;
        newOrderDetails.isASAP = true;

        updateOrder({
          newOrderDetails,
        });

        return;
      }

      // make sure that the new date isn't the same as the current orderDetails.datetimeToPickup
      if (newDate.getTime() === orderDetails.datetimeToPickup.getTime()) {
        return;
      }

      const newOrderDetails = structuredClone(orderDetails);
      newOrderDetails.datetimeToPickup = newDate;
      newOrderDetails.isASAP = false;

      updateOrder({
        newOrderDetails,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mainForm, orderDetails, updateOrder]);

  const formPickupNameValue = useWatch({
    name: "pickupName",
    control: mainForm.control,
  });

  useEffect(() => {
    setPickupName(formPickupNameValue);
  }, [formPickupNameValue, setPickupName]);

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

  const pickupDateContainerRef = useRef<HTMLDivElement>(null);
  const pickupTimeContainerRef = useRef<HTMLDivElement>(null);
  const pickupNameContainerRef = useRef<HTMLDivElement>(null);

  function scrollPickupDateErorrIntoView(date: Date) {
    const todayAtMidnight = getMidnightCSTInUTC();

    return date < todayAtMidnight;
  }

  function scrollPickupTimeErrorIntoView(time: string) {
    if (time.trim().length === 0) {
      return true;
    }

    if (minPickupTime === null || minPickupTime === undefined) {
      return false;
    }

    const minOrderPickupDatetime = minPickupTime.value;
    const now = new Date();
    const selectedDate = mainForm.getValues().dateToPickup;

    const isASAP = time === "ASAP (~20 mins)" || orderDetails.isASAP;

    const pickupTimeIsValid = isSelectedTimeSlotValid({
      isASAP,
      datetimeToPickup: orderDetails.isASAP
        ? now
        : mergeDateAndTime(selectedDate, time) || now,
      minPickupDatetime: minOrderPickupDatetime,
    });

    return !pickupTimeIsValid;
  }

  function scrollPickupNameErrorIntoView(pickupName: string) {
    pickupName = pickupName.trim().replace(/\s+/g, " ");

    // Check if the pickup name is not empty
    if (pickupName.length < 1) {
      return true; // "Pickup name is required"
    }

    // Check if the pickup name exceeds the maximum length of 61 characters
    if (pickupName.length > 61) {
      return true; // "Invalid pickup name length"
    }

    // Check for valid characters (letters, spaces, hyphens, and apostrophes)
    if (!/^[A-Za-z\s'-]+$/.test(pickupName)) {
      return true; // "Invalid characters found"
    }

    // Check for non-ASCII characters
    if (/[^\u0000-\u007F]/.test(pickupName)) {
      return true; // "Invalid characters found"
    }

    // Check for emojis
    if (/[\p{Emoji}]/u.test(pickupName)) {
      return true; // "Invalid characters found"
    }

    // All checks passed
    return false;
  }

  return (
    <div className="baseVertFlex relative size-full !justify-start">
      <div className="baseVertFlex w-full !items-start gap-1 border-b p-4">
        <div className="baseFlex gap-1">
          <LiaShoppingBagSolid className="mb-[4px] size-[22px]" />
          <p className="text-lg font-medium">Your order</p>
        </div>
        <span className="baseFlex ml-1 h-4 gap-1.5 text-stone-600">
          <AnimatedNumbers value={numberOfItems} fontSize={16} padding={0} />

          {`item${numberOfItems === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="baseVertFlex size-full !justify-start overflow-y-auto">
        {/* location + date & time picker + pickup name form */}
        <div className="baseFlex relative my-4 w-min flex-wrap gap-2 rounded-md border border-stone-300 bg-gradient-to-br from-stone-200 to-stone-300/70 p-4 px-8 shadow-sm">
          <div className="absolute inset-0 size-full overflow-hidden rounded-md">
            <StaticLotus className="absolute -bottom-9 -right-9 size-28 rotate-[-45deg] fill-primary/50" />
          </div>

          <span className="text-sm">
            Your order will be available for pickup at
          </span>

          <div className="baseFlex gap-2">
            <TbLocation className="text-primary" />
            <Button variant={"link"} className="h-6" asChild>
              <a
                href="https://www.google.com/maps/place/Ngon+Bistro/@44.9560024,-93.1337998,15z/data=!4m6!3m5!1s0x87f62a8194b9460f:0x51ed0108f30095d4!8m2!3d44.9560024!4d-93.1337998!16s%2Fg%2F1tk6wglq?entry=ttu"
                target="_blank"
                rel="noreferrer"
                className="!p-0 !text-sm"
              >
                2100 Snelling Ave Roseville, MN 55113
              </a>
            </Button>
          </div>

          <Form {...mainForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void mainForm.handleSubmit((mainFormData) => {
                  void tipForm.handleSubmit((tipFormData) => {
                    void onMainFormSubmit(mainFormData);
                  })();
                })();
              }}
              className="baseVertFlex mt-2 !items-start gap-2"
            >
              <div className="baseFlex !items-start gap-2">
                <FormField
                  control={mainForm.control}
                  name="dateToPickup"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormItem
                      ref={pickupDateContainerRef}
                      className="baseVertFlex relative scroll-mt-16 !items-start space-y-0"
                    >
                      <div className="baseVertFlex !items-start gap-2">
                        <FormLabel className="font-semibold">
                          Pickup date
                        </FormLabel>
                        <Select
                          onValueChange={(stringifiedDate) =>
                            field.onChange(parseISO(stringifiedDate))
                          }
                          value={format(field.value, "yyyy-MM-dd")}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[215px] pl-[14px]">
                              <CiCalendarDate className="h-5 w-5 shrink-0" />
                              <SelectValue
                                placeholder="Select a day"
                                className="w-[215px] placeholder:!text-muted-foreground"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent side="bottom">
                            <AvailablePickupDays />
                          </SelectContent>
                        </Select>
                      </div>
                      <AnimatePresence>
                        {invalid && (
                          <motion.div
                            key={"pickupDateError"}
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: "0.5rem",
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-1 text-sm font-medium text-red-500"
                          >
                            {error?.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />

                <FormField
                  control={mainForm.control}
                  name="timeToPickup"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormItem
                      ref={pickupTimeContainerRef}
                      style={{
                        width:
                          field.value === ""
                            ? "156px"
                            : field.value === "ASAP (~20 mins)"
                              ? "176px"
                              : `${field.value.length * 25}px`,
                      }}
                      className="baseVertFlex relative scroll-mt-16 !items-start space-y-0 transition-[width]"
                    >
                      <div className="baseVertFlex !items-start gap-2">
                        <FormLabel className="font-semibold">
                          Pickup time
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-max gap-2 pl-4">
                              <FaRegClock className="shrink-0" />
                              <SelectValue
                                placeholder="Select a time"
                                className="placeholder:!text-muted-foreground"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            side="bottom"
                            className={`${
                              isToday(mainForm.getValues().dateToPickup) &&
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
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: "0.5rem",
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-1 text-sm font-medium text-red-500"
                          >
                            {error?.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />
              </div>

              <div className="baseFlex !items-start gap-2">
                <FormField
                  control={mainForm.control}
                  name="pickupName"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormItem
                      ref={pickupNameContainerRef}
                      className="baseVertFlex relative scroll-mt-16 !items-start space-y-0"
                    >
                      <div className="baseVertFlex !items-start gap-2">
                        <FormLabel className="text-nowrap font-semibold">
                          Pickup name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Smith"
                            className="w-[215px]"
                          />
                        </FormControl>
                      </div>
                      <AnimatePresence>
                        {invalid && (
                          <motion.div
                            key={"pickupNameError"}
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: "0.5rem",
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-1 text-sm font-medium text-red-500"
                          >
                            {error?.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <p className="ml-4 !self-start text-lg font-semibold underline underline-offset-2">
          Items
        </p>

        <AnimatePresence>
          {itemNamesRemovedFromCart.length > 0 && (
            <motion.div
              key={"cartSheetRemovedItemsCard"}
              initial={{
                opacity: 0,
                height: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}
              animate={{
                opacity: 1,
                height: `${100 + itemNamesRemovedFromCart.length * 24}px`,
                paddingTop: "1rem",
                paddingBottom: "1rem",
              }}
              exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="shrink-0 px-8"
            >
              <motion.div
                layout={"position"}
                className="baseVertFlex relative w-full !items-start !justify-start gap-2 rounded-md bg-primary p-4 pr-16 text-sm text-offwhite"
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
        <AnimatePresence mode={"wait"}>
          {orderDetails.items.length === 0 ? (
            <motion.div
              key={"cartSheetEmptyCartCard"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="baseVertFlex size-full gap-4 px-4 py-20"
            >
              <p className="text-lg font-semibold">Your order is empty</p>
              <p className="w-64 text-center">
                It looks like you haven&apos;t added anything to your order yet.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={"cartSheetItemsCard"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="baseVertFlex w-full !items-start !justify-start gap-2 p-4 pb-16"
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
                      {item.hasImageOfItem && (
                        <Image
                          src={"/menuItems/sampleImage.webp"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md drop-shadow-md"
                        />
                      )}

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
                              disabled={item.quantity > 20}
                              className="size-7 rounded-none border-none p-0"
                              onClick={() => {
                                if (item.quantity > 20) return;
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

                          <div className="baseVertFlex ml-1 mt-2 w-full !items-start text-sm">
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
                              <p className="max-w-72 break-all">
                                - {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="baseVertFlex !items-end">
                          <div className="baseFlex gap-2 leading-8">
                            {item.discountId && (
                              <div className="baseFlex gap-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-offwhite">
                                <p>{discounts[item.discountId]?.name}</p>
                              </div>
                            )}

                            {/* completely unsure as to why this is necessary to wrap like this,
                                but otherwise caused extremely odd overflow issues with animating out
                                text... */}
                            <AnimatePresence mode={"popLayout"}>
                              <AnimatedPrice
                                price={formatPrice(
                                  calculateRelativeTotal({
                                    items: [item],
                                    customizationChoices,
                                    discounts,
                                  }),
                                )}
                                excludeAnimatePresence={true}
                              />
                            </AnimatePresence>
                          </div>

                          <Button
                            variant={"underline"}
                            size={"underline"}
                            onClick={() => {
                              setIsEditingItem(true);
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
                            {item.hasImageOfItem && (
                              <div className="rounded-md bg-rewardsGradient p-1">
                                <Image
                                  src={"/menuItems/sampleImage.webp"}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="rounded-md drop-shadow-md"
                                />
                              </div>
                            )}

                            <div className="baseFlex w-full !items-start !justify-between">
                              <div className="baseVertFlex !items-start">
                                {/* item name, dietary restrictions, and edit button */}
                                <div className="baseFlex gap-2">
                                  <p className="text-lg">{item.name}</p>

                                  {item.includeDietaryRestrictions && (
                                    <div className="size-2 shrink-0 rounded-full bg-primary/75" />
                                  )}
                                </div>

                                <div className="baseFlex my-1 gap-2 rounded-md border border-primary !px-2 !py-0.5 text-xs text-primary">
                                  {item.pointReward ? (
                                    <CiGift className="size-5" />
                                  ) : (
                                    <LuCakeSlice className="size-5 stroke-[1.5px]" />
                                  )}
                                  <p className="font-medium">
                                    {item.pointReward ? (
                                      <>
                                        {new Decimal(item.price)
                                          .mul(2) // item price (in cents) multiplied by 2
                                          .toNumber()}{" "}
                                        point reward
                                      </>
                                    ) : (
                                      "Birthday reward"
                                    )}
                                  </p>
                                </div>

                                <div className="baseVertFlex ml-1 w-full !items-start text-sm">
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
                                    <p className="max-w-72 break-all">
                                      - {item.specialInstructions}
                                    </p>
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
                                {/* completely unsure as to why this is necessary to wrap like this,
                                but otherwise caused extremely odd overflow issues with animating out
                                text... */}
                                <AnimatePresence mode={"popLayout"}>
                                  <AnimatedPrice
                                    price={formatPrice(
                                      calculateRelativeTotal({
                                        items: [item],
                                        customizationChoices,
                                        discounts,
                                      }),
                                    )}
                                    excludeAnimatePresence={true}
                                  />
                                </AnimatePresence>

                                <Button
                                  variant={"underline"}
                                  size={"underline"}
                                  onClick={() => {
                                    setIsEditingItem(true);
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
          <div className="baseFlex mb-2 mt-auto w-full gap-2 !self-end">
            <div className="size-2 shrink-0 rounded-full bg-primary/75" />
            <p className="text-sm">
              Item will be prepared following your dietary restrictions
            </p>
          </div>
        )}
      </div>

      <div className="baseVertFlex w-full border-t">
        <div className="baseVertFlex w-full gap-4 px-4 py-3">
          <div
            style={{
              justifyContent: isSignedIn ? "space-between" : "flex-start",
            }}
            className="baseFlex w-full"
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
              <Label htmlFor="prefersNapkinsAndUtensilsSwitch">
                Include napkins and utensils
              </Label>
            </div>

            {isSignedIn && (
              <Button
                variant={"rewards"}
                className="baseFlex gap-2 font-semibold"
                onClick={() => {
                  setShowRewardsDialog(true);
                }}
              >
                <CiGift className="size-6 drop-shadow-[0_1px_4px_rgb(0_0_0_/_25%)]" />
                My rewards
              </Button>
            )}
          </div>
        </div>

        <div className="baseVertFlex w-full gap-2 rounded-bl-xl border-t bg-gradient-to-br from-stone-200 to-stone-300 px-4 pb-3 pt-2 shadow-inner">
          {/* tip form */}
          <div
            className={`baseFlex w-full !justify-start gap-4 transition-all
            ${tipForm.formState.errors.tipValue ? "pb-5" : ""}
          `}
          >
            <span className="font-medium">Tip</span>

            <div className="baseFlex gap-2">
              <AnimatePresence mode="popLayout">
                {showCustomTipInput ? (
                  <motion.div
                    key="customTipForm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Form {...tipForm}>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void mainForm.handleSubmit((mainFormData) => {
                            void tipForm.handleSubmit((tipFormData) => {
                              void onMainFormSubmit(mainFormData);
                            })();
                          })();
                        }}
                        className="baseVertFlex gap-2"
                      >
                        <FormField
                          control={tipForm.control}
                          name="tipValue"
                          render={({
                            field: { onChange, onBlur, value },
                            fieldState: { invalid, error },
                          }) => (
                            <FormItem className="baseVertFlex relative !items-start space-y-0 rounded-md outline outline-2 outline-primary">
                              <div className="baseVertFlex relative !items-start gap-2">
                                <Input
                                  ref={customTipInputRef}
                                  aria-label="Custom tip amount"
                                  value={
                                    value === "0" ? "" : trimLeadingZeros(value)
                                  }
                                  type={"tel"}
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
                                <div
                                  className={`absolute bottom-0 left-0 top-0 flex items-center pl-2
                                  ${tipForm.getValues().tipValue === "" || tipForm.getValues().tipValue === "0" ? "text-stone-500" : ""}
                                  `}
                                >
                                  $
                                </div>
                              </div>
                              <AnimatePresence>
                                {invalid && (
                                  <motion.div
                                    key={"tipValueError"}
                                    // due to being absolute, not copy pasting the
                                    // animation states w/ marginTop/height changes
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute -bottom-6 left-0 right-0 ml-1 w-[280px] text-sm font-medium text-red-500"
                                  >
                                    {error?.message}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="customTipButton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      variant={
                        orderDetails.tipPercentage === null
                          ? "default"
                          : "outline"
                      }
                      className="text-xs font-semibold"
                      onClick={() => {
                        setShowCustomTipInput(true);

                        setTimeout(() => {
                          customTipInputRef.current?.focus();
                        }, 0);

                        if (orderDetails.tipPercentage !== null) {
                          updateOrder({
                            newOrderDetails: {
                              ...orderDetails,
                              tipPercentage: null,
                              tipValue: 0,
                            },
                          });
                        }
                      }}
                      onFocus={() => {
                        setTimeout(() => {
                          customTipInputRef.current?.focus();
                        }, 0);

                        if (orderDetails.tipPercentage !== null) {
                          updateOrder({
                            newOrderDetails: {
                              ...orderDetails,
                              tipPercentage: null,
                              tipValue: 0,
                            },
                          });
                        }
                      }}
                    >
                      Custom
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <div className="baseFlex mt-1 w-full !justify-between text-sm">
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
                    <AnimatedPrice price={formatPrice(-5)} />
                  </div>
                )} */}

              <div className="baseFlex w-full !justify-between text-sm">
                <p>Est. tax</p>
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
              className="h-5/6 w-[1px] bg-stone-400"
            />

            <Button
              variant="default"
              disabled={
                checkoutButtonText !== "Proceed to checkout" ||
                orderDetails.items.length === 0
              }
              className="text-xs font-semibold tablet:text-sm"
              onClick={() => {
                // FYI: manually scrolling to these inputs since react-hook-form isn't
                // able to scroll to <select> elements it seems, and also the scrolling
                // to the pickupName input didn't work great on ios at least.

                const needToScrollPickupDateErrorIntoView =
                  scrollPickupDateErorrIntoView(
                    mainForm.getValues().dateToPickup,
                  );
                const needToScrollPickupTimeErrorIntoView =
                  scrollPickupTimeErrorIntoView(
                    mainForm.getValues().timeToPickup,
                  );
                const needToScrollPickupNameErrorIntoView =
                  scrollPickupNameErrorIntoView(
                    mainForm.getValues().pickupName,
                  );

                if (needToScrollPickupDateErrorIntoView) {
                  const container = pickupDateContainerRef.current;

                  if (container) {
                    container.scrollIntoView({
                      behavior: "instant",
                      block: "start",
                    });
                  }
                } else if (needToScrollPickupTimeErrorIntoView) {
                  const container = pickupTimeContainerRef.current;

                  if (container) {
                    container.scrollIntoView({
                      behavior: "instant",
                      block: "start",
                    });
                  }
                } else if (needToScrollPickupNameErrorIntoView) {
                  const container = pickupNameContainerRef.current;

                  if (container) {
                    container.scrollIntoView({
                      behavior: "instant",
                      block: "start",
                    });
                  }
                }

                void mainForm.handleSubmit((mainFormData) => {
                  void tipForm.handleSubmit((tipFormData) => {
                    void onMainFormSubmit(mainFormData);
                  })();
                })();
              }}
            >
              <AnimatePresence mode={"popLayout"} initial={false}>
                <motion.div
                  key={`cartSheet-${checkoutButtonText}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.25,
                  }}
                  // static width to prevent layout shift
                  className="baseFlex w-[150px] gap-2"
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
  );
}

export default CartSheet;
