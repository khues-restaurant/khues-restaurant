import { AnimatePresence, motion } from "framer-motion";
import { type AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import DynamicHead from "~/components/DynamicHead";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import "~/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { asPath, events, pathname } = router;
  const currentPathRef = useRef(asPath);
  const isHistoryNavigationRef = useRef(false);
  const pendingScrollTargetRef = useRef(0);
  const scrollPositionsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    currentPathRef.current = asPath;
    scrollPositionsRef.current[asPath] = window.scrollY;
  }, [asPath]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    router.beforePopState(() => {
      isHistoryNavigationRef.current = true;
      return true;
    });

    const handleRouteChangeStart = (nextUrl: string) => {
      scrollPositionsRef.current[currentPathRef.current] = window.scrollY;
      pendingScrollTargetRef.current = isHistoryNavigationRef.current
        ? (scrollPositionsRef.current[nextUrl] ?? 0)
        : 0;
      isHistoryNavigationRef.current = false;
    };

    const handleRouteChangeError = () => {
      pendingScrollTargetRef.current = window.scrollY;
      isHistoryNavigationRef.current = false;
    };

    events.on("routeChangeStart", handleRouteChangeStart);
    events.on("routeChangeError", handleRouteChangeError);

    return () => {
      events.off("routeChangeStart", handleRouteChangeStart);
      events.off("routeChangeError", handleRouteChangeError);
      router.beforePopState(() => true);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [events, router]);

  return (
    <>
      <DynamicHead currentPath={pathname} />
      <GeneralLayout>
        <div className="grid w-full min-w-0 grid-cols-1 grid-rows-1">
          <AnimatePresence
            mode="wait"
            onExitComplete={() => {
              window.scrollTo({ left: 0, top: pendingScrollTargetRef.current });
            }}
          >
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full min-w-0 [grid-area:1/1]"
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </div>
      </GeneralLayout>
    </>
  );
}

export default MyApp;
