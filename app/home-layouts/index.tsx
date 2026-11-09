"use client";

// Homepage designs for the non-classic site themes (classic uses the page in app/page.tsx).
// Theme state lives in app/lib/site-theme.ts.
import type { SiteTheme } from "@/app/lib/site-theme";
import NewspaperHome from "./newspaper";
import RecordHome from "./record";

/** Themes with their own homepage design. */
export function hasAltHome(theme: SiteTheme): theme is "newspaper" | "music" {
  return theme === "newspaper" || theme === "music";
}

export function AltHome({ look }: { look: "newspaper" | "music" }) {
  return look === "newspaper" ? <NewspaperHome /> : <RecordHome />;
}
