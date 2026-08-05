import React, { useEffect, useRef, useState } from "react";
import "./LoadingOverlay.css";

export interface LoadingOverlayProps {
  isVisible: boolean;
}

const ANALYSIS_STATUS_MESSAGES: readonly string[] = [
  "Parsing source code...",
  "Building syntax tree...",
  "Finding logical issues...",
  "Estimating complexity...",
  "Generating explanation...",
  "Preparing results...",
  "Almost done...",
];

const MESSAGE_INTERVAL_MS = 2400;
const MESSAGE_FADE_MS = 350;
const OVERLAY_EXIT_MS = 320;

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterFrameRef = useRef<number | null>(null);

  const clearFadeTimeout = (): void => {
    if (fadeTimeoutRef.current !== null) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  };

  const clearExitTimeout = (): void => {
    if (exitTimeoutRef.current !== null) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
  };

  const clearEnterFrame = (): void => {
    if (enterFrameRef.current !== null) {
      cancelAnimationFrame(enterFrameRef.current);
      enterFrameRef.current = null;
    }
  };

  useEffect(() => {
    clearExitTimeout();
    clearEnterFrame();

    if (isVisible) {
      setShouldRender(true);
      enterFrameRef.current = requestAnimationFrame(() => {
        enterFrameRef.current = requestAnimationFrame(() => {
          setIsActive(true);
          enterFrameRef.current = null;
        });
      });
      return;
    }

    setIsActive(false);
    exitTimeoutRef.current = setTimeout(() => {
      setShouldRender(false);
      exitTimeoutRef.current = null;
    }, OVERLAY_EXIT_MS);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      clearFadeTimeout();
      setMessageIndex(0);
      setMessageVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setMessageVisible(false);

      clearFadeTimeout();
      fadeTimeoutRef.current = setTimeout(() => {
        setMessageIndex((prev) =>
          prev < ANALYSIS_STATUS_MESSAGES.length - 1 ? prev + 1 : prev
        );
        setMessageVisible(true);
        fadeTimeoutRef.current = null;
      }, MESSAGE_FADE_MS);
    }, MESSAGE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearFadeTimeout();
    };
  }, [isVisible]);

  useEffect(() => {
    return () => {
      clearFadeTimeout();
      clearExitTimeout();
      clearEnterFrame();
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  const statusMessage = ANALYSIS_STATUS_MESSAGES[messageIndex];

  return (
    <div
      className={`loading-overlay${isActive ? " loading-overlay--active" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={isActive}
      aria-label="Analyzing your code"
    >
      <div className="loading-overlay__backdrop" aria-hidden="true" />

      <div className="loading-overlay__card">
        <div className="loading-overlay__spinner" aria-hidden="true">
          <svg
            className="loading-overlay__spinner-svg"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="loading-overlay__spinner-track"
              cx="24"
              cy="24"
              r="20"
            />
            <circle
              className="loading-overlay__spinner-indicator"
              cx="24"
              cy="24"
              r="20"
            />
          </svg>
        </div>

        <p className="loading-overlay__title">Analyzing your code...</p>

        <p
          className={`loading-overlay__status${
            messageVisible ? " loading-overlay__status--visible" : ""
          }`}
        >
          {statusMessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;