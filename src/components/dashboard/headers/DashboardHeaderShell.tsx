import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import DashboardDesktopHeader from "~/components/dashboard/headers/DashboardDesktopHeader";
import DashboardMobileHeader from "~/components/dashboard/headers/DashboardMobileHeader";
import { type Dispatch, type SetStateAction } from "react";

interface DashboardHeaderShell {
  viewState: "orderManagement" | "customerChats" | "itemManagement" | "stats";
  setViewState: Dispatch<
    SetStateAction<
      "orderManagement" | "customerChats" | "itemManagement" | "stats"
    >
  >;
}

function DashboardHeaderShell({
  viewState,
  setViewState,
}: DashboardHeaderShell) {
  const viewportLabel = useGetViewportLabel();
  // maybe want to also expose width/height from hook as well?

  return (
    <>
      {viewportLabel.includes("mobile") ? (
        <DashboardMobileHeader
          viewState={viewState}
          setViewState={setViewState}
        />
      ) : (
        <DashboardDesktopHeader
          viewState={viewState}
          setViewState={setViewState}
        />
      )}
    </>
  );
}

export default DashboardHeaderShell;
