// src/components/dashboard/Dashboard.tsx
import { useRef } from "react";
import React, { useState } from "react";
import CodeInput from "../codeInput/CodeInput";
import AnalysisPanel from "../analysisPanel/AnalysisPanel";
import "./Dashboard.css";

// Shape of the analysis result returned by the backend (mirrors CodeInput's type)
interface AnalysisResult {
  explanation: string;
  bugs: string[];
  optimizations: string[];
  complexity: string;
  testCases: string[];
}

/**
 * Dashboard Component
 * Vertical AI workspace for CodeLens AI, inspired by Google AI Studio /
 * Gemini / Firebase Console. The code editor sits full-width at the top,
 * with the analysis results stacked below it once available.
 */
const Dashboard: React.FC = () => {
  // Holds the latest analysis result returned from the backend via CodeInput
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string>("");
  const [submittedLanguage, setSubmittedLanguage] = useState<string>("");

  return (
    <section className="dashboard" aria-label="Code analysis workspace">
      <div className="dashboard__container">
        {/* Editor section */}
        <div
  id="code-editor-section"
  className="dashboard__editor-section"
>
        <CodeInput
          initialCode={submittedCode}
          onBeforeAnalyze={(code, language) => {
          setSubmittedCode(code);
          setSubmittedLanguage(language);
      }}
  onAnalysisComplete={setAnalysis}
  onClear={() => {
    setAnalysis(null);
    setSubmittedCode("");
    setSubmittedLanguage("");
  }}
/>
        </div>

        {/* Analysis section */}
        <div className="dashboard__analysis-section">
          <AnalysisPanel analysis={analysis} code={submittedCode}
language={submittedLanguage}
onApplyCode={(improved) => setSubmittedCode(improved)} />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;