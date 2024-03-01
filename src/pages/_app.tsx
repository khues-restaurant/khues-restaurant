import { type AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { io } from "socket.io-client";

import "~/styles/globals.css";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import { useRouter } from "next/router";
import DashboardLayout from "~/components/dashboard/DashboardLayout";

export const socket = io({
  path: "/api/socket",
});

// might in some way mess with t3 bootstrapping, be wary
type ComponentWithPageLayout = AppProps & {
  Component: AppProps["Component"] & {
    PageLayout?: React.ComponentType;
  };
};

function MyApp({ Component, pageProps }: ComponentWithPageLayout) {
  const { asPath } = useRouter();

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "rgb(0, 92, 0)",
          colorInputBackground: "rgb(255, 255, 255)",
          colorTextSecondary: "rgb(0, 41, 0)",
          fontFamily: "'Montserrat', sans-serif",
          borderRadius: "0.375rem",
          colorDanger: "rgb(220, 38, 38)",
          colorSuccess: "rgb(184, 255, 184)",
          colorInputText: "rgb(0, 71, 0)",
          colorBackground: "rgb(255, 255, 255)",
          colorText: "rgb(0, 71, 0)",
        },
      }}
      {...pageProps}
    >
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
    </ClerkProvider>
  );
}

export default api.withTRPC(MyApp);
