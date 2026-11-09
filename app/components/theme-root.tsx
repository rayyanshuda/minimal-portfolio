"use client";

// Site-wide theme plumbing, mounted once in app/layout.tsx:
// keeps <html data-site-theme> in sync, reveals the page once the right theme has rendered,
// and hosts the paint-brush transition used when switching themes.
import { useEffect } from "react";
import PaintTransition from "@/app/home-layouts/paint-transition";
import { applySiteThemeAttribute, useSiteTheme } from "@/app/lib/site-theme";

export default function ThemeRoot() {
  const theme = useSiteTheme();

  useEffect(() => {
    applySiteThemeAttribute(theme);
    // the boot script hides the page until the themed markup has rendered (see site-themes.css)
    const id = requestAnimationFrame(() => document.documentElement.setAttribute("data-site-ready", ""));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  return <PaintTransition />;
}
