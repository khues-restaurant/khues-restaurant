import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { type MenuItem } from "@prisma/client";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { CiCalendarDate, CiLocationOn } from "react-icons/ci";
import { FaTrashAlt } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa6";
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
import { parseTimeToNumber } from "~/utils/parseTimeToNumber";
import { getLineItemPrice } from "~/utils/getLineItemPrice";
import { cn } from "~/utils/shadcnuiUtils";

interface OrderCost {
  subtotal: number;
  tax: number;
  total: number;
}

interface CartDrawer {
  setShowCartDrawer: Dispatch<SetStateAction<boolean>>;
  setItemBeingModified: Dispatch<SetStateAction<MenuItem | null>>;
  setInitialItemState: Dispatch<SetStateAction<Item | undefined>>;
  setGuestCheckoutView: Dispatch<
    SetStateAction<"credentialsForm" | "mainView" | "notShowing">
  >;
}

function CartDrawer({
  setShowCartDrawer,
  //^  prob only used if doing the "Close" underlined button in top right
  // (as a general drawer thing though, so maybe directly on <Drawer>?)
  setItemBeingModified,
  setInitialItemState,
  setGuestCheckoutView,
}: CartDrawer) {
  const { isSignedIn } = useAuth();

  const { orderDetails, menuItems } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    menuItems: state.menuItems,
  }));

  const [numberOfItems, setNumberOfItems] = useState(0);

  const [orderCost, setOrderCost] = useState<OrderCost>({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const { updateOrder } = useUpdateOrder();

  const { data: minPickupTime } = api.minimOrderPickupTime.get.useQuery();

  const mainFormSchema = z.object({
    dateToPickUp: z
      .date({
        required_error: "Pickup date must be specified",
      })
      .refine(
        (date) => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          return date >= now;
        },
        {
          message: "Pickup date must be today or later",
        },
      ),
    timeToPickUp: z
      .string({
        required_error: "Pickup time must be specified",
      })
      .refine(
        (time) => {
          if (minPickupTime === null || minPickupTime === undefined) {
            return false;
          }

          return parseTimeToNumber(time) >= minPickupTime.value;
        },
        {
          message:
            "Available pickup times have changed. Please select a new time.",
        },
      ),
  });

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    values: {
      dateToPickUp: orderDetails.dateToPickUp ?? new Date(),
      timeToPickUp: orderDetails.timeToPickUp ?? "",
    },
  });

  mainForm.watch((value) => {
    const newOrderDetails = structuredClone(orderDetails);

    newOrderDetails.dateToPickUp = value.dateToPickUp ?? new Date();
    newOrderDetails.timeToPickUp = value.timeToPickUp;

    updateOrder({
      newOrderDetails,
    });
  });

  useEffect(() => {
    // add up all the quantities of the items in the order
    let sum = 0;
    orderDetails.items.forEach((item) => {
      sum += item.quantity;
    });
    setNumberOfItems(sum);
  }, [orderDetails.items]);

  useEffect(() => {
    setOrderCost(calculateCosts(orderDetails.items));
  }, [orderDetails.items]);

  async function onMainFormSubmit(values: z.infer<typeof mainFormSchema>) {
    if (isSignedIn) {
      // send to stripe (copy logic from <GuestCheckoutForm />)
    } else {
      setGuestCheckoutView("mainView");
    }
  }

  if (orderDetails.items.length === 0) {
    return (
      <div className="baseVertFlex w-full gap-4 p-4">
        {/* TODO: definitely have some (probably paid for) asset of an empty plate or like
          an empty dish with chopsticks beside it? */}

        <p className="text-lg font-semibold underline underline-offset-2">
          Your order is empty
        </p>
        <p className="text-center">
          Looks like you haven&apos;t added anything to your order yet.
        </p>
        <Button
          variant="default"
          className="font-semibold"
          onClick={() => {
            setShowCartDrawer(false);
          }}
          asChild
        >
          <Link href="/order-now">Start an order</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      key="cartDrawer"
      initial={{ opacity: 0, translateX: "-100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "-100%" }}
      transition={{
        duration: 0.35,
      }}
      className="baseVertFlex relative max-h-[85dvh] w-full !justify-start overflow-y-auto"
    >
      <div className="baseVertFlex w-full !items-start border-b-2 p-4">
        <div className="baseFlex gap-2">
          <LiaShoppingBagSolid className="h-6 w-6" />
          <p className="text-lg">Your order</p>
        </div>
        <p className="baseFlex gap-2 text-sm">
          <AnimatedNumbers value={numberOfItems} fontSize={15} padding={0} />

          {`item${numberOfItems > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* location + date & time picker  (TODO: why doesn't horizontal margin work here with w-full..) */}
      <div className="baseFlex my-4 w-[95%] flex-wrap !justify-start gap-2 rounded-md border-b bg-gray-200 p-4">
        <span>Your order will be available for pickup at</span>
        <div className="baseFlex gap-2">
          <div className="baseFlex gap-2">
            <CiLocationOn className="size-6" />
            <Button variant={"link"} asChild>
              <Link href="/googleMapsLink" className="!p-0">
                2100 Snelling Ave Roseville, MN 55113
              </Link>
            </Button>
          </div>
        </div>

        <Form {...mainForm}>
          <form className="baseVertFlex !items-start gap-2">
            <FormField
              control={mainForm.control}
              name="dateToPickUp"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-2">
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
              control={mainForm.control}
              name="timeToPickUp"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                  <div className="baseFlex gap-2">
                    <FormLabel className="font-semibold">Pickup time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-max gap-2 pl-4 pr-2">
                          <FaRegClock />
                          <SelectValue
                            placeholder="Select a time"
                            className="placeholder:!text-muted-foreground"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent side="bottom" className="h-[250px]">
                        <AvailablePickupTimes
                          selectedDate={mainForm.getValues().dateToPickUp}
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
                        // className="absolute -bottom-6 left-0 right-0"
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
      <div className="baseVertFlex w-full !items-start gap-2 border-b p-4 pb-36">
        <p className="text-lg font-semibold underline underline-offset-2">
          Items
        </p>

        <div className="baseVertFlex w-full">
          <AnimatePresence>
            {orderDetails.items.map((item, idx) => (
              <motion.div
                key={item.id}
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
                className="baseFlex w-full !items-start gap-4"
              >
                {/* preview image of item */}
                <div className="imageFiller size-16 rounded-md" />

                <div className="baseFlex w-full !items-start !justify-between">
                  <div className="baseVertFlex !items-start">
                    {/* item name, dietary restrictions, and edit button */}
                    <div className="baseFlex !items-start gap-2">
                      <p className="text-lg">{item.name}</p>

                      {item.includeDietaryRestrictions && (
                        <div className="size-2 rounded-full bg-primary/25" />
                      )}
                    </div>

                    {/* quantity adjustment */}
                    <div className="baseFlex h-8">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-r-none border-2 border-r-0 border-gray-500 p-0"
                        onClick={() => {
                          const newOrderDetails = structuredClone(orderDetails);

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
                      <div className="baseFlex h-full w-8 border-y-2 border-gray-500 bg-white font-semibold">
                        {item.quantity}
                      </div>
                      <Button
                        variant="outline"
                        disabled={item.quantity > 99}
                        className="size-8 rounded-l-none border-2 border-l-0 border-gray-500 p-0"
                        onClick={() => {
                          if (item.quantity > 99) return;
                          const newOrderDetails = structuredClone(orderDetails);

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

                    <div className="baseVertFlex mt-2 w-full !items-start gap-2 text-sm">
                      {/* TODO: customizations and custom instructions */}
                      {item.customizations.map((customization, idx) => (
                        <p key={idx}>
                          - {customization.name}: {customization.value}
                        </p>
                      ))}
                      {item.specialInstructions && (
                        <p>- {item.specialInstructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="baseVertFlex !items-end">
                    <AnimatedPrice
                      price={formatPrice(
                        getLineItemPrice(item.price, item.quantity),
                      )}
                    />
                    <Button
                      variant={"underline"}
                      size={"underline"}
                      onClick={() => {
                        setItemBeingModified(menuItems[item.name]!);
                        setInitialItemState(item);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* dietary restrictions legend */}
        {/* is only rendered if there is an item with "includeDietaryRestrictions" */}
        {orderDetails.items.some((item) => item.includeDietaryRestrictions) && (
          <div className="baseFlex gap-2">
            <div className="size-2 rounded-full bg-primary/25" />
            <p className="text-sm">
              Item will be prepared according to your dietary restrictions
            </p>
          </div>
        )}

        {/* TODO rewards section */}
      </div>

      {/* TODO: why does this scroll a bit along with body when drawer is scrolled? */}
      <DrawerFooter>
        <div className="baseVertFlex w-full border-t bg-gray-200 p-4 shadow-inner">
          <div className="baseFlex w-full !justify-between text-sm">
            <p>Subtotal</p>
            <AnimatedPrice price={formatPrice(orderCost.subtotal)} />
          </div>

          <div className="baseFlex w-full !justify-between text-sm">
            <p>Tax</p>
            <AnimatedPrice price={formatPrice(orderCost.tax)} />
          </div>

          <div className="baseFlex mt-2 w-full !items-end !justify-between">
            <div className="baseFlex gap-2 text-lg font-semibold">
              <p>Total</p>
              <AnimatedPrice price={formatPrice(orderCost.total)} />
            </div>

            {isSignedIn ? (
              <Button
                variant="default"
                className="text-xs font-semibold tablet:text-sm"
                asChild
                onClick={() => void mainForm.handleSubmit(onMainFormSubmit)()}
              >
                <a href="/stripeCheckout">Proceed to checkout</a>
              </Button>
            ) : (
              <Button
                variant="default"
                className="text-xs font-semibold tablet:text-sm"
                onClick={() => void mainForm.handleSubmit(onMainFormSubmit)()}
              >
                Proceed to checkout
              </Button>
            )}
          </div>
        </div>
      </DrawerFooter>
    </motion.div>
  );
}

export default CartDrawer;

function calculateCosts(items: Item[]) {
  let subtotal = 0;
  let tax = 0;
  let total = 0;

  // TODO: is this safe floating point wise?
  items.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  tax = subtotal * 0.07;

  total = subtotal + tax;

  return { subtotal, tax, total };
}
