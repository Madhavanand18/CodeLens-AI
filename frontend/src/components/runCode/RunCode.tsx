// src/components/runCode/RunCode.tsx

import React from "react";
import "./RunCode.css";

interface RunCodeProps {
  /** Called when the user clicks "Run Code" */
  onRun: () => void;
  /** Whether a run is currently in progress */
  isRunning?: boolean;
  /** stdin passed to the program — controlled by parent */
  input: string;
  /** Called when the user edits the stdin textarea */
  onInputChange: (value: string) => void;
  /** The output to display — controlled by parent */
  output: string;
}

/**
 * RunCode Component
 * UI-only panel providing a "Run Code" trigger, a stdin input area,
 * and a stdout output area. Contains no execution logic — the parent
 * controls all state and provides callbacks.
 */
const RunCode: React.FC<RunCodeProps> = ({
  onRun,
  isRunning = false,
  input,
  onInputChange,
  output,
}) => {
  return (
    <div className="run-code">
      {/* Run button */}
      <button
        type="button"
        className="run-code__btn"
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <span className="run-code__spinner" aria-hidden="true" />
            Running...
          </>
        ) : (
          <>
            <span
              className="material-symbols-outlined run-code__btn-icon"
              aria-hidden="true"
            >
              play_arrow
            </span>
            Run Code
          </>
        )}
      </button>

      {/* Input / Output panels */}
      <div className="run-code__panels">
        {/* Stdin */}
        <div className="run-code__panel">
          <div className="run-code__panel-header">
            <span
              className="material-symbols-outlined run-code__panel-icon"
              aria-hidden="true"
            >
              keyboard
            </span>
            <span className="run-code__panel-title">Input (stdin)</span>
            <span className="run-code__panel-hint">Optional</span>
          </div>

          <textarea
            className="run-code__textarea"
            placeholder="Enter program input here..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            spellCheck={false}
            aria-label="Program input"
          />
        </div>

        {/* Stdout */}
        <div className="run-code__panel">
          <div className="run-code__panel-header">
            <span
              className="material-symbols-outlined run-code__panel-icon"
              aria-hidden="true"
            >
              terminal
            </span>
            <span className="run-code__panel-title">Output</span>
          </div>

          <div
            className={`run-code__output ${
              !output ? "run-code__output--empty" : ""
            }`}
            aria-live="polite"
          >
            {output ? (
              <pre className="run-code__output-pre">{output}</pre>
            ) : (
              <span className="run-code__output-placeholder">
                Output will appear here after running.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunCode;