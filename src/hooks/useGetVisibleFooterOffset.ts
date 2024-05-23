import { useState, useLayoutEffect } from "react";
import { useMainStore } from "~/stores/MainStore";

function useGetVisibleFooterOffset() {
  const { footerIsInView } = useMainStore((state) => ({
    footerIsInView: state.footerIsInView,
  }));

  const [visibleFooterOffset, setVisibleFooterOffset] = useState(0);

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (!footerIsInView) {
        setVisibleFooterOffset(0);
        return;
      }

      const footer = document.getElementById("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const visibleHeight = Math.max(0, window.innerHeight - footerRect.top);
        setVisibleFooterOffset(visibleHeight);
      }
    };

    // Initial check in case the page is already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [footerIsInView]);

  return { visibleFooterOffset };
}

export default useGetVisibleFooterOffset;
