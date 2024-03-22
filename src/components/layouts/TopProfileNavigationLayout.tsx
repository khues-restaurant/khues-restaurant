import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useMemo, type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiErrorCircle } from "react-icons/bi";
import { CiGift } from "react-icons/ci";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";

interface Layout {
  children: ReactNode;
}

function TopProfileNavigationLayout({ children }: Layout) {
  const { userId, isLoaded } = useAuth();
  const { asPath, push } = useRouter();

  const finalQueryOfUrl = useMemo(() => {
    if (asPath.includes("/rewards")) return "rewards";
    if (asPath.includes("/my-orders")) return "my-orders";
    if (asPath.includes("/preferences")) return "preferences";
    return "preferences";
  }, [asPath]);

  const [tabValue, setTabValue] = useState<
    "preferences" | "rewards" | "my-orders"
  >(finalQueryOfUrl);

  function getDynamicWidth() {
    if (finalQueryOfUrl === "preferences") {
      return "w-11/12 lg:w-[775px]";
    }

    return "w-11/12 md:w-3/4";
  }

  // why not utilize getServerSideProps on these two instead of waiting for whole
  // page jsx to load?
  if (!isLoaded) {
    return null;
  }

  if (!userId) {
    return <UserIsNotAuthenticated />;
  }

  return (
    <motion.div
      key={"topProfileNavigationLayout"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex w-full"
    >
      <Tabs
        defaultValue={finalQueryOfUrl}
        value={tabValue}
        onValueChange={(value) => {
          setTabValue(value as "preferences" | "rewards" | "my-orders");
          void push(`/profile/${value}`);
        }}
        className="baseVertFlex relative my-36 mb-24 w-full tablet:mt-48"
      >
        <TabsList className="z-40 grid h-min w-11/12 grid-cols-3 gap-2 tablet:h-10 tablet:w-[500px]">
          <TabsTrigger
            value="preferences"
            className="baseVertFlex w-full gap-2 tablet:!flex-row"
            onClick={() => {
              void push(`/profile/preferences`);
            }}
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="baseVertFlex w-full gap-2 tablet:!flex-row"
            onClick={() => {
              void push(`/profile/rewards`);
            }}
          >
            <CiGift className="size-5" />
            Rewards
          </TabsTrigger>
          <TabsTrigger
            value="my-orders"
            className="baseVertFlex w-full gap-2 tablet:!flex-row"
            onClick={() => {
              void push(`/profile/my-orders`);
            }}
          >
            <TfiReceipt className="size-5" />
            My orders
          </TabsTrigger>
        </TabsList>
        <div
          className={`mt-8 min-h-[100dvh] rounded-xl border shadow-md ${getDynamicWidth()}`}
        >
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </Tabs>
    </motion.div>
  );
}
export default TopProfileNavigationLayout;

function UserIsNotAuthenticated() {
  return (
    <div className="baseVertFlex w-10/12 gap-4 rounded-md p-4 md:w-[550px]">
      <div className="baseFlex gap-2">
        <BiErrorCircle className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Access denied</h1>
      </div>
      <p className="text-center text-lg">
        You must be logged in to view this page.
      </p>
    </div>
  );
}
