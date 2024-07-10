import { type Dispatch, type SetStateAction } from "react";
import { type Socket } from "socket.io-client";
import DashboardDesktopHeader from "~/components/dashboard/headers/DashboardDesktopHeader";
import DashboardMobileHeader from "~/components/dashboard/headers/DashboardMobileHeader";
import useViewportLabelResizeListener from "~/hooks/useViewportLabelResizeListener";
import { type DashboardViewStates } from "~/pages/dashboard";
import { useMainStore } from "~/stores/MainStore";

interface DashboardHeaderShell {
  viewState: DashboardViewStates;
  setViewState: Dispatch<SetStateAction<DashboardViewStates>>;
  socket: Socket;
}

function DashboardHeaderShell({
  viewState,
  setViewState,
  socket,
}: DashboardHeaderShell) {
  const { initViewportLabelSet, viewportLabel } = useMainStore((state) => ({
    initViewportLabelSet: state.initViewportLabelSet,
    viewportLabel: state.viewportLabel,
  }));

  // maybe want to also expose width/height from hook as well?

  // TODO: set discounts ActionDialog, link to set discounts and reviews page

  useViewportLabelResizeListener();

  if (initViewportLabelSet === false) return null;

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
          socket={socket}
        />
      )}
    </>
  );
}

export default DashboardHeaderShell;
