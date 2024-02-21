import { AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { EB_Garamond } from "next/font/google";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";
import { type OrderDetails, useMainStore } from "~/stores/MainStore";
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
  const { setOrderDetails } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
  }));

  useEffect(() => {
    const localStorageOrder = localStorage.getItem("khue's-orderDetails");

    if (!localStorageOrder) return;

    const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

    setOrderDetails(parsedOrder);
  }, [setOrderDetails]);

  return (
    <main
      className={`${ebGaramond.className} baseVertFlex relative min-h-[100dvh] !justify-between`}
    >
      <HeaderShell />

      {/* still use mode="wait"? */}
      <AnimatePresence mode="wait">{children}</AnimatePresence>

      <Footer />

      <PostSignUpDialog />
    </main>
  );
}

export default GeneralLayout;
