"use client";

// Broadsheet front page: blackletter masthead, ears, dateline, six-column grid with hairline
// column rules, a lead photo, and an index box. Styled after classic big-city broadsheets
// without using any real paper's name or logo.
import { Fragment, useState } from "react";
import {
  allProjects,
  blogs,
  catLabel,
  connect,
  featuredPhoto,
  filterDefs,
  intro,
  passions,
  research,
  work,
  type Filter,
} from "@/app/lib/home-content";
import ThemePicker from "@/app/components/theme-picker";
import { GoogleFont, linkProps, useSpotifyWidget, useToday } from "./shared";
import "./newspaper.css";

export default function NewspaperHome() {
  const today = useToday();
  const { data: spotify } = useSpotifyWidget();
  const [lead, second, third, ...rest] = allProjects;

  // "more from the lab" scales with the project list: filter by section, show a page at a time.
  // The first three projects are always the front-page features; a filter searches everything.
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const BAND_LIMIT = 8;
  const bandPool = filter === "all" ? rest : allProjects.filter((p) => p.cats.includes(filter));
  const band = showAll ? bandPool : bandPool.slice(0, BAND_LIMIT);
  const [headline, ...deckParts] = intro.lede.split(". ");

  return (
    <div className="hl-news">
      <GoogleFont query="family=UnifrakturMaguntia&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@500;700;800" />
      <div className="hl-news-sheet">
        {/* ================= masthead ================= */}
        <header className="hl-news-head">
          <div className="hl-news-ear">
            <p className="hl-news-ear-quote">“all the code that&apos;s fit to ship.”</p>
          </div>
          <h1 className="hl-news-masthead">{intro.name}</h1>
          <div className="hl-news-ear hl-news-ear--right">
            <p className="hl-news-label">late edition</p>
            <p className="hl-news-ear-text">{intro.subtitle}</p>
          </div>
        </header>

        <div className="hl-news-dateline">
          <span>vol. iii . . . no. {allProjects.length + work.length}</span>
          <span suppressHydrationWarning>waterloo, {today ?? ""}</span>
          <span>free</span>
        </div>

        {/* ================= front page ================= */}
        <div className="hl-news-front">
          {/* lead story */}
          <main className="hl-news-lead">
            <h2 className="hl-news-headline">{headline}.</h2>
            <p className="hl-news-deck">{deckParts.join(". ")}</p>
            <p className="hl-news-byline">By RAYYAN HUDA</p>

            <a className="hl-news-photo" href="/photography">
              <img src={featuredPhoto.src} alt={featuredPhoto.alt} />
              <span className="hl-news-credit">rayyan huda for the portfolio</span>
              <span className="hl-news-cutline">{featuredPhoto.caption}</span>
            </a>

            <div id="projects" className="hl-news-lead-stories">
              {[lead, second].map((p) => (
                <a key={p.name} className="hl-news-story" {...linkProps(p.href)}>
                  <span className="hl-news-label">{p.cats.map(catLabel).join(" · ")}</span>
                  <span className="hl-news-story-title">{p.name}</span>
                  <span className="hl-news-story-body">{p.desc}</span>
                  <span className="hl-news-jump">continued on github →</span>
                </a>
              ))}
            </div>
          </main>

          {/* right rail */}
          <aside className="hl-news-rail">
            <a className="hl-news-story hl-news-story--rail" {...linkProps(third.href)}>
              <span className="hl-news-label">{third.cats.map(catLabel).join(" · ")}</span>
              <span className="hl-news-story-title">{third.name}</span>
              <span className="hl-news-story-body">{third.desc}</span>
              <span className="hl-news-jump">continued on github →</span>
            </a>

            <section id="work" className="hl-news-rail-block">
              <h2 className="hl-news-label hl-news-rail-head">appointments</h2>
              {work.map((w) => (
                <a key={w.name} className="hl-news-brief" {...linkProps(w.href)}>
                  <span className="hl-news-brief-title">{w.name}</span>
                  <span className="hl-news-brief-body">{w.note}</span>
                </a>
              ))}
            </section>

            {spotify ? (
              <section className="hl-news-rail-block">
                <h2 className="hl-news-label hl-news-rail-head">on the radio</h2>
                <a className="hl-news-radio" {...linkProps(spotify.songUrl)}>
                  {spotify.albumImageUrl ? <img src={spotify.albumImageUrl} alt="" /> : null}
                  <span>
                    <span className="hl-news-brief-title">{spotify.title}</span>
                    <span className="hl-news-brief-body">
                      {spotify.artist} · {spotify.isPlaying ? "playing now" : "last played"}
                    </span>
                  </span>
                </a>
              </section>
            ) : null}

            <section className="hl-news-rail-block">
              <h2 className="hl-news-label hl-news-rail-head">editions</h2>
              <ThemePicker className="hl-news-editions" itemClassName="hl-news-edition" />
            </section>
          </aside>
        </div>

        {/* ================= second band ================= */}
        <section className="hl-news-band" aria-label="More projects">
          <div className="hl-news-band-head">
            <h2>more from the lab</h2>
            <nav className="hl-news-band-tabs" aria-label="Filter projects by section">
              {filterDefs.map((f, i) => (
                <Fragment key={f.key}>
                  {i > 0 ? <span aria-hidden="true">·</span> : null}
                  <button
                    type="button"
                    className={filter === f.key ? "is-active" : ""}
                    aria-pressed={filter === f.key}
                    onClick={() => {
                      setFilter(f.key);
                      setShowAll(false);
                    }}
                  >
                    {f.label}
                  </button>
                </Fragment>
              ))}
            </nav>
          </div>
          {band.length === 0 ? <p className="hl-news-empty">no stories in this section today.</p> : null}
          <div className="hl-news-band-grid">
            {band.map((p) => (
              <a key={p.name} className="hl-news-story" {...linkProps(p.href)}>
                <span className="hl-news-story-title hl-news-story-title--sm">{p.name}</span>
                <span className="hl-news-story-body">{p.desc}</span>
                <span className="hl-news-label">{p.cats.map(catLabel).join(" · ")}</span>
              </a>
            ))}
          </div>
          {bandPool.length > BAND_LIMIT ? (
            <button type="button" className="hl-news-more" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "show fewer" : `see all ${bandPool.length} projects →`}
            </button>
          ) : null}
        </section>

        {/* ================= index ================= */}
        <section className="hl-news-index-row">
          <div id="research" className="hl-news-box">
            <h2 className="hl-news-label hl-news-rail-head">research</h2>
            {research.map((r) => (
              <a key={r.name} className="hl-news-brief" {...linkProps(r.href)}>
                <span className="hl-news-brief-title">{r.name}</span>
                <span className="hl-news-brief-body">{r.tag}</span>
              </a>
            ))}
          </div>

          <div id="writing" className="hl-news-box">
            <h2 className="hl-news-label hl-news-rail-head">opinion</h2>
            {blogs.map((b) => (
              <a key={b.name} className="hl-news-brief" {...linkProps(b.href)}>
                <span className="hl-news-brief-title">{b.name}</span>
                <span className="hl-news-brief-body">{b.tag}</span>
              </a>
            ))}
          </div>

          <div id="passions" className="hl-news-box">
            <h2 className="hl-news-label hl-news-rail-head">inside</h2>
            {passions.map((p, i) => (
              <a key={p.name} className="hl-news-inside" href={p.href}>
                <span>{p.name}</span>
                <span className="hl-news-leader" aria-hidden="true" />
                <span>{["a", "c", "d"][i]}{i * 2 + 4}</span>
              </a>
            ))}
          </div>

          <div id="connect" className="hl-news-box">
            <h2 className="hl-news-label hl-news-rail-head">letters</h2>
            <p className="hl-news-letters">
              {connect.line} <em>{connect.lineItalic}</em>
            </p>
            <div className="hl-news-links">
              {connect.links.map((l) => (
                <a key={l.name} className="hl-news-label" {...linkProps(l.href)}>
                  {l.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer className="hl-news-foot">
          <span>printed in waterloo, ontario</span>
          <span>© rayyan huda</span>
        </footer>
      </div>
    </div>
  );
}
