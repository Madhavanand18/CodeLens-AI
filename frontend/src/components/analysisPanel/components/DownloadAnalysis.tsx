// src/components/analysisPanel/components/DownloadAnalysis.tsx

import React, { useState } from "react";
import { formatAnalysis } from "./formatAnalysis";
import type { AnalysisResult } from "./formatAnalysis";

import "./DownloadAnalysis.css";

interface DownloadAnalysisProps {
  /** The completed analysis object to format and download */
  analysis: AnalysisResult;
  /** Optional filename override; defaults to CodeLens-AI-Analysis.txt */
  filename?: string;
}

type DownloadStatus = "idle" | "downloaded" | "error";

/**
 * DownloadAnalysis Component
 * Formats the full analysis result as clean plain text and triggers
 * a .txt file download. Shares formatting logic with CopyAnalysis
 * via the shared formatAnalysis utility.
 */
const DownloadAnalysis: React.FC<DownloadAnalysisProps> = ({
  analysis,
  filename = "CodeLens-AI-Analysis.txt",
}) => {
  const [status, setStatus] = useState<DownloadStatus>("idle");

  const handleDownload = (): void => {
    try {
      const content = formatAnalysis(analysis);
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Release the object URL after the download is triggered
      URL.revokeObjectURL(url);

      setStatus("downloaded");
    } catch (error) {
      console.error("DownloadAnalysis: file download failed.", error);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  const iconName =
    status === "downloaded"
      ? "check_circle"
      : status === "error"
      ? "error"
      : "download";

  const labelText =
    status === "downloaded"
      ? "Downloaded!"
      : status === "error"
      ? "Failed"
      : "Download Report";

  return (
    <button
      type="button"
      className={`download-analysis__btn download-analysis__btn--${status}`}
      onClick={handleDownload}
      disabled={status !== "idle"}
      aria-label={labelText}
    >
      <span
        className="material-symbols-outlined download-analysis__icon"
        aria-hidden="true"
      >
        {iconName}
      </span>
      <span className="download-analysis__label">{labelText}</span>
    </button>
  );
};

export default DownloadAnalysis;