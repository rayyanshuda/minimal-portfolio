"use client";

// Pieces of the record store homepage: fonts, a vinyl, and the content
// of each section (projects as a player tracklist, research + writing as album sleeves, passions
// as stations on a radio dial).
import { useState, type CSSProperties, type ReactNode } from "react";
import {
  allProjects,
  blogs,
  catLabel,
  connect,
  filterDefs,
  passions,
  research,
  sectionNav,
  work,
  type Filter,
} from "@/app/lib/home-content";
import { GoogleFont, linkProps } from "../shared";
import "./record.css";

export const TRACKS = sectionNav;

export function RecFonts() {
  return <GoogleFont query="family=Shrikhand&family=Archivo:ital,wght@0,500;0,700;1,700;1,800" />;
}

/** A black record. `label` goes in the center; `color` tints the label. */
export function Vinyl({
  size,
  spinning,
  label,
  color = "#c8323a",
  className = "",
}: {
  size: number | string;
  spinning?: boolean;
  label?: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`rec-vinyl${spinning ? " is-spinning" : ""} ${className}`}
      style={{ width: size, height: size, "--lbl": color } as CSSProperties}
      aria-hidden="true"
    >
      <div className="rec-vinyl-disc">
        <div className="rec-vinyl-label">{label}</div>
      </div>
      <div className="rec-vinyl-sheen" />
    </div>
  );
}

/* ---------------- projects: genre filters, a page at a time ---------------- */

const PAGE = 4;

function Projects() {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const pool = filter === "all" ? allProjects : allProjects.filter((p) => p.cats.includes(filter));
  const visible = showAll ? pool : pool.slice(0, PAGE);

  return (
    <div className="rec-projects">
      <div className="rec-genres" role="group" aria-label="Filter projects by genre">
        {filterDefs.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`rec-genre${filter === f.key ? " is-active" : ""}`}
            aria-pressed={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              setShowAll(false);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ol className="rec-list">
        {visible.map((p, i) => (
          <li key={p.name}>
            <a className="rec-track" {...linkProps(p.href)}>
              <span className="rec-track-play" aria-hidden="true">
                ▶
              </span>
              <span className="rec-num">B{i + 1}</span>
              <span className="rec-row-main">
                <span className="rec-row-title">{p.name}</span>
                <span className="rec-row-desc">{p.desc}</span>
                <span className="rec-cap rec-row-genre">{p.cats.map(catLabel).join(" · ")}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      {pool.length > PAGE ? (
        <button type="button" className="rec-flip" onClick={() => setShowAll((v) => !v)}>
          {showAll ? (
            "back to side a"
          ) : (
            <>
              flip for {pool.length - PAGE} more <span className="rec-flip-icon" aria-hidden="true">↻</span>
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- work: a plain tracklist ---------------- */

function Rows({ items, prefix }: { items: { name: string; href: string; meta: string }[]; prefix: string }) {
  return (
    <ol className="rec-list">
      {items.map((item, i) => (
        <li key={item.name}>
          <a className="rec-row" {...linkProps(item.href)}>
            <span className="rec-num">
              {prefix}
              {i + 1}
            </span>
            <span className="rec-row-title">{item.name}</span>
            <span className="rec-dots" aria-hidden="true" />
            <span className="rec-cap rec-row-meta">{item.meta}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- research + writing: sleeves with the record peeking out ---------------- */

const SLEEVES = ["#1d3557", "#c8323a", "#2f6f6a", "#1e2430"];

function Discography({ items }: { items: { name: string; href: string; tag: string }[] }) {
  return (
    <div className="rec-discog">
      {items.map((item, i) => (
        <a
          key={item.name}
          className="rec-discog-item"
          style={{ "--sleeve": SLEEVES[i % SLEEVES.length] } as CSSProperties}
          {...linkProps(item.href)}
        >
          <span className="rec-discog-art">
            <Vinyl size="100%" className="rec-discog-vinyl" color="#f4ecdc" />
            <span className="rec-discog-cover">
              <span className="rec-script">{item.name}</span>
            </span>
          </span>
          <span className="rec-discog-title">{item.name}</span>
          <span className="rec-cap">{item.tag}</span>
        </a>
      ))}
    </div>
  );
}

/* ---------------- passions: stations on a radio dial ---------------- */

const STATIONS = [
  { freq: "88.1", pos: 14 },
  { freq: "94.5", pos: 50 },
  { freq: "101.3", pos: 86 },
];

function RadioDial() {
  const [tuned, setTuned] = useState<number | null>(null);
  const needle = tuned === null ? 31 : STATIONS[tuned].pos;

  return (
    <div className="rec-dial" onMouseLeave={() => setTuned(null)}>
      <div className="rec-dial-face">
        <span className="rec-cap rec-dial-band">fm</span>
        <div className="rec-dial-scale" aria-hidden="true" />
        {passions.map((p, i) => (
          <a
            key={p.name}
            href={p.href}
            className={`rec-station${tuned === i ? " is-tuned" : ""}`}
            style={{ left: `${STATIONS[i].pos}%` }}
            onMouseEnter={() => setTuned(i)}
            onFocus={() => setTuned(i)}
          >
            <span className="rec-station-freq">{STATIONS[i].freq}</span>
            <span className="rec-station-name">{p.name}</span>
          </a>
        ))}
        <span className="rec-dial-needle" style={{ left: `${needle}%` }} aria-hidden="true" />
      </div>
      <p className="rec-cap rec-dial-status" aria-live="polite">
        {tuned === null ? "static… hover a station to tune in" : `now tuned to ${passions[tuned].name} · ${STATIONS[tuned].freq} fm`}
      </p>
    </div>
  );
}

/* ---------------- each section's content ---------------- */

export function SectionBody({ id }: { id: string }) {
  switch (id) {
    case "work":
      return <Rows prefix="A" items={work.map((w) => ({ name: w.name, href: w.href, meta: w.note }))} />;
    case "projects":
      return <Projects />;
    case "research":
      return <Discography items={research} />;
    case "writing":
      return <Discography items={blogs} />;
    case "passions":
      return <RadioDial />;
    case "connect":
      return (
        <div className="rec-connect">
          <p className="rec-connect-line">
            {connect.line} <em>{connect.lineItalic}</em>
          </p>
          <div className="rec-links">
            {connect.links.map((l) => (
              <a key={l.name} {...linkProps(l.href)}>
                {l.name}
              </a>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}
