import { AnimatePresence, motion } from "framer-motion";
import { type AppProps } from "next/app";
import { useRouter } from "next/router";
import DynamicHead from "~/components/DynamicHead";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import "~/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  return (
    <>
      <DynamicHead currentPath={pathname} />
      <GeneralLayout>
        <div className="grid w-full min-w-0 grid-cols-1 grid-rows-1">
          <AnimatePresence initial={false} mode="sync">
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
