import { type AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import { useRouter } from "next/router";
import DynamicHead from "~/components/DynamicHead";
import "~/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

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
