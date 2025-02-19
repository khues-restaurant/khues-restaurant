import { type AppProps } from "next/app";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DynamicHead from "~/components/DynamicHead";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const UnsupportedBrowserDetected = dynamic(
  () => import("~/components/UnsupportedBrowserDetected"),
);

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  const [isLookBehindSupported, setIsLookBehindSupported] = useState(true);

  useEffect(() => {
    const support = checkLookBehindSupport();
    setIsLookBehindSupported(support);
  }, []);

  if (!isLookBehindSupported) {
    return <UnsupportedBrowserDetected />;
  }

  return (
    <>
      <DynamicHead currentPath={pathname} />
      <GeneralLayout>
        <Component {...pageProps} />
      </GeneralLayout>
    </>
  );
}

export default api.withTRPC(MyApp);

function checkLookBehindSupport() {
  try {
    new RegExp("(?<=)");
    return true;
  } catch (err) {
    return false;
  }
}
