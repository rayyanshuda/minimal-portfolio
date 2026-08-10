"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";
import ProjectLinkButtons from "@/app/components/project-link-buttons";
import { getThemeBackgroundColor, useDocumentTheme } from "@/app/hooks/use-document-theme";
import type { ProjectLink } from "@/app/lib/content-types";

const contentsItems = [
  { id: "cybertruck-jeep", label: "cybertruck jeep" },
  { id: "gumball-machine", label: "gumball machine" },
];

const PROJECT_LINKS: ProjectLink[] = [];

const gumballParts = [
  { id: "container", title: "Container", file: "/gumball-container (1).STL" },
  { id: "base", title: "Base", file: "/gumball-base.stl" },
  { id: "crank", title: "Crank", file: "/gumball-crank.STL" },
  { id: "spinner", title: "Spinner", file: "/gumball-spinner.STL" },
  { id: "head", title: "Head", file: "/gumball-head.STL" },
  { id: "tail", title: "Tail", file: "/gumball-tail.STL" },
] as const;

type PartId = (typeof gumballParts)[number]["id"];

export default function GumballMachinePage() {
  const theme = useDocumentTheme();
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [expandedPartId, setExpandedPartId] = useState<PartId | null>("container");
  const gumballMountRef = useRef<HTMLDivElement | null>(null);

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
  }, [activePartIndex, theme]);

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
    <RhPageShell
      activeContentId="gumball-machine"
      contentsItems={contentsItems.map((section, index) => ({
        id: section.id,
        label: (
          <>
            <span className="rh-clink-num">{String(index + 1).padStart(2, "0")}</span>
            {section.label}
          </>
        ),
        href: `/blog/3d-modelling/${section.id}`,
      }))}
    >
      <RhSubpageHeader
        title="3d modelling"
        caption={
          PROJECT_LINKS.length > 0 ? <ProjectLinkButtons links={PROJECT_LINKS} /> : undefined
        }
      />

      <section className="section" id="gumball-machine" style={{ marginTop: 46 }}>
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
    </RhPageShell>
  );
}
