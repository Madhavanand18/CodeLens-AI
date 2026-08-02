// src/components/dashboard/Dashboard.tsx

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

  return (
    <section className="dashboard" aria-label="Code analysis workspace">
      <div className="dashboard__container">
        {/* Editor section */}
        <div className="dashboard__editor-section">
        <CodeInput
  onAnalysisComplete={setAnalysis}
  onClear={() => setAnalysis(null)}
/>
        </div>

        {/* Analysis section */}
        <div className="dashboard__analysis-section">
          <AnalysisPanel analysis={analysis} />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;