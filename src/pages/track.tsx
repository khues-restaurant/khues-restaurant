import { SignInButton, useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { PiCookingPotBold } from "react-icons/pi";
import { TfiReceipt } from "react-icons/tfi";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import OrderSummary from "~/components/cart/OrderSummary";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getFirstSixNumbers } from "~/utils/getFirstSixNumbers";
import { io } from "socket.io-client";
import { env } from "~/env";
import { toZonedTime } from "date-fns-tz";

function Track() {
  const { isSignedIn } = useAuth();
  const { isReady, query } = useRouter();
  const orderId = query.id;

  const { viewportLabel, setChatIsOpen } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
    setChatIsOpen: state.setChatIsOpen,
  }));

  const { data: order, refetch } = api.order.getById.useQuery(
    orderId as string,
    {
      enabled: isReady && typeof orderId === "string",
    },
  );

  const [minTimeoutElapsed, setMinTimeoutElapsed] = useState(false);

  useEffect(() => {
    if (
      order === null ||
      order === undefined ||
      order.orderCompletedAt !== null
    )
      return;

    console.log("connecting to socket.io server");

    const socket = io(env.NEXT_PUBLIC_SOCKET_IO_URL, {
      query: {
        userId: order.id,
      },
      secure: env.NEXT_PUBLIC_SOCKET_IO_URL.includes("https") ? true : false,
      retries: 3,
    });

    socket.on(`orderStatusUpdate`, () => {
      void refetch();
    });

    return () => {
      console.log("disconnecting from socket.io server");
      socket.disconnect();
    };
  }, [order, refetch]);

  useEffect(() => {
    setTimeout(() => {
      setMinTimeoutElapsed(true);
    }, 2000);
  }, []);

  const targetRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [positions, setPositions] = useState([
    { top: 0, left: 0 },
    { top: 0, left: 0 },
    { top: 0, left: 0 },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [passedOrderPlacedCheckpoint, setPassedOrderPlacedCheckpoint] =
    useState(false);
  const [passedInProgressCheckpoint, setPassedInProgressCheckpoint] =
    useState(false);
  const [passedReadyForPickupCheckpoint, setPassedReadyForPickupCheckpoint] =
    useState(false);

  useLayoutEffect(() => {
    function updatePositions() {
      if (!order || !minTimeoutElapsed) return;

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
  }, [order, minTimeoutElapsed]);

  const [prevOrderStatus, setPrevOrderStatus] = useState<
    undefined | "orderPlaced" | "inProgress" | "readyForPickup"
  >();

  const [orderStatus, setOrderStatus] = useState<
    undefined | "orderPlaced" | "inProgress" | "readyForPickup"
  >();

  useEffect(() => {
    if (!order || !minTimeoutElapsed) return;

    if (order.orderCompletedAt && orderStatus !== "readyForPickup") {
      setPrevOrderStatus(orderStatus);
      setOrderStatus("readyForPickup");
      return;
    } else if (order.orderStartedAt && orderStatus !== "inProgress") {
      setPrevOrderStatus(orderStatus);
      setOrderStatus("inProgress");
      return;
    }

    if (orderStatus === "orderPlaced") return;
    setTimeout(() => {
      setOrderStatus("orderPlaced");
    }, 500); // allowing for undefined state/ui to render first, then quickly aligning w/ proper state
  }, [order, minTimeoutElapsed, orderStatus]);

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

  useLayoutEffect(() => {
    const progressBar = progressBarRef.current;

    if (!progressBar) return;

    const handleResize = () => {
      const container = containerRef.current;

      const orderPlacedAnchor = targetRefs.current[0];
      const inProgressAnchor = targetRefs.current[1];
      const readyForPickupAnchor = targetRefs.current[2];

      if (
        orderStatus === undefined ||
        !progressBar ||
        !container ||
        !orderPlacedAnchor ||
        !inProgressAnchor ||
        !readyForPickupAnchor
      )
        return;

      const transform = getComputedStyle(progressBar).width;
      const rawFloatWidthString = transform.slice(0, transform.length - 2);

      if (rawFloatWidthString) {
        const progressBarWidth = parseFloat(rawFloatWidthString);

        const orderPlacedCheckpointPosition =
          orderPlacedAnchor.getBoundingClientRect().left -
          container.getBoundingClientRect().left;
        const inProgressCheckpointPosition =
          inProgressAnchor.getBoundingClientRect().left -
          container.getBoundingClientRect().left;
        const readyForPickupCheckpointPosition =
          readyForPickupAnchor.getBoundingClientRect().left -
          container.getBoundingClientRect().left;

        if (progressBarWidth >= orderPlacedCheckpointPosition) {
          setPassedOrderPlacedCheckpoint(true);
        }

        if (progressBarWidth >= inProgressCheckpointPosition) {
          setPassedInProgressCheckpoint(true);
        }

        if (progressBarWidth >= readyForPickupCheckpointPosition) {
          setPassedReadyForPickupCheckpoint(true);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    resizeObserver.observe(progressBar);

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [orderStatus]);

  function getProgressBarWidth() {
    if (viewportLabel.includes("mobile")) {
      if (orderStatus === "orderPlaced") {
        return "25%";
      } else if (orderStatus === "inProgress") {
        return "58%";
      } else if (orderStatus === "readyForPickup") {
        return "100%";
      }

      return "0%";
    } else {
      if (orderStatus === "orderPlaced") {
        return "20%";
      } else if (orderStatus === "inProgress") {
        return "54%";
      } else if (orderStatus === "readyForPickup") {
        return "100%";
      }

      return "0%";
    }
  }

  function getProgressBarDuration() {
    if (orderStatus === "readyForPickup") {
      if (prevOrderStatus === "inProgress") {
        return "1s";
      } else if (prevOrderStatus === "orderPlaced") {
        return "2s";
      }
      return "3s";
    } else if (orderStatus === "inProgress") {
      if (prevOrderStatus === "orderPlaced") {
        return "1s";
      }
      return "2s";
    } else if (orderStatus === "orderPlaced") {
      return "1s";
    }

    return "1.5s"; // not sure about this default
  }

  return (
    <motion.div
      key={"tracking"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full p-4 tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      <Head>
        <title>Track your order | Khue&apos;s</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="Track your order | Khue's"></meta>
        <meta
          property="og:url"
          content={`www.khueskitchen.com/track?id=${typeof orderId === "string" ? orderId ?? "" : ""}`}
        />
        <meta property="og:type" content="website" />
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration = "manual"',
          }}
        />
      </Head>

      <div className="baseVertFlex mb-8 w-full gap-4 px-0 py-4 tablet:max-w-2xl tablet:p-8">
        <AnimatePresence mode="popLayout">
          {order && minTimeoutElapsed ? (
            <motion.div
              key={"trackingContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex size-full !justify-start gap-8 p-2 sm:p-4"
            >
              <div className="baseVertFlex w-full gap-2">
                {/* animated progress bar */}
                <div className="relative h-10 w-full overflow-hidden rounded-full border-2 border-primary shadow-md ">
                  <div
                    ref={containerRef}
                    className="baseFlex absolute left-0 top-0 size-full"
                  >
                    {/* progress bar */}
                    <div
                      ref={progressBarRef}
                      style={{
                        width: getProgressBarWidth(),
                        transition: `width ${getProgressBarDuration()} ease-out`,
                      }}
                      // will-change-auto if necessary
                      className="absolute left-0 top-0 h-full origin-left bg-primary "
                    ></div>

                    {/* orderPlaced checkpoint w/ animated checkmark */}
                    <div
                      ref={(el) => (targetRefs.current[0] = el)}
                      className="absolute left-[11%] top-1 z-10"
                    >
                      <Step
                        status={
                          passedOrderPlacedCheckpoint
                            ? "completed"
                            : "notStarted"
                        }
                      />
                    </div>

                    {/* inProgress checkpoint w/ animated checkmark */}
                    <div
                      ref={(el) => (targetRefs.current[1] = el)}
                      className="absolute left-[45%] top-1 z-10"
                    >
                      <Step
                        status={
                          passedInProgressCheckpoint
                            ? orderStatus === "readyForPickup"
                              ? "completed"
                              : "inProgress"
                            : "notStarted"
                        }
                      />
                    </div>

                    {/* readyForPickup checkpoint w/ animated checkmark */}
                    <div
                      ref={(el) => (targetRefs.current[2] = el)}
                      className="absolute left-[80%] top-1 z-10"
                    >
                      <Step
                        status={
                          passedReadyForPickupCheckpoint
                            ? "completed"
                            : "notStarted"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* floating checkpoint icons + labels */}
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
                        opacity: passedOrderPlacedCheckpoint ? 1 : 0.5,
                        transition: "opacity 0.2s ease-out",
                      }}
                      className="baseVertFlex gap-1"
                    >
                      <TfiReceipt
                        className={`h-6 w-6 text-primary ${
                          passedOrderPlacedCheckpoint ? "shake" : ""
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
                        opacity: passedInProgressCheckpoint ? 1 : 0.5,
                        transition: "opacity 0.2s ease-out",
                      }}
                      className="baseVertFlex gap-1"
                    >
                      <PiCookingPotBold
                        className={`h-6 w-6 text-primary  ${
                          passedInProgressCheckpoint ? "shake" : ""
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
                        opacity: passedReadyForPickupCheckpoint ? 1 : 0.5,
                        transition: "opacity 0.2s ease-out",
                      }}
                      className="baseVertFlex gap-1"
                    >
                      <LiaShoppingBagSolid
                        className={`h-6 w-6 text-primary ${
                          passedReadyForPickupCheckpoint ? "shake" : ""
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
                className="baseFlex h-6 w-full gap-4 overflow-x-hidden tablet:h-7"
              >
                <AnimatePresence mode="popLayout">
                  {orderStatus === "orderPlaced" &&
                    passedOrderPlacedCheckpoint && (
                      <motion.p
                        key={"orderPlacedText"}
                        initial={{ x: "75%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-75%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="font-medium tablet:text-lg"
                      >
                        Your order has been received
                      </motion.p>
                    )}

                  {orderStatus === "inProgress" &&
                    passedInProgressCheckpoint && (
                      <motion.p
                        key={"inProgressText"}
                        initial={{ x: "75%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-75%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="font-medium tablet:text-lg"
                      >
                        Your order is being prepared
                      </motion.p>
                    )}

                  {orderStatus === "readyForPickup" &&
                    passedReadyForPickupCheckpoint && (
                      <motion.p
                        key={"readyForPickupText"}
                        initial={{ x: "75%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-75%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="font-medium tablet:text-lg"
                      >
                        Your order is ready to be picked up!
                      </motion.p>
                    )}
                </AnimatePresence>
              </motion.div>

              <Separator className="w-full" />
              {/* rewards + pickup time + address */}
              <div className="baseVertFlex w-full gap-8">
                {/* mobile */}
                <div className="baseVertFlex w-full !items-start gap-2 tablet:hidden">
                  <div className="baseVertFlex !items-start gap-2 text-sm">
                    <p className="font-semibold underline underline-offset-2">
                      Pickup name
                    </p>
                    <p className="text-sm">
                      {order.firstName} {order.lastName}
                    </p>
                  </div>

                  <div className="baseVertFlex !items-start gap-2 text-sm">
                    <p className="font-semibold underline underline-offset-2">
                      Pickup time
                    </p>
                    <p className="text-sm">
                      {format(
                        toZonedTime(order.datetimeToPickup, "America/Chicago"),
                        "PPPp",
                      )}
                    </p>
                  </div>

                  <div className="baseVertFlex !items-start gap-2 text-sm">
                    <p className="font-semibold underline underline-offset-2">
                      Order #
                    </p>
                    <p className="text-sm">
                      {typeof orderId === "string"
                        ? getFirstSixNumbers(orderId)
                        : ""}
                    </p>
                  </div>

                  <p className="baseVertFlex !items-start gap-2 text-sm">
                    <p className="font-semibold underline underline-offset-2">
                      Address
                    </p>
                    <Button variant={"link"} className="h-4 !p-0">
                      1234 Lorem Ipsum Dr. Roseville, MN 12345
                    </Button>
                  </p>
                </div>

                {/* tablet+ */}
                <div className="baseVertFlex !hidden w-full !items-start gap-2 tablet:!flex">
                  <div className="baseFlex w-full !justify-between">
                    <div className="baseVertFlex !items-start gap-2 text-sm">
                      <p className="font-semibold underline underline-offset-2">
                        Pickup name
                      </p>
                      <p className="text-sm">
                        {order.firstName} {order.lastName}
                      </p>
                    </div>

                    <p className="baseVertFlex !items-start gap-2 text-sm tablet:!items-end">
                      <p className="font-semibold underline underline-offset-2">
                        Order #
                      </p>
                      <p className="text-sm">
                        {typeof orderId === "string"
                          ? getFirstSixNumbers(orderId)
                          : ""}
                      </p>
                    </p>
                  </div>

                  <div className="baseFlex w-full !justify-between">
                    <div className="baseVertFlex !items-start gap-2 text-sm">
                      <p className="font-semibold underline underline-offset-2">
                        Pickup time
                      </p>
                      <p className="text-sm">
                        {format(
                          toZonedTime(
                            order.datetimeToPickup,
                            "America/Chicago",
                          ),
                          "PPPp",
                        )}
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
                </div>

                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(to right bottom, oklch(0.9 0.13 87.8) 0%, oklch(0.75 0.13 87.8) 100%)",
                  }}
                  className="baseFlex relative w-full overflow-hidden rounded-md py-6 shadow-md"
                >
                  <motion.div
                    key={"rewardsHeroMobileImageOne"}
                    initial={{ opacity: 0, y: -125, x: -125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.5,
                    }}
                    className="absolute -left-10 -top-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageTwo"}
                    initial={{ opacity: 0, y: 125, x: -125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.75,
                    }}
                    className="absolute -bottom-10 -left-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>

                  <div className="baseVertFlex z-10 gap-4 rounded-md bg-offwhite p-4 text-primary shadow-lg tablet:px-8 tablet:py-4">
                    <div className="text-center text-lg font-semibold">
                      Khue&apos;s Rewards
                    </div>

                    <div className="baseFlex gap-4 font-bold tracking-wider">
                      <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary tablet:h-6" />
                      <div className="baseVertFlex">
                        <AnimatedNumbers
                          value={rewardsPointsEarned}
                          fontSize={viewportLabel.includes("mobile") ? 22 : 28}
                          padding={0}
                        />
                        <p className="font-semibold tracking-normal">points</p>
                      </div>
                      <SideAccentSwirls className="h-5 fill-primary tablet:h-6" />
                    </div>

                    <div className={`baseVertFlex w-full text-sm text-primary`}>
                      {isSignedIn ? (
                        <>
                          <div className="baseFlex gap-1">
                            You earned
                            <div className="font-bold">
                              <AnimatedNumbers
                                value={order.earnedRewardsPoints}
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
                          <SignInButton mode="modal">
                            <Button
                              variant={"rewards"}
                              onClick={() => {
                                localStorage.setItem(
                                  "khue's-orderIdToRedeem",
                                  order.id,
                                );
                              }}
                            >
                              Sign in
                            </Button>
                          </SignInButton>
                          to redeem your points for this order.
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    key={"rewardsHeroMobileImageThree"}
                    initial={{ opacity: 0, y: -125, x: 125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.95,
                    }}
                    className="absolute -right-10 -top-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageFour"}
                    initial={{ opacity: 0, y: 125, x: 125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.6,
                    }}
                    className="absolute -bottom-10 -right-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>
                </div>
              </div>
              <div className="baseFlex w-full max-w-[400px] sm:max-w-[500px]">
                <OrderSummary order={order} />
              </div>
              <Button
                variant={"underline"}
                className="text-primary"
                onClick={() => setChatIsOpen(true)}
              >
                Need assistance with your order?
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={"trackingLoading"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedLotus className="size-16 fill-primary tablet:size-24" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Track;

function Step({
  status,
}: {
  status: "notStarted" | "inProgress" | "completed";
}) {
  return (
    <motion.div animate={status} className="relative">
      <motion.div
        initial={false}
        variants={{
          notStarted: {
            backgroundColor: "#fffcf5", // offwhite
            borderColor: "#e5e5e5", // neutral-200
            color: "#a3a3a3", // neutral-400
          },
          inProgress: {
            backgroundColor: "#fffcf5", // offwhite
            borderColor: "#14522d", //  bg-primary
            color: "#14522d", //  bg-primary
          },
          completed: {
            backgroundColor: "#14522d", //  bg-primary
            borderColor: "#14522d", //  bg-primary
            color: "#14522d", //  bg-primary
          },
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex size-7 items-center justify-center rounded-full border-2 font-semibold"
      >
        <AnimatePresence mode="wait">
          {status === "completed" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="baseFlex"
            >
              <CheckIcon className="h-6 w-6 text-offwhite" />
            </motion.div>
          ) : status === "inProgress" ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative flex size-3"
            >
              <span
                style={{
                  animationDuration: "2.5s",
                }}
                className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"
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
