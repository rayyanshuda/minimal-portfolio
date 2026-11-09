"use client";

// Record-store photography: a journal of records. Each photo is an album cover with its vinyl
// half out of the sleeve, spinning while the entry is on screen. Clicking puts it on the
// turntable (full photo, spinning record, caption, prev / eject / next).
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { type PhotoCard } from "./layouts";
import { extractVinylColors, getVinylColors, useVinylColorsVersion } from "./vinyl-colors";
import "./record-store-photos.css";

/** CSS variables for a photo's record: its own `vinyl` colors, else ones picked from the photo. */
function vinylStyle(photo: PhotoCard): CSSProperties | undefined {
  const colors = photo.vinyl ?? getVinylColors(photo.src);
  return colors ? ({ "--v1": colors[0], "--v2": colors[1] } as CSSProperties) : undefined;
}

export function Turntable({
  photos,
  index,
  onClose,
  onNav,
}: {
  photos: PhotoCard[];
  index: number;
  onClose: () => void;
  onNav: (next: number) => void;
}) {
  const photo = photos[index];
  useVinylColorsVersion();
  const prev = () => onNav((index - 1 + photos.length) % photos.length);
  const next = () => onNav((index + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  return (
    <div className="rs-player" role="dialog" aria-modal="true" aria-label={photo.caption} onClick={onClose}>
      <div className="rs-player-deck" onClick={(e) => e.stopPropagation()}>
        <div className="rs-player-stage">
          {/* key restarts the slide-out each time the record changes */}
          <div key={photo.id} className="rs-player-vinyl" style={vinylStyle(photo)} aria-hidden="true">
            <div className="rs-player-grooves">
              <img src={photo.src} alt="" className="rs-player-label" />
            </div>
          </div>
          <img
            src={photo.src}
            alt={photo.alt}
            className="rs-player-cover"
            onLoad={(e) => extractVinylColors(e.currentTarget)}
          />
        </div>

        <div className="rs-player-info">
          <p className="rj-label rs-player-kicker">
            <span className="rs-player-dot" aria-hidden="true" /> now playing · track {index + 1} of{" "}
            {photos.length}
          </p>
          <p className="rs-player-title">{photo.caption}</p>
          <p className="rj-label rs-player-date">released {photo.date}</p>
          <div className="rs-player-controls">
            <button type="button" onClick={prev} aria-label="previous photo">
              ⏮
            </button>
            <button type="button" onClick={onClose} aria-label="close">
              ⏏
            </button>
            <button type="button" onClick={next} aria-label="next photo">
              ⏭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecordJournal({
  photos,
  onOpen,
  onActiveChange,
}: {
  photos: PhotoCard[];
  onOpen: (index: number) => void;
  onActiveChange?: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState<Set<string>>(() => new Set());
  useVinylColorsVersion();

  // covers that finished loading before hydration never fire onLoad; sample those once mounted
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLImageElement>(".rj-cover img").forEach((img) => {
      if (img.complete) extractVinylColors(img);
    });
  }, []);

  // records spin while their entry is on screen; the most visible one is the "current track"
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set((entry.target as HTMLElement).id, entry.intersectionRatio);
        setPlaying(new Set([...ratios].filter(([, r]) => r > 0.35).map(([id]) => id)));
        const best = [...ratios].sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) onActiveChange?.(best[0]);
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );
    list.querySelectorAll<HTMLElement>(".rj-entry").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onActiveChange]);

  return (
    <div className="rj" ref={listRef}>
      {photos.map((photo, index) => (
        <article
          key={photo.id}
          id={photo.id}
          className={`rj-entry${index % 2 ? " is-flip" : ""}${playing.has(photo.id) ? " is-playing" : ""}`}
        >
          <button type="button" className="rj-art" onClick={() => onOpen(index)} aria-label={`play: ${photo.caption}`}>
            <span className="rj-vinyl" style={vinylStyle(photo)} aria-hidden="true">
              <span className="rj-grooves">
                <img src={photo.src} alt="" loading="lazy" />
              </span>
            </span>
            <span className="rj-cover">
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                onLoad={(e) => extractVinylColors(e.currentTarget)}
              />
            </span>
          </button>

          <div className="rj-text">
            <p className="rj-label rj-track">track {index + 1}</p>
            <p className="rj-caption">{photo.caption}</p>
            <p className="rj-label rj-date">released {photo.date}</p>
            <button type="button" className="rj-label rj-play" onClick={() => onOpen(index)}>
              ▶ play
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
