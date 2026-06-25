import { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

export default function DailyCall({ url, token, onLeave, onJoined, onError }) {
  const containerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    // Check if a DailyIframe instance already exists
    let frame = DailyIframe.getCallInstance();

    if (!frame) {
      // Create the DailyPrebuilt iframe inside our wrapper container
      frame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "20px",
        },
      });
    } else {
      // Re-parent the existing iframe to our current container if needed
      const iframe = frame.iframe();
      if (iframe && containerRef.current && !containerRef.current.contains(iframe)) {
        containerRef.current.appendChild(iframe);
      }
    }

    frameRef.current = frame;

    // Define iframe events
    const handleJoined = (e) => {
      if (onJoined) onJoined(e);
    };

    const handleLeave = (e) => {
      if (onLeave) onLeave(e);
    };

    const handleError = (e) => {
      if (onError) onError(e);
    };

    // Attach events
    frame.on("joined-meeting", handleJoined);
    frame.on("left-meeting", handleLeave);
    frame.on("error", handleError);

    // Join the call if it's new or not connected yet
    const state = frame.meetingState();
    if (state === "new" || state === "left-meeting") {
      frame.join({
        url,
        ...(token ? { token } : {}),
      });
    }

    // Cleanup on unmount
    return () => {
      // Detach event listeners immediately
      frame.off("joined-meeting", handleJoined);
      frame.off("left-meeting", handleLeave);
      frame.off("error", handleError);

      // Defer the destroy process to check if we are double-mounting in Strict Mode
      setTimeout(() => {
        const iframe = frame.iframe();
        // Only destroy the instance if the iframe has been permanently removed from the DOM
        if (iframe && !document.body.contains(iframe)) {
          frame.destroy();
        }
      }, 100);
    };
  }, [url, token]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "580px",
      }}
    />
  );
}
