import { AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode, useState } from "react";
import { socket } from "~/pages/_app";
import { EB_Garamond } from "next/font/google";
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

const ebGaramond = EB_Garamond({
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

  // useEffect(() => {
  //   function handleNewOrder() {
  //     refetchOrders();
  //   }

  //   function handleNewChat() {
  //     refetchChats();
  //   }

  //   socket.on("newOrder", handleNewOrder);
  //   socket.on("newChat", handleNewChat);

  //   return () => {
  //     socket.off("newOrder", handleNewOrder);
  //     socket.off("newChat", handleNewChat);
  //   };
  // }, []);

  return (
    <main
      className={`${ebGaramond.className} baseVertFlex relative min-h-[100dvh] w-full !justify-between`}
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
        </>
      </AnimatePresence>
    </main>
  );
}

export default DashboardLayout;
