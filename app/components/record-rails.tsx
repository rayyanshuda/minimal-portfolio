"use client";

// Record store side rails, shared by the homepage and every other page on that theme:
// left = a tracklist (a red needle dot marks the active track), right = theme, now spinning, listener.
import Link from "next/link";
import type { ReactNode } from "react";
import ThemePicker from "@/app/components/theme-picker";
import { SPOTIFY_PROFILE_URL } from "@/app/lib/spotify-constants";
import { useSpotifyWidget } from "@/app/lib/spotify-widget-store";
import "./record-rails.css";

export type RailTrack = {
  id: string;
  label: ReactNode;
  href?: string;
  onSelect?: () => void;
};

export const padTrack = (n: number) => String(n).padStart(2, "0");

/** A short, stable "waveform" for a name: bars whose heights come from its letters. */
export function Waveform({ name, bars = 24 }: { name: string; bars?: number }) {
  let h = 7;
  const heights: number[] = [];
  for (let i = 0; i < bars; i++) {
    h = (h * 31 + name.charCodeAt(i % name.length) + i * 17) % 997;
    heights.push(22 + (h % 78));
  }
  return (
    <span className="rr-wave" aria-hidden="true">
      {heights.map((height, b) => (
        <i key={b} style={{ height: `${height}%`, animationDelay: `${(b % 7) * -0.13}s` }} />
      ))}
    </span>
  );
}

export function RailHeading({ children, red }: { children: ReactNode; red?: boolean }) {
  return <span className={`rr-cap rr-head${red ? " rr-red" : ""}`}>{children}</span>;
}

/** The numbered list of tracks. Items with `href` are links; `onSelect` overrides navigation. */
export function RailTrackList({ items, activeId }: { items: RailTrack[]; activeId: string | null }) {
  return (
    <ol className="rr-list">
      {items.map((item, i) => {
        const className = item.id === activeId ? "is-active" : "";
        const body = (
          <>
            <span className="rr-num">{padTrack(i + 1)}</span>
            <span className="rr-list-text">{item.label}</span>
          </>
        );
        return (
          <li key={item.id}>
            {item.href ? (
              <Link
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
                {body}
              </Link>
            ) : (
              <button type="button" className={className} onClick={item.onSelect} aria-pressed={item.id === activeId}>
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function RailThemes() {
  return (
    <section className="rr-block rr-block--themes">
      <RailHeading>theme</RailHeading>
      <ThemePicker className="rr-themes" itemClassName="rr-theme" />
    </section>
  );
}

export function RailNowSpinning() {
  const { data, error } = useSpotifyWidget();
  if (!data) {
    return (
      <section className="rr-block rr-block--spin">
        <RailHeading>now spinning</RailHeading>
        <p className="rr-cap">{error || "tuning in…"}</p>
      </section>
    );
  }
  return (
    <a
      className={`rr-block rr-block--spin rr-spin${data.isPlaying ? " is-live" : ""}`}
      href={data.songUrl}
      target="_blank"
      rel="noreferrer"
    >
      <span className="rr-spin-head rr-head">
        <span className={`rr-dot${data.isPlaying ? " is-live" : ""}`} aria-hidden="true" />
        <span className="rr-cap">{data.isPlaying ? "now spinning" : "last spun"}</span>
      </span>
      <span className="rr-spin-track">
        {data.albumImageUrl ? <img className="rr-spin-art" src={data.albumImageUrl} alt="" /> : null}
        <span className="rr-spin-text">
          <span className="rr-spin-title">{data.title}</span>
          <span className="rr-spin-artist">{data.artist}</span>
        </span>
      </span>
      <Waveform name={data.title} />
    </a>
  );
}

export function RailListener() {
  const { data } = useSpotifyWidget();
  return (
    <section className="rr-block rr-block--listener">
      <RailHeading>listener</RailHeading>
      <a className="rr-listener" href={data?.profileUrl || SPOTIFY_PROFILE_URL} target="_blank" rel="noreferrer">
        <img src={data?.profileImageUrl || "/cat_ocean.PNG"} alt="" />
        <span>{data?.profileName || data?.profileUsername || "rhuda"}</span>
      </a>
    </section>
  );
}

/** The whole right rail: theme, now spinning, listener. */
export function RailRight() {
  return (
    <>
      <RailThemes />
      <RailNowSpinning />
      <RailListener />
    </>
  );
}
