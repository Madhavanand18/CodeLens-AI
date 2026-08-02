// src/components/features/Features.tsx

import React from "react";
import "./Features.css";

// Feature data type
interface Feature {
  title: string;
  description: string;
}

// Centralized feature data — easy to extend without touching JSX structure
const FEATURES: Feature[] = [
  {
    title: "AI Code Explanation",
    description: "Understand complex code in simple language.",
  },
  {
    title: "Bug Detection",
    description: "Identify logical and syntax issues quickly.",
  },
  {
    title: "Optimization",
    description: "Receive performance improvement suggestions.",
  },
  {
    title: "Test Case Generator",
    description: "Generate meaningful edge and corner test cases.",
  },
  {
    title: "Code Refactoring",
    description: "Improve readability and maintainability.",
  },
  {
    title: "Complexity Analysis",
    description: "Estimate time and space complexity.",
  },
];

/**
 * Features Component
 * Displays a responsive grid of feature cards describing
 * CodeLens AI's core capabilities.
 */
const Features: React.FC = () => {
  return (
    <section className="features" aria-label="Features section">
      <div className="features__header">
        <h2 className="features__heading">Powerful Features</h2>
        <p className="features__subtitle">
          Everything you need to understand and improve your code.
        </p>
      </div>

      <div className="features__grid">
        {FEATURES.map((feature) => (
          <article className="features__card" key={feature.title}>
            <h3 className="features__card-title">{feature.title}</h3>
            <p className="features__card-description">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Features;