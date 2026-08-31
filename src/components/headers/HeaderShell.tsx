import DesktopHeader from "~/components/headers/DesktopHeader";
import MobileHeader from "~/components/headers/MobileHeader";
import { useMainStore } from "~/stores/MainStore";

function HeaderShell() {
  const viewportLabel = useMainStore((state) => state.viewportLabel);

  if (!viewportLabel) return null;

  return (
    <>
      {viewportLabel.includes("mobile") ? <MobileHeader /> : <DesktopHeader />}
    </>
  );
}

export default HeaderShell;
