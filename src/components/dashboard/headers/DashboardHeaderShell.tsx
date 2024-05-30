import DashboardDesktopHeader from "~/components/dashboard/headers/DashboardDesktopHeader";
import DashboardMobileHeader from "~/components/dashboard/headers/DashboardMobileHeader";
import { type Dispatch, type SetStateAction } from "react";
import Head from "next/head";
import { useMainStore } from "~/stores/MainStore";
import useViewportLabelResizeListener from "~/hooks/useViewportLabelResizeListener";
import { type Socket } from "socket.io-client";

interface DashboardHeaderShell {
  viewState: "orderManagement" | "customerChats" | "itemManagement" | "stats";
  setViewState: Dispatch<
    SetStateAction<
      "orderManagement" | "customerChats" | "itemManagement" | "stats"
    >
  >;
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
      <Head>
        <title>Dashboard | Khue&apos;s</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

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
