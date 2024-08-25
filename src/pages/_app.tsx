import { type AppProps } from "next/app";
import { Noto_Sans } from "next/font/google";
import Head from "next/head";
import { env } from "~/env";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Khue&apos;s Kitchen</title>

        <meta
          name="description"
          content={
            "Discover the modern Vietnamese flavors at Khue's Kitchen, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
          }
        />
        <meta property="og:title" content={"Khue's Kitchen"}></meta>
        <meta property="og:url" content={"https://www.khueskitchen.com"} />
        <meta name="twitter:title" content={"Khue's Kitchen"} />
        <meta
          property="og:description"
          content={
            "Discover the modern Vietnamese flavors at Khue's Kitchen, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
          }
        />
        <meta
          name="twitter:description"
          content={
            "Discover the modern Vietnamese flavors at Khue's Kitchen, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
          }
        />

        {/* default tags */}
        <meta property="og:site_name" content="Khue's Kitchen" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={`${env.NEXT_PUBLIC_BASE_URL}/openGraph/opengraphImage.png`}
        ></meta>
        <meta
          property="og:image:alt"
          content="Welcome to Khue's Kitchen - A modern take on classic Vietnamese cuisine. The image features a welcoming character in traditional Vietnamese attire, set against a background of delicious Vietnamese dishes."
        ></meta>
        <meta
          property="twitter:image"
          content={`${env.NEXT_PUBLIC_BASE_URL}/openGraph/opengraphImage.png`}
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
