import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import OrderSummary from "~/components/cart/OrderSummary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { ToastAction } from "~/components/ui/toast";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import noOrders from "/public/menuItems/myOrders.jpg";
import Head from "next/head";
import { getFirstValidMidnightDate } from "~/utils/getFirstValidMidnightDate";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import Decimal from "decimal.js";
import { toZonedTime } from "date-fns-tz";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { CiGift } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";
import { useRouter } from "next/router";
import { Separator } from "~/components/ui/separator";

function RecentOrders() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();
  const { asPath } = useRouter();

  const { data: orders } = api.order.getUsersOrders.useQuery(
    { userId },
    {
      enabled: Boolean(userId && isSignedIn),
    },
  );

  const [sortedOrders, setSortedOrders] = useState<
    DBOrderSummary[] | null | undefined
  >();
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (orders === null && sortedOrders === undefined) {
      setSortedOrders([]);
      return;
    }

    const localSortedOrders = orders?.sort((a, b) => {
      if (sortDirection === "desc") {
        return b.datetimeToPickup.getTime() - a.datetimeToPickup.getTime();
      } else {
        return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
      }
    });

    if (localSortedOrders === undefined) return;

    setSortedOrders(localSortedOrders);
  }, [orders, sortedOrders, sortDirection]);

  useLayoutEffect(() => {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 10);
  }, []);

  // TODO: there is still seemingly the flash of layout on the initial render, investigate.

  return (
    <motion.div
      key={"profile-my-orders"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // className={`baseVertFlex relative min-h-[calc(100dvh-6rem-81px)] w-full tablet:min-h-0
      // ${sortedOrders && sortedOrders.length > 0 ? "!justify-start tablet:mb-16" : ""}
      // ${sortedOrders && sortedOrders.length > 5 ? "mb-16" : ""}
      // `}
      className={`baseVertFlex baseVertFlex relative mt-24
      h-full min-h-[calc(100dvh-6rem-81px)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem-120px)]
        ${sortedOrders && sortedOrders.length > 0 ? "!justify-start" : ""}
      `}
    >
      <Head>
        <title>My orders | Khue&apos;s</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="My orders | Khue's"></meta>
        <meta
          property="og:url"
          content="www.khueskitchen.com/profile/my-orders"
        />
        <meta property="og:type" content="website" />
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration = "manual"',
          }}
        />
      </Head>

      <div className="baseFlex my-12 !hidden gap-4 rounded-lg border border-stone-400 bg-offwhite p-1 tablet:!flex">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "ghost"
          }
          asChild
        >
          <Link href="/profile/preferences" className="baseFlex w-full gap-2">
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/rewards") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/rewards" className="baseFlex w-full gap-2">
            <CiGift className="size-6" />
            Rewards
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/my-orders") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/my-orders" className="baseFlex w-full gap-2">
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {orders === undefined || sortedOrders === undefined ? (
          <motion.div
            key={"my-ordersLoadingContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex h-full min-h-[calc(100dvh-6rem-81px)] w-full items-center justify-center tablet:min-h-[calc(100dvh-7rem-120px)] "
          >
            <AnimatedLotus className="size-16 fill-primary tablet:size-24" />
          </motion.div>
        ) : (
          <motion.div
            key={"my-ordersLoadedContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex relative my-8 mb-32 mt-16 w-full !justify-start p-0 transition-all lg:w-[775px] tablet:mt-0 tablet:rounded-xl tablet:border tablet:p-8 tablet:shadow-md"
          >
            {/* fyi: don't think it makes sense to have these two be under an <AnimatePresence /> since
            it should (rarely) ever change between 0 orders and some orders */}

            {sortedOrders && sortedOrders.length > 0 && (
              <div className="baseVertFlex gap-2">
                <div className="baseFlex w-full !justify-end font-medium">
                  <div className="baseFlex gap-2">
                    <Label htmlFor="sortDirection" className="text-nowrap">
                      Sort by
                    </Label>
                    <Select
                      value={sortDirection}
                      onValueChange={(direction) => setSortDirection(direction)}
                    >
                      <SelectTrigger id={"sortDirection"}>
                        <SelectValue placeholder="Sort direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Sort direction</SelectLabel>

                          <SelectItem value={"desc"}>
                            <div className="baseFlex gap-1">Newest</div>
                          </SelectItem>
                          <SelectItem value={"asc"}>
                            <div className="baseFlex gap-1">Oldest</div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="baseVertFlex mb-16 gap-4">
                  {sortedOrders.map((order) => (
                    <OrderAccordion
                      key={order.id}
                      userId={userId}
                      order={order}
                    />
                  ))}
                </div>
              </div>
            )}

            {sortedOrders && sortedOrders.length === 0 && (
              <div className="baseVertFlex relative gap-4 p-4">
                <Image
                  src={noOrders}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  sizes="(max-width: 640px) 80vw, 50vw"
                  className="!relative !rounded-md shadow-md"
                />

                <div className="baseVertFlex gap-4">
                  <p className="text-center tablet:text-lg">
                    It looks like you haven&apos;t placed an order yet.
                  </p>
                  <Button asChild>
                    <Link
                      href="/order"
                      className="baseFlex gap-2 !px-4 !text-base shadow-md"
                    >
                      <SideAccentSwirls className="h-[14px] scale-x-[-1] fill-offwhite" />
                      Get started
                      <SideAccentSwirls className="h-[14px] fill-offwhite" />
                    </Link>
                  </Button>
                  with your first order today!
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="baseFlex sticky bottom-0 left-0 z-40 h-20 w-full gap-0 border-t border-stone-400 bg-offwhite tablet:hidden">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/preferences"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-20 w-[1px] bg-stone-400" />

        <Button
          variant={
            asPath.includes("/profile/rewards") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/rewards"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <CiGift className="size-6" />
            <span className="pb-0.5">Rewards</span>
          </Link>
        </Button>

        <Separator className="h-20 w-[1px] bg-stone-400" />

        <Button
          variant={
            asPath.includes("/profile/my-orders") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/my-orders"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default RecentOrders;

interface OrderAccordion {
  userId: string;
  order: DBOrderSummary;
}

function OrderAccordion({ userId, order }: OrderAccordion) {
  const {
    orderDetails,
    getPrevOrderDetails,
    setPrevOrderDetails,
    customizationChoices,
    discounts,
    setItemNamesRemovedFromCart,
    viewportLabel,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    viewportLabel: state.viewportLabel,
  }));

  const {
    mutate: addItemsFromPreviousOrderToCart,
    isLoading: isValidatingOrder,
  } = api.validateOrder.validate.useMutation({
    onSuccess: (data) => {
      if (!data.validItems) return;

      setTimeout(() => {
        // set prev order details so we can revert if necessary
        // with toast's undo button
        setPrevOrderDetails(orderDetails);

        const totalValidItems = data.validItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );

        toast({
          description: `${totalValidItems} item${totalValidItems > 1 ? "s were" : "was"} added to your order.`,
          action: (
            <ToastAction
              altText={`Undo the addition of ${totalValidItems} item${totalValidItems > 1 ? "s" : ""} to your order.`}
              onClick={() => {
                updateOrder({ newOrderDetails: getPrevOrderDetails() });
              }}
            >
              Undo
            </ToastAction>
          ),
        });

        // directly add to order w/ defaults + trigger toast notification;

        // need to pre-generate unique ids for each item since
        // we can't do it dynamically in the map below
        const largestCurrentItemId =
          orderDetails.items.length === 0
            ? 0
            : orderDetails.items.at(-1)!.id + 1;

        const increasingItemIds = Array.from({
          length: order.orderItems.length,
        }).map((_, index) => largestCurrentItemId + index);

        updateOrder({
          newOrderDetails: {
            ...orderDetails,
            items: [
              ...orderDetails.items,
              ...data.validItems.map((item, idx) => ({
                id: increasingItemIds[idx]!,
                itemId: item.itemId,
                name: item.name,
                customizations: item.customizations,
                specialInstructions: item.specialInstructions,
                includeDietaryRestrictions: item.includeDietaryRestrictions,
                quantity: item.quantity,
                price: item.price,
                isChefsChoice: item.isChefsChoice,
                isAlcoholic: item.isAlcoholic,
                isVegetarian: item.isVegetarian,
                isVegan: item.isVegan,
                isGlutenFree: item.isGlutenFree,
                showUndercookedOrRawDisclaimer:
                  item.showUndercookedOrRawDisclaimer,
                discountId: item.discountId,
                pointReward: item.pointReward,
                birthdayReward: item.birthdayReward,
              })),
            ],
          },
        });

        setKeepSpinnerShowing(false);

        if (data.removedItemNames && data.removedItemNames.length > 0) {
          setItemNamesRemovedFromCart(data.removedItemNames);
        }
      }, 1000);
    },
    onError: (error) => {
      console.error("Error adding items from previous order to cart", error);
    },
  });

  const [accordionOpen, setAccordionOpen] = useState<"open" | "closed">(
    "closed",
  );

  const [keepSpinnerShowing, setKeepSpinnerShowing] = useState(false);

  const { updateOrder } = useUpdateOrder();

  const { toast } = useToast();

  return (
    <Accordion
      key={order.id}
      type="single"
      collapsible
      className="w-full min-w-[340px]"
      value={accordionOpen}
      onValueChange={(value) => {
        setAccordionOpen(value === "open" ? value : "closed");
      }}
    >
      <AccordionItem
        value={"open"}
        className="w-full rounded-md border shadow-md"
        data-state={accordionOpen}
      >
        <div className="baseFlex relative w-full gap-2 p-4 tablet:w-[650px]">
          {viewportLabel.includes("mobile") ? (
            <div className="baseVertFlex w-full gap-4">
              {/* item image previews + track / reorder/rate */}
              <div className="baseFlex w-full !items-end !justify-between gap-12">
                <div className="baseVertFlex !items-start gap-2 !self-start">
                  <div>{format(new Date(order.createdAt), "PPP")}</div>
                  {/* preview images */}
                  <div className="baseFlex gap-2">
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={order.orderItems[0]?.name ?? "First item image"}
                      width={48}
                      height={48}
                      className="rounded-md"
                    />

                    {order.orderItems.length > 1 && (
                      <Image
                        src={"/menuItems/sampleImage.webp"}
                        alt={order.orderItems[0]?.name ?? "Second item image"}
                        width={48}
                        height={48}
                        className="rounded-md"
                      />
                    )}

                    {order.orderItems.length > 2 && (
                      <>
                        {order.orderItems.length > 3 ? (
                          <div className="baseVertFlex size-12 text-sm">
                            + {order.orderItems.length - 2}
                            <span>more</span>
                          </div>
                        ) : (
                          <Image
                            src={"/menuItems/sampleImage.webp"}
                            alt={
                              order.orderItems[0]?.name ?? "Second item image"
                            }
                            width={48}
                            height={48}
                            className="rounded-md"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="baseVertFlex gap-2">
                  {order.orderCompletedAt ? (
                    <>
                      <Button
                        size={"sm"}
                        disabled={keepSpinnerShowing || isValidatingOrder}
                        className="w-20"
                        onClick={() => {
                          // TODO: maybe want to create dialog/modal for the summary of this order

                          // need to pre-generate unique ids for each item since
                          // we can't do it dynamically in the map below
                          const largestCurrentItemId =
                            orderDetails.items.length === 0
                              ? 0
                              : orderDetails.items.at(-1)!.id + 1;

                          const increasingItemIds = Array.from({
                            length: order.orderItems.length,
                          }).map((_, index) => largestCurrentItemId + index);

                          setKeepSpinnerShowing(true);

                          addItemsFromPreviousOrderToCart({
                            userId,
                            orderDetails: {
                              datetimeToPickup: getFirstValidMidnightDate(),
                              isASAP: orderDetails.isASAP,
                              includeNapkinsAndUtensils: false,
                              items: order.orderItems.map((item, idx) => ({
                                id: increasingItemIds[idx]!,
                                itemId: item.menuItemId,
                                name: item.name,
                                customizations: item.customizations,
                                specialInstructions: item.specialInstructions,
                                includeDietaryRestrictions:
                                  item.includeDietaryRestrictions,
                                quantity: item.quantity,
                                price: item.price,
                                isChefsChoice: item.isChefsChoice,
                                isAlcoholic: item.isAlcoholic,
                                isVegetarian: item.isVegetarian,
                                isVegan: item.isVegan,
                                isGlutenFree: item.isGlutenFree,
                                showUndercookedOrRawDisclaimer:
                                  item.showUndercookedOrRawDisclaimer,
                                discountId: item.discountId,
                                birthdayReward: item.birthdayReward,
                                pointReward: item.pointReward,
                              })),
                              discountId: null,
                              tipPercentage: null,
                              tipValue: 0,
                            },
                            validatingAReorder: true,
                          });
                        }}
                      >
                        <AnimatePresence mode="popLayout">
                          <motion.div
                            key={
                              keepSpinnerShowing || isValidatingOrder
                                ? `reorderValidationSpinner-${order.id}`
                                : `reorder-${order.id}`
                            }
                            // whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                              duration: 0.25,
                            }}
                            className="baseFlex gap-2"
                          >
                            {keepSpinnerShowing || isValidatingOrder ? (
                              <div
                                className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                                role="status"
                                aria-label="loading"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                            ) : (
                              <div>Reorder</div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </Button>

                      {/* TODO: only show this if !order.userLeftFeedback once added to schema */}
                      {true && (
                        <RateDialog userId={userId} orderId={order.id} />
                      )}
                    </>
                  ) : (
                    <Button asChild className="baseFlex gap-2">
                      <Link href={`/track?id=${order.id}`}>Track</Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* FYI: I am aware that this is a roundabout way of handling accessibility, but it's the
                best method I can find for allowing arbitrary content (buttons) within the "Trigger"
                of the accordion */}
              <Button
                variant={"outline"}
                className="baseFlex w-full gap-2 rounded-b-md"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAccordionOpen(
                      accordionOpen === "open" ? "closed" : "open",
                    );
                  }
                }}
                onClick={() => {
                  setAccordionOpen(
                    accordionOpen === "open" ? "closed" : "open",
                  );
                }}
              >
                Order details
                <ChevronDown
                  data-state={accordionOpen}
                  className={`h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:rotate-180`}
                />
              </Button>
            </div>
          ) : (
            <div className="baseFlex w-full !justify-between">
              <div className="baseVertFlex !items-start gap-4">
                <div className="text-nowrap">
                  {format(
                    toZonedTime(order.datetimeToPickup, "America/Chicago"),
                    "PPP",
                  )}
                </div>
                {/* item image previews + (date + item names) */}
                <div className="baseFlex relative w-full !justify-start gap-2">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={order.orderItems[0]?.name ?? "First item image"}
                    width={64}
                    height={64}
                    className="rounded-md"
                  />

                  {order.orderItems.length > 1 && (
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={order.orderItems[0]?.name ?? "Second item image"}
                      width={64}
                      height={64}
                      className="rounded-md"
                    />
                  )}

                  {order.orderItems.length > 2 && (
                    <>
                      {order.orderItems.length > 3 ? (
                        <div className="baseVertFlex size-12 text-sm">
                          +{order.orderItems.length - 2}
                          <span>more</span>
                        </div>
                      ) : (
                        <Image
                          src={"/menuItems/sampleImage.webp"}
                          alt={order.orderItems[0]?.name ?? "Second item image"}
                          width={64}
                          height={64}
                          className="rounded-md"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="baseVertFlex gap-4 !self-end">
                <div className="baseFlex gap-2 !self-end">
                  {order.orderCompletedAt ? (
                    <>
                      <Button
                        size={"sm"}
                        disabled={keepSpinnerShowing || isValidatingOrder}
                        className="w-20"
                        onClick={() => {
                          // TODO: maybe want to create dialog/modal for the summary of this order

                          // need to pre-generate unique ids for each item since
                          // we can't do it dynamically in the map below
                          const largestCurrentItemId =
                            orderDetails.items.length === 0
                              ? 0
                              : orderDetails.items.at(-1)!.id + 1;

                          const increasingItemIds = Array.from({
                            length: order.orderItems.length,
                          }).map((_, index) => largestCurrentItemId + index);

                          setKeepSpinnerShowing(true);

                          addItemsFromPreviousOrderToCart({
                            userId,
                            orderDetails: {
                              datetimeToPickup: getFirstValidMidnightDate(),
                              isASAP: orderDetails.isASAP,
                              includeNapkinsAndUtensils: false,
                              items: order.orderItems.map((item, idx) => ({
                                id: increasingItemIds[idx]!,
                                itemId: item.menuItemId,
                                name: item.name,
                                customizations: item.customizations,
                                specialInstructions: item.specialInstructions,
                                includeDietaryRestrictions:
                                  item.includeDietaryRestrictions,
                                quantity: item.quantity,
                                price: item.price,
                                isChefsChoice: item.isChefsChoice,
                                isAlcoholic: item.isAlcoholic,
                                isVegetarian: item.isVegetarian,
                                isVegan: item.isVegan,
                                isGlutenFree: item.isGlutenFree,
                                showUndercookedOrRawDisclaimer:
                                  item.showUndercookedOrRawDisclaimer,
                                discountId: item.discountId,
                                birthdayReward: item.birthdayReward,
                                pointReward: item.pointReward,
                              })),
                              discountId: null,
                              tipPercentage: null,
                              tipValue: 0,
                            },
                            validatingAReorder: true,
                          });
                        }}
                      >
                        <AnimatePresence mode="popLayout">
                          <motion.div
                            key={
                              keepSpinnerShowing || isValidatingOrder
                                ? `tabletReorderValidationSpinner-${order.id}`
                                : `tabletReorder-${order.id}`
                            }
                            // whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                              duration: 0.25,
                            }}
                            className="baseFlex gap-2"
                          >
                            {keepSpinnerShowing || isValidatingOrder ? (
                              <div
                                className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                                role="status"
                                aria-label="loading"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                            ) : (
                              <div>Reorder</div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </Button>

                      {/* TODO: only show this if !order.userLeftFeedback once added to schema */}
                      {true && (
                        <RateDialog userId={userId} orderId={order.id} />
                      )}
                    </>
                  ) : (
                    <Button asChild className="baseFlex gap-2">
                      <Link href={`/track?id=${order.id}`}>Track</Link>
                    </Button>
                  )}
                </div>

                {/* FYI: I am aware that this is a roundabout way of handling accessibility, but it's the
                    best method I can find for allowing arbitrary content (buttons) within the "Trigger"
                    of the accordion */}
                <Button
                  variant={"outline"}
                  className="baseFlex gap-2 self-end rounded-b-md"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setAccordionOpen(
                        accordionOpen === "open" ? "closed" : "open",
                      );
                    }
                  }}
                  onClick={() => {
                    setAccordionOpen(
                      accordionOpen === "open" ? "closed" : "open",
                    );
                  }}
                >
                  Order details
                  <ChevronDown
                    data-state={accordionOpen}
                    className={`h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:rotate-180`}
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
        <AccordionContent className="baseFlex border-t pt-2">
          <div className="baseFlex w-full max-w-lg px-2">
            <OrderSummary order={order} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface RateDialog {
  userId: string;
  orderId: string;
}

function RateDialog({ userId, orderId }: RateDialog) {
  const ctx = api.useUtils();

  const { mutate: submitFeedback } = api.review.create.useMutation({
    onSuccess: async () => {
      await ctx.order.getUsersOrders.invalidate();

      setShowDialog(false);
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const feedbackFormSchema = z.object({
    feedback: z
      .string({
        required_error: "Cannot submit empty feedback.",
      })
      .refine((val) => val.trim().length > 0, {
        // Ensures the string is not just whitespace
        message: "Cannot submit empty feedback.",
      })
      .refine((val) => val.trim().length < 1000, {
        // Ensures the string is not just whitespace
        message: "Feedback cannot exceed 1000 characters.",
      }),
    allowedToBePublic: z.boolean(),
  });

  const feedbackForm = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    values: {
      feedback: "",
      allowedToBePublic: false,
    },
  });

  async function onFormSubmit(values: z.infer<typeof feedbackFormSchema>) {
    try {
      submitFeedback({
        userId,
        orderId,
        message: values.feedback,
        allowedToBePublic: values.allowedToBePublic,
      });
    } catch (e) {
      console.error(e);
    }
  }

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (showDialog) {
      feedbackForm.reset();
    }
  }, [feedbackForm, showDialog]);

  // TODO: add async stuff + also maybe baseVertFlex of [animated logo + "Thanks for your feedback!"]

  return (
    <AlertDialog open={showDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant={"secondary"}
          className="w-[88px] tablet:w-auto"
          onClick={() => setShowDialog(true)}
        >
          Rate
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <div className="baseVertFlex gap-8">
          <AlertDialogHeader>
            <AlertDialogTitle>Order feedback form</AlertDialogTitle>
            <AlertDialogDescription>
              Please let us know how you felt about this order. Your feedback is
              greatly appreciated and helps us improve our service.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...feedbackForm}>
            <form className="baseVertFlex w-full !items-start gap-2">
              <FormField
                control={feedbackForm.control}
                name="feedback"
                render={({ field, fieldState: { invalid, error } }) => (
                  <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                    <div className="baseVertFlex w-full !items-start gap-2">
                      <FormLabel className="font-semibold">Feedback</FormLabel>
                      <Textarea
                        {...field}
                        placeholder="How was your experience?"
                        maxLength={1000}
                        className="w-full"
                      />
                      <p className="pointer-events-none absolute bottom-2 right-4 text-xs text-stone-400 tablet:bottom-1">
                        {1000 - feedbackForm.getValues("feedback").length}{" "}
                        characters remaining
                      </p>
                    </div>
                    <AnimatePresence>
                      {invalid && (
                        <motion.div
                          key={"feedbackError"}
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            marginTop: "0.5rem",
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
                control={feedbackForm.control}
                name="allowedToBePublic"
                render={({ field }) => (
                  <FormItem className="baseFlex mt-2 gap-2 space-y-0">
                    <Switch
                      id="allowedToBePublic"
                      checked={feedbackForm.getValues("allowedToBePublic")}
                      onCheckedChange={(value) =>
                        feedbackForm.setValue("allowedToBePublic", value)
                      }
                    />
                    <FormLabel htmlFor="allowedToBePublic">
                      Allow us to anonymously show your feedback on our website.
                    </FormLabel>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <AlertDialogFooter className="mt-8">
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={
                // !feedbackForm.formState.isValid // this should work but it's not
                feedbackForm.getValues("feedback").trim().length === 0
              }
              onClick={() => {
                void feedbackForm.handleSubmit(onFormSubmit)();
              }}
            >
              Submit feedback
              {/* TODO: add spinner + checkmark for mutation */}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
