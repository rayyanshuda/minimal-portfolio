"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import MobileContentsDrawer from "@/app/components/mobile-contents-drawer";
import MobileThemeToggle from "@/app/components/mobile-theme-toggle";

const sectionNav = [
  { id: "cybertruck-jeep", label: "cybertruck jeep" },
  { id: "gumball-machine", label: "gumball machine" },
];

const gumballParts = [
  { id: "container", title: "Container", file: "/gumball-container (1).STL" },
  { id: "base", title: "Base", file: "/gumball-base.stl" },
  { id: "crank", title: "Crank", file: "/gumball-crank.STL" },
  { id: "spinner", title: "Spinner", file: "/gumball-spinner.STL" },
  { id: "head", title: "Head", file: "/gumball-head.STL" },
  { id: "tail", title: "Tail", file: "/gumball-tail.STL" },
] as const;

type PartId = (typeof gumballParts)[number]["id"];

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

export default function ThreeDModellingBlogPage() {
  const [activeSection, setActiveSection] = useState<string>(sectionNav[0].id);
  const [theme, setTheme] = useState<"midnight" | "snow" | "coffee-cream" | "dusty-blue">("midnight");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyWidgetData | null>(null);
  const [spotifyError, setSpotifyError] = useState<string>("");
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [expandedPartId, setExpandedPartId] = useState<PartId | null>("container");
  const cybertruckMountRef = useRef<HTMLDivElement | null>(null);
  const gumballMountRef = useRef<HTMLDivElement | null>(null);

  const applyTheme = (nextTheme: "midnight" | "snow" | "coffee-cream" | "dusty-blue") => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
  };

  const getThemeBackgroundColor = () => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    return bg || "#000000";
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

  useEffect(() => {
    const mount = cybertruckMountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(getThemeBackgroundColor());

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.3, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.4;
    controls.maxDistance = 10;
    controls.target.set(0, 0.1, 0);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(3.5, 4, 2.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(-3, 1.3, -2.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xaec4ff, 0.4);
    rimLight.position.set(0, 2.5, -3.5);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const grid = new THREE.GridHelper(8, 12, 0x2f2f2f, 0x171717);
    grid.position.y = -1.25;
    scene.add(grid);

    let mesh: THREE.Mesh | null = null;
    const loader = new STLLoader();
    loader.load(
      "/cybertruck3D.stl",
      (geometry: THREE.BufferGeometry) => {
        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();

        const bounds = geometry.boundingBox;
        const size = new THREE.Vector3();
        if (bounds) {
          bounds.getSize(size);
          const largestDimension = Math.max(size.x, size.y, size.z) || 1;
          const targetSize = 2.9;
          const fitScale = targetSize / largestDimension;
          geometry.scale(fitScale, fitScale, fitScale);
        }

        const material = new THREE.MeshPhysicalMaterial({
          color: 0x8d95a3,
          metalness: 0.88,
          roughness: 0.24,
          clearcoat: 1,
          clearcoatRoughness: 0.14,
          reflectivity: 1,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set(0, 0, 0);
        mesh.position.y = 0.12;
        scene.add(mesh);
      },
      undefined,
      () => {},
    );

    const resize = () => {
      const width = mount.clientWidth;
      const height = Math.max(280, mount.clientHeight);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (mesh) {
        mesh.rotation.y += 0.00075;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [theme, isThemeReady]);

  useEffect(() => {
    const mount = gumballMountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(getThemeBackgroundColor());

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.3, 5.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.2;
    controls.maxDistance = 9;
    controls.target.set(0, 0.15, 0);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3.5, 4, 2.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-2.8, 1.8, -2.4);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.52));

    const grid = new THREE.GridHelper(9, 12, 0x2f2f2f, 0x171717);
    grid.position.y = -1.2;
    scene.add(grid);

    let mesh: THREE.Mesh | null = null;
    const loader = new STLLoader();
    const activePart = gumballParts[activePartIndex];

    loader.load(
      activePart.file,
      (geometry: THREE.BufferGeometry) => {
        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();

        const bounds = geometry.boundingBox;
        const size = new THREE.Vector3();
        if (bounds) {
          bounds.getSize(size);
          const largestDimension = Math.max(size.x, size.y, size.z) || 1;
          const targetSize = 2.85;
          const fitScale = targetSize / largestDimension;
          geometry.scale(fitScale, fitScale, fitScale);
        }

        const material = new THREE.MeshPhysicalMaterial({
          color: 0xa9b2bf,
          metalness: 0.82,
          roughness: 0.28,
          clearcoat: 1,
          clearcoatRoughness: 0.18,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.08;
        scene.add(mesh);
      },
      undefined,
      () => {},
    );

    const resize = () => {
      const width = mount.clientWidth;
      const height = Math.max(320, mount.clientHeight);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (mesh) {
        mesh.rotation.y += 0.0007;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activePartIndex, theme, isThemeReady]);

  const activePart = gumballParts[activePartIndex];
  const showPreviousPart = () => {
    setActivePartIndex((current) => (current === 0 ? gumballParts.length - 1 : current - 1));
  };
  const showNextPart = () => {
    setActivePartIndex((current) => (current === gumballParts.length - 1 ? 0 : current + 1));
  };

  const toggleExpandedPart = (partId: PartId) => {
    setExpandedPartId((current) => (current === partId ? null : partId));
  };

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
            <h1 className="site-name">3d modelling</h1>
            <Link href="/" className="profile-home-link" aria-label="Back to home">
              <span className="profile-avatar">
                <img src="/hermes-statue.png" alt="Rayyan Huda profile" className="profile-image" />
                <span className="speech-bubble">i&apos;ll take you home</span>
              </span>
            </Link>
          </div>
          <div className="divider" />
        </header>

        <section className="section" id="cybertruck-jeep">
          <h2>cybertruck jeep design</h2>

          <section className="section project-hero" id="cybertruck-intro">
            <div className="project-hero-row">
              <div className="project-hero-description">
                <p>
                  This is a 3D model designed and assembled in SolidWorks. It&apos;s made up of several components
                  including the body, chassis, dashboard, rods, seat, steering wheel, and tires. A sectional drawing
                  and exploded view of the assembly are included in my repository.
                </p>
              </div>
              <div className="project-hero-model">
                <div className="project-model-container">
                  <div className="project-model-box" ref={cybertruckMountRef} />
                  <p>Interact with me!</p>
                </div>
              </div>
            </div>
          </section>

          <section className="section project-overview-block" id="cybertruck-why">
            <h2>why this project?</h2>
            <div className="project-image">
              <img
                src="/images/cybertruck-exploded.webp"
                alt="cybertruck exploded view with bill of materials solidworks"
              />
            </div>
            <p>
              Following some Blender tutorials (the sprinkle donut was a good place to start), I wanted to dip my feet
              into 3D modelling and design. So I turned my head to SolidWorks, a simpler beginner friendly software.
              I&apos;ve spent most of my personal projects dabbling in software development with various languages
              including Python, Java, C++, and experimenting with HTML, CSS, and JavaScript with this portfolio website.
              Expanding my horizon, 3D design is the next challenge I set myself up to. Although my results may not be on
              par with other designs in the community, I&apos;m proud of what I&apos;ve modelled and excited to share it.
            </p>
          </section>

          <section className="section project-overview-block" id="cybertruck-concept">
            <h2>concept &amp; struggles</h2>
            <div className="project-image">
              <img src="/images/cybertruck-model.webp" alt="cybertruck picture for concept reference" />
            </div>
            <p>
              The idea was to create a Jeep-like Cybertruck. The Cybertruck with its box-y figure was perfect as a
              beginner project to recreate and implement features. I had initial sketches and ideas for different
              extrudes, cuts, and revolves. For the tires, I used a circular tread pattern by rotating shapes around the
              tire axis. I used a similar circular approach for the steering wheel spokes, rotating a spoke three times.
            </p>
            <p>
              For the interior, I wanted to hollow out space for seats and extra room in the back. I was familiar with
              the shell tool, but I kept running into zero-thickness geometry errors. The shell thickness I first
              attempted caused parts of the exterior to collapse where surfaces intersected.
            </p>
            <p>
              The chassis required the most design thinking. Since it integrates every part together, I needed specific
              dimensions for wheel rods, slots for seats and dashboard support, and overall exterior fit. Rods were
              straightforward once slot diameters and lengths were tuned. Seats were built from splines with an extrude
              for width. Finally, assembly mates brought each part together into the full vehicle impression.
            </p>
          </section>

          <section className="section project-overview-block" id="cybertruck-learn">
            <h2>what did i learn?</h2>
            <div className="project-image">
              <img src="/images/cybertruck-sectional.webp" alt="cybertruck sectional view solidworks" />
            </div>
            <p>
              I learned how to break down a complex design into manageable parts, starting with the base frame and
              gradually modelling details like angular body panels and wheel wells. I improved my understanding of
              parametric modeling by defining dimensions and constraints more deliberately. With fillets, chamfers, and
              surface edits, I experimented with balancing sharp edges and smooth transitions to capture the Cybertruck
              aesthetic with Jeep-like rugged elements.
            </p>
            <p>
              I also became more efficient with assemblies, especially when mating components like wheels and chassis.
              Overall, this project sharpened precision, iteration habits, and problem-solving for unusual geometries in
              SolidWorks.
            </p>
            <p>
              Everything here was a learning experience. From getting comfortable with Blender and SolidWorks tools to
              shelling the model successfully, I tested many features and got a real taste of 3D design workflow:
              vision, sketching, tool planning, and modelling. It wasn&apos;t easy or short, and I often relied on
              tutorials, friends, and the SolidWorks community.
            </p>
            <p>
              To showcase that progress, you can interact with the model above and view all parts, assemblies, and
              exploded drawings on my GitHub.
            </p>
          </section>
        </section>

        <section className="section" id="gumball-machine">
          <h2>gumball machine design</h2>

          <section className="section project-hero" id="gumball-intro">
            <div className="project-hero-row">
              <div className="project-hero-description">
                <p>
                  This is a 3D model designed and assembled in SolidWorks. It&apos;s made up of several components
                  including the container, base, crank, spinner, head, and tail. This project is designed to be
                  assembled using the instruction manual. Play around with the parts below!
                </p>
              </div>
              <div className="project-hero-model" />
            </div>

            <div className="gumball-model-container">
              <div className="gumball-caption">{activePart.title}</div>
              <div className="project-model-box gumball-model-box" ref={gumballMountRef} />
              <button type="button" className="gumball-nav prev" onClick={showPreviousPart} aria-label="Show previous part">
                &#10094;
              </button>
              <button type="button" className="gumball-nav next" onClick={showNextPart} aria-label="Show next part">
                &#10095;
              </button>
            </div>
          </section>

          <section className="section project-overview-block" id="gumball-why">
            <h2>why this project?</h2>
            <div className="project-image">
              <img src="/images/gumball assembly.gif" alt="gumball machine assembly and collapse gif" />
            </div>
            <p>
              This was my second 3D modelling project. I had a lot of fun experimenting with SolidWorks features on my
              Cybertruck Jeep model. Having learned a lot from my previous experience and wanting to try something more
              advanced, I was inspired by Lego assemblies. Instead of 3D printing the gumball machine as one piece, I
              designed separate parts that could be assembled into a full build.
            </p>
            <p>
              This project was designed for a group project involving the motif of a Canadian animal. My group decided
              to design a gumball machine in the shape of a squirrel, hence the head and tail parts. Spanning over a
              month and a half, I enjoyed the process of creating something new and learning about locking mechanisms to
              keep different parts in place.
            </p>
          </section>

          <section className="section project-overview-block" id="gumball-concept">
            <h2>concept &amp; struggles</h2>
            <div className="project-image">
              <img src="/images/gumball sketch.webp" alt="initial gumball machine concept idea" />
            </div>
            <p>
              The idea was a squirrel-shaped gumball machine. Unscrewing the head allows a gumball to be inserted into
              the body. The gumball drops into the container where it is caught in the spinner. The crank is then used
              to funnel the gumball out of the container and into the tail, where it spirals down and exits the machine.
            </p>

            <div className="gumball-collapsible-list">
              <button
                type="button"
                className={expandedPartId === "container" ? "gumball-collapsible active" : "gumball-collapsible"}
                onClick={() => toggleExpandedPart("container")}
              >
                Container
              </button>
              <div className={expandedPartId === "container" ? "gumball-expand active" : "gumball-expand"}>
                <div className="project-features">
                  <h3>Container</h3>
                  <h4>Concept / Struggles</h4>
                  <div className="project-image">
                    <img src="/images/container draft model.webp" alt="initial container concept picture" />
                  </div>
                  <p>
                    The container was the main component because the spinner, crank, body, and tail all needed to fit
                    through it. The original design had a tunnel from body opening to tail exit, but this caused repeated
                    print failures and difficult support removal. We redesigned the interior flow path to guide the ball
                    with momentum. It used more material but printed reliably and produced smoother motion.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={expandedPartId === "base" ? "gumball-collapsible active" : "gumball-collapsible"}
                onClick={() => toggleExpandedPart("base")}
              >
                Body
              </button>
              <div className={expandedPartId === "base" ? "gumball-expand active" : "gumball-expand"}>
                <div className="project-features">
                  <h3>Body</h3>
                  <h4>Concept / Struggles</h4>
                  <div className="project-image">
                    <img src="/images/gumball body initial.webp" alt="initial body concept picture" />
                  </div>
                  <p>
                    The body stores gumballs before they enter the spinner. It connects head and container using
                    snap-fit style locking interfaces with different diameters. A main challenge was preserving squirrel
                    proportions while still fitting functional internal paths and connection geometry.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={expandedPartId === "crank" ? "gumball-collapsible active" : "gumball-collapsible"}
                onClick={() => toggleExpandedPart("crank")}
              >
                Crank
              </button>
              <div className={expandedPartId === "crank" ? "gumball-expand active" : "gumball-expand"}>
                <div className="project-features">
                  <h3>Crank</h3>
                  <h4>Concept / Struggles</h4>
                  <div className="project-image">
                    <img src="/images/gumball crank initial.webp" alt="initial crank concept picture" />
                  </div>
                  <p>
                    The crank was designed as a key-like shape to engage the spinner slot. Post-print tolerance became
                    the issue: a nominally correct fit still bound in real prints, especially across printers. Adjusting
                    tolerance strategy and post-processing solved the fit.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={expandedPartId === "spinner" ? "gumball-collapsible active" : "gumball-collapsible"}
                onClick={() => toggleExpandedPart("spinner")}
              >
                Spinner
              </button>
              <div className={expandedPartId === "spinner" ? "gumball-expand active" : "gumball-expand"}>
                <div className="project-features">
                  <h3>Spinner</h3>
                  <h4>Concept / Struggles</h4>
                  <div className="project-image">
                    <img src="/images/gumball spinner initial.webp" alt="initial spinner concept picture" />
                  </div>
                  <p>
                    The spinner uses curved holding geometry to guide the ball. Chamfers were added to improve crank
                    entry and turning reliability. The same tolerance lessons from the crank applied here, emphasizing
                    real print behavior over ideal CAD fit.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={expandedPartId === "head" ? "gumball-collapsible active" : "gumball-collapsible"}
                onClick={() => toggleExpandedPart("head")}
              >
                Head
              </button>
              <div className={expandedPartId === "head" ? "gumball-expand active" : "gumball-expand"}>
                <div className="project-features">
                  <h3>Head</h3>
                  <h4>Concept / Struggles</h4>
                  <div className="project-image">
                    <img src="/images/gumball head concept.webp" alt="initial head concept picture" />
                  </div>
                  <p>
                    The head explored personality details, but complex surface transitions produced modeling instability
                    and self-intersection errors during early attempts. The team simplified the facial geometry and
                    focused on a robust removable lock feature for refilling.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={expandedPartId === "tail" ? "gumball-collapsible active" : "gumball-collapsible"}
                onClick={() => toggleExpandedPart("tail")}
              >
                Tail
              </button>
              <div className={expandedPartId === "tail" ? "gumball-expand active" : "gumball-expand"}>
                <div className="project-features">
                  <h3>Tail</h3>
                  <h4>Concept / Struggles</h4>
                  <div className="project-image">
                    <img src="/images/gumball initial.webp" alt="initial tail concept picture" />
                  </div>
                  <p>
                    The tail evolved from decoration into a functional helical ramp for the final output path. A partial
                    top opening was introduced after testing to make support-removal practical without compromising the
                    motion of the ball.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section project-overview-block" id="gumball-learn">
            <h2>what did i learn?</h2>
            <div className="project-image">
              <video
                controls
                muted
                playsInline
                preload="auto"
                className="gumball-video"
                title="gumball demonstration assembly video"
                src="/images/gumball-demonstration.mp4"
              />
            </div>
            <p>
              This project taught me lessons in 3D modeling, practical design adjustments, and problem-solving under
              manufacturing constraints. Organic shaping in SolidWorks often led to broken constraints and surface errors,
              so iterative simplification and better feature planning became crucial.
            </p>
            <p>
              Tolerance issues became obvious after printing. Small machine-to-machine variability changed fit quality for
              crank and spinner interfaces, showing how important it is to design clearances for real hardware outcomes.
              Managing interdependent part references also required stronger file discipline during iteration.
            </p>
            <p>
              Overall, this project strengthened my workflow in iterative prototyping, debugging functional assemblies,
              and balancing aesthetics with manufacturability. To showcase that learning, you can interact with the 3D
              part viewer above and access the full build details on GitHub.
            </p>
          </section>
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
