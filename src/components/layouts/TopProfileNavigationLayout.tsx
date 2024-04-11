import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiGift } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useMainStore } from "~/stores/MainStore";
import { Separator } from "~/components/ui/separator";

interface Layout {
  children: ReactNode;
}

function TopProfileNavigationLayout({ children }: Layout) {
  const { isSignedIn } = useAuth();
  const { asPath } = useRouter();

  const { footerIsInView } = useMainStore((state) => ({
    footerIsInView: state.footerIsInView,
  }));

  const finalQueryOfUrl = useMemo(() => {
    if (asPath.includes("/rewards")) return "rewards";
    if (asPath.includes("/my-orders")) return "my-orders";
    if (asPath.includes("/preferences")) return "preferences";
    return "preferences";
  }, [asPath]);

  function getDynamicWidth() {
    if (!isSignedIn) return "w-full lg:w-[775px]";

    if (finalQueryOfUrl === "rewards") {
      return "w-full md:w-3/4";
    }

    return "w-full lg:w-[775px]";
  }

  return (
    <motion.div
      key={"topProfileNavigationLayout"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // 73 for bottom navbar, 50 for top navbar
      className="baseVertFlex relative mt-24 min-h-[calc(100dvh-6rem-73px)] w-full !justify-start tablet:mt-32 tablet:min-h-[calc(100dvh-8rem-50px)]"
    >
      <div className="baseFlex my-8 !hidden gap-4 rounded-lg border border-gray-400 bg-white p-1 tablet:!flex">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "ghost"
          }
          asChild
        >
          <Link href="/profile/preferences" className="baseFlex w-full gap-2">
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-gray-400" />

        <Button
          variant={asPath.includes("/profile/rewards") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/rewards" className="baseFlex w-full gap-2">
            <CiGift className="size-6" />
            Rewards
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-gray-400" />

        <Button
          variant={asPath.includes("/profile/my-orders") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/my-orders" className="baseFlex w-full gap-2">
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>

      <div
        className={`h-full tablet:mb-16 tablet:rounded-xl tablet:border tablet:shadow-md ${getDynamicWidth()}`}
      >
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </div>

      <div
        className={`baseFlex bottom-0 left-0 z-40 w-full gap-2 border-t border-gray-400 bg-gray-100 p-1 tablet:hidden ${footerIsInView ? "relative" : "fixed"}`}
      >
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/preferences"
            className="baseVertFlex h-16 w-full gap-2"
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-10 w-[1px] bg-gray-400" />

        <Button
          variant={
            asPath.includes("/profile/rewards") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/rewards"
            className="baseVertFlex h-16 w-full gap-2"
          >
            <CiGift className="size-5" />
            Rewards
          </Link>
        </Button>

        <Separator className="h-10 w-[1px] bg-gray-400" />

        <Button
          variant={
            asPath.includes("/profile/my-orders") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/my-orders"
            className="baseVertFlex h-16 w-full gap-2"
          >
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
export default TopProfileNavigationLayout;
