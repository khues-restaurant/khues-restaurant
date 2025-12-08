import { Noto_Sans } from "next/font/google";
import { type ReactNode } from "react";
import Footer from "~/components/Footer";
import HeaderShell from "~/components/headers/HeaderShell";
import useViewportLabelResizeListener from "~/hooks/useViewportLabelResizeListener";
import { useMainStore } from "~/stores/MainStore";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
});

interface GeneralLayout {
  children: ReactNode;
}

function GeneralLayout({ children }: GeneralLayout) {
  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

  useViewportLabelResizeListener();

  if (!viewportLabel) return null;

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
      </main>
    </>
  );
}

export default GeneralLayout;
