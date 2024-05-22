import { AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import CustomerChats from "~/components/dashboard/CustomerChats";
import ItemManagement from "~/components/dashboard/ItemManagement";
import OrderManagement from "~/components/dashboard/OrderManagement";
import DashboardHeaderShell from "~/components/dashboard/headers/DashboardHeaderShell";
import { Toaster } from "~/components/ui/toaster";
import { useMainStore, type StoreMenuItems } from "~/stores/MainStore";
import { api } from "~/utils/api";

interface DashboardLayout {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayout) {
  const { data: orders, refetch: refetchOrders } =
    api.order.getTodaysOrders.useQuery();

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
    <main className="baseVertFlex relative min-h-[100dvh] w-full !justify-between">
      <DashboardHeaderShell viewState={viewState} setViewState={setViewState} />

      <AnimatePresence>
        <>
          {viewState === "orderManagement" && orders && (
            <OrderManagement orders={orders} />
          )}

          {viewState === "customerChats" && <CustomerChats />}
          {viewState === "itemManagement" &&
            menuCategories &&
            customizationCategories && (
              <ItemManagement
                menuCategories={menuCategories}
                customizationCategories={customizationCategories}
              />
            )}

          {/* TODO: reviews component */}
        </>
      </AnimatePresence>

      <Toaster />
    </main>
  );
}

export default DashboardLayout;
