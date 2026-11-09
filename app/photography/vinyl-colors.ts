"use client";

// Two colors per photo for its record: the photo's dominant color (ring around the label) and a
// second, clearly different color (thin inner ring). Read from the cover <img> once it has loaded
// (same-origin, so canvas can sample it). A photo can override with `vinyl: [ring, accent]` in
// app/photography/page.tsx.
import { useSyncExternalStore } from "react";

export type VinylColors = [string, string];

const cache = new Map<string, VinylColors>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-render when any photo's colors arrive. */
export function useVinylColorsVersion() {
  return useSyncExternalStore(subscribe, () => version, () => 0);
}

export function getVinylColors(src: string): VinylColors | undefined {
  return cache.get(src);
}

type Bin = { r: number; g: number; b: number; n: number; score: number };

function rgbToHsl(r: number, g: number, b: number) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

/** A vinyl-friendly version of a sampled color: more saturated, lightness kept in a range. */
function press(r: number, g: number, b: number, minL: number, maxL: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l0 = (max + min) / 2;
  const s0 = d === 0 ? 0 : d / (1 - Math.abs(2 * l0 - 1));
  const s = Math.min(1, s0 * 1.5 + 0.08);
  const l = Math.min(maxL, Math.max(minL, l0));
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

/** Sample an already-loaded image and cache its two record colors. */
export function extractVinylColors(img: HTMLImageElement) {
  const src = img.getAttribute("src") ?? "";
  if (!src || cache.has(src) || !img.naturalWidth) return;

  const size = 40;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  try {
    ctx.drawImage(img, 0, 0, size, size);
  } catch {
    return;
  }
  const { data } = ctx.getImageData(0, 0, size, size);

  // bucket pixels into a coarse color cube (4 bits per channel)
  const bins = new Map<number, Bin>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bin = bins.get(key) ?? { r: 0, g: 0, b: 0, n: 0, score: 0 };
    bin.r += r;
    bin.g += g;
    bin.b += b;
    bin.n++;
    bins.set(key, bin);
  }

  // score = how common × how colorful; near-black / near-white count for less
  const ranked = [...bins.values()]
    .map((bin) => {
      const r = bin.r / bin.n;
      const g = bin.g / bin.n;
      const b = bin.b / bin.n;
      const { s, l } = rgbToHsl(r, g, b);
      const tonal = l < 0.12 || l > 0.9 ? 0.25 : 1;
      return { r, g, b, n: bin.n, score: bin.n * (0.35 + s) * tonal };
    })
    .sort((a, b) => b.score - a.score);

  const first = ranked[0];
  if (!first) return;
  const dist = (a: Bin, b: Bin) => Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
  // second color: the best-scoring bin that's clearly different from the first
  const second = ranked.find((bin) => dist(bin, first) > 90) ?? ranked[1] ?? first;

  // [vinyl body: mid-dark so grooves still read, accent: lighter so it pops against the body]
  cache.set(src, [press(first.r, first.g, first.b, 0.26, 0.5), press(second.r, second.g, second.b, 0.5, 0.78)]);
  notify();
}
