"use client";

// Page frame for the broadsheet and record store themes. One structure (top bar,
// left contents, main, right rail with theme picker / Spotify / profile) with three skins:
// see themed-shell.css. The classic frame is rh-page-shell.tsx.
import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RailHeading,
  RailRight,
  RailTrackList,
} from "@/app/components/record-rails";
import ThemePicker from "@/app/components/theme-picker";
import { GoogleFont, useToday } from "@/app/home-layouts/shared";
import { SPOTIFY_PROFILE_URL } from "@/app/lib/spotify-constants";
import { useSpotifyWidget } from "@/app/lib/spotify-widget-store";
import type { SiteTheme } from "@/app/lib/site-theme";
import "./themed-shell.css";

export type ShellContentsItem = {
  id: string;
  label: ReactNode;
  href?: string;
  onSelect?: () => void;
};

type Skin = {
  fonts: string;
  back: string;
  contents: string;
  theme: string;
  spotify: string;
  profile: string;
  number: (i: number) => string;
  footer: string;
};

const SKINS: Record<Exclude<SiteTheme, "classic">, Skin> = {
  newspaper: {
    fonts:
      "family=UnifrakturMaguntia&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@500;700;800",
    back: "← front page",
    contents: "in this section",
    theme: "editions",
    spotify: "on the radio",
    profile: "correspondent",
    number: (i) => `A${i + 1}`,
    footer: "printed in waterloo, ontario",
  },
  music: {
    fonts: "family=Shrikhand&family=Archivo:ital,wght@0,500;0,700;1,700;1,800",
    back: "← back to the shop",
    contents: "tracklist",
    theme: "change the record",
    spotify: "now spinning",
    profile: "listener",
    number: (i) => `a${i + 1}`,
    footer: "pressed in waterloo, ontario",
  },
};

function TopBar({
  theme,
  skin,
}: {
  theme: Exclude<SiteTheme, "classic">;
  skin: Skin;
}) {
  const today = useToday();
  const onHome = usePathname() === "/";
  return (
    <header className="ts-top">
      {theme === "music" ? (
        <div className="ts-stripes" aria-hidden="true" />
      ) : null}
      <div className="ts-top-inner">
        {/* no "back" link on the homepage itself, nor on the record store theme */}
        {onHome || theme === "music" ? (
          <span className="ts-top-spacer" />
        ) : (
          <Link href="/" className="ts-label ts-back">
            {skin.back}
          </Link>
        )}
        <Link href="/" className="ts-brand">
          rayyan huda
        </Link>
        <span className="ts-label ts-top-meta" suppressHydrationWarning>
          {theme === "newspaper" ? (today ?? "") : "est. 2023"}
        </span>
      </div>
    </header>
  );
}

export default function ThemedShell({
  theme,
  children,
  contentsItems,
  activeContentId,
}: {
  theme: Exclude<SiteTheme, "classic">;
  children: ReactNode;
  contentsItems: ShellContentsItem[];
  activeContentId: string;
}) {
  const skin = SKINS[theme];
  const hasContents = contentsItems.length > 0;
  const { data: spotify, error } = useSpotifyWidget();
  const contentsRef = useRef<HTMLDetailsElement | null>(null);

  // the contents list is always open on desktop; on phones it starts collapsed above the page
  useEffect(() => {
    const el = contentsRef.current;
    if (el && window.matchMedia("(max-width: 900px)").matches) el.open = false;
  }, []);

  return (
    <div className={`ts ts--${theme}`}>
      <GoogleFont query={skin.fonts} />
      <TopBar theme={theme} skin={skin} />

      <div className="ts-frame">
        {/* no contents (e.g. photography): keep the column, empty */}
        {!hasContents ? (
          <aside className="ts-left" aria-hidden="true" />
        ) : theme === "music" ? (
          <aside className="ts-left rr" aria-label="Contents">
            <details className="ts-contents" open ref={contentsRef}>
              <summary>
                <RailHeading red>
                  side a · {contentsItems.length}{" "}
                  {contentsItems.length === 1 ? "track" : "tracks"}
                </RailHeading>
              </summary>
              <RailTrackList items={contentsItems} activeId={activeContentId} />
            </details>
          </aside>
        ) : (
          <aside className="ts-left" aria-label="Contents">
            <details className="ts-contents" open ref={contentsRef}>
              <summary className="ts-label ts-head">{skin.contents}</summary>
              <nav className="ts-nav">
                {contentsItems.map((item, i) => {
                  const active = item.id === activeContentId;
                  const body = (
                    <>
                      <span className="ts-num">{skin.number(i)}</span>
                      <span className="ts-nav-text">{item.label}</span>
                    </>
                  );
                  const className = `ts-nav-item${active ? " is-active" : ""}`;
                  if (item.href) {
                    return (
                      <Link
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
                        {body}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={className}
                      onClick={item.onSelect}
                      aria-pressed={active}
                    >
                      {body}
                    </button>
                  );
                })}
              </nav>
            </details>
          </aside>
        )}

        <main className="rh-main ts-main">{children}</main>

        {theme === "music" ? (
          <aside
            className="ts-right rr"
            aria-label="Theme, Spotify and profile"
          >
            <RailRight />
          </aside>
        ) : (
          <aside className="ts-right" aria-label="Theme, Spotify and profile">
            <section className="ts-block">
              <h2 className="ts-label ts-head">{skin.theme}</h2>
              <ThemePicker className="ts-themes" itemClassName="ts-theme" />
            </section>

            <section className="ts-block">
              <h2 className="ts-label ts-head">{skin.spotify}</h2>
              {spotify ? (
                <a
                  className="ts-spotify"
                  href={spotify.songUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span
                    className={`ts-spotify-art${spotify.isPlaying ? " is-playing" : ""}`}
                  >
                    {spotify.albumImageUrl ? (
                      <img src={spotify.albumImageUrl} alt="" />
                    ) : null}
                  </span>
                  <span className="ts-spotify-text">
                    <span className="ts-label ts-spotify-status">
                      {spotify.isPlaying ? "playing now" : "last played"}
                    </span>
                    <span className="ts-spotify-title">{spotify.title}</span>
                    <span className="ts-spotify-artist">{spotify.artist}</span>
                  </span>
                </a>
              ) : (
                <p className="ts-label ts-muted">{error || "tuning in…"}</p>
              )}
            </section>

            <section className="ts-block">
              <h2 className="ts-label ts-head">{skin.profile}</h2>
              <a
                className="ts-profile"
                href={spotify?.profileUrl || SPOTIFY_PROFILE_URL}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={spotify?.profileImageUrl || "/cat_ocean.PNG"}
                  alt=""
                />
                <span>
                  {spotify?.profileName || spotify?.profileUsername || "rhuda"}
                </span>
              </a>
            </section>
          </aside>
        )}
      </div>

      <footer className="ts-footer">
        {theme === "music" ? (
          <div className="ts-stripes" aria-hidden="true" />
        ) : null}
        <p className="ts-label">{skin.footer}</p>
      </footer>
    </div>
  );
}
