import DashboardDesktopHeader from "~/components/dashboard/headers/DashboardDesktopHeader";
import DashboardMobileHeader from "~/components/dashboard/headers/DashboardMobileHeader";
import { type Dispatch, type SetStateAction } from "react";
import Head from "next/head";
import { useMainStore } from "~/stores/MainStore";

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
  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

  // maybe want to also expose width/height from hook as well?

  // TODO: set discounts ActionDialog, link to set discounts and reviews page

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
        />
      )}
    </>
  );
}

export default DashboardHeaderShell;
