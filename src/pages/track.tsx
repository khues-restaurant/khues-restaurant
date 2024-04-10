import { SignInButton, useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { PiCookingPotBold } from "react-icons/pi";
import { TfiReceipt } from "react-icons/tfi";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import OrderSummary from "~/components/cart/OrderSummary";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { socket } from "~/pages/_app";
import { api } from "~/utils/api";

// stretch, but if you really wanted to have the order "number" but just numbers,
// you could just have a function that takes in whole id and returns first 6 numbers,
// I don't think it would have drastic effects elsewhere

// { order }: { order: Order }
function Track() {
  const { isSignedIn } = useAuth();
  const { asPath, isReady } = useRouter();
  const orderId = useRouter().query.id;

  // doing trpc fetch here instead of in getServerSideProps so that when order
  // is started/completed from the dashboard, the dashboard can send out a socket emit
  // to refetch the order on here

  // const session = api.payment.getStripeSession.useQuery(
  //   { orderId },
  //   {
  //     enabled: router.isReady,
  //   },
  // );

  const { data: order, refetch } = api.order.getById.useQuery(
    orderId as string,
    {
      enabled: isReady && typeof orderId === "string",
    },
  );

  const targetRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [positions, setPositions] = useState([
    { top: 0, left: 0 },
    { top: 0, left: 0 },
    { top: 0, left: 0 },
  ]);

  useEffect(() => {
    function updatePositions() {
      if (!order) return;

      const newPositions = targetRefs.current.map((targetRef, index) => {
        if (targetRef && floatingRefs.current[index]) {
          const targetRect = targetRef.getBoundingClientRect();
          const floatingRect =
            floatingRefs.current[index]?.getBoundingClientRect();

          if (!floatingRect) return { top: 0, left: 0 };

          const targetCenterX = targetRect.left + targetRect.width / 2;
          const newLeftPosition = targetCenterX - floatingRect.width / 2;

          return {
            top: targetRect.bottom + window.scrollY,
            left: newLeftPosition + window.scrollX,
          };
        }
        return { top: 0, left: 0 };
      });

      setPositions(newPositions as { top: number; left: number }[]);
    }

    updatePositions();

    window.addEventListener("resize", updatePositions);

    return () => window.removeEventListener("resize", updatePositions);
  }, [order]);

  useEffect(() => {
    function refetchOrderStatus(orderIdToRefetch: string) {
      if (orderId === orderIdToRefetch) {
        void refetch();
      }
    }

    socket.on("orderStatusUpdated", refetchOrderStatus);

    return () => {
      socket.off("orderStatusUpdated", refetchOrderStatus);
    };
  }, [orderId, refetch]);

  const viewportLabel = useGetViewportLabel();

  // need the undefined state here so that we can transition the orderPlaced checkpoint.
  // Otherwise it would immediately show the completed state w/o any animation.
  const [orderStatus, setOrderStatus] = useState<
    undefined | "orderPlaced" | "inProgress" | "readyForPickup"
  >();

  useEffect(() => {
    if (!order) return;

    if (order.orderCompletedAt) {
      setOrderStatus("readyForPickup");
      return;
    } else if (order.orderStartedAt) {
      setOrderStatus("inProgress");
      return;
    }

    setTimeout(() => {
      setOrderStatus("orderPlaced");
    }, 50); // allowing for undefined state/ui to render first, then quickly aligning w/ proper state
  }, [order]);

  const [rewardsPointsEarned, setRewardsPointsEarned] = useState(0);
  const [rewardsPointsTimerSet, setRewardsPointsTimerSet] = useState(false);

  useEffect(() => {
    if (!order || rewardsPointsTimerSet) return;

    setRewardsPointsEarned(order.prevRewardsPoints);

    setTimeout(() => {
      if (order) {
        setRewardsPointsEarned(
          order.prevRewardsPoints +
            order.earnedRewardsPoints -
            order.spentRewardsPoints,
        );
      }
    }, 5000);

    setRewardsPointsTimerSet(true);
  }, [order, rewardsPointsTimerSet]);

  if (typeof orderId !== "string") return null;

  // need maybe a decent bit of extra logic if you want to have each icon shake as the progress bar
  // reaches their respective checkpoints rather than how it is now, which is just the current icon
  // shakes since it's the current state.

  // be wary: there's a decent chance that the easings won't update as you expect them to for when
  // you are already on the page and the order status changes. Test this out to confirm/chatgpt

  return (
    <motion.div
      key={"tracking"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start p-4 tablet:mt-36"
    >
      <div className="baseVertFlex w-full gap-4 px-0 py-4 tablet:max-w-2xl tablet:p-8">
        <AnimatePresence>
          {
            order ? (
              <motion.div
                key={"trackingContent"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="baseVertFlex h-full w-full !justify-start gap-8 p-4"
              >
                <p className="text-xl font-semibold underline underline-offset-4">
                  Order {orderId.toUpperCase().substring(0, 6)}
                </p>

                <div className="baseVertFlex w-full gap-2">
                  {/* animated progress bar */}
                  <div className="relative h-10 w-full overflow-hidden rounded-full border-2 border-primary shadow-md ">
                    <div className="baseFlex absolute left-0 top-0 h-full w-full">
                      {/* pre-first checkpoint */}
                      <div className="relative h-full w-[21%]">
                        <motion.div
                          initial={{ scaleX: "0%" }}
                          animate={{ scaleX: "100%" }}
                          transition={{
                            duration: 1,
                            ease:
                              orderStatus === "orderPlaced"
                                ? "easeOut"
                                : "linear",
                            delay: 1,
                          }}
                          className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                        ></motion.div>
                      </div>

                      {/* first checkpoint w/ animated checkmark */}
                      <div
                        ref={(el) => (targetRefs.current[0] = el)}
                        className="absolute left-[14.25%] top-1 z-10"
                      >
                        <Step
                          status={
                            orderStatus === undefined
                              ? "notStarted"
                              : "completed"
                          }
                          delay={1.75}
                        />
                      </div>

                      {/* pre-second checkpoint */}
                      <div className="relative h-full w-[35%]">
                        {(orderStatus === "inProgress" ||
                          orderStatus === "readyForPickup") && (
                          <motion.div
                            initial={{ scaleX: "0%" }}
                            animate={{ scaleX: "100%" }}
                            transition={{
                              duration: 1,
                              ease:
                                orderStatus === "inProgress"
                                  ? "easeOut"
                                  : "linear",
                              delay: 2,
                            }}
                            className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                          ></motion.div>
                        )}
                      </div>

                      {/* second checkpoint w/ animated checkmark */}
                      <div
                        ref={(el) => (targetRefs.current[1] = el)}
                        className="absolute left-[47.15%] top-1 z-10"
                      >
                        <Step
                          status={
                            orderStatus === "readyForPickup"
                              ? "completed"
                              : orderStatus === "inProgress"
                                ? "inProgress"
                                : "notStarted"
                          }
                          delay={2.75}
                          forInProgressCheckpoint
                        />
                      </div>

                      {/* pre-third checkpoint */}
                      <div className="relative h-full w-[35%]">
                        {orderStatus === "readyForPickup" && (
                          <motion.div
                            initial={{ scaleX: "0%" }}
                            animate={{ scaleX: "100%" }}
                            transition={{
                              duration: 1,
                              ease: "easeOut", // TODO: probably need another state to check and see if the time elapsed
                              // on this component is greater than a few seconds, and only if so do you want this to be easeOut,
                              // since if you view tracking page when order is ready for pickup, you want this pre-third
                              // part to be linear
                              delay: 3,
                            }}
                            className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                          ></motion.div>
                        )}
                      </div>

                      {/* third checkpoint w/ animated checkmark */}
                      <div
                        ref={(el) => (targetRefs.current[2] = el)}
                        className="absolute left-[80%] top-1 z-10"
                      >
                        <Step
                          status={
                            orderStatus === "readyForPickup"
                              ? "completed"
                              : "notStarted"
                          }
                          delay={3.75}
                        />
                      </div>

                      {/* post-third checkpoint */}
                      <div className="relative h-full w-[15%]">
                        {orderStatus === "readyForPickup" && (
                          <motion.div
                            initial={{ scaleX: "0%" }}
                            animate={{ scaleX: "100%" }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: 4,
                            }}
                            className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                          ></motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-11 w-full text-xs">
                    <motion.div
                      ref={(el) => (floatingRefs.current[0] = el)}
                      key={"orderPlacedCheckpointContainer"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        position: "absolute",
                        top: `${positions[0]!.top + 14}px`,
                        left: `${positions[0]!.left}px`,
                      }}
                    >
                      <div
                        style={{
                          opacity: orderStatus === undefined ? 0.5 : 1,
                          transition: "opacity 0.2s ease-out",
                          transitionDelay: "1s",
                        }}
                        className="baseVertFlex gap-1"
                      >
                        <TfiReceipt
                          style={{
                            animationDelay: "1.75s",
                          }}
                          className={`h-6 w-6 text-primary ${
                            orderStatus === "orderPlaced" ? "shake" : ""
                          }`}
                        />
                        <p className="text-nowrap text-primary">Order placed</p>
                      </div>
                    </motion.div>

                    <motion.div
                      ref={(el) => (floatingRefs.current[1] = el)}
                      key={"inProgressCheckpointContainer"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      style={{
                        position: "absolute",
                        top: `${positions[1]!.top + 14}px`,
                        left: `${positions[1]!.left}px`,
                      }}
                    >
                      <div
                        style={{
                          opacity:
                            orderStatus === "inProgress" ||
                            orderStatus === "readyForPickup"
                              ? 1
                              : 0.5,
                          transition: "opacity 0.2s ease-out",
                          transitionDelay: "2.75s",
                        }}
                        className="baseVertFlex gap-1"
                      >
                        <PiCookingPotBold
                          style={{
                            animationDelay: "2s",
                          }}
                          className={`h-6 w-6 text-primary  ${
                            orderStatus === "inProgress" ? "shake" : ""
                          }`}
                        />
                        <p className="text-primary">In progress</p>
                      </div>
                    </motion.div>

                    <motion.div
                      ref={(el) => (floatingRefs.current[2] = el)}
                      key={"orderReadyForPickupCheckpointContainer"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      style={{
                        position: "absolute",
                        top: `${positions[2]!.top + 14}px`,
                        left: `${positions[2]!.left}px`,
                      }}
                    >
                      <div
                        style={{
                          opacity: orderStatus === "readyForPickup" ? 1 : 0.5,
                          transition: "opacity 0.2s ease-out",
                          transitionDelay: "3s",
                        }}
                        className="baseVertFlex gap-1"
                      >
                        <LiaShoppingBagSolid
                          style={{
                            animationDelay: "3.75s",
                          }}
                          className={`h-6 w-6 text-primary ${
                            orderStatus === "readyForPickup" ? "shake" : ""
                          }`}
                        />
                        <p className="text-nowrap text-primary">
                          Ready for pickup
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="baseFlex w-full gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {orderStatus === "orderPlaced" && (
                      <motion.p
                        key={"orderPlacedText"}
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-lg font-medium"
                      >
                        Your order has been received
                      </motion.p>
                    )}

                    {orderStatus === "inProgress" && (
                      <motion.p
                        key={"inProgressText"}
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-lg font-medium"
                      >
                        Your order is being prepared
                      </motion.p>
                    )}

                    {orderStatus === "readyForPickup" && (
                      <motion.p
                        key={"readyForPickupText"}
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-lg font-medium"
                      >
                        Your order is ready to be picked up!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* rewards + pickup time + address */}
                <div className="baseVertFlex w-full gap-2">
                  <div className="baseVertFlex w-full !items-start gap-2 tablet:!flex-row tablet:!justify-between tablet:gap-0">
                    <div className="baseVertFlex !items-start gap-2 text-sm">
                      <p className="font-semibold underline underline-offset-2">
                        Pickup time
                      </p>
                      <p className="text-sm">
                        {format(order.datetimeToPickup, "PPPp")}
                      </p>
                    </div>

                    <p className="baseVertFlex !items-start gap-2 text-sm tablet:!items-end">
                      <p className="font-semibold underline underline-offset-2">
                        Address
                      </p>
                      <Button variant={"link"} className="h-4 !p-0">
                        1234 Lorem Ipsum Dr. Roseville, MN 12345
                      </Button>
                    </p>
                  </div>
                  <div className="rewardsGoldBorder baseVertFlex relative mt-4 w-full rounded-md text-yellow-500 shadow-md tablet:max-w-2xl">
                    <p className="text-xl font-bold">K Reward Points</p>

                    <div className="baseVertFlex mt-2 font-bold text-yellow-500">
                      <AnimatedNumbers
                        value={rewardsPointsEarned}
                        fontSize={viewportLabel.includes("mobile") ? 25 : 35}
                        padding={0}
                      />
                      points
                    </div>

                    <WideFancySwirls />

                    <div
                      className={`baseVertFlex w-full text-sm text-yellow-500`}
                    >
                      {isSignedIn ? (
                        <>
                          {/* maybe drop this first part? seems a bit redundant but idk */}
                          <div className="baseFlex gap-1">
                            You earned
                            <div className="font-bold">
                              <AnimatedNumbers
                                value={
                                  rewardsPointsEarned - order.prevRewardsPoints
                                }
                                fontSize={
                                  viewportLabel.includes("mobile") ? 14 : 16
                                }
                                padding={0}
                              />
                            </div>
                            points for this order.
                          </div>
                        </>
                      ) : (
                        <div className="baseVertFlex mt-2 gap-4">
                          <SignInButton
                            mode="modal"
                            afterSignUpUrl={`${
                              process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                            }/postSignUpRegistration`}
                            afterSignInUrl={`${
                              process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                            }${asPath}`}
                          >
                            <Button
                              variant={"rewards"}
                              // className="h-11"
                              // onClick={() => {
                              //   if (asPath.includes("/create")) {
                              //     localStorageTabData.set(getStringifiedTabData());
                              //   }

                              //   // technically can sign in from signup page and vice versa
                              //   if (!userId) localStorageRedirectRoute.set(asPath);
                              //   // ^^ but technically could just append it onto the postSignupRegistration route right?
                              // }}
                            >
                              Sign in
                            </Button>
                          </SignInButton>
                          to redeem your points for this order.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="baseFlex tablet:w-[500px]">
                  <OrderSummary order={order} />
                </div>

                <Button variant={"underline"} className="text-primary">
                  Need assistance with your order?
                </Button>
              </motion.div>
            ) : null
            // TODO: replace this with the animated logo dashoffsetarray
            // <OrderSkeleton />
          }
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Track;

function OrderSkeleton() {
  return (
    <motion.div
      key={"orderSkeleton"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex h-full w-full !justify-start gap-4"
    >
      <Skeleton className="h-12 w-full" index={0} />

      <Skeleton className="h-12 w-96" index={0} />

      <div className="baseVertFlex w-full gap-4">
        <div className="baseFlex w-full !justify-between">
          <Skeleton className="h-8 w-24" index={2} />
          <Skeleton className="h-8 w-48" index={2} />
        </div>
        <Skeleton className="h-64 w-full" index={3} />
      </div>

      <div className="baseVertFlex w-full !items-start gap-4">
        <Skeleton className="h-10 w-24 " index={4} />
        <Skeleton className="h-80 w-full" index={4} />
      </div>
    </motion.div>
  );
}

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   const prisma = new PrismaClient();
//   const order = await prisma.order.findUnique({
//     where: {
//       id: ctx.query.id as string, // TODO: test w/ bogus id or just on /track to see what this does
//     },
//   });

//   return {
//     props: {
//       order,
//       // ...buildClerkProps(ctx.req),
//     },
//   };
// };

function Step({
  status,
  delay,
  forInProgressCheckpoint,
}: {
  status: "notStarted" | "inProgress" | "completed";
  delay: number;
  forInProgressCheckpoint?: boolean;
}) {
  const [statusBeingShown, setStatusBeingShown] = useState("notStarted");

  useEffect(() => {
    if (status === "completed" && forInProgressCheckpoint) {
      setStatusBeingShown("completed");
    } else {
      setTimeout(() => {
        setStatusBeingShown(status);
      }, delay * 1000);
    }

    // do you need to clear timeout here inside of cleanup function?
  }, [status, delay, forInProgressCheckpoint]);

  return (
    <motion.div animate={status} className="relative">
      <motion.div
        initial={false}
        variants={{
          notStarted: {
            backgroundColor: "#fff", // neutral
            borderColor: "#e5e5e5", // neutral-200
            color: "#a3a3a3", // neutral-400
          },
          inProgress: {
            backgroundColor: "#fff",
            borderColor: "#dc3727", //  bg-primary
            color: "#dc3727", //  bg-primary
            transition: {
              delay: 2,
            },
          },
          completed: {
            backgroundColor: "#dc3727", //  bg-primary
            borderColor: "#dc3727", //  bg-primary
            color: "#dc3727", //  bg-primary
          },
        }}
        transition={{ duration: 0.2, delay, ease: "easeOut" }}
        className="relative flex size-7 items-center justify-center rounded-full border-2 font-semibold"
      >
        <AnimatePresence mode="wait">
          {statusBeingShown === "completed" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="baseFlex"
            >
              <CheckIcon className="h-6 w-6 text-white" />
            </motion.div>
          ) : statusBeingShown === "inProgress" ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative flex size-3"
            >
              <span
                style={{
                  animationDuration: "3s",
                }}
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
              ></span>
              <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
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
  );
}
