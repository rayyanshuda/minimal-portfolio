"use client";

// The four site themes as a list of buttons. Each theme's frame styles it via `className`.
import { setSiteTheme, SITE_THEME_ORDER, SITE_THEMES, useSiteTheme } from "@/app/lib/site-theme";

export default function ThemePicker({ className, itemClassName }: { className: string; itemClassName: string }) {
  const theme = useSiteTheme();
  return (
    <div className={className} role="group" aria-label="Site theme">
      {SITE_THEME_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={theme === t}
          className={`${itemClassName}${theme === t ? " is-active" : ""}`}
          onClick={() => setSiteTheme(t)}
        >
          {SITE_THEMES[t]}
        </button>
      ))}
    </div>
  );
}
