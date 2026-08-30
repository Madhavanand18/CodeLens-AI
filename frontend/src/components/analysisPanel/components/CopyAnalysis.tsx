import { formatAnalysis } from "./formatAnalysis";
import type { AnalysisResult } from "./formatAnalysis";
import React, { useState } from "react";
import "./CopyAnalysis.css";

// Matches the existing AnalysisResult shape used across the project


interface CopyAnalysisProps {
  /** The completed analysis object to format and copy */
  analysis: AnalysisResult;
}

// Copy button display states
type CopyStatus = "idle" | "copied" | "error";

/**
 * Formats the analysis object into clean, readable plain text.
 * Suitable for pasting into ChatGPT, GitHub issues, documentation, etc.
 * All section formatting is defined here in one place.
 */

/**
 * CopyAnalysis Component
 * A self-contained, reusable button that formats the full analysis result
 * as clean plain text and copies it to the clipboard.
 * Provides inline visual feedback (Copied / Failed) that auto-resets.
 */
const CopyAnalysis: React.FC<CopyAnalysisProps> = ({ analysis }) => {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const handleCopy = async (): Promise<void> => {
    try {
      const formatted = formatAnalysis(analysis);
      await navigator.clipboard.writeText(formatted);
      setStatus("copied");
    } catch (error) {
      console.error("CopyAnalysis: clipboard write failed.", error);
      setStatus("error");
    } finally {
      // Auto-reset back to idle after 2.2 seconds
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  const iconName =
    status === "copied" ? "check_circle" : status === "error" ? "error" : "content_copy";

  const labelText =
    status === "copied" ? "Copied!" : status === "error" ? "Failed" : "Copy Analysis";

  return (
    <button
      type="button"
      className={`copy-analysis__btn copy-analysis__btn--${status}`}
      onClick={handleCopy}
      disabled={status !== "idle"}
      aria-label={labelText}
    >
      <span
        className="material-symbols-outlined copy-analysis__icon"
        aria-hidden="true"
      >
        {iconName}
      </span>
      <span className="copy-analysis__label">{labelText}</span>
    </button>
  );
};

export default CopyAnalysis;