import { AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import { Noto_Serif } from "next/font/google";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";
import PostSignUpDialog from "~/components/PostSignUpDialog";
import useHandleLocalStorage from "~/hooks/useHandleLocalStorage";
import useKeepOrderDetailsValidated from "~/hooks/useKeepOrderDetailsValidated";
import useAttachSocketListeners from "~/hooks/useAttachSocketListeners";
import { Toaster } from "~/components/ui/toaster";

const notoSerif = Noto_Serif({
  weight: ["400", "500", "600", "700"], // TODO: probably want to relook at these and only import ones we are using
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  useHandleLocalStorage();
  useKeepOrderDetailsValidated();
  useAttachSocketListeners();

  return (
    <main
      className={`${notoSerif.className} baseVertFlex relative min-h-[100dvh] !justify-between`}
    >
      <HeaderShell />

      {/* still use mode="wait"? */}
      <AnimatePresence>{children}</AnimatePresence>

      <Footer />

      <PostSignUpDialog />

      <Toaster />
    </main>
  );
}

export default GeneralLayout;
