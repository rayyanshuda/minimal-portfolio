"use client";

// Site-wide theme: classic, broadsheet or record store. Saved per visitor in
// localStorage and mirrored onto <html data-site-theme> (an inline script in app/layout.tsx sets
// it before first paint, so returning visitors don't see a flash of the wrong theme).
// New visitors get DEFAULT_SITE_THEME.
import { useSyncExternalStore } from "react";

export const SITE_THEMES = {
  classic: "classic",
  newspaper: "broadsheet",
  music: "record store",
} as const;
export type SiteTheme = keyof typeof SITE_THEMES;
export const SITE_THEME_ORDER = Object.keys(SITE_THEMES) as SiteTheme[];

export const SITE_THEME_KEY = "rh-site-theme";
/** Theme for first-time visitors. Keep in sync with app/lib/site-theme-boot.ts. */
export const DEFAULT_SITE_THEME: SiteTheme = "music";
const LEGACY_KEY = "rh-dev-look";
const EVENT = "rh-site-theme-change";

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return !!value && value in SITE_THEMES;
}

export function readSiteTheme(): SiteTheme {
  const fromUrl = new URLSearchParams(window.location.search).get("look");
  if (isSiteTheme(fromUrl)) return fromUrl;
  try {
    const stored = localStorage.getItem(SITE_THEME_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (isSiteTheme(stored)) return stored;
  } catch {}
  return DEFAULT_SITE_THEME;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function applySiteThemeAttribute(theme: SiteTheme) {
  if (theme === "classic") document.documentElement.removeAttribute("data-site-theme");
  else document.documentElement.setAttribute("data-site-theme", theme);
}

/** Apply a theme immediately (no animation). */
export function commitSiteTheme(theme: SiteTheme) {
  try {
    localStorage.setItem(SITE_THEME_KEY, theme);
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
  const url = new URL(window.location.href);
  if (url.searchParams.has("look")) {
    url.searchParams.set("look", theme);
    window.history.replaceState(null, "", url);
  }
  applySiteThemeAttribute(theme);
  window.dispatchEvent(new Event(EVENT));
}

/* The paint-brush transition registers itself here (app/components/theme-root.tsx). */
type Painter = (theme: SiteTheme) => void;
let painter: Painter | null = null;

export function registerPainter(next: Painter | null) {
  painter = next;
}

/** Switch themes, with the paint-brush transition when available. */
export function setSiteTheme(theme: SiteTheme) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (painter && !reduceMotion && theme !== readSiteTheme()) painter(theme);
  else commitSiteTheme(theme);
}

export function useSiteTheme(): SiteTheme {
  return useSyncExternalStore(subscribe, readSiteTheme, () => DEFAULT_SITE_THEME);
}

/** Paint colors per theme for the transition: accent strokes first, then a coat of the new background. */
export const SITE_THEME_PAINT: Record<SiteTheme, { bg: string; accents: string[] }> = {
  classic: { bg: "#f3ece2", accents: ["#7a6454", "#b19479"] },
  newspaper: { bg: "#f8f6f0", accents: ["#121212", "#8a8578"] },
  music: { bg: "#f4ecdc", accents: ["#1d3557", "#c8323a", "#1d3557"] },
};
