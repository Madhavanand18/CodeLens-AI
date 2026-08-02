// src/components/hero/Hero.tsx

import React from "react";
import "./hero.css";

/**
 * Hero Component
 * Landing section for CodeLens AI.
 * Left: heading, description, and call-to-action buttons.
 * Right: CSS-only illustration representing code analysis.
 */
const Hero: React.FC = () => {
  return (
    <section className="hero" aria-label="Hero section">
      {/* Left: Text content */}
      <div className="hero__content">
        <h1 className="hero__heading">Understand Your Code Instantly</h1>
        <p className="hero__description">
          Paste your code and let AI explain logic, detect bugs, suggest
          optimizations and generate better test cases.
        </p>

        <div className="hero__actions">
          <button type="button" className="hero__btn hero__btn--primary">
            Analyze Code
          </button>
          <button type="button" className="hero__btn hero__btn--secondary">
            Learn More
          </button>
        </div>
      </div>

      {/* Right: CSS-only illustration */}
      <div className="hero__illustration" aria-hidden="true">
        <div className="hero__panel">
          {/* Simulated code block with colored lines */}
          <div className="hero__code-block">
            <span className="hero__dot hero__dot--red" />
            <span className="hero__dot hero__dot--yellow" />
            <span className="hero__dot hero__dot--green" />

            <div className="hero__code-line hero__code-line--w70" />
            <div className="hero__code-line hero__code-line--w50" />
            <div className="hero__code-line hero__code-line--w80" />
            <div className="hero__code-line hero__code-line--w40" />
            <div className="hero__code-line hero__code-line--w60" />
          </div>

          {/* Floating glowing analysis cards */}
          <div className="hero__float-card hero__float-card--one">
            <span className="hero__badge hero__badge--success">✓ Bug Fixed</span>
          </div>

          <div className="hero__float-card hero__float-card--two">
            <span className="hero__badge hero__badge--info">⚡ Optimized</span>
          </div>

          <div className="hero__glow-circle" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
