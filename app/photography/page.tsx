"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import MobileContentsDrawer from "@/app/components/mobile-contents-drawer";
import MobileThemeToggle from "@/app/components/mobile-theme-toggle";

type SpotifyWidgetData = {
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

type PhotoCard = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  date: string;
};

const photoCards: PhotoCard[] = [
  {
    id: "photo-1",
    src: "/photographs_pics/sunset1.JPG",
    alt: "Sunset landscape photo",
    caption: "sunset study",
    date: "Apr 2026",
  },
  {
    id: "photo-2",
    src: "/photographs_pics/farm_sunset.jpg",
    alt: "Farm sunset photo",
    caption: "farm sunset",
    date: "May 2026",
  },
  {
    id: "photo-3",
    src: "/photographs_pics/sunrise1.jpg",
    alt: "Sunrise photo",
    caption: "sunrise",
    date: "Jun 2026",
  },
  {
    id: "photo-4",
    src: "/photographs_pics/greenery_forest.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-5",
    src: "/photographs_pics/bridge_sunset1.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-6",
    src: "/photographs_pics/bridge_sunset2.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-7",
    src: "/photographs_pics/bridge_sunset3.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-8",
    src: "/photographs_pics/monotone_alley.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-9",
    src: "/photographs_pics/plane_sunrise1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-10",
    src: "/photographs_pics/raining_petals.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-11",
    src: "/photographs_pics/steam_clock.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-12",
    src: "/photographs_pics/train_tracks.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-13",
    src: "/photographs_pics/van_train_station.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-14",
    src: "/photographs_pics/art_museum.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-15",
    src: "/photographs_pics/bridge_sunset4.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-16",
    src: "/photographs_pics/mountains.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-17",
    src: "/photographs_pics/pakistan1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-18",
    src: "/photographs_pics/pakistan2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-19",
    src: "/photographs_pics/plane_sunrise2.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-20",
    src: "/photographs_pics/sombr_poster.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-21",
    src: "/photographs_pics/sunset2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-22",
    src: "/photographs_pics/the_well1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-23",
    src: "/photographs_pics/the_well2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-24",
    src: "/photographs_pics/tor_train_station.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-25",
    src: "/photographs_pics/tor_train_tracks.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-26",
    src: "/photographs_pics/waterloo_1a.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-27",
    src: "/photographs_pics/waterloo_park1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-28",
    src: "/photographs_pics/waterloo_park2.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-29",
    src: "/photographs_pics/waterloo_sunset1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-30",
    src: "/photographs_pics/winter_waterloo.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-31",
    src: "/photographs_pics/sunset_pose1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-32",
    src: "/photographs_pics/sunset_pose2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
];

function OverflowMarquee({ text }: { text: string }) {
  const viewportRef = useRef<HTMLSpanElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const distance = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      setIsOverflowing(distance > 1);
      setOverflowDistance(distance);
    };

    checkOverflow();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [text]);

  return (
    <span
      ref={viewportRef}
      className={isOverflowing ? "marquee-viewport is-overflow" : "marquee-viewport"}
      style={{ "--marquee-distance": `-${overflowDistance}px` } as Record<string, string>}
    >
      <span className="marquee-track">
        <span className="marquee-segment">{text}</span>
      </span>
    </span>
  );
}

export default function PhotographyPage() {
  const [theme, setTheme] = useState<"midnight" | "snow" | "coffee-cream" | "dusty-blue">("midnight");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());
  const [spotifyData, setSpotifyData] = useState<SpotifyWidgetData | null>(null);
  const [spotifyError, setSpotifyError] = useState<string>("");

  const applyTheme = (nextTheme: "midnight" | "snow" | "coffee-cream" | "dusty-blue") => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
  };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (
      storedTheme === "snow" ||
      storedTheme === "midnight" ||
      storedTheme === "coffee-cream" ||
      storedTheme === "dusty-blue"
    ) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
      setIsThemeReady(true);
      return;
    }

    applyTheme("midnight");
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isThemeReady) return;
    applyTheme(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme, isThemeReady]);

  useEffect(() => {
    let isMounted = true;

    const loadSpotifyTrack = async () => {
      try {
        const response = await fetch("/api/spotify", { cache: "no-store" });
        if (!response.ok) {
          const errorJson = (await response.json()) as { message?: string };
          throw new Error(errorJson.message ?? "Failed to load Spotify track.");
        }

        const data = (await response.json()) as SpotifyWidgetData;
        if (!isMounted) return;

        setSpotifyData(data);
        setSpotifyError("");
      } catch (error) {
        if (!isMounted) return;
        setSpotifyError(error instanceof Error ? error.message : "Spotify widget unavailable.");
      }
    };

    void loadSpotifyTrack();
    const intervalId = window.setInterval(() => {
      void loadSpotifyTrack();
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const toggleFlipped = (photoId: string) => {
    setFlippedIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleFlipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, photoId: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleFlipped(photoId);
  };

  const photoColumns = photoCards.reduce<PhotoCard[][]>(
    (columns, photo, index) => {
      columns[index % 4].push(photo);
      return columns;
    },
    [[], [], [], []],
  );

  const scrollToPhotographySection = () => {
    const target = document.getElementById("photography");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#photography");
  };

  return (
    <div className="page-layout">
      <MobileThemeToggle />
      <MobileContentsDrawer
        activeId="photography"
        items={[{ id: "photography", label: "photography", href: "#photography", onSelect: scrollToPhotographySection }]}
      />
      <aside className="contents-nav" aria-label="Contents">
        <p className="contents-title">contents</p>
        <ul>
          <li>
            <a href="#photography" className="contents-link active">
              photography
            </a>
          </li>
        </ul>
      </aside>

      <main className="portfolio">
        <header className="site-header">
          <div className="site-headline">
            <h1 className="site-name">photography</h1>
            <Link href="/" className="profile-home-link" aria-label="Back to home">
              <span className="profile-avatar">
                <img src="/hermes-statue.png" alt="Rayyan Huda profile" className="profile-image" />
                <span className="speech-bubble">i&apos;ll take you home</span>
              </span>
            </Link>
          </div>
          <div className="divider" />
        </header>

        <section className="section photography-section" id="photography">
          <div className="photography-grid">
            {photoColumns.map((column, columnIndex) => (
              <div key={`column-${columnIndex}`} className="photo-column">
                {column.map((photo) => {
                  const isFlipped = flippedIds.has(photo.id);
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      className="photo-card"
                      onClick={() => toggleFlipped(photo.id)}
                      onKeyDown={(event) => handleFlipKeyDown(event, photo.id)}
                      aria-pressed={isFlipped}
                      aria-label={`${photo.caption}, ${photo.date}`}
                    >
                      <div className={`photo-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                        <div className="photo-card-face photo-card-front">
                          <img src={photo.src} alt={photo.alt} loading="lazy" />
                        </div>
                        <div className="photo-card-face photo-card-back">
                          <span className="photo-caption">{photo.caption}</span>
                          <span className="photo-date">{photo.date}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className="theme-nav" aria-label="Theme controls">
        <p className="contents-title">appearance</p>
        <button
          type="button"
          className={theme === "midnight" ? "theme-link active" : "theme-link"}
          onClick={() => setTheme("midnight")}
          aria-pressed={theme === "midnight"}
        >
          midnight
        </button>
        <button
          type="button"
          className={theme === "snow" ? "theme-link active" : "theme-link"}
          onClick={() => setTheme("snow")}
          aria-pressed={theme === "snow"}
        >
          snow
        </button>
        <button
          type="button"
          className={theme === "coffee-cream" ? "theme-link active" : "theme-link"}
          onClick={() => setTheme("coffee-cream")}
          aria-pressed={theme === "coffee-cream"}
        >
          coffee-cream
        </button>
        <button
          type="button"
          className={theme === "dusty-blue" ? "theme-link active" : "theme-link"}
          onClick={() => setTheme("dusty-blue")}
          aria-pressed={theme === "dusty-blue"}
        >
          dusty-blue
        </button>

        <div className="spotify-widget" aria-live="polite">
          <p className="contents-title">spotify</p>
          {spotifyData ? (
            <a href={spotifyData.songUrl} className="spotify-card" target="_blank" rel="noreferrer">
              {spotifyData.albumImageUrl ? (
                <img
                  src={spotifyData.albumImageUrl}
                  alt={`Album art for ${spotifyData.title}`}
                  className="spotify-art"
                />
              ) : (
                <div className="spotify-art spotify-art-fallback" aria-hidden="true">
                  ♪
                </div>
              )}
              <div className="spotify-track">
                <p className="spotify-status">{spotifyData.isPlaying ? "now playing" : "last played"}</p>
                <p className="spotify-title">
                  <OverflowMarquee text={spotifyData.title} />
                </p>
                <p className="spotify-artist">
                  <OverflowMarquee text={spotifyData.artist} />
                </p>
              </div>
            </a>
          ) : (
            <p className="spotify-error">{spotifyError || "loading..."}</p>
          )}
        </div>
        <div className="spotify-profile-card">
          <p className="spotify-profile-label">profile</p>
          <div className="spotify-profile-row">
            <a href={spotifyData?.profileUrl || "https://open.spotify.com"} target="_blank" rel="noreferrer">
              <img
                src={spotifyData?.profileImageUrl || "/marble_head.png"}
                alt="Rayyan Huda Spotify profile"
                className="spotify-profile-image"
              />
            </a>
            <a
              href={spotifyData?.profileUrl || "https://open.spotify.com"}
              target="_blank"
              rel="noreferrer"
              className="spotify-profile-name"
            >
              {spotifyData?.profileName || spotifyData?.profileUsername || "rayyan huda"}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
