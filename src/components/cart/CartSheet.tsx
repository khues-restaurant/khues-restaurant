import { type MenuItem } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { SheetFooter } from "~/components/ui/sheet";
import { FaTrashAlt } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useMainStore, type Item } from "~/stores/MainStore";
import { CiCalendarDate } from "react-icons/ci";
import { cn } from "~/utils/shadcnuiUtils";
import { LiaShoppingBagSolid } from "react-icons/lia";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import AnimatedPrice from "~/components/AnimatedPrice";
import { safeMultiplyPriceAndQuantity } from "~/utils/safeMultiplyPriceAndQuantity";
import { LuMinus, LuPlus } from "react-icons/lu";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { formatPrice } from "~/utils/formatPrice";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

interface OrderCost {
  subtotal: number;
  tax: number;
  total: number;
}

interface CartSheet {
  setShowCartSheet: Dispatch<SetStateAction<boolean>>;
  setItemBeingModified: Dispatch<SetStateAction<MenuItem | null>>;
  setInitialItemState: Dispatch<SetStateAction<Item | undefined>>;
  setGuestCheckoutView: Dispatch<
    SetStateAction<"credentialsForm" | "mainView" | "notShowing">
  >;
}

function CartSheet({
  setShowCartSheet,
  setItemBeingModified,
  setInitialItemState,
  setGuestCheckoutView,
}: CartSheet) {
  const { isSignedIn } = useAuth();

  const { orderDetails, menuItems } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    menuItems: state.menuItems,
  }));

  const [numberOfItems, setNumberOfItems] = useState(0);
  const [date, setDate] = useState<Date>();

  const [orderCost, setOrderCost] = useState<OrderCost>({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const { updateOrder } = useUpdateOrder();

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

  // hmm maybe you just have a small separate jsx here for the case of empty cart
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
            setShowCartSheet(false);
          }}
          asChild
        >
          <Link href="/order-now">Start an order</Link>
        </Button>
      </div>
    );
  }

  // fyi prob want to remove any default padding so that you can maybe have the date picker group
  // be full-full width?

  return (
    <div className="baseVertFlex relative h-full w-full !justify-start">
      <div className="baseVertFlex w-full !items-start border-b-2 p-4">
        <div className="baseFlex gap-2">
          <LiaShoppingBagSolid className="h-6 w-6" />
          <p className="text-lg">Your order</p>
        </div>
        <p className="text-sm">
          {numberOfItems > 1 ? `${numberOfItems} items` : "1 item"}
        </p>
      </div>

      {/* location + date & time picker  (TODO: why doesn't horizontal margin work here with w-full..) */}
      <div className="baseFlex my-4 w-[95%] flex-wrap !justify-start gap-2 rounded-md border-b bg-gray-300 p-4">
        <span>Your order will be ready for pick up at</span>
        <Button variant={"link"} asChild>
          <Link href="/googleMapsLink" className="!p-0">
            1234 Lorem Ipsum St
          </Link>
        </Button>
        on
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CiCalendarDate className="mr-2 h-5 w-5" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        at
        <Select>
          <SelectTrigger className="w-max pl-3 pr-2">
            <SelectValue
              placeholder="Select a time"
              className="placeholder:!text-muted-foreground"
            />
          </SelectTrigger>
          <SelectContent side="bottom" className="h-[250px]">
            <AvailablePickupTimes />
          </SelectContent>
        </Select>
      </div>

      <p className="ml-4 !self-start text-lg font-semibold underline underline-offset-2">
        Items
      </p>
      {/* summary of items in cart */}
      <div className="baseVertFlex h-full w-full !items-start !justify-start gap-2 overflow-y-auto border-b p-4  pb-36">
        {/* is idx a safe key here? */}
        {/* also how would you do exit animation for item being removed from cart with this structure? ask chatgpt */}
        <div className="baseVertFlex w-full gap-4">
          {orderDetails.items.map((item, idx) => (
            <div key={idx} className="baseFlex w-full !items-start gap-4">
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
                      safeMultiplyPriceAndQuantity(item.price, item.quantity),
                    )}
                  />
                  <Button
                    variant={"underline"}
                    size={"underline"}
                    // className="h-7 !p-0 underline"
                    // TODO: need variant that doesn't do animated underline
                    onClick={() => {
                      setItemBeingModified(menuItems[item.name]!);
                      setInitialItemState(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
      <SheetFooter>
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
                onClick={() => {
                  const newOrderDetails = structuredClone(orderDetails);

                  // I think only thing we would need to do here is to format the order
                  // json to be in the format that stripe expects, and then send it w/in query
                  // to stripe?

                  // send to stripe, only after coming back from stripe (idk should
                  // we send user to temp page that specifically sends data to db
                  // and signal over websocket to bkacend? or just do it on
                  // /track page and show a loading spinner until we have confirmation
                  // that data is in database..)
                }}
              >
                <a href="/stripeCheckout">Proceed to checkout</a>
              </Button>
            ) : (
              <Button
                variant="default"
                className="text-xs font-semibold tablet:text-sm"
                onClick={() => {
                  setGuestCheckoutView("mainView");
                }}
              >
                Proceed to checkout
              </Button>
            )}
          </div>
        </div>
      </SheetFooter>
    </div>
  );
}

export default CartSheet;

function AvailablePickupTimes() {
  // TODO: this is where all of the logic/JSX for the available pickup times goes

  return (
    <SelectGroup>
      <SelectLabel>Available pickup times</SelectLabel>
      <SelectItem value="3:00PM">3:00 PM</SelectItem>
      <SelectItem value="3:30PM">3:30 PM</SelectItem>
      <SelectItem value="4:00PM">4:00 PM</SelectItem>
      <SelectItem value="4:30PM">4:30 PM</SelectItem>
      <SelectItem value="5:00PM">5:00 PM</SelectItem>
      <SelectItem value="5:30PM">5:30 PM</SelectItem>
      <SelectItem value="6:00PM">6:00 PM</SelectItem>
      <SelectItem value="6:30PM">6:30 PM</SelectItem>
      <SelectItem value="7:00PM">7:00 PM</SelectItem>
      <SelectItem value="7:30PM">7:30 PM</SelectItem>
      <SelectItem value="8:00PM">8:00 PM</SelectItem>
      <SelectItem value="8:30PM">8:30 PM</SelectItem>
      <SelectItem value="9:00PM">9:00 PM</SelectItem>
      <SelectItem value="9:30PM">9:30 PM</SelectItem>
      <SelectItem value="10:00PM">10:00 PM</SelectItem>
    </SelectGroup>
  );
}

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
