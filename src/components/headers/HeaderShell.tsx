import MobileHeader from "~/components/headers/MobileHeader";
import DesktopHeader from "~/components/headers/DesktopHeader";
import { useMainStore } from "~/stores/MainStore";

function HeaderShell() {
  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

  return (
    <>
      {viewportLabel.includes("mobile") ? <MobileHeader /> : <DesktopHeader />}
    </>
  );
}

export default HeaderShell;
