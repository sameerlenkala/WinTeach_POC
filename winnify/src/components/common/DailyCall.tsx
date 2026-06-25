import { useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

interface DailyCallProps {
  url: string;
  token?: string;
  onLeave?: () => void;
  onJoined?: () => void;
  onError?: (err: unknown) => void;
}

export default function DailyCall({ url, token, onLeave, onJoined, onError }: DailyCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<ReturnType<typeof DailyIframe.createFrame> | null>(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    // Reuse existing instance if present (handles React Strict Mode double-mount)
    let frame = DailyIframe.getCallInstance();

    if (!frame) {
      frame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '12px',
        },
      });
    } else {
      // Re-parent to current container if needed
      const iframe = frame.iframe();
      if (iframe && containerRef.current && !containerRef.current.contains(iframe)) {
        containerRef.current.appendChild(iframe);
      }
    }

    frameRef.current = frame;

    const handleJoined = () => onJoined?.();
    const handleLeave = () => onLeave?.();
    const handleError = (e: unknown) => onError?.(e);

    frame.on('joined-meeting', handleJoined);
    frame.on('left-meeting', handleLeave);
    frame.on('error', handleError);

    const state = frame.meetingState();
    if (state === 'new' || state === 'left-meeting') {
      frame.join({ url, ...(token ? { token } : {}) });
    }

    return () => {
      frame!.off('joined-meeting', handleJoined);
      frame!.off('left-meeting', handleLeave);
      frame!.off('error', handleError);

      // Defer destroy to avoid conflicts with Strict Mode cleanup
      setTimeout(() => {
        const iframe = frame!.iframe();
        if (iframe && !document.body.contains(iframe)) {
          frame!.destroy();
        }
      }, 100);
    };
  }, [url, token]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '520px' }}
    />
  );
}
