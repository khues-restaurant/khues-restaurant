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
import { socket } from "~/pages/_app";
import { FaUtensils } from "react-icons/fa6";

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
}

function OrderManagement({ orders }: OrderManagement) {
  const [notStartedOrders, setNotStartedOrders] = useState<OrderWithItems[]>(
    [],
  );
  const [startedOrders, setStartedOrders] = useState<OrderWithItems[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([]);

  const [selectedTab, setSelectedTab] = useState<
    "notStarted" | "started" | "completed"
  >("notStarted");

  // TODO/FYI: if not already stated, do NOT want to ever clear the "notification" numbers
  // on the not started/in progress tabs, since they are strictly the number of current orders
  // in their respective states.

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

  // const { data: orders, refetch: refetchOrders } = api.order.getAll.useQuery();

  return (
    <motion.div
      key={"orderManagement"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-32 h-full w-full tablet:mt-48"
    >
      <div className="baseFlex w-11/12 !justify-between  tablet:w-full tablet:max-w-lg">
        <Button
          variant={"link"}
          onClick={() => setSelectedTab("notStarted")}
          className="relative text-xl"
        >
          Not started
          {/* TODO: notification number */}
        </Button>

        <Button
          variant={"link"}
          onClick={() => setSelectedTab("started")}
          className="relative text-xl"
        >
          Started
          {/* TODO: notification number */}
        </Button>

        <Button
          variant={"link"}
          className="text-xl"
          onClick={() => setSelectedTab("completed")}
        >
          Completed
        </Button>
      </div>

      <AnimatePresence>
        {selectedTab === "notStarted" && (
          <motion.div
            key={"notStarted"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseFlex w-full"
          >
            <AnimatePresence>
              <div className="baseVertFlex mt-8 w-11/12 tablet:w-full tablet:max-w-3xl">
                {notStartedOrders ? (
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
        )}

        {selectedTab === "started" && (
          <motion.div
            key={"started"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseFlex w-full"
          >
            <AnimatePresence>
              <div className="baseVertFlex mt-8 w-11/12 tablet:w-full tablet:max-w-2xl">
                {startedOrders ? (
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
              <div className="baseVertFlex mt-8 w-11/12 tablet:w-full tablet:max-w-2xl">
                {completedOrders ? (
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
      </AnimatePresence>
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

      // notify the customer that their order has been started
      socket.emit("orderStatusUpdate", order.id);
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

      // notify the customer that their order has been started
      socket.emit("orderStatusUpdate", order.id);
    },
  });

  return (
    <motion.div
      key={order.id}
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
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{
        opacity: { duration: 0.1 },
        height: { duration: 0.2 },
        marginTop: { duration: 0.2 },
        marginBottom: { duration: 0.2 },
      }}
      className="baseFlex w-full rounded-md border px-4 py-4 tablet:px-8"
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
          <div className="baseVertFlex relative w-11/12 !justify-between gap-4 tablet:w-full tablet:!flex-row">
            <div className="baseFlex w-full !justify-between gap-4 tablet:w-auto tablet:!justify-center">
              <div className="baseFlex gap-1 text-lg">
                <span>{order.firstName}</span>
                <span>{order.lastName}</span>
              </div>

              {/* (up to) first three images w/ the (+ however many more one) */}
              <div className="baseFlex gap-2">
                <div className="imageFiller size-8 rounded-full" />
                <div className="imageFiller size-8 rounded-full" />
                <div className="imageFiller size-8 rounded-full" />
              </div>
            </div>

            <div className="baseFlex w-full !justify-between gap-4 tablet:w-auto tablet:!justify-center">
              <p className="baseFlex gap-2 text-lg font-semibold">
                <>
                  {view === "completed" && order.orderCompletedAt ? (
                    <>Completed at {formatTime(order.orderCompletedAt)}</>
                  ) : (
                    <>Due at {formatTime(order.datetimeToPickup)}</>
                  )}
                </>
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
                      {view === "notStarted" ? "Start order" : "Complete order"}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader className="text-lg">
                      {view === "notStarted" ? "Start order" : "Complete order"}
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      Are you sure you want to{" "}
                      {view === "notStarted" ? "start" : "complete"}{" "}
                      <span className="font-semibold">
                        {order.firstName} {order.lastName}&apos;s
                      </span>{" "}
                      order?
                    </AlertDialogDescription>

                    <AlertDialogFooter>
                      <Button
                        variant="secondary"
                        disabled={orderIdBeingMutated === order.id}
                        onClick={() => {
                          setOpenDialogId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={orderIdBeingMutated === order.id}
                        className="baseFlex gap-2"
                        onClick={() => {
                          setOrderIdBeingMutated(order.id);
                          if (view === "notStarted") {
                            startOrder({ id: order.id });
                          } else {
                            completeOrder({
                              id: order.id,
                              customerEmail: order.email,
                            });
                          }
                        }}
                      >
                        Confirm
                        {orderIdBeingMutated === order.id && (
                          <motion.div
                            key={`${order.id}Spinner`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-block size-4 animate-spin rounded-full border-[4px] border-current border-t-transparent text-primary"
                            role="status"
                            aria-label="loading"
                          >
                            <span className="sr-only">Loading...</span>
                          </motion.div>
                        )}
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
                setAccordionOpen(accordionOpen === "open" ? "closed" : "open");
              }}
              className={`absolute bottom-2.5 right-[-30px] h-4 w-4 shrink-0 cursor-pointer text-primary transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:rotate-180 tablet:bottom-2 tablet:right-[-25px]`}
            />
          </div>

          <AccordionContent>
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

  return (
    <div className="baseVertFlex mt-4 !items-start gap-2 border-t p-2 pt-4">
      {/* TODO: if chatgpt search reveals this person is influential, put disclaimer right here,
      also obv make the background of the accordion "trigger" goldish */}

      {order.orderItems.map((item) => (
        <div key={item.id} className="baseFlex gap-4">
          <div className="imageFiller size-12 rounded-md" />

          {/* TODO: idk why I couldn't just generically have this be h-full... 
              setting h-12 but don't want this to be hardcoded */}
          <div className="baseVertFlex h-full min-h-12 !items-start !justify-start gap-2">
            <div className="baseFlex gap-2 text-xl font-semibold">
              <p>{item.quantity}</p>
              <p>{item.name}</p>
              {item.includeDietaryRestrictions && (
                <div className="size-2 rounded-full bg-primary/25" />
              )}
            </div>

            <div className="baseVertFlex w-full !items-start gap-2 text-sm">
              {Object.values(item.customizations).map((customization, idx) => (
                <p key={idx}>
                  -{" "}
                  {
                    customizationChoices[customization.customizationChoiceId]
                      ?.customizationCategory.name
                  }
                  :{" "}
                  {
                    customizationChoices[customization.customizationChoiceId]
                      ?.name
                  }
                </p>
              ))}
              {item.specialInstructions && <p>- {item.specialInstructions}</p>}
            </div>
          </div>
        </div>
      ))}

      {order.dietaryRestrictions && (
        <div className="baseVertFlex gap-2">
          <div className="baseFlex gap-2">
            <div className="size-2 rounded-full bg-primary/25" />
            Item needs to follow these dietary restrictions:
          </div>
          <p className="text-sm">{order.dietaryRestrictions}</p>
        </div>
      )}

      {order.includeNapkinsAndUtensils && (
        <div className="baseFlex w-full">
          <div className="baseFlex gap-2 text-sm italic text-gray-400">
            <FaUtensils className="size-4" />
            <p>Napkins and utensils were requested.</p>
          </div>
        </div>
      )}
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
