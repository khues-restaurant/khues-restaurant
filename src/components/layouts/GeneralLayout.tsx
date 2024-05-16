import { AnimatePresence } from "framer-motion";
import { useRef, useEffect, type ReactNode } from "react";
import HeaderShell from "~/components/headers/HeaderShell";
import Footer from "~/components/Footer";
import PostSignUpDialog from "~/components/PostSignUpDialog";
import useKeepOrderDetailsValidated from "~/hooks/useKeepOrderDetailsValidated";
import useInitializeStoreDBQueries from "~/hooks/useInitializeStoreDBQueries";
import { Toaster } from "~/components/ui/toaster";
import Chat from "~/components/Chat";
import { useMainStore } from "~/stores/MainStore";
import useViewportLabelResizeListener from "~/hooks/useViewportLabelResizeListener";
import { useAuth } from "@clerk/nextjs";
import { api } from "~/utils/api";
import useGetUserId from "~/hooks/useGetUserId";
import useInitLocalStorage from "~/hooks/useInitLocalStorage";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  const { isLoaded, isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { initViewportLabelSet, setFooterIsInView } = useMainStore((state) => ({
    initViewportLabelSet: state.initViewportLabelSet,
    setFooterIsInView: state.setFooterIsInView,
  }));

  useViewportLabelResizeListener();

  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterIsInView(entry?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: "0px 0px 0px 0px",
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

  useInitLocalStorage();
  useKeepOrderDetailsValidated();
  useInitializeStoreDBQueries();

  if (
    initViewportLabelSet === false ||
    !isLoaded ||
    (isLoaded && isSignedIn && user === undefined)
  )
    return null;

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

        <SpeedInsights />
        <Analytics />
      </main>
    </>
  );
}

export default GeneralLayout;
