import { AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import CustomerChats from "~/components/dashboard/CustomerChats";
import ItemManagement from "~/components/dashboard/ItemManagement";
import OrderManagement from "~/components/dashboard/OrderManagement";
import DashboardHeaderShell from "~/components/dashboard/headers/DashboardHeaderShell";
import { Toaster } from "~/components/ui/toaster";
import useClearToastsOnRefocus from "~/hooks/useClearToastsOnRefocus";
import { useMainStore, type StoreMenuItems } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { io } from "socket.io-client";
import { env } from "~/env";
import { Noto_Sans } from "next/font/google";
import Stats from "~/components/dashboard/Stats";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

const socket = io(env.NEXT_PUBLIC_SOCKET_IO_URL, {
  query: {
    userId: "dashboard",
  },
  secure: env.NEXT_PUBLIC_SOCKET_IO_URL.includes("https") ? true : false,
  retries: 3,
});

interface Dashboard {
  children: ReactNode;
}

function Dashboard({ children }: Dashboard) {
  const { data: orders, refetch: refetchOrders } =
    api.order.getDashboardOrders.useQuery();

  // const { data: chats, refetch: refetchChats } = api.chats.getAll.useQuery();

  const { data: menuCategories, refetch: refetchItems } =
    api.menuCategory.getAll.useQuery({
      onlyOnlineOrderable: true,
    });

  const { data: customizationCategories, refetch: refetchCustomizations } =
    api.customizationCategory.getAll.useQuery();

  const [viewState, setViewState] = useState<
    "orderManagement" | "customerChats" | "itemManagement" | "stats"
  >("orderManagement");

  const {
    setOrderDetails,
    setMenuItems,
    customizationChoices,
    setCustomizationChoices,
    discounts,
    setDiscounts,
  } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
    setMenuItems: state.setMenuItems,
    customizationChoices: state.customizationChoices,
    setCustomizationChoices: state.setCustomizationChoices,
    discounts: state.discounts,
    setDiscounts: state.setDiscounts,
  }));

  const { data: databaseCustomizationChoices } =
    api.customizationChoice.getAll.useQuery();
  const { data: databaseDiscounts } = api.discount.getAll.useQuery();

  useClearToastsOnRefocus();

  useEffect(() => {
    if (
      (Object.keys(customizationChoices).length !== 0 &&
        Object.keys(discounts).length !== 0) ||
      !databaseCustomizationChoices ||
      !databaseDiscounts
    )
      return;

    setCustomizationChoices(databaseCustomizationChoices);

    setDiscounts(databaseDiscounts);
  }, [
    customizationChoices,
    setCustomizationChoices,
    discounts,
    setDiscounts,
    databaseCustomizationChoices,
    databaseDiscounts,
  ]);

  useEffect(() => {
    if (!menuCategories) return;

    const menuItems = menuCategories.flatMap((category) => category.menuItems);

    const menuItemsObject = menuItems.reduce((acc, menuItem) => {
      acc[menuItem.name] = menuItem;
      return acc;
    }, {} as StoreMenuItems);

    setMenuItems(menuItemsObject);
  }, [menuCategories, setMenuItems]);

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${notoSans.style.fontFamily};
        }
      `}</style>
      <main
        className={`baseVertFlex ${notoSans.className} relative min-h-[100dvh] w-full !justify-between bg-body`}
      >
        <DashboardHeaderShell
          viewState={viewState}
          setViewState={setViewState}
          socket={socket}
        />

        <AnimatePresence>
          <>
            {viewState === "orderManagement" && orders && (
              <OrderManagement orders={orders} socket={socket} />
            )}

            {viewState === "customerChats" && <CustomerChats socket={socket} />}

            {viewState === "itemManagement" &&
              menuCategories &&
              customizationCategories && (
                <ItemManagement
                  menuCategories={menuCategories}
                  customizationCategories={customizationCategories}
                />
              )}

            {viewState === "stats" && <Stats />}

            {/* TODO: reviews component */}
          </>
        </AnimatePresence>

        <Toaster />
      </main>
    </>
  );
}

export default Dashboard;
