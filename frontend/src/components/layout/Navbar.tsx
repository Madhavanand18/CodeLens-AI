// src/components/layout/Navbar.tsx

import React, { useState } from "react";
import "./Navbar.css";

// Centralized nav link data — easy to extend without touching JSX structure
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/**
 * Navbar Component
 * Reusable, responsive navigation bar for CodeLens AI.
 * Contains logo, nav links, sign-in button, and mobile hamburger menu.
 */
const Navbar: React.FC = () => {
  // Tracks whether the mobile menu is open
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Toggles mobile menu open/close state safely
  const handleMenuToggle = (): void => {
    try {
      setIsMenuOpen((prev) => !prev);
    } catch (error) {
      console.error("Navbar: failed to toggle menu state.", error);
    }
  };

  // Closes the mobile menu when a link is clicked
  const handleLinkClick = (): void => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      {/* Left: Logo */}
      <div className="navbar__logo">
        <span className="navbar__logo-text">CodeLens AI</span>
      </div>

      {/* Middle: Navigation links (desktop + mobile) */}
      <ul className={`navbar__links ${isMenuOpen ? "navbar__links--open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <li key={link.label} className="navbar__link-item">
            <a href={link.href} className="navbar__link" onClick={handleLinkClick}>
              {link.label}
            </a>
          </li>
        ))}

        {/* Sign In button shown inside mobile menu */}
        <li className="navbar__link-item navbar__signin-mobile">
          <button type="button" className="navbar__signin-btn">
            Sign In
          </button>
        </li>
      </ul>

      {/* Right: Sign In button (desktop) */}
      <div className="navbar__actions">
        <button type="button" className="navbar__signin-btn">
          Sign In
        </button>
      </div>

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className="navbar__toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        onClick={handleMenuToggle}
      >
        <span className="navbar__toggle-bar" />
        <span className="navbar__toggle-bar" />
        <span className="navbar__toggle-bar" />
      </button>
    </nav>
  );
};

export default Navbar;