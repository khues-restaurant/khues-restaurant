import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoCardOutline } from "react-icons/io5";
import { CiGift } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";
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
import AnimatedLotus from "~/components/ui/AnimatedLotus";
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
import { Separator } from "~/components/ui/separator";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Textarea } from "~/components/ui/textarea";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import useForceScrollToTopOnAsyncComponents from "~/hooks/useForceScrollToTopOnAsyncComponents";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type DBOrderSummary } from "~/types/orderSummary";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getFirstValidMidnightDate } from "~/utils/dateHelpers/getFirstValidMidnightDate";
import { menuItemImagePaths } from "~/utils/menuItemImagePaths";
import noOrders from "public/interior/six.jpg";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { type User } from "@prisma/client";

function RecentOrders() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();
  const { asPath } = useRouter();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(isSignedIn && userId),
  });

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

    // this logic is reversed from what you'd expect because the list is rendered
    // with the first item in the array being rendered first. So to sort by the newest
    // orders, we need to sort in descending order actually.
    // (uses slice to avoid mutating the original array)
    const localSortedOrders = orders?.slice().sort((a, b) => {
      if (sortDirection === "asc") {
        return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
      } else {
        return b.datetimeToPickup.getTime() - a.datetimeToPickup.getTime();
      }
    });

    if (
      localSortedOrders !== undefined &&
      !isEqual(localSortedOrders, sortedOrders)
    ) {
      setSortedOrders(localSortedOrders);
    }
  }, [orders, sortedOrders, sortDirection]);

  useForceScrollToTopOnAsyncComponents();

  // TODO: there is still seemingly the flash of layout on the initial render, investigate.

  return (
    <motion.div
      key={"profile-my-orders"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`baseVertFlex baseVertFlex relative
      h-full min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]
        ${sortedOrders && sortedOrders.length > 0 ? "!justify-start" : ""}
      `}
    >
      <div className="baseFlex sticky left-0 top-20 z-40 h-14 w-full gap-0 bg-offwhite shadow-sm tablet:hidden">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "activeLink" : "text"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/preferences"
            className={`baseFlex h-14 w-full gap-2 !rounded-none text-xs
            ${asPath.includes("/profile/preferences") ? "activeUnderline" : "border-b-2 border-stone-300"}`}
          >
            <IoSettingsOutline className="size-4 shrink-0" />
            Preferences
          </Link>
        </Button>

        <Button
          variant={
            asPath.includes("/profile/gift-cards") ? "activeLink" : "text"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/gift-cards"
            className={`baseFlex h-14 w-full gap-2 !rounded-none text-xs
            ${asPath.includes("/profile/gift-cards") ? "activeUnderline" : "border-b-2 border-stone-300"}`}
          >
            <CiGift className="size-4 shrink-0" />
            My gift cards
          </Link>
        </Button>

        <Button
          variant={
            asPath.includes("/profile/my-orders") ? "activeLink" : "text"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/my-orders"
            className={`baseFlex h-14 w-full gap-2 !rounded-none text-xs
            ${asPath.includes("/profile/my-orders") ? "activeUnderline" : "border-b-2 border-stone-300"}`}
          >
            <TfiReceipt className="size-4 shrink-0" />
            My Orders
          </Link>
        </Button>
      </div>

      <div className="baseFlex my-12 !hidden gap-4 rounded-lg border border-stone-400 bg-offwhite p-1 tablet:!flex">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "ghost"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/preferences"
            className="baseFlex w-full gap-2"
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/gift-cards") ? "default" : "ghost"}
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/gift-cards"
            className="baseFlex w-full gap-2"
          >
            <IoCardOutline className="size-5" />
            My Gift Cards
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/my-orders") ? "default" : "ghost"}
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/my-orders"
            className="baseFlex w-full gap-2"
          >
            <TfiReceipt className="size-5" />
            My Orders
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
            // offsetting the tablet+ top nav margin w/ a negative top margin of the same size to
            // keep lotus centered
            className="baseVertFlex w-full grow-[1] items-center justify-center tablet:mt-[-48px]"
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
            className="baseVertFlex relative my-8 mb-32 mt-16 w-full grow-[1] !justify-start p-0 transition-all lg:w-[775px] tablet:mt-0 tablet:rounded-xl tablet:border tablet:bg-offwhite tablet:p-8 tablet:shadow-md"
          >
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
                      user={user}
                    />
                  ))}
                </div>
              </div>
            )}

            {sortedOrders && sortedOrders.length === 0 && (
              <div className="baseVertFlex relative grow-[1] gap-4 p-4">
                <Image
                  src={noOrders}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  sizes="(max-width: 640px) 80vw, 50vw"
                  className="!relative !rounded-md shadow-md"
                />

                <div className="baseVertFlex gap-4">
                  <p className="text-center">
                    It looks like you haven&apos;t placed an order yet.
                  </p>
                  <Button asChild>
                    <Link
                      prefetch={false}
                      href="/order"
                      className="baseFlex gap-2 !px-4 shadow-md tablet:!py-6 tablet:!text-lg"
                    >
                      <SideAccentSwirls className="h-[14px] scale-x-[-1] fill-offwhite" />
                      Get started
                      <SideAccentSwirls className="h-[14px] fill-offwhite" />
                    </Link>
                  </Button>
                  <p className="text-center">with your first order today!</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RecentOrders;

interface OrderAccordion {
  userId: string;
  order: DBOrderSummary;
  user: User | null | undefined;
}

function OrderAccordion({ userId, order, user }: OrderAccordion) {
  const {
    orderDetails,
    getPrevOrderDetails,
    setPrevOrderDetails,
    setItemNamesRemovedFromCart,
    viewportLabel,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
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
                includeDietaryRestrictions:
                  user?.autoApplyDietaryRestrictions ?? false,
                quantity: item.quantity,
                price: item.price,
                discountId: item.discountId,
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
      className="w-full min-w-[340px] xs:min-w-[400px]"
      value={accordionOpen}
      onValueChange={(value) => {
        setAccordionOpen(value === "open" ? value : "closed");
      }}
    >
      <AccordionItem
        value={"open"}
        className="w-full rounded-md border bg-offwhite shadow-md"
        data-state={accordionOpen}
      >
        <div className="baseFlex relative w-full gap-2 p-4 tablet:w-[650px]">
          {viewportLabel.includes("mobile") ? (
            <div className="baseVertFlex w-full gap-4">
              {/* item image previews + track / reorder/rate */}
              <div className="baseFlex w-full !items-end !justify-between gap-12">
                <div className="baseVertFlex !items-start gap-2 !self-start">
                  <div>{format(new Date(order.createdAt), "PPP")}</div>
                  {order.orderRefundedAt && (
                    <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      Refunded on{" "}
                      {format(
                        toZonedTime(order.orderRefundedAt, "America/Chicago"),
                        "PPP",
                      )}
                    </span>
                  )}
                  {/* preview images */}
                  <div className="baseFlex gap-2">
                    {menuItemImagePaths[order.orderItems[0]?.name ?? ""] && (
                      <Image
                        src={
                          menuItemImagePaths[order.orderItems[0]?.name ?? ""]!
                        }
                        alt={order.orderItems[0]?.name ?? "First item"}
                        width={500}
                        height={500}
                        className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                      />
                    )}

                    {order.orderItems.length > 1 &&
                      menuItemImagePaths[order.orderItems[1]?.name ?? ""] && (
                        <Image
                          src={
                            menuItemImagePaths[order.orderItems[1]?.name ?? ""]!
                          }
                          alt={order.orderItems[1]?.name ?? "Second item"}
                          width={500}
                          height={500}
                          className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                        />
                      )}

                    {order.orderItems.length > 2 &&
                      menuItemImagePaths[order.orderItems[2]?.name ?? ""] && (
                        <>
                          {order.orderItems.length > 3 ? (
                            <div className="baseVertFlex size-12 text-sm">
                              + {order.orderItems.length - 2}
                              <span>more</span>
                            </div>
                          ) : (
                            <Image
                              src={
                                menuItemImagePaths[
                                  order.orderItems[2]?.name ?? ""
                                ]!
                              }
                              alt={order.orderItems[2]?.name ?? "Third item"}
                              width={500}
                              height={500}
                              className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                            />
                          )}
                        </>
                      )}
                  </div>
                </div>

                <div className="baseVertFlex gap-2">
                  {order.orderCompletedAt ? (
                    <>
                      {!order.userLeftFeedback && (
                        <RateDialog userId={userId} orderId={order.id} />
                      )}

                      <Button
                        disabled={keepSpinnerShowing || isValidatingOrder}
                        className="w-24"
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
                              includeNapkinsAndUtensils: false,
                              items: order.orderItems.map((item, idx) => ({
                                id: increasingItemIds[idx]!,
                                itemId: item.menuItemId,
                                name: item.name,
                                customizations: item.customizations,
                                specialInstructions: item.specialInstructions,
                                includeDietaryRestrictions:
                                  user?.autoApplyDietaryRestrictions ?? false,
                                quantity: item.quantity,
                                price: item.price,
                                discountId: item.discountId,
                                birthdayReward: item.birthdayReward,
                              })),
                              discountId: null,
                              tipPercentage: null,
                              tipValue: 0,
                            },
                            validatingAReorder: true,
                          });
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
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
                    </>
                  ) : (
                    <Button asChild className="baseFlex gap-2">
                      <Link prefetch={false} href={`/track?id=${order.id}`}>
                        Track
                      </Link>
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
                  className={`h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=open]:rotate-180`}
                />
              </Button>
            </div>
          ) : (
            <div className="baseFlex w-full !justify-between">
              <div className="baseVertFlex !items-start gap-4">
                <div className="baseVertFlex !items-start gap-1 text-nowrap">
                  <span>
                    {format(
                      toZonedTime(order.datetimeToPickup, "America/Chicago"),
                      "PPP",
                    )}
                  </span>
                  {order.orderRefundedAt && (
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Refunded on{" "}
                      {format(
                        toZonedTime(order.orderRefundedAt, "America/Chicago"),
                        "PPP",
                      )}
                    </span>
                  )}
                </div>
                {/* item image previews + (date + item names) */}
                <div className="baseFlex relative w-full !justify-start gap-2">
                  {menuItemImagePaths[order.orderItems[0]?.name ?? ""] && (
                    <Image
                      src={menuItemImagePaths[order.orderItems[0]?.name ?? ""]!}
                      alt={order.orderItems[0]?.name ?? "First item"}
                      width={500}
                      height={500}
                      className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                    />
                  )}

                  {order.orderItems.length > 1 &&
                    menuItemImagePaths[order.orderItems[1]?.name ?? ""] && (
                      <Image
                        src={
                          menuItemImagePaths[order.orderItems[1]?.name ?? ""]!
                        }
                        alt={order.orderItems[1]?.name ?? "Second item"}
                        width={500}
                        height={500}
                        className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
                      />
                    )}

                  {order.orderItems.length > 2 &&
                    menuItemImagePaths[order.orderItems[2]?.name ?? ""] && (
                      <>
                        {order.orderItems.length > 3 ? (
                          <div className="baseVertFlex size-12 text-sm">
                            +{order.orderItems.length - 2}
                            <span>more</span>
                          </div>
                        ) : (
                          <Image
                            src={
                              menuItemImagePaths[
                                order.orderItems[2]?.name ?? ""
                              ]!
                            }
                            alt={order.orderItems[2]?.name ?? "Third item"}
                            width={500}
                            height={500}
                            className="!size-16 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md"
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
                        disabled={keepSpinnerShowing || isValidatingOrder}
                        className="w-24"
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
                              includeNapkinsAndUtensils: false,
                              items: order.orderItems.map((item, idx) => ({
                                id: increasingItemIds[idx]!,
                                itemId: item.menuItemId,
                                name: item.name,
                                customizations: item.customizations,
                                specialInstructions: item.specialInstructions,
                                includeDietaryRestrictions:
                                  user?.autoApplyDietaryRestrictions ?? false,
                                quantity: item.quantity,
                                price: item.price,
                                discountId: item.discountId,
                                birthdayReward: item.birthdayReward,
                              })),
                              discountId: null,
                              tipPercentage: null,
                              tipValue: 0,
                            },
                            validatingAReorder: true,
                          });
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
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

                      {!order.userLeftFeedback && (
                        <RateDialog userId={userId} orderId={order.id} />
                      )}
                    </>
                  ) : (
                    <Button asChild className="baseFlex gap-2">
                      <Link prefetch={false} href={`/track?id=${order.id}`}>
                        Track
                      </Link>
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
                    className={`h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=open]:rotate-180`}
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
      setSubmitButtonText("Submitted");

      setTimeout(() => {
        void ctx.order.getUsersOrders.invalidate();
        setShowDialog(false);
      }, 1500);
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

      setSubmitButtonText("Submitting");
    } catch (e) {
      console.error(e);
    }
  }

  const [showDialog, setShowDialog] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState("Submit feedback");

  useEffect(() => {
    if (showDialog) {
      feedbackForm.reset();
    }
  }, [feedbackForm, showDialog]);

  return (
    <AlertDialog open={showDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant={"secondary"}
          className="w-24 tablet:w-auto"
          onClick={() => setShowDialog(true)}
        >
          Rate
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <div className="baseVertFlex gap-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
              Order feedback form
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Please let us know how you felt about this order. Your feedback is
              greatly appreciated and helps us improve our service.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...feedbackForm}>
            <form
              onSubmit={feedbackForm.handleSubmit(onFormSubmit)}
              className="baseVertFlex w-full !items-start gap-2"
            >
              <FormField
                control={feedbackForm.control}
                name="feedback"
                render={({ field, fieldState: { invalid, error } }) => (
                  <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                    <div className="baseVertFlex w-full !items-start gap-2">
                      <VisuallyHidden>
                        <FormLabel className="font-semibold">
                          Feedback
                        </FormLabel>
                      </VisuallyHidden>
                      <Textarea
                        {...field}
                        placeholder="How was your experience?"
                        maxLength={1000}
                        className="max-h-64 min-h-32 w-full"
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
                            marginTop: "0.25rem",
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

              {/* <FormField
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
              /> */}
            </form>
          </Form>
        </div>
        <AlertDialogFooter className="baseFlex w-full !flex-row !justify-between gap-2">
          <AlertDialogCancel asChild>
            <Button
              disabled={submitButtonText !== "Submit feedback"}
              variant="secondary"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={
                // !feedbackForm.formState.isValid // this should work but it's not
                feedbackForm.getValues("feedback").trim().length === 0 ||
                submitButtonText !== "Submit feedback"
              }
              onClick={() => {
                void feedbackForm.handleSubmit(onFormSubmit)();
              }}
            >
              <AnimatePresence mode={"popLayout"} initial={false}>
                <motion.div
                  key={submitButtonText}
                  layout
                  // whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="baseFlex w-[112px] gap-2"
                >
                  {submitButtonText === "Submit feedback" && "Submit feedback"}

                  {submitButtonText === "Submitting" && (
                    <div
                      className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                      role="status"
                      aria-label="loading"
                    >
                      <span className="sr-only">Loading...</span>
                    </div>
                  )}
                  {submitButtonText === "Submitted" && (
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="size-5 text-offwhite"
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
                    </svg>
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
