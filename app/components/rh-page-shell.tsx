"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import MobileContentsDrawer from "@/app/components/mobile-contents-drawer";
import MobileThemeToggle from "@/app/components/mobile-theme-toggle";
import OverflowMarquee from "@/app/components/overflow-marquee";
import { SPOTIFY_PROFILE_URL } from "@/app/lib/spotify-constants";
import { useSpotifyWidget, type SpotifyWidgetData } from "@/app/lib/spotify-widget-store";

export type { SpotifyWidgetData };

export type Theme = "midnight" | "snow" | "coffee-cream" | "dusty-blue";

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
const BRUSH_SPACING = 4;
const MOBILE_UI_SELECTOR =
  ".mobile-contents-toggle, .mobile-contents-drawer, .mobile-contents-overlay, .mobile-theme-toggle, .mobile-theme-overlay, .mobile-theme-close";

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return !!target.closest("a, button, input, textarea, select, label, [role='button']");
}

function isInSidebarColumn(clientX: number, pageEl: HTMLElement) {
  const main = pageEl.querySelector(".rh-main");
  if (!(main instanceof HTMLElement)) return false;
  const mainR = main.getBoundingClientRect();
  return clientX < mainR.left || clientX > mainR.right;
}

function isInMainColumn(clientX: number, pageEl: HTMLElement) {
  const main = pageEl.querySelector(".rh-main");
  if (!(main instanceof HTMLElement)) return false;
  const r = main.getBoundingClientRect();
  return clientX >= r.left && clientX <= r.right;
}

function clientToDoc(clientX: number, clientY: number) {
  return { x: clientX + window.scrollX, y: clientY + window.scrollY };
}

function appendDabs(container: HTMLElement, points: PaintDab[]) {
  if (!points.length) return;
  const fragment = document.createDocumentFragment();
  for (const { x, y, r } of points) {
    const dab = document.createElement("div");
    dab.className = "rh-grid-brush-dab";
    dab.style.left = `${x - r}px`;
    dab.style.top = `${y - r}px`;
    dab.style.width = `${r * 2}px`;
    dab.style.height = `${r * 2}px`;
    fragment.appendChild(dab);
  }
  container.appendChild(fragment);
}

function dabsAlongSegment(docX0: number, docY0: number, docX1: number, docY1: number): PaintDab[] {
  const dx = docX1 - docX0;
  const dy = docY1 - docY0;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return [{ x: docX1, y: docY1, r: BRUSH_RADIUS }];

  const steps = Math.max(1, Math.ceil(dist / BRUSH_SPACING));
  const dabs: PaintDab[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    dabs.push({ x: docX0 + dx * t, y: docY0 + dy * t, r: BRUSH_RADIUS });
  }
  return dabs;
}

function addDabsAlongLine(
  docX0: number,
  docY0: number,
  docX1: number,
  docY1: number,
  addDabs: (points: PaintDab[]) => void,
) {
  addDabs(dabsAlongSegment(docX0, docY0, docX1, docY1));
}

type CaretDocument = Document & {
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
};

function getTextNodeAtPoint(clientX: number, clientY: number): Text | null {
  const doc = document as CaretDocument;

  if (doc.caretRangeFromPoint) {
    const caret = doc.caretRangeFromPoint(clientX, clientY);
    if (!caret || caret.startContainer.nodeType !== Node.TEXT_NODE) return null;
    return caret.startContainer as Text;
  }

  if (doc.caretPositionFromPoint) {
    const caret = doc.caretPositionFromPoint(clientX, clientY);
    if (!caret || caret.offsetNode.nodeType !== Node.TEXT_NODE) return null;
    return caret.offsetNode as Text;
  }

  return null;
}

function hasSidebarTextAtPoint(clientX: number, clientY: number) {
  const textNode = getTextNodeAtPoint(clientX, clientY);
  if (!textNode) return false;

  const parent = textNode.parentElement;
  if (!parent?.closest(".rh-aside-panel, .theme-nav")) return false;

  const range = document.createRange();
  range.selectNodeContents(textNode);
  for (const rect of range.getClientRects()) {
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      return true;
    }
  }
  return false;
}

function isMainTextAtPoint(clientX: number, clientY: number) {
  const textNode = getTextNodeAtPoint(clientX, clientY);
  if (!textNode) return false;

  const parent = textNode.parentElement;
  if (!parent?.closest(".rh-main")) return false;
  if (isInteractiveTarget(textNode)) return false;
  return true;
}

type RhPageShellProps = {
  children: ReactNode;
  contentsItems: RhContentsItem[];
  activeContentId: string;
};

export default function RhPageShell({ children, contentsItems, activeContentId }: RhPageShellProps) {
  const [theme, setTheme] = useState<Theme>("coffee-cream");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const { data: spotifyData, error: spotifyError } = useSpotifyWidget();
  const [isGridPainting, setIsGridPainting] = useState(false);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const highlightsRef = useRef<HTMLDivElement | null>(null);
  const paintRef = useRef({
    active: false,
    mode: null as "grid" | "text" | null,
    moved: false,
    sidebarPressed: false,
    pointerId: null as number | null,
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

    pageEl.querySelectorAll("mark.rh-word-highlight").forEach((mark) => {
      mark.replaceWith(...mark.childNodes);
    });

    const clearGridPaint = () => {
      highlightsRef.current?.replaceChildren();
    };

    const addDabsToCanvas = (points: PaintDab[]) => {
      const container = highlightsRef.current;
      if (!container || !points.length) return;
      appendDabs(container, points);
    };

    const releasePointer = (pointerId: number | null) => {
      if (pointerId === null) return;
      if (pageEl.hasPointerCapture(pointerId)) {
        pageEl.releasePointerCapture(pointerId);
      }
    };

    const beginGridPaint = (e: PointerEvent) => {
      e.preventDefault();
      window.getSelection()?.removeAllRanges();

      const pressX = paintRef.current.startX;
      const pressY = paintRef.current.startY;
      const pressDoc = clientToDoc(pressX, pressY);
      const { x, y } = clientToDoc(e.clientX, e.clientY);
      const moved = Math.hypot(e.clientX - pressX, e.clientY - pressY) > GRID_PAINT_DRAG_THRESHOLD;

      paintRef.current = {
        active: true,
        mode: "grid",
        moved,
        sidebarPressed: false,
        pointerId: e.pointerId,
        startX: pressX,
        startY: pressY,
        lastX: pressDoc.x,
        lastY: pressDoc.y,
      };

      pageEl.setPointerCapture(e.pointerId);
      setIsGridPainting(true);
      addDabsToCanvas([{ x: pressDoc.x, y: pressDoc.y, r: BRUSH_RADIUS }]);
      if (pressDoc.x !== x || pressDoc.y !== y) {
        addDabsAlongLine(pressDoc.x, pressDoc.y, x, y, addDabsToCanvas);
      }
      paintRef.current.lastX = x;
      paintRef.current.lastY = y;
    };

    const paintTo = (clientX: number, clientY: number) => {
      const paint = paintRef.current;
      const { x, y } = clientToDoc(clientX, clientY);

      if (paint.lastX !== null && paint.lastY !== null) {
        addDabsAlongLine(paint.lastX, paint.lastY, x, y, addDabsToCanvas);
      } else {
        addDabsToCanvas([{ x, y, r: BRUSH_RADIUS }]);
      }

      paint.lastX = x;
      paint.lastY = y;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;

      const target = e.target;
      if (target instanceof Element && target.closest(MOBILE_UI_SELECTOR)) {
        clearGridPaint();
        return;
      }

      const inMain = isInMainColumn(e.clientX, pageEl);
      const inSidebar = isInSidebarColumn(e.clientX, pageEl);

      if (inMain) {
        paintRef.current.sidebarPressed = false;
        if (isMainTextAtPoint(e.clientX, e.clientY)) {
          clearGridPaint();
          paintRef.current = {
            active: true,
            mode: "text",
            moved: false,
            sidebarPressed: false,
            pointerId: null,
            startX: e.clientX,
            startY: e.clientY,
            lastX: null,
            lastY: null,
          };
          return;
        }
        return;
      }

      if (!inSidebar) return;

      paintRef.current.sidebarPressed = true;
      paintRef.current.startX = e.clientX;
      paintRef.current.startY = e.clientY;

      if (hasSidebarTextAtPoint(e.clientX, e.clientY)) return;

      beginGridPaint(e);
    };

    const onPointerMove = (e: PointerEvent) => {
      const paint = paintRef.current;

      if (!paint.active || paint.mode !== "grid") {
        if (e.buttons !== 1 || !paint.sidebarPressed) return;
        if (hasSidebarTextAtPoint(e.clientX, e.clientY)) return;
        if (Math.hypot(e.clientX - paint.startX, e.clientY - paint.startY) < GRID_PAINT_DRAG_THRESHOLD) return;
        beginGridPaint(e);
        return;
      }

      if (paint.pointerId !== null && e.pointerId !== paint.pointerId) return;

      if (Math.hypot(e.clientX - paint.startX, e.clientY - paint.startY) > GRID_PAINT_DRAG_THRESHOLD) {
        paint.moved = true;
        window.getSelection()?.removeAllRanges();
      }

      e.preventDefault();

      const moves =
        typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
      for (const move of moves) {
        paintTo(move.clientX, move.clientY);
      }
    };

    const endPaint = (e: PointerEvent) => {
      const paint = paintRef.current;
      if (!paint.active && !paint.sidebarPressed) return;
      if (
        paint.active &&
        paint.mode === "grid" &&
        paint.pointerId !== null &&
        e.pointerId !== paint.pointerId
      ) {
        return;
      }

      releasePointer(paint.pointerId);

      if (paint.active && paint.mode === "grid" && !paint.moved) {
        clearGridPaint();
      }

      paintRef.current = {
        active: false,
        mode: null,
        moved: false,
        sidebarPressed: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        lastX: null,
        lastY: null,
      };
      setIsGridPainting(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    pageEl.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", endPaint, true);
    document.addEventListener("pointercancel", endPaint, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      pageEl.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endPaint, true);
      document.removeEventListener("pointercancel", endPaint, true);
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
