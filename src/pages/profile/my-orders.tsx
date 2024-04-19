import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import OrderSummary from "~/components/cart/OrderSummary";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
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
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { ToastAction } from "~/components/ui/toast";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { type GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import isEqual from "lodash.isequal";

function RecentOrders({ initOrders }: { initOrders: DBOrderSummary[] | null }) {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();

  const { data: currentOrderData } = api.order.getUsersOrders.useQuery(
    { userId },
    {
      enabled: Boolean(userId && isSignedIn),
    },
  );

  console.log("rendering");

  const [orders, setOrders] = useState<DBOrderSummary[] | null>(initOrders);

  useEffect(() => {
    if (
      currentOrderData === undefined ||
      currentOrderData === null ||
      isEqual(initOrders, currentOrderData)
    )
      return;

    setOrders(currentOrderData);
  }, [initOrders, currentOrderData]);

  const [sortedOrders, setSortedOrders] = useState<DBOrderSummary[] | null>(
    null,
  );
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (orders === null && sortedOrders === null) {
      setSortedOrders([]);
      return;
    }

    const sortedOrders = orders.sort((a, b) => {
      if (sortDirection === "desc") {
        return b.datetimeToPickup.getTime() - a.datetimeToPickup.getTime();
      } else {
        return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
      }
    });

    console.log("setting orders");
    setSortedOrders(sortedOrders);
  }, [orders, sortDirection]);

  // dang, there is still seemingly the flash of layout on the initial render, investigate.
  // could it be due to the type errors in above effect?

  return (
    <motion.div
      key={"profile-my-orders"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative min-h-[calc(100dvh-6rem-73px)] w-full tablet:min-h-0 tablet:!justify-start"
    >
      <div className="baseVertFlex relative mt-4 w-full p-0 transition-all tablet:my-8 tablet:p-8">
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

            <div className="baseVertFlex gap-4">
              {sortedOrders.map((order) => (
                <OrderAccordion key={order.id} userId={userId} order={order} />
              ))}
            </div>
          </div>
        )}

        {sortedOrders && sortedOrders.length === 0 && (
          <div className="baseVertFlex relative gap-4">
            <Image
              src={"/menuItems/myOrders.jpg"}
              alt={"TODO: fill in w/ appropriate alt text"}
              fill
              className="!relative rounded-md !px-4 "
            />

            <div className="baseVertFlex gap-4">
              <p className="text-center tablet:text-lg">
                It looks like you haven&apos;t placed an order yet.
              </p>
              <Button asChild>
                <Link href="/order-now">Get started</Link>
              </Button>
              with your first order today!
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

RecentOrders.PageLayout = TopProfileNavigationLayout;

export default RecentOrders;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { props: {} };

  const prisma = new PrismaClient();

  const recentOrders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      orderItems: {
        include: {
          customizations: true,
          discount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Iterate over each order to transform the item customizations
  // into a Record<string, string> for each order's items
  const initOrders =
    // @ts-expect-error asdf
    (recentOrders?.map((order) => {
      order.orderItems = order.orderItems.map((item) => {
        // @ts-expect-error asdf
        item.customizations = item.customizations.reduce(
          (acc, customization) => {
            acc[customization.customizationCategoryId] =
              customization.customizationChoiceId;
            return acc;
          },
          {} as Record<string, string>,
        );

        return item;
      });

      return order;
    }) as DBOrderSummary[]) ?? null;

  return {
    props: { initOrders, ...buildClerkProps(ctx.req) },
  };
};
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
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
  }));

  const { mutate: addItemsFromOrderToCart, isLoading: isValidatingOrder } =
    api.validateOrder.validate.useMutation({
      onSuccess: (data) => {
        if (!data.validItems) return;

        // set prev order details so we can revert if necessary
        // with toast's undo button
        setPrevOrderDetails(orderDetails);

        const totalValidItems = data.validItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );

        toast({
          description: `${totalValidItems} item${totalValidItems > 1 ? "s" : ""} added to your order.`,
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

        // directly add to order w/ defaults + trigger toast notification
        setShowCheckmark(true);

        updateOrder({
          newOrderDetails: {
            ...orderDetails,
            items: [
              ...orderDetails.items,
              ...data.validItems.map((item) => ({
                id: crypto.randomUUID(),
                itemId: item.itemId,
                name: item.name,
                customizations: item.customizations,
                specialInstructions: item.specialInstructions,
                includeDietaryRestrictions: item.includeDietaryRestrictions,
                quantity: item.quantity,
                price: item.price,
                discountId: item.discountId,
                pointReward: item.pointReward,
                birthdayReward: item.birthdayReward,
              })),
            ],
          },
        });

        setTimeout(() => {
          setShowCheckmark(false);
        }, 1000);

        if (data.removedItemNames && data.removedItemNames.length > 0) {
          setItemNamesRemovedFromCart(data.removedItemNames);
        }
      },
      onError: (error) => {
        console.error("Error adding items from previous order to cart", error);
      },
    });

  const [accordionOpen, setAccordionOpen] = useState<"open" | "closed">(
    "closed",
  );
  const viewportLabel = useGetViewportLabel();

  const [showCheckmark, setShowCheckmark] = useState(false);

  const { updateOrder } = useUpdateOrder();

  const { toast } = useToast();

  return (
    <Accordion
      key={order.id}
      type="single"
      collapsible
      className="w-full"
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
              <div className="baseFlex w-full !justify-between gap-12">
                <div className="baseVertFlex !items-start gap-2">
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
                          <div className="baseVertFlex size-12 rounded-md border p-1 text-sm">
                            +{order.orderItems.length - 2}
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
                        disabled={showCheckmark || isValidatingOrder}
                        onClick={() => {
                          addItemsFromOrderToCart({
                            userId,
                            orderDetails: {
                              datetimeToPickUp: new Date(),
                              includeNapkinsAndUtensils: false,
                              items: order.orderItems.map((item) => ({
                                id: crypto.randomUUID(),
                                itemId: item.menuItemId,
                                name: item.name,
                                customizations: item.customizations,
                                specialInstructions: item.specialInstructions,
                                includeDietaryRestrictions:
                                  item.includeDietaryRestrictions,
                                quantity: item.quantity,
                                price: item.price,
                                discountId: item.discountId,
                                pointReward: item.pointReward,
                                birthdayReward: item.birthdayReward,
                              })),
                              discountId: null,
                            },
                            validatingAReorder: true,
                          });
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {showCheckmark ? (
                            <motion.svg
                              key={`reorderCheckmark-${order.id}`}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                              className="size-6 text-white"
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
                          ) : isValidatingOrder ? (
                            <motion.div
                              key={`reorderValidationSpinner-${order.id}`}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
                              role="status"
                              aria-label="loading"
                            >
                              <span className="sr-only">Loading...</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key={`reorder-${order.id}`}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              Reorder
                            </motion.div>
                          )}
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
                  {format(new Date(order.createdAt), "PPP")}
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
                        <div className="baseVertFlex size-12 rounded-md border p-1 text-sm">
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
                        disabled={showCheckmark || isValidatingOrder}
                        onClick={() => {
                          addItemsFromOrderToCart({
                            userId,
                            orderDetails: {
                              datetimeToPickUp: new Date(),
                              includeNapkinsAndUtensils: false,
                              items: order.orderItems.map((item) => ({
                                id: crypto.randomUUID(),
                                itemId: item.menuItemId,
                                name: item.name,
                                customizations: item.customizations,
                                specialInstructions: item.specialInstructions,
                                includeDietaryRestrictions:
                                  item.includeDietaryRestrictions,
                                quantity: item.quantity,
                                price: item.price,
                                discountId: item.discountId,
                                pointReward: item.pointReward,
                                birthdayReward: item.birthdayReward,
                              })),
                              discountId: null,
                            },
                            validatingAReorder: true,
                          });
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {showCheckmark ? (
                            <motion.svg
                              key={`reorderCheckmark-${order.id}`}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                              className="size-6 text-white"
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
                          ) : isValidatingOrder ? (
                            <motion.div
                              key={`reorderValidationSpinner-${order.id}`}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
                              role="status"
                              aria-label="loading"
                            >
                              <span className="sr-only">Loading...</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key={`reorder-${order.id}`}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              Reorder
                            </motion.div>
                          )}
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
                render={({ field, fieldState: { invalid } }) => (
                  <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                    <div className="baseVertFlex w-full !items-start gap-2">
                      <FormLabel className="font-semibold">Feedback</FormLabel>
                      <Textarea
                        {...field}
                        placeholder="How was your experience?"
                        maxLength={1000}
                        className="w-full"
                      />
                      <p className="pointer-events-none absolute bottom-2 right-4 text-xs text-gray-400 tablet:bottom-1">
                        {1000 - feedbackForm.getValues("feedback").length}{" "}
                        characters remaining
                      </p>
                    </div>
                    <AnimatePresence>
                      {invalid && (
                        <motion.div
                          key={"feedbackError"}
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
                control={feedbackForm.control}
                name="allowedToBePublic"
                render={({ field }) => (
                  <FormItem className="baseFlex gap-2 space-y-0">
                    <Switch
                      id="allowedToBePublic"
                      checked={feedbackForm.getValues("allowedToBePublic")}
                      onCheckedChange={(value) =>
                        feedbackForm.setValue("allowedToBePublic", value)
                      }
                    />
                    <FormLabel
                      htmlFor="allowedToBePublic"
                      className="font-semibold"
                    >
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
