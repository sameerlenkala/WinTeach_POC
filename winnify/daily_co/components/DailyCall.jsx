import { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

export default function DailyCall() {
  const containerRef = useRef(null);

  useEffect(() => {
    const frame = DailyIframe.createFrame(
      containerRef.current,
      {
        showLeaveButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
        },
      }
    );

    frame.join({
      url: "https://demo.daily.co/hello",
    });

    return () => frame.destroy();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}