import { AnimatePresence } from "framer-motion";
import { useRef, useEffect, type ReactNode } from "react";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";
import PostSignUpDialog from "~/components/PostSignUpDialog";
import useHandleLocalStorage from "~/hooks/useHandleLocalStorage";
import useKeepOrderDetailsValidated from "~/hooks/useKeepOrderDetailsValidated";
import useAttachSocketListeners from "~/hooks/useAttachSocketListeners";
import { Toaster } from "~/components/ui/toaster";
import Chat from "~/components/Chat";
import { useMainStore } from "~/stores/MainStore";

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  const { setFooterIsInView } = useMainStore((state) => ({
    footerIsInView: state.footerIsInView,
    setFooterIsInView: state.setFooterIsInView,
  }));

  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterIsInView(entry?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: "81px 0px 0px 0px",
        threshold: 0,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    // to abide by eslint rule
    const localSentinelRef = sentinelRef.current;

    return () => {
      if (localSentinelRef) {
        observer.unobserve(localSentinelRef);
      }

      setFooterIsInView(false);
    };
  }, [setFooterIsInView]);

  useHandleLocalStorage();
  useKeepOrderDetailsValidated();
  useAttachSocketListeners();

  return (
    <>
      <main className="baseVertFlex relative min-h-dvh !justify-between">
        <HeaderShell />

        {/* still use mode="wait"? */}
        <AnimatePresence>{children}</AnimatePresence>

        {/* need to have both this and the top profile nav one because otherwise you would have the
            1px of whitespace (due to this) between mobile fixed bottom nav and footer */}
        <div ref={sentinelRef} style={{ height: "1px" }}></div>

        <Footer />

        <Chat />

        {/* if you want, extract a bit of the logic within here to this component so you can just wholly
            conditionally render this component */}
        <PostSignUpDialog />

        <Toaster />
      </main>
    </>
  );
}

export default GeneralLayout;
