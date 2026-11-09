"use client";

// Record store homepage: one record (your current Spotify song as its label) on a sleeve, then every
// section in a single centred column. The side rails are shared with every record store page
// (record-rails.tsx). Narrow screens move the themes to the top and turn now spinning into a mini
// player along the bottom.
import { useEffect, useState } from "react";
import { intro } from "@/app/lib/home-content";
import { useSpotifyWidget } from "@/app/lib/spotify-widget-store";
import { padTrack as pad, RailHeading, RailRight, RailTrackList } from "@/app/components/record-rails";
import { RecFonts, SectionBody, TRACKS, Vinyl } from "./common";

/** The id of the section crossing the middle of the screen. */
function useActiveTrack() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const t of TRACKS) {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return active;
}

export default function RecordHome() {
  const { data } = useSpotifyWidget();
  const active = useActiveTrack();

  return (
    <div className="rec rec--single">
      <RecFonts />
      <nav className="rec-rail rec-rail--left rr" aria-label="Sections">
        <RailHeading red>side a · {TRACKS.length} tracks</RailHeading>
        <RailTrackList items={TRACKS.map((t) => ({ id: t.id, label: t.label, href: `#${t.id}` }))} activeId={active} />
      </nav>
      <aside className="rec-rail rec-rail--right rr" aria-label="Theme, Spotify and profile">
        <RailRight />
      </aside>

      <main className="rec-single-col">
        <div className="rec-single-hero" aria-hidden="true">
          <div className="rec-single-sleeve">
            <span className="rec-script">rh</span>
          </div>
          <Vinyl
            size={230}
            spinning={Boolean(data?.isPlaying)}
            className="rec-single-vinyl"
            label={data?.albumImageUrl ? <img src={data.albumImageUrl} alt="" /> : null}
          />
        </div>

        <h1 className="rec-script rec-single-name">{intro.name}</h1>
        <p className="rec-cap">{intro.subtitle}</p>
        <p className="rec-lede">{intro.lede}</p>

        {TRACKS.map((t, i) => (
          <section key={t.id} id={t.id} className="rec-single-section">
            <h2 className="rec-cap rec-single-head">
              <span className="rec-red">{pad(i + 1)}</span> {t.label}
            </h2>
            <SectionBody id={t.id} />
          </section>
        ))}
      </main>
    </div>
  );
}
