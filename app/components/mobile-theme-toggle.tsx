"use client";

import { useEffect, useRef, useState } from "react";

export default function MobileThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [isToggleVisible, setIsToggleVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("mobile-theme-open");
    } else {
      document.body.classList.remove("mobile-theme-open");
    }

    return () => {
      document.body.classList.remove("mobile-theme-open");
    };
  }, [isOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      if (isOpen) return;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;

      if (Math.abs(delta) < 6) return;
      if (delta > 0 && currentY > 28) {
        setIsToggleVisible(false);
      } else if (delta < 0) {
        setIsToggleVisible(true);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={isToggleVisible ? "mobile-theme-toggle is-visible" : "mobile-theme-toggle is-hidden"}
        aria-label="Open appearance and Spotify"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true" className="mobile-theme-icon" />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="mobile-theme-overlay"
            aria-label="Close appearance and Spotify"
            onClick={() => setIsOpen(false)}
          />
          <button
            type="button"
            className="mobile-theme-close"
            aria-label="Close appearance and Spotify"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </>
      ) : null}
    </>
  );
}
