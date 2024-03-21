import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiTimer } from "react-icons/bi";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
import RevealFromTop from "~/components/ui/RevealFromTop";
import { Button } from "~/components/ui/button";
import { TabsContent } from "~/components/ui/tabs";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";

function Rewards() {
  const userId = useGetUserId();
  const { data: user } = api.user.get.useQuery(userId, {
    enabled: !!userId,
  });

  const { data: activeDiscounts } = api.discount.getAll.useQuery();
  const { data: activeRewards } = api.discount.getUserRewards.useQuery(userId);

  const [isMobileViewport, setIsMobileViewport] = useState(true);

  // TODO: was there an issue with useGetViewportLabel()?
  useEffect(() => {
    function handleResize() {
      setIsMobileViewport(window.innerWidth < 1000 || window.innerHeight < 700);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  });

  const radius = isMobileViewport ? 20 : 25;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const gapLength = 30;

  const [rewardsPointsEarned, setRewardsPointsEarned] = useState(0);
  const [offset, setOffset] = useState(0);

  const [rewardsPointsTimerSet, setRewardsPointsTimerSet] = useState(false);

  useEffect(() => {
    if (!user || rewardsPointsTimerSet) return;

    setTimeout(() => {
      if (user) {
        setRewardsPointsEarned(user.rewardsPoints);
        setOffset(circumference - circumference * (user.rewardsPoints / 1500));
      }
    }, 1500);

    setRewardsPointsTimerSet(true);
  }, [user, rewardsPointsTimerSet, circumference]);

  return (
    <motion.div
      key={"profile-rewards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative w-full"
    >
      <TabsContent value="rewards">
        <div className="baseVertFlex relative mt-4 w-full p-4 transition-all tablet:my-8 tablet:p-8">
          <div className="rewardsGoldBorder baseVertFlex relative w-full rounded-md shadow-md tablet:max-w-2xl">
            <svg
              viewBox={isMobileViewport ? "-7 0 50 1" : "-12 -5 60 1"}
              className="size-40 tablet:size-64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="myGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{
                      stopColor: "rgb(255 217 114)",
                      stopOpacity: "1",
                    }}
                  />
                  <stop
                    offset="100%"
                    style={{
                      stopColor: "rgb(212, 175, 55)",
                      stopOpacity: "1",
                    }}
                  />
                </linearGradient>
              </defs>

              <path
                className="circle-bg"
                d={`M ${(36 - gapLength) / 2},18 a ${radius},${radius} 0 1,1 ${gapLength},0`}
                fill="none"
                stroke="url(#myGradient)"
                strokeWidth={9}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeLinecap="round"
              />

              <path
                className="circle-bg"
                d={`M ${(36 - gapLength) / 2},18 a ${radius},${radius} 0 1,1 ${gapLength},0`}
                fill="none"
                stroke="#fff"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeLinecap="round"
              />

              <motion.path
                className="size-40 tablet:size-64"
                d={`M ${(36 - gapLength) / 2},18 a ${radius},${radius} 0 1,1 ${gapLength},0`}
                fill="none"
                stroke="url(#myGradient)" // Reference to our gradient
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: offset,
                  // Add any conditional animation logic here
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                strokeDasharray={`${circumference} ${circumference}`}
              />
            </svg>

            <div className="baseVertFlex absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 font-bold text-yellow-500 tablet:top-[38%]">
              <AnimatedNumbers
                value={rewardsPointsEarned}
                fontSize={isMobileViewport ? 25 : 48}
                padding={0}
              />
              points
            </div>

            <WideFancySwirls />

            <RevealFromTop
              initialDelay={6}
              className={`baseVertFlex w-full text-yellow-500 ${isMobileViewport ? "text-sm" : ""} `}
            >
              {/* TODO: fix this css */}
              <div className="w-64 text-center">
                <span className="text-center">You are</span>{" "}
                <div className="inline-block text-center font-bold">
                  <AnimatedNumbers
                    value={1500 - rewardsPointsEarned}
                    fontSize={isMobileViewport ? 14 : 16}
                    padding={0}
                  />
                </div>{" "}
                <span className="text-center">
                  points away from your next free meal!
                </span>
              </div>
            </RevealFromTop>
          </div>

          {/* TODO: keep this part below? */}
          <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-yellow-500">
            <p className="text-2xl font-medium underline underline-offset-2">
              -.- Member benefits -.-
            </p>

            <div className="baseVertFlex gap-8 tablet:!flex-row">
              <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[325px] tablet:w-full tablet:justify-start">
                <div className="baseFlex h-24 w-full">
                  <CiGift className="size-24 text-yellow-500" />
                </div>
                <div className="border-t border-yellow-500 p-4 text-center">
                  Earning rewards is as simple as savoring your favorite meals!
                  For every dollar spent, you earn points that accumulate
                  towards delicious rewards. Reach 1500 points, and enjoy a meal
                  on us — it&apos;s our way of saying &lsquo;Thank you&rsquo;
                  for making us a part of your dining journey.
                </div>
              </div>

              <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[325px] tablet:w-full tablet:justify-start">
                <div className="baseFlex h-24 w-full">
                  <FaCakeCandles className="size-16 text-yellow-500" />
                </div>
                <div className="border-t border-yellow-500 p-4 text-center">
                  Make your special day unforgettable with a complimentary
                  birthday treat from us. It&apos;s our way of wishing you joy
                  and deliciousness on your birthday. Just be sure to let us
                  know when your big day is when you sign up!
                </div>
              </div>

              <div className="rewardsGoldBorder baseVertFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:h-[325px] tablet:w-full tablet:justify-start">
                <BiTimer className="size-24 text-yellow-500" />
                <div className="border-t border-yellow-500 p-4 text-center">
                  Access special deals that make every visit a little more
                  special. From 10% off your favorite appetizers to exclusive
                  access to items before they arrive on the menu, there&apos;s
                  always something to look forward to. Keep an eye out for our
                  emails or check back here for the latest deals!
                </div>
              </div>
            </div>
          </div>

          {/* .map() of Member discount(s) */}
          {/* the exact image shown might need to be hardcoded... just because like
              if it's 10% off appetizers then yeah you could show a specific appetizer, but idk seems flaky */}
          {/* then just name of discount with expiration date next to it, and description below it */}
          {activeDiscounts && Object.values(activeDiscounts).length > 0 ? (
            <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-yellow-500">
              <p className="text-2xl font-medium underline underline-offset-2">
                -.- Member discounts -.-
              </p>
              {Object.values(activeDiscounts).map((discount) => (
                <div
                  key={discount.id}
                  className="rewardsGoldBorder baseFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:w-full tablet:justify-start"
                >
                  <div className="baseVertFlex w-full gap-4 tablet:!flex-row">
                    <div className="imageFiller size-24 rounded-md shadow-md"></div>
                    <div className="baseVertFlex !items-start border-t border-yellow-500 p-4 text-center tablet:border-l tablet:border-t-0">
                      <p className="font-bold">{discount.name}</p>

                      <p className="text-start">{discount.description}</p>
                      {/* TODO: have this be a countdown maybe? */}
                      <p className="mt-2 text-sm">
                        Expires on {format(discount.expirationDate, "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="baseVertFlex gap-4">
              <p>No active discounts at the moment.</p>
            </div>
          )}

          {/* .map() of Your rewards */}
          <div className="baseVertFlex mt-8 max-w-7xl gap-8 text-yellow-500">
            <p className="text-2xl font-medium underline underline-offset-2">
              -.- Your rewards -.-
            </p>
            {activeRewards && Object.values(activeRewards).length > 1 ? (
              <>
                {Object.values(activeRewards).map((reward) => (
                  <div
                    key={reward.id}
                    className="rewardsGoldBorder baseFlex m-4 gap-2 rounded-md shadow-md tablet:m-0 tablet:w-full tablet:justify-start"
                  >
                    <div className="baseVertFlex w-full tablet:!flex-row">
                      {reward.name.includes("Points") ? (
                        <CiGift className="size-24 text-yellow-500" />
                      ) : (
                        <FaCakeCandles className="size-16 text-yellow-500" />
                      )}
                      <div className="baseVertFlex !items-start border-t border-yellow-500 p-4 text-center tablet:border-l tablet:border-t-0">
                        <p className="font-bold">{reward.name}</p>

                        <p className="text-start">{reward.description}</p>
                        {/* TODO: have this be a countdown maybe? */}
                        <p className="mt-2 text-sm">
                          Expires on {format(reward.expirationDate, "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="baseFlex gap-2">
                  <Button asChild>
                    <Link href="/order-now">Order now</Link>
                  </Button>
                  to redeem your reward!
                </div>
              </>
            ) : (
              <p className="baseFlex gap-1">
                You are{" "}
                {
                  <AnimatedNumbers
                    value={1500 - rewardsPointsEarned}
                    fontSize={16}
                    padding={0}
                  />
                }{" "}
                points away from your next reward.
              </p>
            )}
          </div>
        </div>
      </TabsContent>
    </motion.div>
  );
}

Rewards.PageLayout = TopProfileNavigationLayout;

export default Rewards;
