import MobileHeader from "~/components/headers/MobileHeader";
import DesktopHeader from "~/components/headers/DesktopHeader";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";

function HeaderShell() {
  const viewportLabel = useGetViewportLabel();
  // maybe want to also expose width/height from hook as well?

  return (
    <>
      {viewportLabel.includes("mobile") ? <MobileHeader /> : <DesktopHeader />}
    </>
  );
}

export default HeaderShell;
