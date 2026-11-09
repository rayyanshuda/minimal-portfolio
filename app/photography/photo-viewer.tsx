"use client";

// Photo close-up for the classic and broadsheet themes: the same job as the record store's
// turntable (large photo, caption, date, previous / close / next, arrow keys + Esc), dressed
// for each theme instead of as a record player.
import { useEffect } from "react";
import { type PhotoCard } from "./layouts";
import "./photo-viewer.css";

type Look = "classic" | "newspaper";

const WORDS: Record<Look, { kicker: string; date: string; prev: string; close: string; next: string }> = {
  classic: { kicker: "photo", date: "", prev: "← prev", close: "close", next: "next →" },
  newspaper: { kicker: "plate", date: "photographed", prev: "‹ previous", close: "close", next: "next ›" },
};

export default function PhotoViewer({
  look,
  photos,
  index,
  onClose,
  onNav,
}: {
  look: Look;
  photos: PhotoCard[];
  index: number;
  onClose: () => void;
  onNav: (next: number) => void;
}) {
  const photo = photos[index];
  const words = WORDS[look];
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
    <div className={`pv pv--${look}`} role="dialog" aria-modal="true" aria-label={photo.caption} onClick={onClose}>
      <div className="pv-deck" onClick={(e) => e.stopPropagation()}>
        {/* key restarts the fade each time the photo changes */}
        <figure key={photo.id} className="pv-figure">
          <img src={photo.src} alt={photo.alt} className="pv-photo" />
        </figure>

        <div key={`${photo.id}-info`} className="pv-info">
          <p className="pv-label pv-kicker">
            {words.kicker} {index + 1} of {photos.length}
          </p>
          <p className="pv-caption">{photo.caption}</p>
          <p className="pv-label pv-date">
            {words.date ? `${words.date} ` : ""}
            {photo.date}
          </p>
          <div className="pv-controls">
            <button type="button" className="pv-label" onClick={prev} aria-label="previous photo">
              {words.prev}
            </button>
            <button type="button" className="pv-label" onClick={onClose} aria-label="close">
              {words.close}
            </button>
            <button type="button" className="pv-label" onClick={next} aria-label="next photo">
              {words.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
