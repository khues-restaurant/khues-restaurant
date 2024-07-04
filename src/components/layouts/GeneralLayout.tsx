import { useAuth } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Noto_Sans } from "next/font/google";
import { useEffect, useState, type ReactNode } from "react";
import Chat from "~/components/Chat";
import Footer from "~/components/Footer";
import HeaderShell from "~/components/headers/HeaderShell";
import PostSignUpDialog from "~/components/PostSignUpDialog";
import { Toaster } from "~/components/ui/toaster";
import useGetUserId from "~/hooks/useGetUserId";
import useInitializeStoreDBQueries from "~/hooks/useInitializeStoreDBQueries";
import useInitLocalStorage from "~/hooks/useInitLocalStorage";
import useKeepOrderDetailsValidated from "~/hooks/useKeepOrderDetailsValidated";
import useViewportLabelResizeListener from "~/hooks/useViewportLabelResizeListener";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";

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
      <style jsx global>{`
        html {
          font-family: ${notoSans.style.fontFamily};
        }
      `}</style>
      <main
        className={`baseVertFlex ${notoSans.className} relative min-h-dvh !justify-between bg-body`}
      >
        <HeaderShell />

        {children}

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
