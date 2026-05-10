 "use client";

import { useEffect, useRef, useState } from "react";
import MobileContentsDrawer from "@/app/components/mobile-contents-drawer";
import MobileThemeToggle from "@/app/components/mobile-theme-toggle";

const sectionNav = [
  { id: "work", label: "work" },
  { id: "projects", label: "projects" },
  { id: "blog", label: "blog" },
  { id: "passions", label: "passions" },
  { id: "connect", label: "connect" },
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

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("work");
  const [theme, setTheme] = useState<"midnight" | "snow" | "coffee-cream" | "dusty-blue">("midnight");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyWidgetData | null>(null);
  const [spotifyError, setSpotifyError] = useState<string>("");
  const [homeBubbleText, setHomeBubbleText] = useState("this is home");
  const [isHomeBubbleTextVisible, setIsHomeBubbleTextVisible] = useState(true);
  const [homeBubbleWidth, setHomeBubbleWidth] = useState<number>(0);
  const homeBubbleTimeoutsRef = useRef<number[]>([]);
  const homeBubbleMeasureRef = useRef<HTMLSpanElement | null>(null);

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

  const projects: { name: string; description: string; href?: string }[] = [
    {
      name: "deep learning skin lesion classifier",
      description: "support the detection of skin cancer by utilizing deep learning to analyze dermoscopic images.",
    },
    { name: "url shortener",
      description: "users input a long url (and optionally a custom alias) to generate a short, shareable link." },
    {
      name: "ai voice assistant agent",
      description: "offline conversational agent with system level commands and conversation transcription.",
    },
  ];

  const blogs = [
    {
      name: "my machine learning journey",
      href: "/blog/my-machine-learning-journey",
    },
    {
      name: "3d modelling",
      href: "/blog/3d-modelling",
    },
  ];

  const clearHomeBubbleSequence = () => {
    homeBubbleTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    homeBubbleTimeoutsRef.current = [];
  };

  const measureHomeBubbleWidth = (text: string) => {
    const measureElement = homeBubbleMeasureRef.current;
    if (!measureElement) return 0;
    const previousText = measureElement.textContent ?? "";
    measureElement.textContent = text;
    const width = Math.ceil(measureElement.getBoundingClientRect().width);
    measureElement.textContent = previousText;
    return width;
  };

  const transitionHomeBubbleText = (nextText: string) => {
    setIsHomeBubbleTextVisible(false);
    const fadeTimeout = window.setTimeout(() => {
      const nextWidth = measureHomeBubbleWidth(nextText);
      if (nextWidth > 0) setHomeBubbleWidth(nextWidth);
      setHomeBubbleText(nextText);
      const fadeInTimeout = window.setTimeout(() => {
        setIsHomeBubbleTextVisible(true);
      }, 40);
      homeBubbleTimeoutsRef.current.push(fadeInTimeout);
    }, 180);
    homeBubbleTimeoutsRef.current.push(fadeTimeout);
  };

  const startHomeBubbleSequence = () => {
    clearHomeBubbleSequence();
    setHomeBubbleText("this is home");
    setIsHomeBubbleTextVisible(true);
    const initialWidth = measureHomeBubbleWidth("this is home");
    if (initialWidth > 0) setHomeBubbleWidth(initialWidth);

    const secondLineTimeout = window.setTimeout(() => {
      transitionHomeBubbleText("go explore, i have nothing more to say");
    }, 3000);

    const thirdLineTimeout = window.setTimeout(() => {
      transitionHomeBubbleText("i mean it, i can be here forever");
    }, 6000);

    homeBubbleTimeoutsRef.current = [secondLineTimeout, thirdLineTimeout];
  };

  const stopHomeBubbleSequence = () => {
    clearHomeBubbleSequence();
    setHomeBubbleText("this is home");
    setIsHomeBubbleTextVisible(true);
  };

  useEffect(() => {
    return () => {
      clearHomeBubbleSequence();
    };
  }, []);

  useEffect(() => {
    const measureElement = homeBubbleMeasureRef.current;
    if (!measureElement) return;
    setHomeBubbleWidth(Math.ceil(measureElement.getBoundingClientRect().width));
  }, [homeBubbleText]);

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
            <h1 className="site-name">rayyan huda</h1>
            <span className="profile-avatar" onMouseEnter={startHomeBubbleSequence} onMouseLeave={stopHomeBubbleSequence}>
                <img src="/hermes-statue.png" alt="Rayyan Huda profile" className="profile-image" />
                <span
                  className="speech-bubble"
                  style={homeBubbleWidth > 0 ? { width: `${homeBubbleWidth}px` } : undefined}
                >
                  <span className={isHomeBubbleTextVisible ? "speech-bubble-text" : "speech-bubble-text is-hidden"}>
                    {homeBubbleText}
                  </span>
                </span>
                <span ref={homeBubbleMeasureRef} className="speech-bubble speech-bubble-measure">
                  {homeBubbleText}
                </span>
              </span>
          </div>

          


          <div className="divider" />
        </header>

        <section className="section" id="work">
          <h2>work</h2>
          <ul className="work-list">
            <li>
              <a className="underlined" href="#">
                alembic.space
              </a>{" "}
              <span className="muted">| aesthetic thinking tool. WIP manifesto</span>
            </li>
            <li className="muted bullet">curate beautiful and shareable micro-essays with ease</li>
            <li className="muted bullet">
              micro-essay: the essay&apos;s exploratory nature with the aphorism&apos;s impact
            </li>
            <li className="muted bullet">
              the internet-native medium for ideas: write once, share everywhere
            </li>
            <li>
              <a className="underlined" href="#">
                lab.alembic.space
              </a>{" "}
              <span className="muted">| generative design suite in the browser</span>
            </li>
            <li className="muted bullet">part of the alembic visual ecosystem</li>
            <li className="muted bullet">120+ shaders and counting</li>
            <li className="muted bullet nested">each layerable on any image</li>
            <li className="muted bullet nested">
              searchable by vibes (semantic search via cosine similarity to shader description vector embeddings)
            </li>
            <li>
              <a className="underlined" href="#">
                banger.garden
              </a>{" "}
              <span className="muted">| exclusive tweet curation experiment</span>
            </li>
            <li>
              <a className="underlined" href="#">
                github
              </a>{" "}
              <span className="muted">| miscellaneous coding projects</span>
            </li>
            <li>
              <a className="underlined" href="#">
                systems design engineering @ university of waterloo
              </a>{" "}
              <span className="muted">| the academic hustle</span>
            </li>
          </ul>
        </section>

        <section className="section projects" id="projects">
          <h2>Projects</h2>
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.name}>
                <a className="project-card-link" href={project.href ?? "#"}>
                  <span className="project-title">{project.name}</span>
                  <p className="project-description">{project.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="section blog" id="blog">
          <h2>Blog</h2>
          <ul className="project-list">
            {blogs.map((blog) => (
              <li key={blog.name}>
                <a className="project-card-link" href={blog.href}>
                  <span className="project-title">{blog.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="section passions" id="passions">
          <h2>the fruits of my passions</h2>
          <p>
            <a className="underlined" href="/poetry">
              poetry
            </a>{" "}
            |{" "}
            <a className="underlined" href="/photography">
              photography
            </a>{" "}
            |{" "}
            <a className="underlined" href="/free-verse">
              free verse
            </a>
          </p>
        </section>

        <section className="section connect" id="connect">
          <h2>connect</h2>
          <p>
            <a className="underlined" href="mailto:rayyanshuda@gmail.com">
              email
            </a>{" "}
            |{" "}
            <a className="underlined" href="https://www.linkedin.com/in/rayyanhuda/" target="_blank" rel="noreferrer">
              linkedin
            </a>{" "}
            |{" "}
            <a className="underlined" href="https://x.com/rayyanshuda" target="_blank" rel="noreferrer">
              twitter
            </a>
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
                src={spotifyData?.profileImageUrl || "/cat_ocean.PNG"}
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
              {spotifyData?.profileName || spotifyData?.profileUsername || "rhuda"}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
