import { AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
// import Footer from "../Footer/Footer";
// import GeneralLayoutStatefulShell from "./GeneralLayoutStatefulShell";
import { EB_Garamond } from "next/font/google";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";

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
  return (
    <main
      className={`${ebGaramond.className} baseVertFlex relative min-h-[100dvh] !justify-between`}
    >
      {/* <GeneralLayoutStatefulShell /> */}
      <HeaderShell />

      {/* still use mode="wait"? */}
      <AnimatePresence mode="wait">{children}</AnimatePresence>

      <Footer />
    </main>
  );
}

export default GeneralLayout;
