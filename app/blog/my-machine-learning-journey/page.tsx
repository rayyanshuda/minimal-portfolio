"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MobileContentsDrawer from "@/app/components/mobile-contents-drawer";
import MobileThemeToggle from "@/app/components/mobile-theme-toggle";

const sectionNav = [
  { id: "how-it-started", label: "how it started" },
  { id: "first-real-project", label: "first real project" },
  { id: "what-im-learning-now", label: "what i'm learning now" },
  { id: "next-up", label: "next up" },
];

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

export default function MachineLearningJourneyPage() {
  const [activeSection, setActiveSection] = useState<string>(sectionNav[0].id);
  const [theme, setTheme] = useState<"midnight" | "snow" | "coffee-cream" | "dusty-blue">("midnight");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyWidgetData | null>(null);
  const [spotifyError, setSpotifyError] = useState<string>("");

  const applyTheme = (nextTheme: "midnight" | "snow" | "coffee-cream" | "dusty-blue") => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
  };

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    scrollToSection(sectionId);
  };

  useEffect(() => {
    const sectionElements = sectionNav
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) return;

    let ticking = false;

    const updateActiveSection = () => {
      const probeY = window.scrollY + window.innerHeight * 0.32;
      let nextActive = sectionElements[0].id;

      for (const section of sectionElements) {
        if (section.offsetTop <= probeY) {
          nextActive = section.id;
        } else {
          break;
        }
      }

      setActiveSection((current) => (current === nextActive ? current : nextActive));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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

  return (
    <div className="page-layout">
      <MobileThemeToggle />
      <MobileContentsDrawer
        activeId={activeSection}
        items={sectionNav.map((section) => ({
          id: section.id,
          label: section.label,
          href: `#${section.id}`,
          onSelect: () => scrollToSection(section.id),
        }))}
      />
      <aside className="contents-nav" aria-label="Contents">
        <p className="contents-title">contents</p>
        <ul>
          {sectionNav.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={activeSection === section.id ? "contents-link active" : "contents-link"}
                onClick={(event) => handleSectionClick(event, section.id)}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <main className="portfolio">
        <header className="site-header">
          <div className="site-headline">
            <h1 className="site-name">my machine learning journey</h1>
            <Link href="/" className="profile-home-link" aria-label="Back to home">
              <span className="profile-avatar">
                <img src="/hermes-statue.png" alt="Rayyan Huda profile" className="profile-image" />
                <span className="speech-bubble">i&apos;ll take you home</span>
              </span>
            </Link>
          </div>
          <div className="divider" />
        </header>

        <section className="section" id="how-it-started">
          <h2>how it started</h2>
          <p className="muted">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>
        </section>

        <section className="section" id="first-real-project">
          <h2>first real project</h2>
          <p className="muted">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>
        </section>

        <section className="section" id="what-im-learning-now">
          <h2>what i&apos;m learning now</h2>
          <p className="muted">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>
        </section>

        <section className="section" id="next-up">
          <h2>next up</h2>
          <p className="muted">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>
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
