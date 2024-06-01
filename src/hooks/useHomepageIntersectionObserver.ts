import { useEffect, useRef } from "react";
import { useAnimation } from "framer-motion";

interface UseScrollAnimation {
  threshold: number;
  axis: "x" | "y";
  scrollDir: "up" | "down";
}

function useHomepageIntersectionObserver({
  threshold,
  axis,
  scrollDir,
}: UseScrollAnimation) {
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && scrollDir === "down") {
            void controls.start({ opacity: 1, [axis]: 0, filter: "blur(0px)" });
          } else if (entry.boundingClientRect.top < 0 && scrollDir === "up") {
            void controls.start({ opacity: 1, [axis]: 0, filter: "blur(0px)" });
          }
        });
      },
      { threshold },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    const internalElementRef = elementRef.current;

    return () => {
      if (internalElementRef) {
        observer.unobserve(internalElementRef);
      }
    };
  }, [controls, scrollDir, threshold, axis]);

  return { controls, elementRef };
}

export default useHomepageIntersectionObserver;
