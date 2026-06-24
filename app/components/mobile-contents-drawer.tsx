"use client";

import { useState } from "react";
import { useEffect, useRef } from "react";

type MobileContentsItem = {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
};

type MobileContentsDrawerProps = {
  title?: string;
  activeId?: string;
  items: MobileContentsItem[];
};

export default function MobileContentsDrawer({ title = "contents", activeId, items }: MobileContentsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isToggleVisible, setIsToggleVisible] = useState(true);
  const lastScrollYRef = useRef(0);

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

  const handleSelect = (item: MobileContentsItem) => {
    item.onSelect?.();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={isToggleVisible ? "mobile-contents-toggle is-visible" : "mobile-contents-toggle is-hidden"}
        aria-label="Open contents"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen ? <button type="button" className="mobile-contents-overlay" aria-label="Close contents" onClick={() => setIsOpen(false)} /> : null}

      <aside className={isOpen ? "mobile-contents-drawer open" : "mobile-contents-drawer"} aria-label="Mobile contents">
        <div className="mobile-contents-header">
          <p className="rh-muted rh-aside-label">{title}</p>
          <button type="button" className="mobile-contents-close" aria-label="Close contents" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <nav className="rh-aside-nav">
          {items.map((item) => {
            const className = `rh-aside-link rh-clink${activeId === item.id ? " is-active" : " rh-muted"}`;

            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={className}
                  onClick={(event) => {
                    if (item.onSelect) {
                      event.preventDefault();
                    }
                    handleSelect(item);
                  }}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <button key={item.id} type="button" className={className} onClick={() => handleSelect(item)}>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
