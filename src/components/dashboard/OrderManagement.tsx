import {
  type Order,
  type OrderItem,
  type OrderItemCustomization,
} from "@prisma/client";
import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { FaRedo } from "react-icons/fa";
import { FaUtensils } from "react-icons/fa6";
import { type Socket } from "socket.io-client";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import {
  CHICAGO_TIME_ZONE,
  getMidnightCSTInUTC,
} from "~/utils/dateHelpers/cstToUTCHelpers";
import { getFirstSixNumbers } from "~/utils/formatters/getFirstSixNumbers";

type OrderItemTest = OrderItem & {
  customizations: OrderItemCustomization[];
};

type OrderWithItems = Order & {
  orderItems: OrderItemTest[];
};

interface OrderManagement {
  orders: OrderWithItems[];
  socket: Socket;
}

function OrderManagement({ orders, socket }: OrderManagement) {
  const { refetch: refetchOrders } = api.order.getDashboardOrders.useQuery();

  const [notStartedOrders, setNotStartedOrders] = useState<OrderWithItems[]>(
    [],
  );
  const [startedOrders, setStartedOrders] = useState<OrderWithItems[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([]);
  const [futureOrders, setFutureOrders] = useState<OrderWithItems[]>([]);

  const [selectedTab, setSelectedTab] = useState<
    "notStarted" | "started" | "completed" | "future"
  >("notStarted");

  const [manuallyRefreshingOrders, setManuallyRefreshingOrders] =
    useState(false);

  // FYI: if not already stated, do NOT want to ever clear the "notification" numbers
  // on the not started/in progress tabs, since they are strictly the number of current orders
  // in their respective states.

  useEffect(() => {
    socket.on("newOrderWasPlaced", () => {
      console.log("refetching new order");
      void refetchOrders().then((e) => {
        e.isSuccess;
      });
    });

    return () => {
      socket.off("newOrderWasPlaced");
    };
  }, [socket, refetchOrders]);

  useEffect(() => {
    const notStarted = [];
    const started = [];
    const completed = [];
    const future = [];

    const futureDate = addDays(getMidnightCSTInUTC(new Date()), 1);

    // split up the orders into categories
    for (const order of orders) {
      if (order.datetimeToPickup >= futureDate) {
        future.push(order);
      } else if (order.orderStartedAt === null) {
        notStarted.push(order);
      } else if (order.orderCompletedAt === null) {
        started.push(order);
      } else if (order.orderCompletedAt !== null) {
        completed.push(order);
      }
    }

    // sort by ascending datetimeToPickup
    notStarted.sort((a, b) => {
      return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
    });
    started.sort((a, b) => {
      return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
    });
    completed.sort((a, b) => {
      return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
    });
    future.sort((a, b) => {
      return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
    });

    setNotStartedOrders(notStarted);
    setStartedOrders(started);
    setCompletedOrders(completed);
    setFutureOrders(future);
  }, [orders]);

  const { toast } = useToast();

  return (
    <motion.div
      key={"orderManagement"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex size-full"
    >
      <div className="baseFlex mt-4 !justify-end gap-2 rounded-lg border bg-offwhite p-1 md:mt-2">
        <Button
          variant={
            selectedTab === "notStarted" || selectedTab === "started"
              ? "default"
              : "ghost"
          }
          className={`${selectedTab !== "notStarted" && selectedTab !== "started" ? "text-primary" : ""}`}
          onClick={() => setSelectedTab("notStarted")}
        >
          In progress
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={selectedTab === "completed" ? "default" : "ghost"}
          className={`${selectedTab !== "completed" ? "text-primary" : ""}`}
          onClick={() => setSelectedTab("completed")}
        >
          Completed
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={selectedTab === "future" ? "default" : "ghost"}
          className={`${selectedTab !== "future" ? "text-primary" : ""}`}
          onClick={() => setSelectedTab("future")}
        >
          Future
        </Button>

        <Button
          variant="outline"
          disabled={manuallyRefreshingOrders}
          className="baseFlex absolute right-4 !hidden gap-2 md:!flex"
          onClick={() => {
            setManuallyRefreshingOrders(true);

            void refetchOrders().then((e) => {
              if (e.isSuccess) {
                toast({
                  description: "Orders have been refreshed.",
                });

                setManuallyRefreshingOrders(false);
              }
            });
          }}
        >
          <FaRedo className="size-4" />
          Refresh orders
        </Button>
      </div>

      <Button
        variant="outline"
        disabled={manuallyRefreshingOrders}
        className="baseFlex mb-2 mt-4 gap-2 md:!hidden"
        onClick={() => {
          setManuallyRefreshingOrders(true);

          void refetchOrders().then((e) => {
            if (e.isSuccess) {
              toast({
                description: "Orders have been refreshed.",
              });

              setManuallyRefreshingOrders(false);
            }
          });
        }}
      >
        <FaRedo className="size-4" />
        Refresh orders
      </Button>

      {(selectedTab === "notStarted" || selectedTab === "started") && (
        <div className="baseFlex mt-6 w-full !justify-around border-b-2 border-stone-300 pb-2 pr-8 sm:px-0">
          <div className="relative">
            <p className="hidden text-xl font-semibold text-primary sm:flex">
              Not started
            </p>

            <Button
              variant={selectedTab === "notStarted" ? "activeLink" : "link"}
              onClick={() => setSelectedTab("notStarted")}
              className="!px-0 text-lg font-semibold text-primary sm:!hidden"
            >
              Not started
            </Button>

            {/* notification count */}
            {notStartedOrders.length > 0 && (
              <div
                className={`absolute -top-3 rounded-full bg-primary px-2 py-0.5 text-offwhite
                ${notStartedOrders.length < 10 ? "-right-7" : "-right-9"}
              `}
              >
                <AnimatedNumbers
                  value={notStartedOrders.length}
                  fontSize={14}
                  padding={6}
                />
              </div>
            )}
          </div>

          <Separator
            orientation="vertical"
            className="h-8 w-[2px] bg-stone-300 sm:hidden"
          />

          <div className="relative">
            <p className="hidden text-xl font-semibold text-primary sm:flex">
              Started
            </p>

            <Button
              variant={selectedTab === "started" ? "activeLink" : "link"}
              onClick={() => setSelectedTab("started")}
              className="!px-0 text-lg font-semibold text-primary sm:!hidden"
            >
              Started
            </Button>

            {/* notification count */}
            {startedOrders.length > 0 && (
              <div
                className={`absolute -top-3 rounded-full bg-primary px-2 py-0.5 text-offwhite
                ${startedOrders.length < 10 ? "-right-7" : "-right-9"}
              `}
              >
                <AnimatedNumbers
                  value={startedOrders.length}
                  fontSize={14}
                  padding={6}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="baseFlex w-full">
        {(selectedTab === "notStarted" || selectedTab === "started") && (
          <div className="baseFlex h-full w-full !items-start">
            <motion.div
              key={"notStarted"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`baseVertFlex mt-8 min-h-[70dvh] w-full !justify-start ${selectedTab === "started" ? "!hidden sm:!flex" : ""}`}
            >
              <AnimatePresence>
                <div className="baseVertFlex w-full !justify-start gap-2 overflow-y-auto px-4 pb-4 sm:max-h-[70dvh]">
                  {notStartedOrders.length > 0 ? (
                    <>
                      {notStartedOrders.map((order) => (
                        <CustomerOrder
                          key={order.id}
                          order={order}
                          view={"notStarted"}
                        />
                      ))}
                    </>
                  ) : (
                    <div>No orders found</div>
                  )}
                </div>
              </AnimatePresence>
            </motion.div>

            <Separator
              orientation="vertical"
              className="hidden h-[73dvh] w-[2px] bg-stone-300 sm:block"
            />

            <motion.div
              key={"started"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`baseVertFlex mt-8 min-h-[70dvh] w-full !justify-start ${selectedTab === "notStarted" ? "!hidden sm:!flex" : ""}`}
            >
              <AnimatePresence>
                <div className="baseVertFlex w-full !justify-start gap-2 overflow-y-auto px-4 pb-4 sm:max-h-[70dvh]">
                  {startedOrders.length > 0 ? (
                    <>
                      {startedOrders.map((order) => (
                        <CustomerOrder
                          key={order.id}
                          order={order}
                          view={"started"}
                        />
                      ))}
                    </>
                  ) : (
                    <div>No orders found</div>
                  )}
                </div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {selectedTab === "completed" && (
          <motion.div
            key={"completed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex min-h-[80.25dvh] w-full !justify-start"
          >
            <AnimatePresence>
              <div className="baseVertFlex mt-8 w-11/12 !justify-start gap-2 overflow-y-auto pb-4 sm:max-h-[70dvh] tablet:w-full tablet:max-w-xl">
                {completedOrders.length > 0 ? (
                  <>
                    {completedOrders.map((order) => (
                      <CustomerOrder
                        key={order.id}
                        order={order}
                        view={"completed"}
                      />
                    ))}
                  </>
                ) : (
                  <div className="mt-8">No orders found</div>
                )}
              </div>
            </AnimatePresence>
          </motion.div>
        )}

        {selectedTab === "future" && (
          <motion.div
            key={"future"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex min-h-[80.25dvh] w-full !justify-start"
          >
            <AnimatePresence>
              <div className="baseVertFlex mt-8 w-11/12 !justify-start gap-2 overflow-y-auto pb-4 sm:max-h-[70dvh] tablet:w-full tablet:max-w-xl">
                {futureOrders.length > 0 ? (
                  <>
                    {futureOrders.map((order) => (
                      <CustomerOrder
                        key={order.id}
                        order={order}
                        view={"future"}
                      />
                    ))}
                  </>
                ) : (
                  <div className="mt-8">No orders found</div>
                )}
              </div>
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default OrderManagement;

interface CustomerOrder {
  order: OrderWithItems;
  view: "notStarted" | "started" | "completed" | "future";
}

function CustomerOrder({ order, view }: CustomerOrder) {
  const ctx = api.useUtils();

  const [accordionOpen, setAccordionOpen] = useState<"open" | "closed">(
    "closed",
  );
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [orderIdBeingMutated, setOrderIdBeingMutated] = useState<string | null>(
    null,
  );
  const [, setDialogJustClosed] = useState(false);

  const { mutate: startOrder } = api.order.startOrder.useMutation({
    onError: (error) => {
      console.error(error);
      // toast this error
    },
    onSettled: async () => {
      await ctx.order.getDashboardOrders.invalidate();

      setAccordionOpen("closed");
      setOpenDialogId(null);
      setOrderIdBeingMutated(null);

      toast({
        description: `${order.firstName} ${order.lastName}'s order has been started.`,
      });
    },
  });
  const { mutate: completeOrder } = api.order.completeOrder.useMutation({
    onError: (error) => {
      console.error(error);
      // toast this error
    },
    onSettled: async () => {
      await ctx.order.getDashboardOrders.invalidate();

      setAccordionOpen("closed");
      setOpenDialogId(null);
      setOrderIdBeingMutated(null);

      toast({
        description: `${order.firstName} ${order.lastName}'s order has been completed.`,
      });
    },
  });

  const { toast } = useToast();

  const pickupTimeChicago = toZonedTime(
    order.datetimeToPickup,
    CHICAGO_TIME_ZONE,
  );
  const orderCompletedAtChicago = order.orderCompletedAt
    ? toZonedTime(order.orderCompletedAt, CHICAGO_TIME_ZONE)
    : null;
  const orderRefundedAtChicago = order.orderRefundedAt
    ? toZonedTime(order.orderRefundedAt, CHICAGO_TIME_ZONE)
    : null;

  function sumUpNumberOfItemsInOrder(order: OrderWithItems) {
    return order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  return (
    <motion.div
      key={order.id}
      className={`baseFlex w-full max-w-lg cursor-pointer rounded-md border bg-offwhite p-4
      ${order.notableUserDescription ? "border-yellow-500 bg-gradient-to-br from-amber-200 to-amber-400" : ""}
      `}
      onClick={() => {
        setAccordionOpen(accordionOpen === "open" ? "closed" : "open");
      }}
    >
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={accordionOpen}
        onValueChange={(value) => {
          setAccordionOpen(value === "open" ? value : "closed");
        }}
      >
        <AccordionItem
          value="open"
          className="w-full border-none"
          data-state={accordionOpen}
        >
          <div className="baseVertFlex relative w-full !justify-between gap-4">
            <div
              className={`baseFlex w-full !justify-between gap-4
            ${order.notableUserDescription ? "text-primary" : ""}
            `}
            >
              <div className="baseFlex gap-1 !self-start text-lg font-medium">
                <span>{order.firstName}</span>
                <span>{order.lastName}</span>
              </div>

              <p className="baseFlex gap-2 text-right text-lg font-medium">
                <>
                  {(view === "notStarted" || view === "started") && (
                    <>
                      Due at{" "}
                      {format(pickupTimeChicago, "h:mm a")}
                    </>
                  )}

                  {view === "completed" && orderCompletedAtChicago && (
                    <>
                      Completed at{" "}
                      {format(orderCompletedAtChicago, "h:mm a")}
                    </>
                  )}

                  {view === "future" && (
                    <>
                      Due on {format(pickupTimeChicago, "EEEE, MMM d ")} at{" "}
                      {format(pickupTimeChicago, "h:mm a")}
                    </>
                  )}
                </>
              </p>
            </div>

            <div
              className={`baseFlex w-full
            ${order.notableUserDescription ? "text-primary" : ""}
            `}
            >
              <div className="baseFlex w-full !justify-between gap-4">
                <p className="font-medium">
                  {sumUpNumberOfItemsInOrder(order) > 1
                    ? `${sumUpNumberOfItemsInOrder(order)} items`
                    : "1 item"}
                </p>

                {(view === "notStarted" || view === "started") && (
                  <AlertDialog
                    open={openDialogId === order.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDialogJustClosed(true);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        className="text-base"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDialogId(order.id);
                        }}
                      >
                        {view === "notStarted"
                          ? "Start order"
                          : "Complete order"}
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader className="text-lg font-semibold">
                        {view === "notStarted"
                          ? "Start order"
                          : "Complete order"}
                      </AlertDialogHeader>
                      <AlertDialogDescription>
                        Are you sure you want to{" "}
                        {view === "notStarted" ? "start" : "complete"}{" "}
                        <span className="font-semibold">
                          {order.firstName} {order.lastName}&apos;s
                        </span>{" "}
                        order?
                      </AlertDialogDescription>

                      <AlertDialogFooter className="baseFlex mt-8 w-full !flex-row gap-8">
                        <Button
                          variant="secondary"
                          disabled={orderIdBeingMutated === order.id}
                          className="w-full"
                          onClick={() => {
                            setOpenDialogId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={orderIdBeingMutated === order.id}
                          className="baseFlex w-full gap-2"
                          onClick={() => {
                            setOrderIdBeingMutated(order.id);
                            if (view === "notStarted") {
                              startOrder({ id: order.id });
                            } else {
                              completeOrder({
                                id: order.id,
                                userId: order.userId,
                                customerEmail: order.email,
                              });
                            }
                          }}
                        >
                          Confirm
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {orderRefundedAtChicago && (
                  <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Refunded{" "}
                    {format(orderRefundedAtChicago, "PPP")}
                  </span>
                )}
              </div>

              <ChevronDown
                data-state={accordionOpen}
                className={`ml-4 h-4 w-4 shrink-0 cursor-pointer text-primary transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=open]:rotate-180`}
              />
            </div>
          </div>

          <AccordionContent className="cursor-default pb-0">
            <OrderItems order={order} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

interface OrderItems {
  order: OrderWithItems;
}

function OrderItems({ order }: OrderItems) {
  const { customizationChoices } = useMainStore((state) => ({
    customizationChoices: state.customizationChoices,
  }));

  const [orderBeingReprinted, setOrderBeingReprinted] = useState(false);

  const { mutate: reprintOrder } = api.orderPrintQueue.create.useMutation({
    onError: (error) => {
      console.error(error);
      // toast this error
    },
    onSettled: async () => {
      setOrderBeingReprinted(false);

      toast({
        description: `${order.firstName} ${order.lastName}'s order has been queued to reprint.`,
      });
    },
  });

  const { toast } = useToast();

  return (
    <div
      className={`baseVertFlex mt-4 gap-2 border-t p-2 pb-0 pt-4
      ${order.notableUserDescription ? "rounded-md pb-4" : "rounded-b-md"}
    `}
    >
      {/* TODO: if chatgpt search reveals this person is influential, put disclaimer right here,
      also obv make the background of the accordion "trigger" goldish */}

      {order.notableUserDescription && (
        <div className="baseVertFlex w-full gap-2 pb-2">
          <p className="text-lg font-semibold">Notable user description:</p>
          <p>{order.notableUserDescription}</p>
        </div>
      )}

      <div className="baseVertFlex !items-start">
        {order.orderItems.map((item) => (
          <div
            key={item.id}
            className="baseVertFlex h-full !items-start !justify-start gap-2"
          >
            <div className="baseFlex !justify-start gap-2 text-xl font-medium">
              <p>{item.quantity}x</p>
              <p>{item.name}</p>
              {item.includeDietaryRestrictions && (
                <div className="size-2 shrink-0 rounded-full bg-primary/75" />
              )}
            </div>

            {(item.customizations.length > 0 || item.specialInstructions) && (
              <div className="baseVertFlex ml-4 w-full !items-start gap-2 text-sm">
                {Object.values(item.customizations).map(
                  (customization, idx) => (
                    <p key={idx}>
                      -{" "}
                      {
                        customizationChoices[
                          customization.customizationChoiceId
                        ]?.customizationCategory.name
                      }
                      :{" "}
                      {
                        customizationChoices[
                          customization.customizationChoiceId
                        ]?.name
                      }
                    </p>
                  ),
                )}

                {item.specialInstructions && (
                  <p>- &ldquo; {item.specialInstructions}&rdquo;</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {order.orderItems.some((item) => item.includeDietaryRestrictions) && (
        <div className="baseVertFlex my-4 w-full gap-2">
          <div className="baseFlex gap-2 font-medium underline underline-offset-2">
            <div className="size-2 shrink-0 rounded-full bg-primary/75" />
            Contains dietary restrictions:
          </div>
          <p className="text-sm font-semibold">
            &ldquo; {order.dietaryRestrictions} &rdquo;
          </p>
        </div>
      )}

      {order.includeNapkinsAndUtensils && (
        <div className="baseFlex mt-2 w-full">
          <div className="baseFlex gap-2 text-sm italic text-stone-500">
            <FaUtensils className="size-4" />
            <p>Napkins and utensils were requested.</p>
          </div>
        </div>
      )}

      <Separator className="mt-2 h-[1px] w-full" />

      <div className="baseFlex w-full flex-wrap !justify-between gap-4">
        <p>Order #{getFirstSixNumbers(order.id)}</p>

        {order.phoneNumber && (
          <a
            href={`tel:${order.phoneNumber}`}
            className="text-sm font-semibold text-primary"
          >
            {formatPhoneNumber(order.phoneNumber)}
          </a>
        )}

        <Button
          variant={"secondary"}
          disabled={orderBeingReprinted}
          size={"sm"}
          className="!self-center text-sm"
          onClick={() => {
            setOrderBeingReprinted(true);
            reprintOrder({ orderId: order.id });
          }}
        >
          Reprint ticket
        </Button>
      </div>
    </div>
  );
}

function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-numeric characters (except for the leading "+")
  const cleaned = phoneNumber.replace(/[^0-9]/g, "");

  // Handle optional country code (e.g., +1)
  let normalizedNumber = cleaned;

  // If the number starts with a "1" and is 11 digits long, strip the leading "1"
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    normalizedNumber = cleaned.slice(1);
  } else if (cleaned.length > 10 && cleaned.startsWith("1")) {
    // Handle the case where the number might have an international prefix (e.g., +1)
    normalizedNumber = cleaned.slice(1);
  }

  // Check if the normalized number is of the correct length (10 digits)
  if (normalizedNumber.length !== 10) {
    throw new Error(
      "Invalid phone number length. It should be 10 digits after country code normalization.",
    );
  }

  // Extract the area code, the first three digits, and the last four digits
  const areaCode = normalizedNumber.slice(0, 3);
  const firstPart = normalizedNumber.slice(3, 6);
  const secondPart = normalizedNumber.slice(6, 10);

  // Format the phone number
  const formattedPhoneNumber = `(${areaCode}) ${firstPart}-${secondPart}`;

  return formattedPhoneNumber;
}
