import {
  OrderItemCustomization,
  type Order,
  Discount,
  MenuItem,
  OrderItem,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/utils/api";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useMainStore, type OrderDetails } from "~/stores/MainStore";
import { ChevronDown } from "lucide-react";
import { DashboardOrder } from "~/server/api/routers/order";
import { FaUtensils } from "react-icons/fa6";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import { Separator } from "~/components/ui/separator";
import { format } from "date-fns";
import { useToast } from "~/components/ui/use-toast";
import { type Socket } from "socket.io-client";

// type FullOrderItems = OrderItem & {
//   customizations: OrderItemCustomization[];
//   discount: Discount;
//   // menuItem: MenuItem;
//   // order: Order;
// };

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
  const { refetch: refetchOrders } = api.order.getTodaysOrders.useQuery();

  const [notStartedOrders, setNotStartedOrders] = useState<OrderWithItems[]>(
    [],
  );
  const [startedOrders, setStartedOrders] = useState<OrderWithItems[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([]);

  const [selectedTab, setSelectedTab] = useState<
    "notStarted" | "started" | "completed" | "future"
  >("notStarted");

  // TODO/FYI: if not already stated, do NOT want to ever clear the "notification" numbers
  // on the not started/in progress tabs, since they are strictly the number of current orders
  // in their respective states.

  useEffect(() => {
    socket.on("newOrderWasPlaced", () => {
      console.log("refetching new order");
      void refetchOrders();
    });

    return () => {
      socket.off("newOrderWasPlaced");
    };
  }, [socket, refetchOrders]);

  useEffect(() => {
    const notStarted = [];
    const started = [];
    const completed = [];

    // split up the orders into the three categories
    for (const order of orders) {
      if (order.orderStartedAt === null) {
        notStarted.push(order);
      } else if (order.orderCompletedAt === null) {
        started.push(order);
      } else {
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

    setNotStartedOrders(notStarted);
    setStartedOrders(started);
    setCompletedOrders(completed);
  }, [orders]);

  return (
    <motion.div
      key={"orderManagement"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-32 size-full tablet:mt-28"
    >
      <div className="baseFlex !justify-end rounded-lg border p-1">
        <Button
          variant={
            selectedTab === "notStarted" || selectedTab === "started"
              ? "default"
              : "text"
          }
          className={`${selectedTab !== "notStarted" && selectedTab !== "started" ? "text-primary" : ""}`}
          onClick={() => setSelectedTab("notStarted")}
        >
          In progress
        </Button>

        <Button
          variant={selectedTab === "completed" ? "default" : "text"}
          className={`${selectedTab !== "completed" ? "text-primary" : ""}`}
          onClick={() => setSelectedTab("completed")}
        >
          Completed
        </Button>

        <Button
          variant={selectedTab === "future" ? "default" : "text"}
          className={`${selectedTab !== "future" ? "text-primary" : ""}`}
          onClick={() => setSelectedTab("future")}
        >
          Future
        </Button>
      </div>

      {(selectedTab === "notStarted" || selectedTab === "started") && (
        <div className="baseFlex my-6 w-full !justify-around border-b-2 border-stone-300">
          <div className="relative">
            <p
              onClick={() => setSelectedTab("notStarted")}
              className="text-xl font-semibold text-primary"
            >
              Not started
            </p>

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

          <div className="relative">
            <p
              onClick={() => setSelectedTab("started")}
              className="text-xl font-semibold text-primary"
            >
              Started
            </p>

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
        {selectedTab !== "completed" && selectedTab !== "future" && (
          <div className="baseFlex w-full !items-start">
            <motion.div
              key={"notStarted"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseFlex w-full"
            >
              <AnimatePresence>
                <div className="baseVertFlex max-h-[70dvh] w-full !justify-start gap-2 overflow-y-auto px-4 pb-4">
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

            <Separator orientation="vertical" className="h-[70dvh] " />

            <motion.div
              key={"started"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseFlex w-full"
            >
              <AnimatePresence>
                <div className="baseVertFlex max-h-[70dvh] w-full !justify-start gap-2 overflow-y-auto px-4 pb-4">
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
            className="baseFlex w-full"
          >
            <AnimatePresence>
              <div className="baseVertFlex mt-8 max-h-[70dvh] w-11/12 !justify-start gap-2 overflow-y-auto pb-4 tablet:w-full tablet:max-w-xl">
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
                  <div>No orders found</div>
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
  view: "notStarted" | "started" | "completed";
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

  const { mutate: startOrder } = api.order.startOrder.useMutation({
    onError: (error) => {
      console.error(error);
      // toast this error
    },
    onSettled: async () => {
      await ctx.order.getTodaysOrders.invalidate();

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
      await ctx.order.getTodaysOrders.invalidate();

      setAccordionOpen("closed");
      setOpenDialogId(null);
      setOrderIdBeingMutated(null);

      toast({
        description: `${order.firstName} ${order.lastName}'s order has been completed.`,
      });
    },
  });

  const { toast } = useToast();

  function sumUpNumberOfItemsInOrder(order: OrderWithItems) {
    return order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  return (
    <motion.div
      key={order.id}
      // initial={{
      //   opacity: 0,
      //   height: 0,
      //   marginTop: 0,
      //   marginBottom: 0,
      // }}
      // animate={{
      //   opacity: 1,
      //   height: "auto",
      //   marginTop: "0.25rem",
      //   marginBottom: "0.25rem",
      // }}
      // exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      // transition={{
      //   opacity: { duration: 0.1 },
      //   height: { duration: 0.2 },
      //   marginTop: { duration: 0.2 },
      //   marginBottom: { duration: 0.2 },
      // }}
      className={`baseFlex w-full max-w-lg rounded-md border p-4
      ${order.notableUserDescription ? "border-yellow-500 bg-gradient-to-br from-amber-200 to-amber-400" : ""}
      `}
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
              <div className="baseFlex gap-1 text-lg font-semibold">
                <span>{order.firstName}</span>
                <span>{order.lastName}</span>
              </div>

              {/* (up to) first three images w/ the (+ however many more one) */}
              {/* <div className="baseFlex gap-2">
                <div className="imageFiller size-8 rounded-full" />
                <div className="imageFiller size-8 rounded-full" />
                <div className="imageFiller size-8 rounded-full" />
              </div> */}

              <p className="baseFlex gap-2 text-lg font-semibold">
                <>
                  {view === "completed" && order.orderCompletedAt ? (
                    <>Completed at {format(order.orderCompletedAt, "h:mm a")}</>
                  ) : (
                    <>Due at {format(order.datetimeToPickup, "h:mm a")}</>
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

                {view !== "completed" && (
                  <AlertDialog open={openDialogId === order.id}>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="text-base"
                        onClick={() => {
                          setOpenDialogId(order.id);
                        }}
                      >
                        {view === "notStarted"
                          ? "Start order"
                          : "Complete order"}
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader className="text-lg">
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

                      <AlertDialogFooter className="mt-4 gap-4">
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
              </div>

              {/* FYI: I am aware that this is a roundabout way of handling accessibility, but it's the
                best method I can find for allowing arbitrary content (buttons) within the "Trigger"
                of the accordion */}
              <ChevronDown
                tabIndex={0}
                data-state={accordionOpen}
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
                className={`ml-4 h-4 w-4 shrink-0 cursor-pointer text-primary transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:rotate-180`}
              />
            </div>
          </div>

          <AccordionContent className="pb-0">
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
  const { orderDetails, menuItems, customizationChoices, discounts } =
    useMainStore((state) => ({
      orderDetails: state.orderDetails,
      menuItems: state.menuItems,
      customizationChoices: state.customizationChoices,
      discounts: state.discounts,
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
      className={`baseVertFlex mt-4 !items-start gap-2 border-t p-2 pb-0 pt-4
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

      {order.orderItems.map((item) => (
        <div key={item.id} className="baseFlex">
          {/* TODO: idk why I couldn't just generically have this be h-full... 
              setting h-12 but don't want this to be hardcoded */}
          <div className="baseVertFlex h-full !items-start !justify-start gap-2">
            <div className="baseFlex gap-2 text-xl font-semibold">
              <p>{item.quantity}</p>
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
                  <p>- {item.specialInstructions}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {order.orderItems.some((item) => item.includeDietaryRestrictions) && (
        <div className="baseVertFlex mt-2 w-full gap-2">
          <div className="baseFlex gap-2">
            <div className="size-2 shrink-0 rounded-full bg-primary/75" />
            Item needs to follow these dietary restrictions:
          </div>
          <p className="text-sm font-semibold">
            &ldquo; {order.dietaryRestrictions} &rdquo;
          </p>
        </div>
      )}

      {order.includeNapkinsAndUtensils && (
        <div className="baseFlex w-full">
          <div className="baseFlex gap-2 text-sm italic text-stone-400">
            <FaUtensils className="size-4" />
            <p>Napkins and utensils were requested.</p>
          </div>
        </div>
      )}

      <Button
        variant={"secondary"}
        disabled={orderBeingReprinted}
        size={"sm"}
        className="mt-4 !self-center text-sm"
        onClick={() => {
          setOrderBeingReprinted(true);
          reprintOrder({ orderId: order.id });
        }}
      >
        Reprint
      </Button>
    </div>
  );
}

function formatTime(datetime: Date) {
  let hours = datetime.getHours();
  const minutes = datetime.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours %= 12; // Convert to 12-hour format
  hours = hours || 12; // Adjust midnight or noon
  const strHours = hours < 10 ? `${hours}` : `${hours}`; // Omit leading 0 if < 10
  const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${strHours}:${strMinutes} ${ampm}`;
}
