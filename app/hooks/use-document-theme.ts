"use client";

import { useEffect, useState } from "react";

export type Theme = "midnight" | "snow" | "coffee-cream" | "dusty-blue";

export function useDocumentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("coffee-cream");

  useEffect(() => {
    const read = () => {
      const stored = document.documentElement.getAttribute("data-theme") as Theme | null;
      if (stored) setTheme(stored);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function getThemeBackgroundColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  return bg || "#000000";
}
