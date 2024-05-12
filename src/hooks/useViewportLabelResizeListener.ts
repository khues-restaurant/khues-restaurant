import { useEffect, useLayoutEffect } from "react";
import { useMainStore } from "~/stores/MainStore";

function useViewportLabelResizeListener() {
  const {
    viewportLabel,
    setViewportLabel,
    initViewportLabelSet,
    setInitViewportLabelSet,
  } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
    setViewportLabel: state.setViewportLabel,
    initViewportLabelSet: state.initViewportLabelSet,
    setInitViewportLabelSet: state.setInitViewportLabelSet,
  }));

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    function handleResize() {
      let localViewportLabel: "mobile" | "mobileLarge" | "tablet" | "desktop" =
        "mobile";

      // TODO: experiment with this
      if (window.innerHeight > 667) {
        localViewportLabel = "mobileLarge";
      }

      if (window.innerWidth > 1000 && window.innerHeight > 700) {
        localViewportLabel = "tablet";
      }

      if (window.innerWidth > 1500 && window.innerHeight > 800) {
        localViewportLabel = "desktop";
      }

      if (localViewportLabel !== viewportLabel) {
        setViewportLabel(localViewportLabel);
      }

      if (initViewportLabelSet === false) {
        setInitViewportLabelSet(true);
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [
    viewportLabel,
    setViewportLabel,
    initViewportLabelSet,
    setInitViewportLabelSet,
  ]);
}

export default useViewportLabelResizeListener;
