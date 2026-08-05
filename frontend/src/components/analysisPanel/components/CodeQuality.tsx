// src/components/analysisPanel/components/CodeQuality.tsx

import React from "react";
import "./CodeQuality.css";

// Shape of the analysis result this component reads from
interface AnalysisResult {
  explanation: string;
  bugs: string[];
  optimizations: string[];
  complexity: string;
  testCases: string[];
}

interface CodeQualityProps {
  /** The completed analysis object; scoring is derived entirely from this */
  analysis: AnalysisResult;
}

// Rating tiers, ordered from highest to lowest score threshold
const RATING_TIERS: { minScore: number; label: string }[] = [
  { minScore: 4.6, label: "Outstanding" },
  { minScore: 3.8, label: "Excellent" },
  { minScore: 3.0, label: "Very Good" },
  { minScore: 2.2, label: "Good" },
  { minScore: 1.2, label: "Needs Improvement" },
  { minScore: 0, label: "Poor" },
];

/**
 * Computes a 0–5 quality score using only the existing analysis object.
 * No backend calls, no additional AI requests — pure local heuristic.
 */
function computeQualityScore(analysis: AnalysisResult): number {
  if (!analysis.explanation || analysis.explanation.trim().length === 0) {
    return 1.0;
  }

  const bugCount = analysis.bugs?.length ?? 0;
  const optimizationCount = analysis.optimizations?.length ?? 0;

  let score = 5;
  score -= bugCount * 0.8;
  score -= optimizationCount * 0.3;

  if (bugCount === 0 && optimizationCount === 0) {
    score = 5;
  }

  return Math.max(0, Math.min(5, Math.round(score * 10) / 10));
}

// Resolves the descriptive label for a given numeric score
function getRatingLabel(score: number): string {
  const tier = RATING_TIERS.find((t) => score >= t.minScore);
  return tier ? tier.label : "Poor";
}

// Star variant type — controls FILL and icon name independently
type StarVariant = "filled" | "half" | "empty";

// Determines which variant each star slot should render at the given score
function getStarVariant(slot: number, score: number): StarVariant {
  if (score >= slot) return "filled";
  if (score >= slot - 0.5) return "half";
  return "empty";
}

/**
 * Renders a single Material Symbol star.
 * - "star" with FILL=1 → fully filled star
 * - "star_half" with FILL=1 → half star (left half filled)
 * - "star" with FILL=0 → outlined star
 *
 * FILL is applied via `font-variation-settings` on the element class
 * rather than through separate icon names (which is the correct approach
 * for Material Symbols as opposed to legacy Material Icons).
 */
function StarIcon({ variant }: { variant: StarVariant }) {
  const classMap: Record<StarVariant, string> = {
    filled: "code-quality__star code-quality__star--filled",
    half: "code-quality__star code-quality__star--half",
    empty: "code-quality__star code-quality__star--empty",
  };

  // "star_half" renders the correct half-filled glyph;
  // "star" is used for both filled and empty, differentiated by FILL axis.
  const iconName = variant === "half" ? "star_half" : "star";

  return (
    <span className={classMap[variant]} aria-hidden="true">
      {iconName}
    </span>
  );
}

/**
 * CodeQuality Component
 * Reusable Material Design card summarizing overall code quality as a
 * 0–5 star rating, derived entirely from the existing analysis object.
 */
const CodeQuality: React.FC<CodeQualityProps> = ({ analysis }) => {
  const score = computeQualityScore(analysis);
  const label = getRatingLabel(score);

  return (
    <article className="code-quality">
      <div className="code-quality__header">
        <span className="code-quality__header-icon" aria-hidden="true">
          verified
        </span>
        <h3 className="code-quality__heading">Code Quality</h3>
      </div>

      <div className="code-quality__stars" role="img" aria-label={`${score} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((slot) => (
          <StarIcon key={slot} variant={getStarVariant(slot, score)} />
        ))}
      </div>

      <div className="code-quality__score-row">
        <span className="code-quality__score">{score.toFixed(1)} / 5</span>
        <span className="code-quality__label">{label}</span>
      </div>

      <p className="code-quality__description">
        Based on detected bugs, optimizations and overall analysis.
      </p>
    </article>
  );
};

export default CodeQuality;