import { useCallback, useEffect } from "react";
import { useToast } from "~/components/ui/use-toast";

function useClearToastsOnRefocus() {
  const { dismiss: dismissToasts } = useToast();

  const clearToasts = useCallback(() => {
    dismissToasts();
  }, [dismissToasts]);

  useEffect(() => {
    clearToasts();

    window.addEventListener("focus", clearToasts);

    return () => window.removeEventListener("focus", clearToasts);
  }, [clearToasts]);
}

export default useClearToastsOnRefocus;
