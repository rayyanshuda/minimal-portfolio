"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import MobileContentsDrawer from "@/app/components/mobile-contents-drawer";
import MobileThemeToggle from "@/app/components/mobile-theme-toggle";
import OverflowMarquee from "@/app/components/overflow-marquee";
import { SPOTIFY_PROFILE_URL } from "@/app/lib/spotify-constants";

export type Theme = "midnight" | "snow" | "coffee-cream" | "dusty-blue";

export type SpotifyWidgetData = {
  isPlaying: boolean;
  title: string;
  artist: string;
  songUrl: string;
  albumImageUrl: string;
  profileName: string;
  profileUsername: string;
  profileImageUrl: string;
  profileUrl: string;
};

export type RhContentsItem = {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
};

const themeOrder: Theme[] = ["midnight", "snow", "coffee-cream", "dusty-blue"];

type PaintDab = { x: number; y: number; r: number };

const GRID_PAINT_DRAG_THRESHOLD = 4;
const BRUSH_RADIUS = 12;
const BRUSH_SPACING = 6;
const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, label, [role='button'], .mobile-contents-toggle, .mobile-contents-drawer, .mobile-contents-overlay, .mobile-theme-toggle, .mobile-theme-overlay, .mobile-theme-close, .theme-nav";

function clientToDoc(clientX: number, clientY: number) {
  return { x: clientX + window.scrollX, y: clientY + window.scrollY };
}

function dabsAlongLine(x0: number, y0: number, x1: number, y1: number, r: number): PaintDab[] {
  const dabs: PaintDab[] = [];
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < BRUSH_SPACING) {
    dabs.push({ x: x1, y: y1, r });
    return dabs;
  }
  const steps = Math.ceil(dist / BRUSH_SPACING);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    dabs.push({ x: x0 + dx * t, y: y0 + dy * t, r });
  }
  return dabs;
}

function appendDab(container: HTMLElement, { x, y, r }: PaintDab) {
  const dab = document.createElement("div");
  dab.className = "rh-grid-brush-dab";
  dab.style.left = `${x - r}px`;
  dab.style.top = `${y - r}px`;
  dab.style.width = `${r * 2}px`;
  dab.style.height = `${r * 2}px`;
  container.appendChild(dab);
}

function isGridPaintTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return !target.closest(INTERACTIVE_SELECTOR);
}

type RhPageShellProps = {
  children: ReactNode;
  contentsItems: RhContentsItem[];
  activeContentId: string;
};

export default function RhPageShell({ children, contentsItems, activeContentId }: RhPageShellProps) {
  const [theme, setTheme] = useState<Theme>("coffee-cream");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyWidgetData | null>(null);
  const [spotifyError, setSpotifyError] = useState("");
  const [isGridPainting, setIsGridPainting] = useState(false);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const highlightsRef = useRef<HTMLDivElement | null>(null);
  const paintRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: null as number | null,
    lastY: null as number | null,
  });

  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    document.body.setAttribute("data-theme", t);
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    const initial: Theme = stored && themeOrder.includes(stored) ? stored : "coffee-cream";
    setTheme(initial);
    applyTheme(initial);
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isThemeReady) return;
    applyTheme(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme, isThemeReady]);

  useEffect(() => {
    const pageEl = pageRef.current;
    if (!pageEl) return;

    const clearPaint = () => {
      highlightsRef.current?.replaceChildren();
    };

    const addDabs = (points: PaintDab[]) => {
      const container = highlightsRef.current;
      if (!container || !points.length) return;
      for (const point of points) appendDab(container, point);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!isGridPaintTarget(e.target)) {
        clearPaint();
        return;
      }

      e.preventDefault();
      const { x, y } = clientToDoc(e.clientX, e.clientY);
      paintRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        lastX: x,
        lastY: y,
      };
      setIsGridPainting(true);
      addDabs([{ x, y, r: BRUSH_RADIUS }]);
    };

    const onMouseMove = (e: MouseEvent) => {
      const paint = paintRef.current;
      if (!paint.active) return;

      if (Math.hypot(e.clientX - paint.startX, e.clientY - paint.startY) > GRID_PAINT_DRAG_THRESHOLD) {
        paint.moved = true;
      }

      const { x, y } = clientToDoc(e.clientX, e.clientY);
      if (paint.lastX !== null && paint.lastY !== null) {
        addDabs(dabsAlongLine(paint.lastX, paint.lastY, x, y, BRUSH_RADIUS));
      } else {
        addDabs([{ x, y, r: BRUSH_RADIUS }]);
      }
      paint.lastX = x;
      paint.lastY = y;
    };

    const endPaint = () => {
      const paint = paintRef.current;
      if (!paint.active) return;
      if (!paint.moved) clearPaint();
      paintRef.current = {
        active: false,
        moved: false,
        startX: 0,
        startY: 0,
        lastX: null,
        lastY: null,
      };
      setIsGridPainting(false);
    };

    pageEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endPaint);
    return () => {
      pageEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endPaint);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSpotify = async (attempt = 0): Promise<void> => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch("/api/spotify", { cache: "no-store", signal: controller.signal });
        if (!res.ok) {
          const errorJson = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(errorJson.message ?? "Failed to load Spotify track.");
        }

        const data = (await res.json()) as SpotifyWidgetData;
        if (!mounted) return;

        setSpotifyData(data);
        setSpotifyError("");
      } catch (e) {
        if (!mounted) return;

        if (attempt < 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 800));
          if (!mounted) return;
          return loadSpotify(attempt + 1);
        }

        const message =
          e instanceof Error && e.name === "AbortError"
            ? "Spotify widget timed out."
            : e instanceof Error
              ? e.message
              : "Spotify widget unavailable.";
        setSpotifyError(message);
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void loadSpotify();
    const id = window.setInterval(() => void loadSpotify(), 30000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const drawerItems = contentsItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    onSelect: item.onSelect,
  }));

  return (
    <div className={isGridPainting ? "rh-page is-grid-painting" : "rh-page"} ref={pageRef}>
      <div className="rh-backdrop-stack" aria-hidden="true">
        <div className="rh-page-fill" />
        <div className="rh-grid-backdrop" />
      </div>

      <div className="rh-grid-highlights" ref={highlightsRef} aria-hidden="true" />

      <MobileThemeToggle />
      <MobileContentsDrawer activeId={activeContentId} items={drawerItems} />

      <div className="rh-shell">
        <aside className="rh-aside-left" aria-label="Contents">
          <div className="rh-aside-panel rh-aside-panel--left">
          <p className="rh-muted rh-aside-label">contents</p>
          <nav className="rh-aside-nav">
            {contentsItems.map((item) => {
              const isActive = activeContentId === item.id;
              const className = `rh-aside-link rh-clink${isActive ? " is-active" : " rh-muted"}`;

              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={className}
                    onClick={
                      item.onSelect
                        ? (e) => {
                            e.preventDefault();
                            item.onSelect?.();
                          }
                        : undefined
                    }
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <button key={item.id} type="button" className={className} onClick={item.onSelect} aria-pressed={isActive}>
                  {item.label}
                </button>
              );
            })}
          </nav>
          </div>
        </aside>

        <main className="rh-main">{children}</main>

        <aside className="rh-aside-right" aria-label="Theme controls">
          <div className="rh-aside-panel rh-aside-panel--right">
          <p className="rh-muted rh-aside-label">appearance</p>
          <div className="rh-aside-theme-list">
            {themeOrder.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={`rh-aside-theme-btn rh-clink${theme === t ? "" : " rh-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="rh-muted rh-aside-label">spotify</p>
          {spotifyData ? (
            <a href={spotifyData.songUrl} target="_blank" rel="noreferrer" className="rh-spotify-card">
              {spotifyData.albumImageUrl ? (
                <img src={spotifyData.albumImageUrl} alt="" className="rh-spotify-card-art" />
              ) : (
                <span className="rh-spotify-card-art rh-spotify-card-art-fallback">♪</span>
              )}
              <span className="rh-spotify-card-track">
                <span className="rh-spotify-card-status">{spotifyData.isPlaying ? "now playing" : "last played"}</span>
                <span className="rh-spotify-card-title">
                  <OverflowMarquee text={spotifyData.title} />
                </span>
                <span className="rh-spotify-card-artist">
                  <OverflowMarquee text={spotifyData.artist} />
                </span>
              </span>
            </a>
          ) : (
            <p className="rh-muted rh-aside-loading">{spotifyError || "loading…"}</p>
          )}

          <p className="rh-muted rh-aside-label">profile</p>
          <a
            href={spotifyData?.profileUrl || SPOTIFY_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="rh-aside-profile"
          >
            <img src={spotifyData?.profileImageUrl || "/cat_ocean.PNG"} alt="" />
            <span>{spotifyData?.profileName || spotifyData?.profileUsername || "rhuda"}</span>
          </a>
          </div>
        </aside>
      </div>

      <aside className="theme-nav" aria-label="Theme controls">
        <p className="rh-muted rh-aside-label">appearance</p>
        <div className="rh-aside-theme-list">
          {themeOrder.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`rh-aside-theme-btn rh-clink${theme === t ? "" : " rh-muted"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="rh-muted rh-aside-label">spotify</p>
        {spotifyData ? (
          <a href={spotifyData.songUrl} target="_blank" rel="noreferrer" className="rh-spotify-card">
            {spotifyData.albumImageUrl ? (
              <img src={spotifyData.albumImageUrl} alt={`Album art for ${spotifyData.title}`} className="rh-spotify-card-art" />
            ) : (
              <span className="rh-spotify-card-art rh-spotify-card-art-fallback" aria-hidden="true">
                ♪
              </span>
            )}
            <span className="rh-spotify-card-track">
              <span className="rh-spotify-card-status">{spotifyData.isPlaying ? "now playing" : "last played"}</span>
              <span className="rh-spotify-card-title">
                <OverflowMarquee text={spotifyData.title} />
              </span>
              <span className="rh-spotify-card-artist">
                <OverflowMarquee text={spotifyData.artist} />
              </span>
            </span>
          </a>
        ) : (
          <p className="rh-muted rh-aside-loading">{spotifyError || "loading…"}</p>
        )}

        <p className="rh-muted rh-aside-label">profile</p>
        <a
          href={spotifyData?.profileUrl || SPOTIFY_PROFILE_URL}
          target="_blank"
          rel="noreferrer"
          className="rh-aside-profile"
        >
          <img
            src={spotifyData?.profileImageUrl || "/cat_ocean.PNG"}
            alt="Rayyan Huda Spotify profile"
          />
          <span>{spotifyData?.profileName || spotifyData?.profileUsername || "rhuda"}</span>
        </a>
      </aside>
    </div>
  );
}
