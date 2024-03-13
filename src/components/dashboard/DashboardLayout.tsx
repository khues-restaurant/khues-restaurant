import { AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode, useState } from "react";
import { socket } from "~/pages/_app";
import { Noto_Serif } from "next/font/google";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";
import { api } from "~/utils/api";
import {
  useMainStore,
  type OrderDetails,
  type StoreMenuItems,
} from "~/stores/MainStore";
import PostSignUpDialog from "~/components/PostSignUpDialog";
import DashboardHeaderShell from "~/components/dashboard/headers/DashboardHeaderShell";
import OrderManagement from "~/components/dashboard/OrderManagement";
import CustomerChats from "~/components/dashboard/CustomerChats";
import ItemManagement from "~/components/dashboard/ItemManagement";

const notoSerif = Noto_Serif({
  weight: ["400", "500", "600", "700"], // TODO: probably want to relook at these and only import ones we are using
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

interface DashboardLayout {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayout) {
  const { data: orders, refetch: refetchOrders } =
    api.order.getTodaysOrders.useQuery();
  // const { data: chats, refetch: refetchChats } = api.chats.getAll.useQuery();
  const { data: menuCategories, refetch: refetchItems } =
    api.menuCategory.getAll.useQuery();

  // mutations can go inside of the individual components

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

  // useEffect(() => {
  //   function handleNewOrder() {
  //     refetchOrders();
  //   }

  //   function handleNewChat() {
  //     refetchChats();
  //   }

  //   socket.on("newOrder", handleNewOrder);
  // socket.on("newChat", handleNewChat);

  //   return () => {
  //     socket.off("newOrder", handleNewOrder);
  //     socket.off("newChat", handleNewChat);
  //   };
  // }, []);

  return (
    <main
      className={`${notoSerif.className} baseVertFlex relative min-h-[100dvh] w-full !justify-between`}
    >
      <DashboardHeaderShell viewState={viewState} setViewState={setViewState} />

      <AnimatePresence>
        <>
          {viewState === "orderManagement" && orders && (
            <OrderManagement orders={orders} />
          )}

          {viewState === "customerChats" && <CustomerChats />}
          {viewState === "itemManagement" && menuCategories && (
            <ItemManagement menuCategories={menuCategories} />
          )}

          {/* TODO: reviews component */}
        </>
      </AnimatePresence>
    </main>
  );
}

export default DashboardLayout;
