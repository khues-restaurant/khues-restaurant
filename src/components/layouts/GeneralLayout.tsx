import { AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
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
import { Noto_Sans } from "next/font/google";

import useClearToastsOnRefocus from "~/hooks/useClearToastsOnRefocus";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  const { isLoaded, isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { initViewportLabelSet } = useMainStore((state) => ({
    initViewportLabelSet: state.initViewportLabelSet,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { data: userExists } = api.user.isUserRegistered.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const [shouldRenderPostSignUpDialog, setShouldRenderPostSignUpDialog] =
    useState(false);

  useEffect(() => {
    // if user is signed in and user does not exist, show post sign up dialog
    if (
      userId &&
      isSignedIn &&
      userExists !== undefined &&
      userExists === false
    ) {
      setShouldRenderPostSignUpDialog(true);
    }
  }, [isSignedIn, userExists, userId]);

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
      <main
        style={{
          fontFamily: notoSans.style.fontFamily,
        }}
        className={`baseVertFlex ${notoSans.className} relative min-h-dvh !justify-between bg-body`}
      >
        <HeaderShell />

        <AnimatePresence>{children}</AnimatePresence>

        <Chat />

        <Footer />

        {shouldRenderPostSignUpDialog && (
          <PostSignUpDialog
            setShouldRenderPostSignUpDialog={setShouldRenderPostSignUpDialog}
          />
        )}

        <Toaster />

        <SpeedInsights />
        <Analytics />
      </main>
    </>
  );
}

export default GeneralLayout;
