import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
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
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
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
import { useToast } from "~/components/ui/use-toast";
import { useMainStore } from "~/stores/MainStore";
import { api, type RouterOutputs } from "~/utils/api";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { getFirstSixNumbers } from "~/utils/formatters/getFirstSixNumbers";

const DEFAULT_DATE = new Date();

type RefundOrder = RouterOutputs["refund"]["getOrdersByDate"][number];

type SearchMode = "date" | "name";

function Refunds() {
  const { toast } = useToast();
  const ctx = api.useUtils();

  const [searchMode, setSearchMode] = useState<SearchMode>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [nameInput, setNameInput] = useState("");
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);
  const [submittedName, setSubmittedName] = useState("");
  const [refundReason, setRefundReason] = useState<
    "duplicate" | "fraudulent" | "requested_by_customer"
  >("requested_by_customer");
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [orderBeingRefunded, setOrderBeingRefunded] = useState<string | null>(
    null,
  );

  const { data: dateResults, isFetching: isFetchingDateResults } =
    api.refund.getOrdersByDate.useQuery(
      {
        date: submittedDate || DEFAULT_DATE,
      },
      {
        enabled: searchMode === "date" && submittedDate !== null,
      },
    );

  const { data: nameResults, isFetching: isFetchingNameResults } =
    api.refund.getOrdersByCustomerName.useQuery(
      {
        query: submittedName,
      },
      {
        enabled: searchMode === "name" && submittedName.trim().length >= 2,
      },
    );

  const refundMutation = api.refund.refundOrder.useMutation({
    onSuccess: async (updatedOrder) => {
      toast({
        description: `Order #${getFirstSixNumbers(updatedOrder.id)} has been refunded.`,
      });

      setOrderBeingRefunded(null);
      setOpenDialogId(null);

      await Promise.allSettled([
        ctx.refund.getOrdersByDate.invalidate(),
        ctx.refund.getOrdersByCustomerName.invalidate(),
        ctx.order.getUsersOrders.invalidate(),
      ]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description:
          error?.message ?? "The refund could not be processed. Please retry.",
      });
      setOrderBeingRefunded(null);
    },
  });

  const orders = useMemo<RefundOrder[] | undefined>(() => {
    return searchMode === "date" ? dateResults : nameResults;
  }, [dateResults, nameResults, searchMode]);

  const isLoading = useMemo(() => {
    return searchMode === "date"
      ? isFetchingDateResults
      : isFetchingNameResults;
  }, [isFetchingDateResults, isFetchingNameResults, searchMode]);

  const hasSearched = useMemo(() => {
    return searchMode === "date"
      ? submittedDate !== null
      : submittedName.trim().length >= 2;
  }, [searchMode, submittedDate, submittedName]);

  return (
    <motion.div
      key="refunds-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[70dvh] w-full !justify-start gap-8 p-4"
    >
      <div className="baseVertFlex w-full max-w-lg !items-start gap-6">
        <div className="baseVertFlex w-full gap-2 xs:!flex-row">
          <Button
            variant={searchMode === "date" ? "default" : "outline"}
            onClick={() => setSearchMode("date")}
          >
            <CalendarIcon className="mr-2 size-4" /> Search by date
          </Button>
          <Button
            variant={searchMode === "name" ? "default" : "outline"}
            onClick={() => setSearchMode("name")}
          >
            <Search className="mr-2 size-4" /> Search by customer name
          </Button>
        </div>

        {searchMode === "date" ? (
          <div className="baseVertFlex w-full gap-4 rounded-lg border bg-offwhite p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Select a pickup date to view every order from that day.
            </p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) return;
                setSelectedDate(date);
              }}
              autoFocus
            />
            <Button
              disabled={!selectedDate || isFetchingDateResults}
              onClick={() => {
                if (!selectedDate) return;
                setSubmittedDate(selectedDate);
              }}
            >
              Search
            </Button>
          </div>
        ) : (
          <form
            className="baseFlex w-full !items-end gap-2 rounded-lg border bg-offwhite p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = nameInput.trim();
              if (trimmed.length < 2) return;
              setSubmittedName(trimmed);
            }}
          >
            <div className="baseVertFlex w-full !items-start gap-2">
              <Label htmlFor="refundNameSearch" className="text-sm font-medium">
                Customer name
              </Label>
              <Input
                id="refundNameSearch"
                placeholder="Enter a first or last name"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                minLength={2}
              />
            </div>
            <Button
              type="submit"
              disabled={nameInput.trim().length < 2 || isFetchingNameResults}
            >
              Search
            </Button>
          </form>
        )}
      </div>

      <Separator className="w-full" />

      <div className="baseVertFlex w-full max-w-5xl gap-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        )}

        {!isLoading && hasSearched && (!orders || orders.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No orders matched your search.
          </p>
        )}

        {!isLoading && !hasSearched && (
          <p className="text-sm text-muted-foreground">
            Start by{" "}
            {searchMode === "date"
              ? "choosing a date"
              : "entering a customer name"}
            .
          </p>
        )}

        {orders && orders.length > 0 && (
          <div className="baseVertFlex w-full max-w-lg gap-4">
            {orders.map((order) => (
              <RefundOrderCard
                key={order.id}
                order={order}
                dialogIsOpen={openDialogId === order.id}
                setDialogOpen={(isOpen) =>
                  setOpenDialogId(isOpen ? order.id : null)
                }
                isRefunding={
                  orderBeingRefunded === order.id && refundMutation.isLoading
                }
                onRefund={() => {
                  setOrderBeingRefunded(order.id);
                  refundMutation.mutate({
                    orderId: order.id,
                    reason: refundReason,
                  });
                }}
                refundReason={refundReason}
                setRefundReason={setRefundReason}
                onDialogClosed={() => {
                  setOpenDialogId(null);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface RefundOrderCardProps {
  order: RefundOrder;
  dialogIsOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  isRefunding: boolean;
  onRefund: () => void;
  refundReason: "duplicate" | "fraudulent" | "requested_by_customer";
  setRefundReason: Dispatch<
    SetStateAction<"duplicate" | "fraudulent" | "requested_by_customer">
  >;
  onDialogClosed: () => void;
}

function RefundOrderCard({
  order,
  dialogIsOpen,
  setDialogOpen,
  isRefunding,
  onRefund,
  refundReason,
  setRefundReason,
  onDialogClosed,
}: RefundOrderCardProps) {
  const { customizationChoices } = useMainStore((state) => ({
    customizationChoices: state.customizationChoices,
  }));

  const pickupTimeCST = toZonedTime(order.datetimeToPickup, "America/Chicago");
  const refundedAtCST = order.orderRefundedAt
    ? toZonedTime(order.orderRefundedAt, "America/Chicago")
    : null;

  return (
    <div className="baseVertFlex w-full gap-4 rounded-md border bg-offwhite p-4 shadow-sm">
      <div className="baseFlex w-full !items-start !justify-between gap-4">
        <div className="baseVertFlex !items-start gap-1">
          <p className="text-lg font-semibold text-primary">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            Pickup {format(pickupTimeCST, "EEEE, MMM d, h:mm a")}
          </p>
          <p className="text-xs text-muted-foreground">
            Placed on{" "}
            {format(toZonedTime(order.createdAt, "America/Chicago"), "PPP p")}
          </p>
        </div>

        <div className="baseVertFlex !items-end gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Order #{getFirstSixNumbers(order.id)}
          </p>

          {refundedAtCST ? (
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Refunded {format(refundedAtCST, "PPP")}
            </span>
          ) : (
            <AlertDialog open={dialogIsOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button disabled={isRefunding}>Refund</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refund this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will refund the entire payment in Stripe and mark the
                    order as refunded. This action cannot be undone.
                    <div className="baseVertFlex mt-4 gap-2">
                      <Label
                        htmlFor="refundReasonSelect"
                        className="text-sm font-medium"
                      >
                        Reason for refund
                      </Label>
                      <Select
                        value={refundReason}
                        onValueChange={(value) =>
                          setRefundReason(
                            value as
                              | "duplicate"
                              | "fraudulent"
                              | "requested_by_customer",
                          )
                        }
                      >
                        <SelectTrigger id={"delayAmount"} className="w-[180px]">
                          <SelectValue placeholder="Select a delay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Refund reason</SelectLabel>
                            <SelectItem value="duplicate">
                              Duplicate order
                            </SelectItem>
                            <SelectItem value="fraudulent">
                              Fraudulent order
                            </SelectItem>
                            <SelectItem value="requested_by_customer">
                              Requested by customer
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={onDialogClosed}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isRefunding}
                    onClick={() => {
                      onRefund();
                    }}
                  >
                    {isRefunding ? "Processing…" : "Confirm refund"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Separator className="w-full" />

      <div className="baseVertFlex !items-start">
        {order.orderItems.map((item) => (
          <div
            key={item.id}
            className="baseVertFlex h-full !items-start !justify-start gap-2"
          >
            <div className="baseFlex !justify-start gap-2 font-medium">
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

      <Separator className="w-full" />

      <div className="baseVertFlex gap-1 text-sm">
        <div className="baseFlex w-full !justify-between gap-16">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="baseFlex w-full !justify-between gap-16">
          <span>Tax</span>
          <span>{formatPrice(order.tax)}</span>
        </div>

        <div className="baseFlex w-full !justify-between gap-16">
          <span>
            Tip
            {order.tipPercentage !== null ? ` (${order.tipPercentage}%)` : ""}
          </span>
          <span>{formatPrice(order.tipValue)}</span>
        </div>

        <div className="baseFlex w-full !justify-between gap-16 text-base font-semibold">
          <span>Total collected</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

export default Refunds;
