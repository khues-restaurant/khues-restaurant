import { useLayoutEffect } from "react";

// FYI: this is a hook I would like to remove in the future if next.js
// fixes the issue where with async components that use <AnimatedLotus />
// while loading in the content of the page, the page will *often times*
// end up scrolled partially down the page (if coming from a partially scrolled
// down page).

function useForceScrollToTopOnAsyncComponents() {
  useLayoutEffect(() => {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 10);
  }, []);
}

export default useForceScrollToTopOnAsyncComponents;
