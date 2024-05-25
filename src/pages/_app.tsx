import { type AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import { useRouter } from "next/router";
import DashboardLayout from "~/components/dashboard/DashboardLayout";
import { ParallaxProvider } from "react-scroll-parallax";
import { useEffect } from "react";

// might in some way mess with t3 bootstrapping, be wary
type ComponentWithPageLayout = AppProps & {
  Component: AppProps["Component"] & {
    PageLayout?: React.ComponentType;
  };
};

function MyApp({ Component, pageProps }: ComponentWithPageLayout) {
  const { asPath, events } = useRouter();

  // trying to fix weird mobile scroll issue when navigating between (maybe just
  // pages with nested layouts?) where the page would not scroll to the top when loaded
  // useEffect(() => {
  //   const handleRouteChange = () => {
  //     setTimeout(() => {
  //       console.log("hi");
  //       window.scrollTo(0, 0);
  //     }, 50);
  //   };

  //   events.on("routeChangeComplete", handleRouteChange);

  //   return () => {
  //     events.off("routeChangeComplete", handleRouteChange);
  //   };
  // }, [events]);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "hsl(144deg, 61%, 20%)",
          colorInputBackground: "hsl(40deg, 100%, 98%)",
          colorTextSecondary: "rgb(128, 128, 128)", // gray
          fontFamily: "'Noto Sans', sans-serif",
          borderRadius: "0.375rem",
          colorDanger: "#dc2626", // red-600
          colorSuccess: "#16a34a", // green-600
          colorInputText: "rgb(64, 64, 64)", // dark gray
          colorBackground: "hsl(40deg, 100%, 98%)",
          colorText: "rgb(64, 64, 64)", // dark gray
        },
      }}
      {...pageProps}
    >
      <ParallaxProvider scrollAxis="vertical">
        {asPath.includes("/dashboard") ? (
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        ) : (
          <GeneralLayout>
            {Component.PageLayout ? (
              // @ts-expect-error TODO: fix this type error later
              <Component.PageLayout>
                <Component {...pageProps} />
              </Component.PageLayout>
            ) : (
              <Component {...pageProps} />
            )}
          </GeneralLayout>
        )}
      </ParallaxProvider>
    </ClerkProvider>
  );
}

export default api.withTRPC(MyApp);
