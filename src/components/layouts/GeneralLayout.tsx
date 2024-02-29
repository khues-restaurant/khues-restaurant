import { AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode } from "react";
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

const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600", "700"], // TODO: probably want to relook at these and only import ones we are using
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  const { setOrderDetails, setMenuItems } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
    setMenuItems: state.setMenuItems,
  }));

  const { data: menuCategories } = api.menuCategory.getAll.useQuery();

  useEffect(() => {
    if (!menuCategories) return;

    const menuItems = menuCategories.flatMap((category) => category.menuItems);

    const menuItemsObject = menuItems.reduce((acc, menuItem) => {
      acc[menuItem.name] = menuItem;
      return acc;
    }, {} as StoreMenuItems);

    setMenuItems(menuItemsObject);
  }, [menuCategories, setMenuItems]);

  useEffect(() => {
    const localStorageOrder = localStorage.getItem("khue's-orderDetails");

    if (!localStorageOrder) return;

    const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

    parsedOrder.dateToPickUp = new Date(parsedOrder.dateToPickUp);
    // TODO: this should be moved/consolidated into one massive localstorage handler hook I think.

    setOrderDetails(parsedOrder);
  }, [setOrderDetails]);

  return (
    <main
      className={`${ebGaramond.className} baseVertFlex relative min-h-[100dvh] !justify-between`}
    >
      <HeaderShell />

      {/* still use mode="wait"? */}
      <AnimatePresence>{children}</AnimatePresence>

      <Footer />

      <PostSignUpDialog />
    </main>
  );
}

export default GeneralLayout;
