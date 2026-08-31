import { useEffect, useLayoutEffect } from "react";
import { useMainStore } from "~/stores/MainStore";

function useViewportLabelResizeListener() {
  const viewportLabel = useMainStore((state) => state.viewportLabel);
  const setViewportLabel = useMainStore((state) => state.setViewportLabel);

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

      if (window.innerWidth > 1000 && window.innerHeight > 600) {
        localViewportLabel = "tablet";
      }

      if (window.innerWidth > 1536 && window.innerHeight > 600) {
        localViewportLabel = "desktop";
      }

      if (localViewportLabel !== viewportLabel) {
        setViewportLabel(localViewportLabel);
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [viewportLabel, setViewportLabel]);
}

export default useViewportLabelResizeListener;
