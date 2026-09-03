import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import "./FixCode.css";

interface AnalysisResult {
  explanation: string;
  bugs: string[];
  optimizations: string[];
  complexity: string;
  testCases: string[];
}

interface FixCodeProps {
  code: string;
  language: string;
  analysis: AnalysisResult;
  onApplyCode?: (improvedCode: string) => void;
}

type FixStatus = "idle" | "loading" | "success" | "error";

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  Java: "java",
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  C: "c",
  "C++": "cpp",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
};

const FixCode: React.FC<FixCodeProps> = ({
  code,
  language,
  analysis,
  onApplyCode,
}) => {
  const [status, setStatus] = useState<FixStatus>("idle");
  const [improvedCode, setImprovedCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFix = async (): Promise<void> => {
    if (!code.trim()) return;

    

    setStatus("loading");
    setImprovedCode("");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          analysis,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || typeof data.code !== "string") {
        throw new Error(data.message || "Failed to improve code.");
      }

      setImprovedCode(data.code);
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      console.error("FixCode: request failed.", error);
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const handleApply = (): void => {
    if (improvedCode.trim()) {
      onApplyCode?.(improvedCode);
    }
  };

  const monacoLanguage =
    MONACO_LANGUAGE_MAP[language] ?? "plaintext";

  return (
    <div className="fix-code">
      {status !== "success" && (
        <button
          type="button"
          className={`fix-code__trigger ${
            status === "loading"
              ? "fix-code__trigger--loading"
              : ""
          }`}
          onClick={handleFix}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <span className="fix-code__spinner" />
              Improving Code...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">
                auto_fix_high
              </span>
              Fix / Improve Code
            </>
          )}
        </button>
      )}

      {status === "error" && (
        <div className="fix-code__error">
          <span className="material-symbols-outlined">
            error
          </span>

          <p>{errorMessage}</p>

          <button
            type="button"
            className="fix-code__retry-btn"
            onClick={handleFix}
          >
            Try Again
          </button>
        </div>
      )}

      {status === "success" && improvedCode && (
        <div className="fix-code__result">
          <div className="fix-code__result-header">
            <div className="fix-code__result-title">
              <span className="material-symbols-outlined">
                compare
              </span>

              <div>
                <h3>Compare Code</h3>
                <span>Original vs Improved</span>
              </div>
            </div>

            <button
              type="button"
              className="fix-code__apply-btn"
              onClick={handleApply}
            >
              <span className="material-symbols-outlined">
                swap_horiz
              </span>
              Replace Code
            </button>
          </div>

          <div className="fix-code__comparison">
            <div className="fix-code__editor-panel">
              <div className="fix-code__editor-label">
                <span className="material-symbols-outlined">
                  code
                </span>
                Original Code
              </div>

              <Editor
                height="420px"
                language={monacoLanguage}
                theme="vs-dark"
                value={code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  fontFamily:
                    "'JetBrains Mono', Consolas, monospace",
                  fontSize: 14,
                  padding: {
                    top: 16,
                    bottom: 16,
                  },
                  lineNumbers: "on",
                  folding: true,
                  smoothScrolling: true,
                  renderLineHighlight: "all",
                }}
              />
            </div>

            <div className="fix-code__editor-panel">
              <div className="fix-code__editor-label fix-code__editor-label--improved">
                <span className="material-symbols-outlined">
                  auto_fix_high
                </span>
                Improved Code
              </div>

              <Editor
                height="420px"
                language={monacoLanguage}
                theme="vs-dark"
                value={improvedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  fontFamily:
                    "'JetBrains Mono', Consolas, monospace",
                  fontSize: 14,
                  padding: {
                    top: 16,
                    bottom: 16,
                  },
                  lineNumbers: "on",
                  folding: true,
                  smoothScrolling: true,
                  renderLineHighlight: "all",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixCode;