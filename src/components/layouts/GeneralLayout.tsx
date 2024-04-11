import { AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";
import PostSignUpDialog from "~/components/PostSignUpDialog";
import useHandleLocalStorage from "~/hooks/useHandleLocalStorage";
import useKeepOrderDetailsValidated from "~/hooks/useKeepOrderDetailsValidated";
import useAttachSocketListeners from "~/hooks/useAttachSocketListeners";
import { Toaster } from "~/components/ui/toaster";

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  useHandleLocalStorage();
  useKeepOrderDetailsValidated();
  useAttachSocketListeners();

  return (
    <>
      <main className="baseVertFlex relative min-h-dvh !justify-between">
        <HeaderShell />

        {/* still use mode="wait"? */}
        <AnimatePresence>{children}</AnimatePresence>

        <Footer />

        {/* if you want, extract a bit of the logic within here to this component so you can just wholly
            conditionally render this component */}
        <PostSignUpDialog />

        <Toaster />
      </main>
    </>
  );
}

export default GeneralLayout;
