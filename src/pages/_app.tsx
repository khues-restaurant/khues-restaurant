import { ClerkProvider } from "@clerk/nextjs";
import { type AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DynamicHead from "~/components/DynamicHead";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import "~/styles/globals.css";
import { api } from "~/utils/api";
import { Noto_Sans } from "next/font/google";
const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

const UnsupportedBrowserDetected = dynamic(
  () => import("~/components/UnsupportedBrowserDetected"),
);

function MyApp({ Component, pageProps }: AppProps) {
  // const { pathname } = useRouter();

  // const [isLookBehindSupported, setIsLookBehindSupported] = useState(true);

  // useEffect(() => {
  //   const support = checkLookBehindSupport();
  //   setIsLookBehindSupported(support);
  // }, []);

  // if (!isLookBehindSupported) {
  //   return <UnsupportedBrowserDetected />;
  // }

  // <ClerkProvider
  //   publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  //   appearance={{
  //     variables: {
  //       colorPrimary: "hsl(144deg, 61%, 20%)",
  //       colorInputBackground: "hsl(40deg, 100%, 99%)",
  //       colorTextSecondary: "rgb(128, 128, 128)", // gray
  //       fontFamily: "'Noto Sans', sans-serif",
  //       borderRadius: "0.375rem",
  //       colorDanger: "#dc2626", // red-600
  //       colorSuccess: "#16a34a", // green-600
  //       colorInputText: "rgb(64, 64, 64)", // dark gray
  //       colorBackground: "hsl(40deg, 100%, 99%)",
  //       colorText: "rgb(64, 64, 64)", // dark gray
  //     },
  //   }}
  //   {...pageProps}
  // >

  //   <DynamicHead currentPath={pathname} />
  //   {pathname === "/dashboard" ? (
  //     <Component {...pageProps} />
  //   ) : (
  //     <GeneralLayout>
  //       <Component {...pageProps} />
  //     </GeneralLayout>
  //   )}
  // </ClerkProvider>
  return (
    <>
      <Head>
        <title>Khue&apos;s</title>

        <meta
          name="description"
          content={
            "Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
          }
        />
        <meta property="og:title" content={"Khue's"}></meta>
        <meta property="og:url" content={"https://www.khueskitchen.com"} />
        <meta name="twitter:title" content={"Khue's"} />
        <meta
          property="og:description"
          content={
            "Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
          }
        />
        <meta
          name="twitter:description"
          content={
            "Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
          }
        />

        {/* default tags */}
        <meta property="og:site_name" content="Khue's" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={
            "https://khues-restaurant.vercel.app/openGraph/opengraphImage.png"
          }
        ></meta>
        <meta
          property="og:image:alt"
          content="Welcome to Khue's - A modern take on classic Vietnamese cuisine. The image features a welcoming character in traditional Vietnamese attire, set against a background of delicious Vietnamese dishes."
        ></meta>
        <meta
          property="twitter:image"
          content="https://khues-restaurant.vercel.app/openGraph/opengraphImage.png"
        />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>

      <style jsx global>{`
        html {
          font-family: ${notoSans.style.fontFamily};
        }
      `}</style>
      <main
        className={`baseVertFlex ${notoSans.className} relative min-h-dvh !justify-between bg-gradient-to-br from-offwhite to-primary/10`}
      >
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default api.withTRPC(MyApp);

// function checkLookBehindSupport() {
//   try {
//     new RegExp("(?<=)");
//     return true;
//   } catch (err) {
//     return false;
//   }
// }
