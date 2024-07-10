import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import OrderSummary from "~/components/cart/OrderSummary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
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
import { type DashboardReview } from "~/server/api/routers/review";
import { api } from "~/utils/api";

function Reviews() {
  const { data: reviews } = api.review.getAll.useQuery();

  const [sortedReviews, setSortedReviews] = useState<
    DashboardReview[] | null | undefined
  >();
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (reviews === null && sortedReviews === undefined) {
      setSortedReviews([]);
      return;
    }

    // this logic is reversed from what you'd expect because the list is rendered
    // with the first item in the array being rendered first. So to sort by the newest
    // reviews, we need to sort in descending order actually.
    // (uses slice to avoid mutating the original array)
    const localSortedReviews = reviews?.slice().sort((a, b) => {
      if (sortDirection === "asc") {
        return (
          a.order.datetimeToPickup.getTime() -
          b.order.datetimeToPickup.getTime()
        );
      } else {
        return (
          b.order.datetimeToPickup.getTime() -
          a.order.datetimeToPickup.getTime()
        );
      }
    });

    if (
      localSortedReviews !== undefined &&
      !isEqual(localSortedReviews, sortedReviews)
    ) {
      setSortedReviews(localSortedReviews);
    }
  }, [reviews, sortedReviews, sortDirection]);

  return (
    <motion.div
      key={"reviews"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex my-8 mb-24 h-full max-w-3xl desktop:max-w-6xl"
    >
      <AnimatePresence mode="wait">
        {reviews === undefined || sortedReviews === undefined ? (
          <motion.div
            key={"reviewsLoadingContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            // offsetting the tablet+ top nav margin w/ a negative top margin of the same size to
            // keep lotus centered
            className="baseVertFlex w-full grow-[1] items-center justify-center tablet:mt-[-48px]"
          >
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key={"reviewsLoadedContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex relative my-8 mb-32 mt-16 w-full grow-[1] !justify-start p-0 transition-all lg:w-[775px] tablet:mt-0 tablet:rounded-xl tablet:border tablet:bg-offwhite tablet:p-8 tablet:shadow-md"
          >
            {sortedReviews && sortedReviews.length > 0 && (
              <div className="baseVertFlex gap-2">
                <div className="baseFlex w-full !justify-between font-medium">
                  <p className="text-lg">Customer reviews</p>
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
                  {sortedReviews.map((review) => (
                    <ReviewAccordion key={review.order.id} review={review} />
                  ))}
                </div>
              </div>
            )}

            {sortedReviews && sortedReviews.length === 0 && (
              <p>No reviews have been written yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Reviews;

interface ReviewAccordion {
  review: DashboardReview;
}

function ReviewAccordion({ review }: ReviewAccordion) {
  const [accordionOpen, setAccordionOpen] = useState<"open" | "closed">(
    "closed",
  );

  return (
    <Accordion
      key={review.order.id}
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
          <div className="baseFlex w-full !justify-between">
            <div className="baseVertFlex !items-start">
              {review.user && (
                <div className="baseFlex gap-1 font-medium">
                  <span>{review.user.firstName}</span>
                  <span>{review.user.lastName}</span>
                </div>
              )}

              <div className="baseFlex gap-1 text-nowrap text-sm text-stone-400">
                <span>Order pickup date:</span>
                <span>
                  {format(
                    toZonedTime(
                      review.order.datetimeToPickup,
                      "America/Chicago",
                    ),
                    "MM/dd/yyyy",
                  )}
                </span>
                <span>at</span>
                <span>
                  {format(
                    toZonedTime(
                      review.order.datetimeToPickup,
                      "America/Chicago",
                    ),
                    "h:mm a",
                  )}
                </span>
              </div>

              {/* review message content */}
              <p className="mt-4">&ldquo;{review.message}&rdquo;</p>
            </div>

            <div className="baseVertFlex absolute right-4 top-4">
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
        </div>
        <AccordionContent className="baseFlex border-t pt-2">
          <div className="baseFlex w-full max-w-lg px-2">
            <OrderSummary order={review.order} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
