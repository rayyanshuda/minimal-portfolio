"use client";

// Paint-brush transition between site themes: accent swipes, then wide strokes in the new theme's
// background color cover the screen; the new theme is swapped in underneath and the paint fades away.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { commitSiteTheme, registerPainter, SITE_THEME_PAINT, type SiteTheme } from "@/app/lib/site-theme";
import "./paint-transition.css";

type Look = SiteTheme;

function paletteFor(look: Look) {
  return SITE_THEME_PAINT[look];
}

type Stroke = { d: string; width: number; color: string; delay: number; duration: number; opacity?: number };

const ACCENT_DUR = 420;
const COVER_START = 200;
const COVER_STAGGER = 55;
const COVER_DUR = 420;
const REVEAL_MS = 520;

/** A gently wavy stroke across the screen; `flip` paints it right-to-left. */
function wave(x0: number, y0: number, x1: number, y1: number, amp: number, flip: boolean) {
  const [ax, ay, bx, by] = flip ? [x1, y1, x0, y0] : [x0, y0, x1, y1];
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  return `M${ax},${ay} Q${(ax + mx) / 2},${(ay + my) / 2 - amp} ${mx},${my} T${bx},${by}`;
}

function accentStrokes(w: number, h: number, accents: string[]): Stroke[] {
  return accents.slice(0, 4).map((color, i) => ({
    d: wave(-160, h * (0.95 - i * 0.12), w + 160, h * (0.15 - i * 0.05), 40, i % 2 === 1),
    width: Math.max(90, Math.min(w, h) * 0.16),
    color,
    delay: i * 70,
    duration: ACCENT_DUR,
  }));
}

/** Horizontal bands, top to bottom, alternating direction, each with a few bristle streaks. */
function bandStrokes(w: number, h: number, color: string) {
  const strokes: Stroke[] = [];
  const gap = 140;
  const bands = Math.ceil(h / gap) + 1;
  for (let i = 0; i < bands; i++) {
    const y = i * gap + gap * 0.3;
    const flip = i % 2 === 1;
    const delay = COVER_START + i * COVER_STAGGER;
    const width = gap * 1.7;
    strokes.push({ d: wave(-160, y, w + 160, y + 10, 22, flip), width, color, delay, duration: COVER_DUR });
    // bristle streaks inside the band, slightly darker/lighter than the coat
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * (width / 5);
      strokes.push({
        d: wave(-160, y + off, w + 160, y + off + 10, 22, flip),
        width: 2 + ((i + k) % 3) * 2,
        color: k % 2 ? `color-mix(in srgb, ${color} 82%, #000)` : `color-mix(in srgb, ${color} 85%, #fff)`,
        delay: delay + 30,
        duration: COVER_DUR,
        opacity: 0.45,
      });
    }
  }
  const coverEnd = COVER_START + (bands - 1) * COVER_STAGGER + COVER_DUR;
  return { strokes, coverEnd };
}

type Run = {
  id: number;
  look: Look;
  w: number;
  h: number;
  bg: string;
  accents: Stroke[];
  coat: Stroke[];
  coverEnd: number;
  finishing: boolean;
};

function StrokeSvg({ w, h, strokes, className }: { w: number; h: number; strokes: Stroke[]; className?: string }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className}>
      <defs>
        {/* ragged, bristly paint edges */}
        <filter id="rh-paint-edge" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#rh-paint-edge)" fill="none" strokeLinecap="round">
        {strokes.map((s, i) => (
          <path
            key={i}
            d={s.d}
            pathLength={1}
            className="rh-paint-stroke"
            stroke={s.color}
            strokeWidth={s.width}
            strokeOpacity={s.opacity}
            style={{ animationDelay: `${s.delay}ms`, animationDuration: `${s.duration}ms` }}
          />
        ))}
      </g>
    </svg>
  );
}

export default function PaintTransition() {
  const [run, setRun] = useState<Run | null>(null);
  const busy = useRef(false);
  const pending = useRef<Look | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    const finish = (fadeMs: number) => {
      later(() => {
        setRun(null);
        busy.current = false;
        pending.current = null;
      }, fadeMs);
    };

    const paint = (look: Look) => {
      if (busy.current) {
        // already mid-stroke: swap in whichever look was picked last
        pending.current = look;
        return;
      }
      busy.current = true;
      pending.current = look;

      const id = Date.now();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const { bg, accents } = paletteFor(look);
      const accentSet = accentStrokes(w, h, accents);
      const { strokes: bands, coverEnd } = bandStrokes(w, h, bg);

      setRun({
        id,
        look,
        w,
        h,
        bg,
        accents: accentSet,
        coat: bands,
        coverEnd,
        finishing: false,
      });

      later(() => {
        // screen is fully painted: swap the real page underneath
        window.scrollTo({ top: 0 });
        commitSiteTheme(pending.current ?? look);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            later(() => setRun((r) => (r ? { ...r, finishing: true } : r)), 60);
            finish(60 + REVEAL_MS);
          }),
        );
      }, coverEnd + 40);
    };

    registerPainter(paint);
    const pendingTimers = timers.current;
    return () => {
      registerPainter(null);
      pendingTimers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (!run) return null;

  const vars = { "--paint-bg": run.bg, "--cover-end": `${run.coverEnd - 80}ms` } as CSSProperties;

  return (
    <div key={run.id} className={`rh-paint${run.finishing ? " is-revealing" : ""}`} style={vars} aria-hidden="true">
      <StrokeSvg w={run.w} h={run.h} strokes={[...run.accents, ...run.coat]} />
      {/* safety coat so no gaps survive between strokes right before the swap */}
      <div className="rh-paint-coat" />
    </div>
  );
}
