import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isToday, parseISO } from "date-fns";
import Decimal from "decimal.js";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import { Clock, Loader2, MapPin, X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { CiCalendarDate, CiGift } from "react-icons/ci";
import { FaTrashAlt, FaUserAlt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { LuCakeSlice, LuMinus, LuPlus } from "react-icons/lu";
import { z } from "zod";
import AvailablePickupDays from "~/components/cart/AvailablePickupDays";
import AvailablePickupTimes from "~/components/cart/AvailablePickupTimes";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
import { menuItemImagePaths } from "~/utils/menuItemImagePaths";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import giftCardFront from "public/giftCards/giftCardFront.png";

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

interface OrderCost {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

type AppliedGiftCard = {
  code: string;
  balance: number;
};

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
  const [slideCheckoutArrow, setSlideCheckoutArrow] = useState(false);

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

  const [giftCardDialogOpen, setGiftCardDialogOpen] = useState(false);
  const [giftCardInput, setGiftCardInput] = useState("");
  const [giftCardError, setGiftCardError] = useState("");
  const [appliedGiftCards, setAppliedGiftCards] = useState<AppliedGiftCard[]>(
    [],
  );

  const checkBalanceMutation = api.giftCard.checkBalance.useMutation({
    onSuccess: (balance, variables) => {
      if (balance > 0) {
        if (orderDetails.giftCardCodes?.includes(variables.code)) {
          setGiftCardError("Gift card already applied.");
          return;
        }

        const newCodes = [
          ...(orderDetails.giftCardCodes || []),
          variables.code,
        ];
        updateOrder({
          newOrderDetails: {
            ...orderDetails,
            giftCardCodes: newCodes,
          },
        });
        setAppliedGiftCards((prev) => [
          ...prev,
          { code: variables.code, balance },
        ]);
        setGiftCardError("");
        setGiftCardInput("");
      } else {
        setGiftCardError("Gift card has zero balance.");
      }
    },
    onError: (err) => {
      setGiftCardError(err.message);
    },
  });

  const checkBalancesMutation = api.giftCard.checkBalances.useMutation({
    onSuccess: (cards) => {
      setAppliedGiftCards(cards);
    },
  });

  const { data: myGiftCards, isLoading: isLoadingGiftCards } =
    api.giftCard.getMyCards.useQuery(undefined, {
      enabled: Boolean(isSignedIn),
      staleTime: 30_000,
    });

  useEffect(() => {
    const codes = orderDetails.giftCardCodes ?? [];

    if (codes.length === 0) {
      return;
    }

    if (appliedGiftCards.length !== codes.length) {
      checkBalancesMutation.mutate({ codes });
    }
  }, [
    orderDetails.giftCardCodes,
    appliedGiftCards.length,
    checkBalancesMutation,
  ]);

  const handleApplyGiftCard = () => {
    const normalizedCode = giftCardInput.trim().toUpperCase();

    if (!normalizedCode) return;

    setGiftCardError("");
    checkBalanceMutation.mutate({ code: normalizedCode });
  };

  const removeGiftCard = (code: string) => {
    const newCodes =
      orderDetails.giftCardCodes?.filter((c) => c !== code) || [];
    updateOrder({
      newOrderDetails: {
        ...orderDetails,
        giftCardCodes: newCodes,
      },
    });
    setAppliedGiftCards((prev) => prev.filter((c) => c.code !== code));
  };

  const selectedGiftCardCodes = useMemo(
    () => new Set(orderDetails.giftCardCodes ?? []),
    [orderDetails.giftCardCodes],
  );

  const handleSavedCardToggle = (
    code: string,
    balance: number,
    shouldApply: boolean,
  ) => {
    if (shouldApply) {
      if (selectedGiftCardCodes.has(code)) return;

      const newCodes = [...(orderDetails.giftCardCodes ?? []), code];
      updateOrder({
        newOrderDetails: {
          ...orderDetails,
          giftCardCodes: newCodes,
        },
      });
      setAppliedGiftCards((prev) => {
        const filtered = prev.filter((card) => card.code !== code);
        return [...filtered, { code, balance }];
      });
      return;
    }

    removeGiftCard(code);
  };

  const sortedAppliedGiftCards = useMemo(
    () => [...appliedGiftCards].sort((a, b) => a.balance - b.balance),
    [appliedGiftCards],
  );

  const { giftCardDeduction, finalTotal, deductionBreakdown } = useMemo(() => {
    let remaining = orderCost.total;
    let total = 0;
    const breakdown: Record<string, number> = {};

    for (const card of sortedAppliedGiftCards) {
      const deduction = Math.min(remaining, card.balance);
      breakdown[card.code] = deduction;
      remaining -= deduction;
      total += deduction;
    }

    return {
      giftCardDeduction: total,
      finalTotal: Math.max(0, orderCost.total - total),
      deductionBreakdown: breakdown,
    };
  }, [sortedAppliedGiftCards, orderCost.total]);

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
      if (item.birthdayReward) {
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
          const selectedDate = mainForm.getValues().dateToPickup;
          const mergedDatetime = mergeDateAndTime(selectedDate, time);

          if (!mergedDatetime) {
            return false;
          }

          return isSelectedTimeSlotValid({
            datetimeToPickup: mergedDatetime,
            minPickupDatetime: minOrderPickupDatetime,
          });
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
      timeToPickup: getHoursAndMinutesFromDate(orderDetails.datetimeToPickup),
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

      const dateChanged =
        value.dateToPickup.getDate() !==
          orderDetails.datetimeToPickup.getDate() ||
        value.dateToPickup.getMonth() !==
          orderDetails.datetimeToPickup.getMonth() ||
        value.dateToPickup.getFullYear() !==
          orderDetails.datetimeToPickup.getFullYear();

      let newDate: Date | undefined;

      if (dateChanged) {
        newDate = getMidnightCSTInUTC(value.dateToPickup);
      } else {
        const timeSelection =
          typeof value.timeToPickup === "string" ? value.timeToPickup : "";

        if (timeSelection.trim().length === 0) {
          newDate = getMidnightCSTInUTC(value.dateToPickup);
        } else {
          newDate = mergeDateAndTime(value.dateToPickup, timeSelection);
        }
      }

      if (!newDate) return;

      if (newDate.getTime() === orderDetails.datetimeToPickup.getTime()) {
        return;
      }

      const newOrderDetails = structuredClone(orderDetails);
      newOrderDetails.datetimeToPickup = newDate;

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

  const [paddingBottom, setPaddingBottom] = useState("0.75rem");

  useEffect(() => {
    const safeAreaInsetBottom = getSafeAreaInsetBottom();

    if (safeAreaInsetBottom > 0) {
      setPaddingBottom(`${safeAreaInsetBottom}px`);
    } else {
      setPaddingBottom("1rem");
    }
  }, []);

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
    const selectedDate = mainForm.getValues().dateToPickup;
    const mergedDatetime = mergeDateAndTime(selectedDate, time);

    if (!mergedDatetime) {
      return true;
    }

    const pickupTimeIsValid = isSelectedTimeSlotValid({
      datetimeToPickup: mergedDatetime,
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
      <div className="baseVertFlex w-full !items-start gap-1 border-b p-4">
        <div className="baseFlex gap-1">
          <LiaShoppingBagSolid className="mb-[4px] size-[22px]" />
          <p className="text-lg font-medium">Your order</p>
        </div>
        <span className="baseFlex ml-1 h-4 gap-1.5 text-stone-600">
          {`${numberOfItems} item${numberOfItems === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* location + date & time picker */}
      <div
        className="baseVertFlex relative my-4 max-w-lg !justify-start gap-1 rounded-md border border-stone-300 bg-gradient-to-br
        from-stone-200 to-stone-300/80 px-6 py-4 shadow-sm"
      >
        <div className="absolute inset-0 size-full overflow-hidden rounded-md">
          <StaticLotus className="absolute bottom-[-41px] right-[-41px] size-32 rotate-[-45deg] fill-primary/50" />
        </div>

        <span className="text-sm">
          Your order will be available for pickup at
        </span>
        <div className="baseFlex gap-2">
          <MapPin className="size-4 text-primary" />

          <Button variant={"link"} className="h-6" asChild>
            <a
              href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
              target="_blank"
              rel="noreferrer"
              className="!p-0 !text-sm"
            >
              693 Raymond Ave, St. Paul, MN 55114
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
            className="baseVertFlex mt-4 w-full !items-start gap-4"
          >
            <FormField
              control={mainForm.control}
              name="dateToPickup"
              render={({ field, fieldState: { invalid, error } }) => (
                <FormItem
                  ref={pickupDateContainerRef}
                  className="baseVertFlex relative scroll-mt-16 !items-start space-y-0"
                >
                  <div className="baseVertFlex !items-start gap-2">
                    <FormLabel className="baseFlex gap-2 font-semibold">
                      <CiCalendarDate className="h-5 w-5 shrink-0" />
                      Pickup date
                    </FormLabel>
                    <Select
                      onValueChange={(stringifiedDate) =>
                        field.onChange(parseISO(stringifiedDate))
                      }
                      value={format(field.value, "yyyy-MM-dd")}
                    >
                      <FormControl>
                        <SelectTrigger className="pl-[14px]">
                          <SelectValue
                            placeholder="Select a day"
                            className="placeholder:!text-muted-foreground"
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
                          marginTop: "0.25rem",
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium text-red-500"
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
                  className="baseVertFlex relative scroll-mt-16 !items-start space-y-0"
                >
                  <div className="baseVertFlex !items-start gap-2">
                    <FormLabel className="baseFlex h-5 gap-2 font-semibold">
                      <Clock className="mx-0.5 w-4 shrink-0" />
                      Pickup time
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-max gap-2 pl-4">
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
                          marginTop: "0.25rem",
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-72 text-sm font-medium text-red-500"
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
              name="pickupName"
              render={({ field, fieldState: { invalid, error } }) => (
                <FormItem
                  ref={pickupNameContainerRef}
                  className="baseVertFlex relative scroll-mt-16 !items-start space-y-0"
                >
                  <div className="baseVertFlex !items-start gap-2">
                    <FormLabel className="baseFlex h-5 gap-2 font-semibold">
                      <FaUserAlt className="w-5 shrink-0" />
                      Pickup name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Smith"
                        className="w-[200px]"
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
                          marginTop: "0.25rem",
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium text-red-500"
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
      </div>

      {/* summary of items in cart */}
      <div className="baseVertFlex size-full max-w-lg !items-start !justify-start">
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
                paddingTop: "1rem",
                paddingBottom: "1rem",
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
                  variant={"underline"} // prob diff variant or make a new one
                  // rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:pointer-events-none data-[state=open]:bg-secondary
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
              className="baseVertFlex my-8 w-full gap-4 px-4 py-12"
            >
              <p className="text-lg font-semibold">Your order is empty</p>
              <p className="w-64 text-center">
                It looks like you haven&apos;t added anything to your order yet.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={"cartDrawerItemsCard"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="baseVertFlex w-full !items-start !justify-start gap-2 px-4 pb-36 pt-1"
            >
              <div className="baseVertFlex w-full !justify-start">
                <AnimatePresence>
                  {regularItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        marginTop: "0.5rem",
                        marginBottom: "0.5rem",
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
                      {menuItemImagePaths[item.name] ? (
                        <Image
                          src={menuItemImagePaths[item.name] ?? ""}
                          alt={`${item.name} at Khue's in St. Paul`}
                          width={200}
                          height={200}
                          quality={100}
                          className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                        />
                      ) : (
                        <div className="baseFlex size-16 shrink-0 rounded-2xl border">
                          <StaticLotus className="size-12 fill-primary/50" />
                        </div>
                      )}

                      <div className="baseFlex w-full !items-start !justify-between gap-2">
                        <div className="baseVertFlex !items-start gap-1">
                          {/* item name, dietary restrictions, and edit button */}
                          <div className="baseFlex !items-start gap-2">
                            {item.includeDietaryRestrictions && (
                              <div className="mt-[11px] size-2 shrink-0 rounded-full bg-primary/75" />
                            )}

                            <p className="text-lg">{item.name}</p>
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
                              disabled={item.quantity >= 20}
                              className="size-7 rounded-none border-none p-0"
                              onClick={() => {
                                if (item.quantity >= 20) return;
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

                          {/* customization choices and special instructions */}
                          {(Object.values(item.customizations).length > 0 ||
                            item.specialInstructions) && (
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
                                <p className="max-w-48 break-all">
                                  - {item.specialInstructions}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="baseVertFlex !items-end">
                          <div className="baseFlex gap-2 leading-8">
                            {item.discountId && (
                              <div className="baseFlex gap-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-offwhite">
                                <p>{discounts[item.discountId]?.name}</p>
                              </div>
                            )}

                            <p>
                              {formatPrice(
                                calculateRelativeTotal({
                                  items: [item],
                                  customizationChoices,
                                  discounts,
                                }),
                              )}
                            </p>
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
                            {menuItemImagePaths[item.name] ? (
                              <div className="!size-16 min-h-16 min-w-16 rounded-md bg-rewardsGradient !p-1">
                                <Image
                                  src={menuItemImagePaths[item.name] ?? ""}
                                  alt={`${item.name} at Khue's in St. Paul`}
                                  width={200}
                                  height={200}
                                  quality={100}
                                  className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                                />
                              </div>
                            ) : (
                              <div className="baseFlex size-16 shrink-0 rounded-2xl border">
                                <StaticLotus className="size-12 fill-primary/50" />
                              </div>
                            )}

                            <div className="baseFlex w-full !items-start !justify-between">
                              <div className="baseVertFlex !items-start">
                                {/* item name, dietary restrictions, and edit button */}
                                <div className="baseFlex !items-start gap-2">
                                  {item.includeDietaryRestrictions && (
                                    <div className="mt-[11px] size-2 shrink-0 rounded-full bg-primary/75" />
                                  )}

                                  <p className="text-lg">{item.name}</p>
                                </div>

                                <div className="baseFlex my-1 gap-1.5 rounded-md border border-primary !px-2 !py-0.5 text-xs text-primary">
                                  <LuCakeSlice className="size-4 stroke-[1.5px]" />

                                  <p className="font-medium">Birthday reward</p>
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
                                    <p className="max-w-48 break-all">
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
                                          orderItem.birthdayReward
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
                                <p>
                                  {formatPrice(
                                    calculateRelativeTotal({
                                      items: [item],
                                      customizationChoices,
                                      discounts,
                                    }),
                                  )}
                                </p>

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
          <div className="baseFlex mb-2 mt-auto w-full gap-2">
            <div className="size-2 shrink-0 rounded-full bg-primary/75" />
            <p className="text-nowrap text-xs">
              Item will be prepared following your dietary restrictions
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
                  <CiGift className="size-[22px] drop-shadow-[0_1px_4px_rgb(0_0_0_/_25%)]" />
                  My rewards
                </Button>
              )}

              <Dialog
                open={giftCardDialogOpen}
                onOpenChange={setGiftCardDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 text-xs font-semibold"
                  >
                    Redeem Gift Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-2xl font-semibold">
                      My Gift Cards
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Apply a saved card or enter a new code below.
                    </p>
                  </DialogHeader>

                  <div className="space-y-4">
                    {isSignedIn ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-stone-600">
                          Available gift cards
                        </p>
                        {isLoadingGiftCards ? (
                          <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading your cards...
                          </div>
                        ) : (myGiftCards?.length ?? 0) > 0 ? (
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {myGiftCards?.map((card) => (
                              <label
                                key={card.id}
                                className="flex cursor-pointer items-center gap-3 rounded-md border bg-white/80 p-3 shadow-sm transition hover:border-primary"
                              >
                                <Checkbox
                                  checked={selectedGiftCardCodes.has(card.code)}
                                  onCheckedChange={(checked) =>
                                    handleSavedCardToggle(
                                      card.code,
                                      card.balance,
                                      Boolean(checked),
                                    )
                                  }
                                  className="mt-0.5"
                                  aria-label={`Toggle gift card ending in ${card.code.slice(-4)}`}
                                />
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={giftCardFront}
                                    alt="Khue's gift card"
                                    width={80}
                                    height={48}
                                    className="h-12 w-20 rounded-md object-cover shadow"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      Card ending in {card.code.slice(-4)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Balance {formatPrice(card.balance)}
                                    </span>
                                  </div>
                                </div>
                                <span className="ml-auto text-sm font-semibold">
                                  {formatPrice(card.balance)}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                            You don&apos;t have any gift cards with a remaining
                            balance yet.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                        Sign in to see gift cards tied to your account.
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-stone-600">
                        Redeem gift card
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyGiftCard();
                        }}
                        className="flex flex-col gap-3 sm:flex-row"
                      >
                        <Input
                          id="giftCardCode"
                          value={giftCardInput}
                          onChange={(e) => {
                            setGiftCardError("");
                            setGiftCardInput(e.target.value.toUpperCase());
                          }}
                          placeholder="Enter gift card code"
                          className="uppercase sm:flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={checkBalanceMutation.isLoading}
                          className="sm:w-24"
                        >
                          {checkBalanceMutation.isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Checking
                            </>
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </form>
                      {giftCardError && (
                        <p className="text-sm text-red-500">{giftCardError}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border bg-stone-100/80 p-4">
                    <p className="text-xs uppercase text-stone-500">
                      Remaining balance
                    </p>
                    <p className="text-2xl font-semibold">
                      {formatPrice(finalTotal)}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div
            style={{
              paddingBottom,
            }}
            className="baseVertFlex min-h-24 w-full gap-2 overflow-hidden border-t bg-gradient-to-br from-stone-200 to-stone-300 pt-2 shadow-inner xs:px-4 xs:pb-3"
          >
            {/* tip form */}
            <div
              className={`baseFlex w-full !justify-start gap-4 px-4 transition-all xs:px-0
            ${tipForm.formState.errors.tipValue ? "pb-6" : ""}
          `}
            >
              <span className="font-medium">Tip</span>

              <div className="baseFlex w-full gap-2 xs:w-auto">
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
                          className="baseVertFlex w-full gap-2 xs:w-auto"
                        >
                          <FormField
                            control={tipForm.control}
                            name="tipValue"
                            render={({
                              field: { onChange, onBlur, value },
                              fieldState: { invalid, error },
                            }) => (
                              <FormItem className="baseVertFlex relative w-full !items-start space-y-0 rounded-md outline outline-2 outline-primary xs:w-auto">
                                <div className="baseVertFlex relative !items-start gap-2">
                                  <Input
                                    ref={customTipInputRef}
                                    aria-label="Custom tip amount"
                                    value={
                                      value === "0"
                                        ? ""
                                        : trimLeadingZeros(value)
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
                        className="w-full !border !border-input text-xs font-semibold xs:w-auto"
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
                  className="w-full !border !border-input text-xs font-semibold xs:w-auto"
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
                  className="w-full !border !border-input text-xs font-semibold xs:w-auto"
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
                  className="w-full !border !border-input text-xs font-semibold xs:w-auto"
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

            <div className="baseVertFlex w-full !justify-between gap-2 xs:!flex-row xs:gap-4">
              <div className="baseVertFlex mt-1 w-full px-8 xs:w-1/2 xs:px-0">
                <div className="baseFlex w-full !justify-between text-sm">
                  <p>Subtotal</p>
                  <p>{formatPrice(orderCost.subtotal)}</p>
                </div>

                <div className="baseFlex w-full !justify-between text-sm">
                  <p>Est. tax</p>
                  <p>{formatPrice(orderCost.tax)}</p>
                </div>

                <div className="baseFlex w-full !justify-between text-sm">
                  <p>{`Tip${orderDetails.tipPercentage !== null ? ` (${orderDetails.tipPercentage}%)` : ""}`}</p>
                  <p>{formatPrice(orderCost.tip)}</p>
                </div>

                <div className="baseFlex w-full !justify-between gap-2 text-lg font-semibold">
                  <p>Total</p>
                  <p>{formatPrice(orderCost.total)}</p>
                </div>

                {sortedAppliedGiftCards.map((card) => {
                  const deduction = deductionBreakdown[card.code] ?? 0;

                  if (deduction <= 0) return null;

                  return (
                    <div
                      key={card.code}
                      className="baseFlex w-full !justify-between text-sm text-green-600"
                    >
                      <div className="flex items-center gap-2">
                        <p>Gift Card (****{card.code.slice(-4)})</p>
                        <button
                          onClick={() => removeGiftCard(card.code)}
                          className="text-xs text-red-500 underline"
                        >
                          Remove
                        </button>
                      </div>
                      <p>-{formatPrice(deduction)}</p>
                    </div>
                  );
                })}

                {giftCardDeduction > 0 && (
                  <div className="baseFlex w-full !justify-between gap-2 border-t pt-2 text-lg font-bold">
                    <p>Payable Total</p>
                    <p>{formatPrice(finalTotal)}</p>
                  </div>
                )}
              </div>

              <Separator
                // orientation="vertical"
                className="hidden h-[1px] w-full bg-stone-400 xs:block xs:h-5/6 xs:w-[1px]"
              />

              <div className="w-full px-8 xs:w-1/2 xs:px-0">
                <Button
                  variant="default"
                  disabled={
                    checkoutButtonText !== "Proceed to checkout" ||
                    orderDetails.items.length === 0
                  }
                  className="!w-full text-sm font-semibold"
                  onPointerEnter={() => {
                    setSlideCheckoutArrow(true);
                  }}
                  onPointerLeave={() => {
                    setSlideCheckoutArrow(false);
                  }}
                  onPointerCancel={() => {
                    setSlideCheckoutArrow(false);
                  }}
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
                      key={`cartDrawer-${checkoutButtonText}`}
                      // layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.25,
                      }}
                      // static width to prevent layout shift
                      className="baseFlex !w-full gap-2"
                    >
                      {checkoutButtonText === "Proceed to checkout" &&
                      finalTotal === 0
                        ? "Complete order"
                        : checkoutButtonText}

                      {checkoutButtonText === "Loading" ? (
                        <div
                          className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                          role="status"
                          aria-label="loading"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <FaArrowRight
                          style={{
                            transform: slideCheckoutArrow
                              ? "translateX(3px)"
                              : "translateX(0)",
                          }}
                          className="size-4 transition-all"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CartDrawer;
