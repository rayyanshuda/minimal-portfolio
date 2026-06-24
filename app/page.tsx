"use client";

import { useEffect, useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";

/* ------------------------------------------------------------------ *
 *  TYPES + DATA
 * ------------------------------------------------------------------ */

type Filter = "all" | "cv" | "ml" | "swe";

const sectionNav = [
  { id: "work", label: "work" },
  { id: "projects", label: "projects" },
  { id: "research", label: "research" },
  { id: "writing", label: "writing" },
  { id: "passions", label: "passions" },
  { id: "connect", label: "connect" },
];

const work = [
  { name: "CloudAct CPA", href: "https://cloudact.ca/", note: "testing and developing ai agents" },
  { name: "WAT.ai", href: "https://watai.ca/", note: "machine learning projects" },
  { name: "github", href: "https://github.com/rayyanshuda", note: "miscellaneous coding projects" },
  { name: "systems design engineering, uwaterloo", href: "https://uwaterloo.ca/systems-design-engineering/", note: "undergraduate studies" },
];

const allProjects = [
  { cat: "cv",  name: "deep learning skin lesion classifier", tag: "computer vision",  href: "https://github.com/rayyanshuda/skin-lesion-class",  desc: "detecting skin cancer by analyzing dermoscopic images with deep learning." },
  { cat: "ml",  name: "ai voice assistant agent",            tag: "machine learning", href: "https://github.com/rayyanshuda/ai-voice-assistant", desc: "an offline conversational agent with system-level commands and live transcription." },
  { cat: "swe", name: "url shortener",                       tag: "software",         href: "https://github.com/rayyanshuda/url-shortener",     desc: "turns a long url, with an optional custom alias, into a short, shareable link." },
];

// TODO: replace these placeholders with your real papers + links.
const papers = [
  { tag: "computer vision",  title: "lightweight cnns for dermoscopic skin-lesion classification", venue: "undergraduate research · 2025", cta: "pdf", href: "#" },
  { tag: "machine learning", title: "self-supervised pretraining for medical imaging",             venue: "in review",                   cta: "pdf", href: "#" },
];

const blogs = [
  { name: "my machine learning journey", tag: "essay", href: "/blog/my-machine-learning-journey" },
  { name: "3d modelling",                tag: "essay", href: "/blog/3d-modelling" },
];

const filterDefs: { key: Filter; label: string }[] = [
  { key: "all", label: "all" },
  { key: "cv",  label: "computer vision" },
  { key: "ml",  label: "machine learning" },
  { key: "swe", label: "software" },
];

/* shared mono-label style */
const mono = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: "'Spline Sans Mono', monospace",
  ...extra,
});

/* ------------------------------------------------------------------ *
 *  PAGE
 * ------------------------------------------------------------------ */
export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState("work");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  /* scroll-spy: highlight the active section in the contents nav */
  useEffect(() => {
    const els = sectionNav
      .map((s) => document.getElementById(s.id))
      .filter((e): e is HTMLElement => e !== null);
    if (!els.length) return;
    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.3;
      let next = els[0].id;
      for (const el of els) {
        if (el.offsetTop <= probe) next = el.id;
        else break;
      }
      setActive((cur) => (cur === next ? cur : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const projects = filter === "all" ? allProjects : allProjects.filter((p) => p.cat === filter);

  /* ---- small reusable bits ---- */
  const SectionHead = ({ n, title }: { n: string; title: string }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 13, marginBottom: 15 }}>
      <span className="rh-muted" style={mono({ fontSize: 11 })}>{n}</span>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}>{title}</h2>
      <span className="rh-div" style={{ flex: 1, height: 1 }} />
    </div>
  );

  return (
    <RhPageShell
      activeContentId={active}
      contentsItems={sectionNav.map((s) => ({
        id: s.id,
        label: s.label,
        href: `#${s.id}`,
        onSelect: () => scrollToSection(s.id),
      }))}
    >
          <header>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 46, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.015em" }}>rayyan huda</h1>
                <div className="rh-muted" style={mono({ marginTop: 13, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" })}>machine learning · computer vision · software</div>
              </div>
              <span className="rh-avatar" style={{ position: "relative", display: "inline-flex", alignItems: "center", flex: "none" }}>
                <span className="rh-bubble" style={mono({ position: "absolute", right: "calc(100% + 12px)", top: "50%", whiteSpace: "nowrap", background: "var(--spotify-card-bg)", color: "var(--spotify-card-text)", fontSize: 10.5, letterSpacing: "0.04em", padding: "7px 10px", borderRadius: 2 })}>teaching machines to see ✶</span>
                <img src="/hermes-statue.png" alt="rayyan huda" style={{ height: 66, width: "auto", display: "block", opacity: 0.92 }} />
              </span>
            </div>
            <p style={{ margin: "24px 0 0", fontSize: 18, lineHeight: 1.62, fontWeight: 300, maxWidth: "52ch" }}>systems design engineering at waterloo, building computer-vision and machine-learning systems. off the clock i write, shoot 35mm, and keep a small notebook of verse.</p>
            <div className="rh-div" style={{ marginTop: 28, height: 1 }} />
          </header>

          {/* 01 WORK */}
          <section id="work" style={{ marginTop: 46, scrollMarginTop: 36 }}>
            <SectionHead n="01" title="work" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {work.map((w) => (
                <a key={w.name} className="rh-row" href={w.href} target="_blank" rel="noopener noreferrer"
                   style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "baseline", gap: 14, padding: "10px 0", margin: "0 -14px" }}>
                  <span style={{ paddingLeft: 14, fontSize: 17 }}>{w.name}</span>
                  <span className="rh-muted" style={{ flex: 1, fontSize: 14, fontWeight: 300, textAlign: "right", paddingRight: 14 }}>{w.note}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 02 PROJECTS */}
          <section id="projects" style={{ marginTop: 46, scrollMarginTop: 36 }}>
            <SectionHead n="02" title="projects" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 6 }}>
              {filterDefs.map((f) => (
                <button key={f.key} type="button" onClick={() => setFilter(f.key)}
                        className={filter === f.key ? "rh-clink" : "rh-clink rh-muted"}
                        style={mono({ background: "none", border: 0, padding: "0 0 3px", cursor: "pointer", fontSize: 11.5, letterSpacing: "0.04em", color: filter === f.key ? "var(--text)" : undefined, borderBottom: `1px solid ${filter === f.key ? "currentColor" : "transparent"}` })}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", minHeight: 200 }}>
              {projects.map((p) => (
                <a key={p.name} className="rh-row rh-border" href={p.href} target="_blank" rel="noopener noreferrer"
                   style={{ textDecoration: "none", color: "inherit", display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, padding: "17px 0", margin: "0 -14px" }}>
                  <span className="rh-muted" style={mono({ paddingLeft: 14, fontSize: 10.5, letterSpacing: "0.07em", lineHeight: 1.5, paddingTop: 4 })}>{p.tag}</span>
                  <span style={{ paddingRight: 14 }}>
                    <span style={{ display: "block", fontSize: 20, fontWeight: 400, letterSpacing: "-0.01em" }}>{p.name}</span>
                    <span className="rh-muted" style={{ display: "block", marginTop: 7, fontSize: 15.5, lineHeight: 1.55, fontWeight: 300, maxWidth: "50ch" }}>{p.desc}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* 03 RESEARCH */}
          <section id="research" style={{ marginTop: 46, scrollMarginTop: 36 }}>
            <SectionHead n="03" title="research" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {papers.map((r) => (
                <a key={r.title} className="rh-row rh-border" href={r.href} target="_blank" rel="noopener noreferrer"
                   style={{ textDecoration: "none", color: "inherit", display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 20, padding: "17px 0", margin: "0 -14px" }}>
                  <span className="rh-muted" style={mono({ paddingLeft: 14, fontSize: 10.5, letterSpacing: "0.07em", lineHeight: 1.5, paddingTop: 3 })}>{r.tag}</span>
                  <span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{r.title}</span>
                    <span className="rh-muted" style={{ display: "block", marginTop: 5, fontSize: 13.5, fontWeight: 300, fontStyle: "italic" }}>{r.venue}</span>
                  </span>
                  <span className="rh-muted" style={mono({ paddingRight: 14, alignSelf: "center", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase" })}>{r.cta}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 04 WRITING */}
          <section id="writing" style={{ marginTop: 46, scrollMarginTop: 36 }}>
            <SectionHead n="04" title="writing" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {blogs.map((b) => (
                <a key={b.name} className="rh-row rh-border" href={b.href}
                   style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 18, padding: "13px 0", margin: "0 -14px" }}>
                  <span style={{ paddingLeft: 14, fontSize: 18 }}>{b.name}</span>
                  <span className="rh-muted" style={mono({ paddingRight: 14, fontSize: 10.5, letterSpacing: "0.07em" })}>{b.tag}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 05 PASSIONS */}
          <section id="passions" style={{ marginTop: 46, scrollMarginTop: 36 }}>
            <SectionHead n="05" title="the fruits of my passions" />
            <p style={{ margin: 0, fontSize: 18, fontWeight: 300, display: "flex", gap: 18, alignItems: "baseline" }}>
              <a className="rh-ul" href="/poetry" style={{ textDecoration: "none", color: "inherit" }}>poetry</a>
              <span className="rh-muted">/</span>
              <a className="rh-ul" href="/photography" style={{ textDecoration: "none", color: "inherit" }}>photography</a>
              <span className="rh-muted">/</span>
              <a className="rh-ul" href="/free-verse" style={{ textDecoration: "none", color: "inherit" }}>free verse</a>
            </p>
          </section>

          {/* 06 CONNECT */}
          <section id="connect" style={{ marginTop: 46, scrollMarginTop: 36 }}>
            <SectionHead n="06" title="connect" />
            <p style={{ margin: "0 0 22px", fontSize: 25, fontWeight: 300, lineHeight: 1.35, maxWidth: "24ch" }}>
              always glad to talk <span style={{ fontStyle: "italic" }}>models, code, or a good poem.</span>
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              <a className="rh-ul" style={mono({ fontSize: 13 })} href="mailto:rayyanshuda@gmail.com">email</a>
              <a className="rh-ul" style={mono({ fontSize: 13 })} href="https://www.linkedin.com/in/rayyanhuda/" target="_blank" rel="noreferrer">linkedin</a>
              <a className="rh-ul" style={mono({ fontSize: 13 })} href="https://x.com/rayyanshuda" target="_blank" rel="noreferrer">twitter</a>
              <a className="rh-ul" style={mono({ fontSize: 13 })} href="https://github.com/rayyanshuda" target="_blank" rel="noreferrer">github</a>
            </div>
          </section>
    </RhPageShell>
  );
}
