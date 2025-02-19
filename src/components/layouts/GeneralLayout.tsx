import { Analytics } from "@vercel/analytics/react";
import { Noto_Sans } from "next/font/google";
import { type ReactNode } from "react";
import Footer from "~/components/Footer";
import HeaderShell from "~/components/headers/HeaderShell";
import { Toaster } from "~/components/ui/toaster";
import useViewportLabelResizeListener from "~/hooks/useViewportLabelResizeListener";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  useViewportLabelResizeListener();

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

        <Footer />

        <Toaster />

        <Analytics />
      </main>
    </>
  );
}

export default GeneralLayout;
