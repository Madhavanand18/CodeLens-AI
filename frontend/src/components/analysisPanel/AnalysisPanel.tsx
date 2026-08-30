import CodeQuality from "./components/CodeQuality";
import CopyAnalysis from "./components/CopyAnalysis";
import DownloadAnalysis from "./components/DownloadAnalysis";
import React from "react";
import "./AnalysisPanel.css";

// Shape of the analysis result returned by the backend
interface AnalysisResult {
  explanation: string;
  bugs: string[];
  optimizations: string[];
  complexity: string;
  testCases: string[];
}

// Icon shown per section, keyed by title (Material Symbols icon names)
const SECTION_ICONS: Record<string, string> = {
  "Code Explanation": "code",
  "Issues Found": "bug_report",
  "Suggested Improvements": "lightbulb",
  Complexity: "query_stats",
  "Test Cases": "science",
};

// Props allow this component to be reused with custom analysis data
interface AnalysisPanelProps {
  /** Analysis result from the backend; null/undefined shows the empty state */
  analysis?: AnalysisResult | null;
}

// Renders each string as its own premium mini-card (used for bugs, optimizations, test cases)
const renderMiniCards = (items: string[], emptyLabel: string): React.ReactNode => {
  if (!items || items.length === 0) {
    return (
      <div className="analysis-panel__mini-card analysis-panel__mini-card--success">
        <span className="material-symbols-outlined analysis-panel__mini-card-icon">
          check_circle
        </span>
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="analysis-panel__mini-list">
      {items.map((item, index) => (
        <div className="analysis-panel__mini-card" key={index}>
          {item}
        </div>
      ))}
    </div>
  );
};

// Splits the single "complexity" string into time/space parts for display.
// Falls back gracefully if the AI response doesn't clearly separate them.
const parseComplexity = (complexity: string): { time: string; space: string } => {
  if (!complexity) {
    return { time: "N/A", space: "N/A" };
  }

  const timeMatch = complexity.match(/time[^:]*:\s*([^\n,;]+)/i);
  const spaceMatch = complexity.match(/space[^:]*:\s*([^\n,;]+)/i);

  return {
    time: timeMatch ? timeMatch[1].trim() : complexity,
    space: spaceMatch ? spaceMatch[1].trim() : complexity,
  };
};

/**
 * AnalysisPanel Component
 * Reusable results panel displaying analysis categories as large,
 * individually stacked premium cards in the style of Google's AI
 * products (Gemini, AI Studio, Firebase Console).
 *
 * Shows a clean empty state until real analysis data is available;
 * no placeholder or demo values are ever displayed.
 */
const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis = null }) => {
  // No analysis yet — show a clean empty state, no placeholder/demo data
  if (analysis === null) {
    return (
      <section className="analysis-panel" aria-label="Code analysis results">
        <h2 className="analysis-panel__title">Analysis</h2>

        <div className="analysis-panel__card analysis-panel__empty-state">
          <span className="material-symbols-outlined analysis-panel__empty-icon">
            neurology
          </span>
          <h3 className="analysis-panel__empty-heading">Ready to Analyze</h3>
          <p className="analysis-panel__empty-subtitle">
            Paste your code above and click Analyze Code to generate an AI
            analysis.
          </p>
        </div>
      </section>
    );
  }

  // Analysis available — show real results as large stacked premium cards
  return (
    <section className="analysis-panel" aria-label="Code analysis results">
      <h2 className="analysis-panel__title">Analysis</h2>

      <div className="analysis-panel__stack">
        <article className="analysis-panel__card analysis-panel__card--explanation">
          <div className="analysis-panel__card-header">
            <span className="material-symbols-outlined analysis-panel__card-icon">
              {SECTION_ICONS["Code Explanation"]}
            </span>
            <h3 className="analysis-panel__card-title">Code Explanation</h3>
          </div>
          <p className="analysis-panel__card-text analysis-panel__card-text--large">
            {analysis.explanation || "No explanation available."}
          </p>
        </article>

        <article className="analysis-panel__card">
          <div className="analysis-panel__card-header">
            <span className="material-symbols-outlined analysis-panel__card-icon">
              {SECTION_ICONS["Issues Found"]}
            </span>
            <h3 className="analysis-panel__card-title">Issues Found</h3>
          </div>
          {renderMiniCards(analysis.bugs, "No issues detected")}
        </article>

        <article className="analysis-panel__card">
          <div className="analysis-panel__card-header">
            <span className="material-symbols-outlined analysis-panel__card-icon">
              {SECTION_ICONS["Suggested Improvements"]}
            </span>
            <h3 className="analysis-panel__card-title">Suggested Improvements</h3>
          </div>
          {renderMiniCards(analysis.optimizations, "No improvements suggested")}
        </article>

        <CodeQuality analysis={analysis} />

        <article className="analysis-panel__card">
          <div className="analysis-panel__card-header">
            <span className="material-symbols-outlined analysis-panel__card-icon">
              {SECTION_ICONS["Complexity"]}
            </span>
            <h3 className="analysis-panel__card-title">Complexity</h3>
          </div>
          <div className="analysis-panel__complexity-grid">
            <div className="analysis-panel__complexity-card">
              <span className="analysis-panel__complexity-label">
                Time Complexity
              </span>
              <span className="analysis-panel__complexity-value">
                {parseComplexity(analysis.complexity).time}
              </span>
            </div>
            <div className="analysis-panel__complexity-card">
              <span className="analysis-panel__complexity-label">
                Space Complexity
              </span>
              <span className="analysis-panel__complexity-value">
                {parseComplexity(analysis.complexity).space}
              </span>
            </div>
          </div>
        </article>

        <article className="analysis-panel__card">
          <div className="analysis-panel__card-header">
            <span className="material-symbols-outlined analysis-panel__card-icon">
              {SECTION_ICONS["Test Cases"]}
            </span>
            <h3 className="analysis-panel__card-title">Test Cases</h3>
          </div>
          {renderMiniCards(analysis.testCases, "No test cases generated")}
        </article>
        <div className="analysis-panel__analysis-actions">
          <CopyAnalysis analysis={analysis} />
          <DownloadAnalysis analysis={analysis} />
        </div>
      </div>
    </section>
  );
};

export default AnalysisPanel;