import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { type Socket } from "socket.io-client";
import DashboardDesktopHeader from "~/components/dashboard/headers/DashboardDesktopHeader";
import DashboardMobileHeader from "~/components/dashboard/headers/DashboardMobileHeader";
import useInitializeStoreDBQueries from "~/hooks/useInitializeStoreDBQueries";
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

  useInitializeStoreDBQueries();
  useViewportLabelResizeListener();

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    let isMounted = true;

    const ensureAudioContext = async () => {
      if (audioContextRef.current) return audioContextRef.current;

      const AudioContextCtor =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error("Web Audio API not supported in this browser");
      }
      const context = new AudioContextCtor();
      audioContextRef.current = context;
      return context;
    };

    const ensureAudioBuffer = async () => {
      if (audioBufferRef.current) return audioBufferRef.current;

      const context = await ensureAudioContext();
      try {
        const response = await fetch("/sounds/newOrderAlert.mp3", {
          cache: "force-cache",
        });
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await context.decodeAudioData(arrayBuffer);
        if (isMounted) audioBufferRef.current = decodedBuffer;
        return decodedBuffer;
      } catch (error) {
        console.error("Failed to load new order alert", error);
        throw error;
      }
    };

    const playAlert = async () => {
      try {
        const context = await ensureAudioContext();
        if (context.state === "suspended") {
          await context.resume().catch(() => undefined);
        }

        const buffer = await ensureAudioBuffer();
        if (!buffer) return;

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
      } catch (error) {
        console.error("Failed to play new order alert", error);
      }
    };

    const handleNewOrderPlaced = () => {
      // Fire and forget; audio playback errors already logged inside playAlert.
      void playAlert();
    };

    socket.on("newOrderWasPlaced", handleNewOrderPlaced);

    return () => {
      isMounted = false;
      socket.off("newOrderWasPlaced", handleNewOrderPlaced);
    };
  }, [socket]);

  if (initViewportLabelSet === false) return null;

  return (
    <>
      {viewportLabel.includes("mobile") ? (
        <DashboardMobileHeader
          viewState={viewState}
          setViewState={setViewState}
          socket={socket}
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
