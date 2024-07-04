import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "hsl(144deg, 61%, 20%)",
          colorInputBackground: "hsl(40deg, 100%, 99%)",
          colorTextSecondary: "rgb(128, 128, 128)", // gray
          fontFamily: "'Noto Sans', sans-serif",
          borderRadius: "0.375rem",
          colorDanger: "#dc2626", // red-600
          colorSuccess: "#16a34a", // green-600
          colorInputText: "rgb(64, 64, 64)", // dark gray
          colorBackground: "hsl(40deg, 100%, 99%)",
          colorText: "rgb(64, 64, 64)", // dark gray
        },
      }}
      {...pageProps}
    >
      <DynamicHead currentPath={pathname} />
      {pathname === "/dashboard" ? (
        <Component {...pageProps} />
      ) : (
        <GeneralLayout>
          <Component {...pageProps} />
        </GeneralLayout>
      )}
    </ClerkProvider>
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
