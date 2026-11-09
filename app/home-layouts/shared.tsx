"use client";

import { useSyncExternalStore } from "react";
import { useSpotifyWidget } from "@/app/lib/spotify-widget-store";

export { useSpotifyWidget };

const noopSubscribe = () => () => {};

let cachedDate: string | null = null;
let cachedTime: string | null = null;

/** Today's date, e.g. "sunday, november 8, 2026". null during server render (avoids hydration mismatch). */
export function useToday() {
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      (cachedDate ??= new Date()
        .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        .toLowerCase()),
    () => null,
  );
}

/** Local time at page load, e.g. "9:14 pm". */
export function useTimeOfDay() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (cachedTime ??= new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()),
    () => null,
  );
}

const ROMAN: [number, string][] = [
  [10, "x"],
  [9, "ix"],
  [5, "v"],
  [4, "iv"],
  [1, "i"],
];

export function roman(n: number) {
  let out = "";
  for (const [value, numeral] of ROMAN) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

export function isExternal(href: string) {
  return /^https?:/.test(href);
}

/** Props for an <a> that opens external links in a new tab. */
export function linkProps(href: string) {
  return isExternal(href) ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };
}

/** Loads a Google Fonts stylesheet once; React hoists it into <head>. */
export function GoogleFont({ query }: { query: string }) {
  return <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${query}&display=swap`} precedence="default" />;
}
