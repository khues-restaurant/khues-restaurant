import { SignInButton, useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { MdQuestionMark } from "react-icons/md";
import { PiCookingPotBold } from "react-icons/pi";
import { TfiReceipt } from "react-icons/tfi";
import { io } from "socket.io-client";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import OrderSummary from "~/components/cart/OrderSummary";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { env } from "~/env";
import useForceScrollToTopOnAsyncComponents from "~/hooks/useForceScrollToTopOnAsyncComponents";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getFirstSixNumbers } from "~/utils/formatters/getFirstSixNumbers";

import affogato from "/public/menuItems/affogato.png";
import grilledSirloin from "/public/menuItems/grilled-sirloin.png";
import roastPorkFriedRice from "/public/menuItems/roast-pork-fried-rice.png";
import thaiTeaTresLeches from "/public/menuItems/thai-tea-tres-leches.png";

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

  const orderPlacedTargetRef = useRef<HTMLDivElement | null>(null);
  const inProgressTargetRef = useRef<HTMLDivElement | null>(null);
  const readyForPickupTargetRef = useRef<HTMLDivElement | null>(null);

  const orderPlacedFloatingRef = useRef<HTMLDivElement | null>(null);
  const inProgressFloatingRef = useRef<HTMLDivElement | null>(null);
  const readyForPickupFloatingRef = useRef<HTMLDivElement | null>(null);

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

      const newPositions = [
        { target: orderPlacedTargetRef, floating: orderPlacedFloatingRef },
        { target: inProgressTargetRef, floating: inProgressFloatingRef },
        {
          target: readyForPickupTargetRef,
          floating: readyForPickupFloatingRef,
        },
      ].map(({ target, floating }) => {
        if (target.current && floating.current) {
          const targetRect = target.current.getBoundingClientRect();
          const floatingRect = floating.current.getBoundingClientRect();

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

    let timeout: NodeJS.Timeout | null = null;

    if (order.orderStartedAt === null && order.orderCompletedAt === null) {
      timeout = setTimeout(() => {
        if (orderStatus === "orderPlaced") return;
        setOrderStatus("orderPlaced");
      }, 500); // allowing for undefined state/ui to render first, then quickly aligning w/ proper state
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  });

  useEffect(() => {
    if (!order || !minTimeoutElapsed) return;

    if (order.orderCompletedAt && orderStatus !== "readyForPickup") {
      setPrevOrderStatus(orderStatus);
      setOrderStatus("readyForPickup");
      return;
    } else if (
      order.orderStartedAt &&
      order.orderCompletedAt === null &&
      orderStatus !== "inProgress" &&
      orderStatus !== "readyForPickup"
    ) {
      setPrevOrderStatus(orderStatus);
      setOrderStatus("inProgress");
      return;
    }
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
    }, 3000);

    setRewardsPointsTimerSet(true);
  }, [order, rewardsPointsTimerSet]);

  useLayoutEffect(() => {
    const progressBar = progressBarRef.current;

    if (!progressBar) return;

    const handleResize = () => {
      const container = containerRef.current;

      const orderPlacedAnchor = orderPlacedTargetRef.current;
      const inProgressAnchor = inProgressTargetRef.current;
      const readyForPickupAnchor = readyForPickupTargetRef.current;

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

  useForceScrollToTopOnAsyncComponents();

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

  if (order === null) {
    return (
      <motion.div
        key={"track"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        // TODO: find a way css wise so that you don't have any scrollbar on tablet+ since this is guarenteed
        // to be a tiny tiny element on this page
        className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full tablet:min-h-[calc(100dvh-6rem)]"
      >
        <div className="baseVertFlex relative max-w-80 gap-4 overflow-hidden rounded-lg border bg-gradient-to-br from-offwhite to-primary/10 px-6 py-8 shadow-md tablet:max-w-2xl tablet:p-12 tablet:pb-8">
          <>
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

            <MdQuestionMark className="mb-4 size-10" />

            <Separator />

            <div className="baseVertFlex gap-4 pb-6">
              <p className="text-center font-medium">
                We were unable to find your order.
              </p>

              <p className="text-center text-sm">
                If you think this is a mistake, please contact us.
              </p>

              <Button asChild>
                <Link href={"/"} className="baseFlex mt-2 gap-2 tablet:mt-4">
                  <SideAccentSwirls className="h-4 scale-x-[-1] fill-offwhite" />
                  Return home
                  <SideAccentSwirls className="h-4 fill-offwhite" />
                </Link>
              </Button>
            </div>
          </>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={"tracking"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full p-4 tablet:min-h-[calc(100dvh-6rem)]"
    >
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
                      ref={orderPlacedTargetRef}
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
                      ref={inProgressTargetRef}
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
                      ref={readyForPickupTargetRef}
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
                    ref={orderPlacedFloatingRef}
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
                    ref={inProgressFloatingRef}
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
                        className={`h-6 w-6 text-primary ${
                          passedInProgressCheckpoint ? "shake" : ""
                        }`}
                      />
                      <p className="text-primary">In progress</p>
                    </div>
                  </motion.div>

                  <motion.div
                    ref={readyForPickupFloatingRef}
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
                        className="whitespace-nowrap text-nowrap font-medium tablet:text-lg"
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
                        className="whitespace-nowrap text-nowrap font-medium tablet:text-lg"
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
                        className="whitespace-nowrap text-nowrap font-medium tablet:text-lg"
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

                  <div className="baseVertFlex !items-start gap-2 text-sm">
                    <p className="font-semibold underline underline-offset-2">
                      Address
                    </p>
                    <Button variant={"link"} className="h-4 !p-0" asChild>
                      <a
                        href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary"
                      >
                        693 Raymond Ave, St. Paul, MN 55114
                      </a>
                    </Button>
                  </div>
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

                    <div className="baseVertFlex !items-start gap-2 text-sm tablet:!items-end">
                      <p className="font-semibold underline underline-offset-2">
                        Order #
                      </p>
                      <p className="text-sm">
                        {typeof orderId === "string"
                          ? getFirstSixNumbers(orderId)
                          : ""}
                      </p>
                    </div>
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

                    <div className="baseVertFlex !items-start gap-2 text-sm tablet:!items-end">
                      <p className="font-semibold underline underline-offset-2">
                        Address
                      </p>
                      <Button variant={"link"} className="h-4 !p-0" asChild>
                        <a
                          href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary"
                        >
                          693 Raymond Ave, St. Paul, MN 55114
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="baseFlex relative w-full overflow-hidden rounded-md bg-rewardsGradient py-6 shadow-md">
                  <motion.div
                    key={"rewardsHeroMobileImageOne"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: -125,
                      x: -125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.5,
                    }}
                    className="absolute -left-8 -top-8"
                  >
                    <Image
                      src={grilledSirloin}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageTwo"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: 125,
                      x: -125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.75,
                    }}
                    className="absolute -bottom-8 -left-8"
                  >
                    <Image
                      src={roastPorkFriedRice}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
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
                          <div className="baseFlex gap-1 font-medium">
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
                              className="px-8"
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
                          <span className="font-medium">
                            to redeem your points for this order.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    key={"rewardsHeroMobileImageThree"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: -125,
                      x: 125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.95,
                    }}
                    className="absolute -right-8 -top-8"
                  >
                    <Image
                      src={affogato}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageFour"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: 125,
                      x: 125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.6,
                    }}
                    className="absolute -bottom-8 -right-8"
                  >
                    <Image
                      src={thaiTeaTresLeches}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div>
                </div>
              </div>
              <div className="baseFlex w-full max-w-[400px] sm:max-w-[450px]">
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
