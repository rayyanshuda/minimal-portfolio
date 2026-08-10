"use client";

import { useEffect, useRef } from "react";
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

export default function CybertruckJeepPage() {
  const theme = useDocumentTheme();
  const cybertruckMountRef = useRef<HTMLDivElement | null>(null);

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
  }, [theme]);

  return (
    <RhPageShell
      activeContentId="cybertruck-jeep"
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

      <section className="section" id="cybertruck-jeep" style={{ marginTop: 46 }}>
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
    </RhPageShell>
  );
}
