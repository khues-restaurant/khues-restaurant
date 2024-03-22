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
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import useGetUserId from "~/hooks/useGetUserId";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { api } from "~/utils/api";

function RecentOrders() {
  const userId = useGetUserId();
  const { data: user } = api.user.get.useQuery(userId, {
    enabled: !!userId,
  });

  const { data: orders } = api.order.getUsersOrders.useQuery(userId, {
    enabled: !!userId,
  });

  const [sortedOrders, setSortedOrders] = useState<DBOrderSummary[]>([]);
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (orders) {
      const sortedOrders = orders.sort((a, b) => {
        if (sortDirection === "desc") {
          return b.datetimeToPickup.getTime() - a.datetimeToPickup.getTime();
        } else {
          return a.datetimeToPickup.getTime() - b.datetimeToPickup.getTime();
        }
      });
      setSortedOrders(sortedOrders);
    }
  }, [orders, sortDirection]);

  // TODO: ah prob can't do the nested route level animated logo based on if user
  // api has been fetched, since this needs the orders.. not the end of the world to define it here

  return (
    <motion.div
      key={"profile-my-orders"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative w-full"
    >
      <TabsContent value="my-orders">
        <div className="baseVertFlex relative mt-4 w-full p-0 transition-all tablet:my-8 tablet:p-8">
          {sortedOrders && sortedOrders.length > 0 ? (
            <div className="baseVertFlex gap-2">
              <div className="baseFlex w-full !justify-end font-medium">
                {/* <p>
                  {sortedOrders.length} total{" "}
                  {sortedOrders.length > 1 ? "sortedOrders" : "order"}
                </p> */}

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
              {sortedOrders.map((order) => (
                <OrderAccordion key={order.id} userId={userId} order={order} />
              ))}
            </div>
          ) : (
            <div>
              Probably want an image of like an angled down shot of a table with
              three plates of food on there, and below a message like: "It looks
              like you haven't placed an order yet. ButtonToOrderNowPage[Get
              started] with your first order today!
            </div>
          )}
        </div>
      </TabsContent>
    </motion.div>
  );
}

RecentOrders.PageLayout = TopProfileNavigationLayout;

export default RecentOrders;

interface OrderAccordion {
  userId: string;
  order: DBOrderSummary;
}

function OrderAccordion({ userId, order }: OrderAccordion) {
  const [accordionOpen, setAccordionOpen] = useState<"open" | "closed">(
    "closed",
  );
  const viewportLabel = useGetViewportLabel();

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
                    <div className="imageFiller size-12 rounded-md"></div>
                    {order.orderItems.length > 1 && (
                      <div className="imageFiller size-12 rounded-md"></div>
                    )}

                    {order.orderItems.length > 2 && (
                      <>
                        {order.orderItems.length > 3 ? (
                          <div className="baseVertFlex gap-1 rounded-md bg-gray-200 p-1 text-sm">
                            + {order.orderItems.length - 2}
                            <span>more</span>
                          </div>
                        ) : (
                          <div className="imageFiller size-12 rounded-md"></div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="baseVertFlex gap-2">
                  {order.orderCompletedAt ? (
                    <>
                      <Button
                        onClick={() => {
                          // TODO: add items to cart through updateOrder()
                        }}
                      >
                        Reorder
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
                <div className="baseFlex w-full !justify-start gap-2">
                  {/* preview images */}
                  <div className="baseFlex gap-2">
                    <div className="imageFiller size-16 rounded-md"></div>
                    {order.orderItems.length > 1 && (
                      <div className="imageFiller size-16 rounded-md"></div>
                    )}

                    {order.orderItems.length > 2 && (
                      <>
                        {order.orderItems.length > 3 ? (
                          <div className="baseVertFlex gap-1 rounded-md bg-gray-200 p-1 text-sm">
                            + {order.orderItems.length - 2}
                            <span>more</span>
                          </div>
                        ) : (
                          <div className="imageFiller size-16 rounded-md"></div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="baseVertFlex gap-4 !self-end">
                <div className="baseFlex gap-2 !self-end">
                  {order.orderCompletedAt ? (
                    <>
                      <Button
                        onClick={() => {
                          // TODO: add items to cart through updateOrder()
                        }}
                      >
                        Reorder
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
