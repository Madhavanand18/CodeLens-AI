// src/components/layout/Navbar.tsx

import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";

// Center navigation links
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Analyze", href: "#analyze" },
  { label: "Features", href: "#features" },
  { label: "Docs", href: "#docs" },
  { label: "Pricing", href: "#pricing" },
];

// Dropdown menu items shown when the hamburger icon is clicked
const MENU_ITEMS: { label: string; href: string }[] = [
  { label: "Sign In", href: "#signin" },
  { label: "History", href: "#history" },
  { label: "Settings", href: "#settings" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/**
 * Navbar Component
 * Floating, premium-styled navigation bar for CodeLens AI.
 * Features a centered link group and a hamburger-triggered dropdown
 * menu (instead of a traditional mobile off-canvas panel).
 */
const Navbar: React.FC = () => {
  // Controls whether the hamburger dropdown menu is open
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Controls whether the mobile nav-links panel is open
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Ref used to detect outside clicks and close the dropdown
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggles the hamburger dropdown menu
  const handleMenuToggle = (): void => {
    try {
      setIsMenuOpen((prev) => !prev);
    } catch (error) {
      console.error("Navbar: failed to toggle menu state.", error);
    }
  };

  // Toggles the mobile nav-links panel
  const handleMobileNavToggle = (): void => {
    setIsMobileNavOpen((prev) => !prev);
  };

  // Closes the dropdown menu (used after selecting an item)
  const handleMenuItemClick = (): void => {
    setIsMenuOpen(false);
  };

  // Closes the mobile nav panel (used after selecting a link)
  const handleNavLinkClick = (): void => {
    setIsMobileNavOpen(false);
  };

  // Closes the dropdown when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main navigation">
        {/* Left: Logo */}
        <div className="navbar__logo">
          <span className="navbar__logo-text">CodeLens AI</span>
        </div>

        {/* Center: Navigation links (desktop) */}
        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.label} className="navbar__link-item">
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right: Hamburger icon + dropdown */}
        <div className="navbar__menu" ref={menuRef}>
          <button
            type="button"
            className="navbar__menu-btn"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={handleMenuToggle}
          >
            ☰
          </button>

          <div className={`navbar__dropdown ${isMenuOpen ? "navbar__dropdown--open" : ""}`}>
          {MENU_ITEMS.map((item) => (
  <a
    key={item.label}
    href={item.href}
    className="navbar__dropdown-item"
    onClick={handleMenuItemClick}
  >
    {item.label}
  </a>
))}
          </div>
        </div>

        {/* Mobile-only nav toggle (for the center links) */}
        <button
          type="button"
          className="navbar__mobile-toggle"
          aria-label="Toggle navigation links"
          aria-expanded={isMobileNavOpen}
          onClick={handleMobileNavToggle}
        >
          <span className="navbar__mobile-toggle-bar" />
          <span className="navbar__mobile-toggle-bar" />
          <span className="navbar__mobile-toggle-bar" />
        </button>
      </nav>

      {/* Mobile nav-links panel */}
      <div className={`navbar__mobile-links ${isMobileNavOpen ? "navbar__mobile-links--open" : ""}`}>
      {NAV_LINKS.map((link) => (
  <a
    key={link.label}
    href={link.href}
    className="navbar__mobile-link"
    onClick={handleNavLinkClick}
  >
    {link.label}
  </a>
))}
      </div>
    </header>
  );
};

export default Navbar;