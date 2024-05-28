import { AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
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
import useClearToastsOnRefocus from "~/hooks/useClearToastsOnRefocus";

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  const { isLoaded, isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { initViewportLabelSet } = useMainStore((state) => ({
    initViewportLabelSet: state.initViewportLabelSet,
  }));

  useViewportLabelResizeListener();

  useInitLocalStorage();
  useKeepOrderDetailsValidated();
  useInitializeStoreDBQueries();

  useClearToastsOnRefocus();

  if (
    initViewportLabelSet === false ||
    !isLoaded ||
    (isLoaded && isSignedIn && user === undefined)
  )
    return null;

  return (
    <>
      <main className="baseVertFlex bg-body relative min-h-dvh !justify-between">
        <HeaderShell />

        {/* still use mode="wait"? */}
        <AnimatePresence>{children}</AnimatePresence>

        <Chat />

        <Footer />

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
