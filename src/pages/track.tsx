import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { api } from "~/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { type Order, PrismaClient } from "@prisma/client";
import { socket } from "~/pages/_app";
import { Skeleton } from "~/components/ui/skeleton";
import { TfiReceipt } from "react-icons/tfi";
import { PiCookingPotBold } from "react-icons/pi";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import OrderSummary from "~/components/cart/OrderSummary";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import RevealFromTop from "~/components/ui/RevealFromTop";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";

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

  const [rewardsPointsEarned, setRewardsPointsEarned] = useState(0);

  const [rewardsPointsTimerSet, setRewardsPointsTimerSet] = useState(false);

  useEffect(() => {
    if (!order || rewardsPointsTimerSet) return;

    setRewardsPointsEarned(order.prevRewardsPoints);

    setTimeout(() => {
      if (order) {
        // TODO: if points are less than prev points, we know we have gone over 1500,
        // so inside of here we will need to treat the points as if they are 1500,
        // and then have another setTimeout to set the points back to what they actually are
        // after 2s

        // ^ may want a separate boolean flag state for "toggleGoldColor" or w/e since we don't want to
        // tie color change to immediately happen as soon as 1500 points are set because we want the red
        // to fill up all the way, and then have the gold color animate in, and then animate back to red
        // as the points are set back to what they actually are

        setRewardsPointsEarned(order.rewardsPoints);
      }
    }, 5000);

    setRewardsPointsTimerSet(true);
  }, [order, rewardsPointsTimerSet]);

  if (typeof orderId !== "string") return null;

  // prob want golden gradient of sorts for rewards,
  // and will have to have some swelling brightness effect when hitting 1500 points

  return (
    <motion.div
      key={"tracking"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start p-4 tablet:mt-48"
    >
      <div className="baseVertFlex w-full gap-4 rounded-md border-2 border-primary px-0 py-4 shadow-lg tablet:max-w-2xl tablet:p-8">
        <p className="text-xl font-semibold">
          Order {orderId.toUpperCase().substring(0, 6)}
        </p>
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
                <RevealFromTop
                  initialDelay={0}
                  className="baseVertFlex w-full gap-2"
                >
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
                              !order.orderCompletedAt && !order.orderStartedAt
                                ? "easeOut"
                                : "linear",
                            delay: 0.5,
                          }}
                          className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                        ></motion.div>
                      </div>

                      {/* first checkpoint w/ animated checkmark */}
                      <div className="absolute left-[14.25%] top-1 z-10">
                        <Step status={"completed"} />
                      </div>

                      {/* pre-second checkpoint */}
                      <div className="relative h-full w-[35%]">
                        {(order.orderStartedAt ?? order.orderCompletedAt) && (
                          <motion.div
                            initial={{ scaleX: "0%" }}
                            animate={{ scaleX: "100%" }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: 1.5,
                            }}
                            className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                          ></motion.div>
                        )}
                      </div>

                      {/* second checkpoint w/ animated checkmark */}
                      <div className="absolute left-[47.15%] top-1 z-10">
                        <Step
                          status={
                            order.orderCompletedAt
                              ? "completed"
                              : order.orderStartedAt
                                ? "inProgress"
                                : "notStarted"
                          }
                        />
                      </div>

                      {/* pre-third checkpoint */}
                      <div className="relative h-full w-[35%]">
                        {order.orderCompletedAt && (
                          <motion.div
                            initial={{ scaleX: "0%" }}
                            animate={{ scaleX: "100%" }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: 2.5,
                            }}
                            className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                          ></motion.div>
                        )}
                      </div>

                      {/* first checkpoint w/ animated checkmark */}
                      <div className="absolute left-[80%] top-1 z-10">
                        <Step
                          status={
                            order.orderCompletedAt ? "completed" : "notStarted"
                          }
                        />
                      </div>

                      {/* post-third checkpoint */}
                      <div className="relative h-full w-[15%]">
                        {order.orderCompletedAt && (
                          <motion.div
                            initial={{ scaleX: "0%" }}
                            animate={{ scaleX: "100%" }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: 3.5,
                            }}
                            className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
                          ></motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative h-6 w-full">
                    <div className="absolute left-[15%] top-0">
                      <TfiReceipt className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute left-[47.5%] top-0">
                      <PiCookingPotBold className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute left-[80%] top-0">
                      <LiaShoppingBagSolid className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </RevealFromTop>

                <RevealFromTop initialDelay={1.5} className="baseFlex w-full">
                  <p className="text-lg">
                    {order.orderCompletedAt
                      ? "Your order is ready to be picked up!"
                      : order.orderStartedAt
                        ? "Your order is being prepared."
                        : "Your order has been received."}
                  </p>
                </RevealFromTop>

                {/* rewards + pickup time + address */}
                <div className="baseVertFlex w-full gap-2">
                  <div className="baseVertFlex w-full !items-start gap-2 tablet:!flex-row tablet:!justify-between tablet:gap-0">
                    <div className="baseVertFlex !items-start text-sm">
                      <p className="text-gray-400 underline underline-offset-2">
                        Pickup time
                      </p>
                      <p>{format(order.datetimeToPickup, "PPPp")}</p>
                    </div>

                    <p className="baseVertFlex !items-start text-sm tablet:!items-end">
                      <p className="text-gray-400 underline underline-offset-2">
                        Address
                      </p>
                      <Button variant={"link"} className="h-4 !p-0">
                        1234 Lorem Ipsum Dr. Roseville, MN 12345
                      </Button>
                    </p>
                  </div>
                  <RevealFromTop
                    initialDelay={2}
                    className="rewardsGoldBorder baseVertFlex relative w-full rounded-md text-yellow-500 shadow-md tablet:max-w-2xl"
                  >
                    <p className="text-xl font-bold">K Reward Points</p>

                    <div className="baseVertFlex mt-2 font-bold text-yellow-500">
                      <AnimatedNumbers
                        value={rewardsPointsEarned}
                        fontSize={viewportLabel.includes("mobile") ? 25 : 38}
                        padding={0}
                      />
                      points
                    </div>

                    <WideFancySwirls />

                    <RevealFromTop
                      initialDelay={4}
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
                        <div className="baseVertFlex gap-2">
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
                    </RevealFromTop>
                  </RevealFromTop>
                </div>

                <RevealFromTop initialDelay={1}>
                  <OrderSummary order={order} />
                </RevealFromTop>
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
}: {
  status: "notStarted" | "inProgress" | "completed";
}) {
  return (
    <motion.div animate={status} className="relative">
      {/* <motion.div
        variants={{
          inProgress: {
            scale: 1,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          },
          completed: {
            scale: 1.25,
          },
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "tween",
          ease: "circOut",
        }}
        className="absolute inset-0 rounded-full bg-white"
      /> */}

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
              delay: 0.5,
            },
          },
          completed: {
            backgroundColor: "#dc3727", //  bg-primary
            borderColor: "#dc3727", //  bg-primary
            color: "#dc3727", //  bg-primary
          },
        }}
        transition={{ duration: 0.2 }}
        className="relative flex size-7 items-center justify-center rounded-full border-2 font-semibold"
      >
        <div className="flex items-center justify-center">
          {status === "completed" ? (
            <CheckIcon className="h-6 w-6 text-white" />
          ) : status === "inProgress" ? (
            <span className="relative flex size-3">
              <span
                style={{
                  animationDuration: "3s",
                }}
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
              ></span>
              <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
            </span>
          ) : (
            <span></span>
          )}
        </div>
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
