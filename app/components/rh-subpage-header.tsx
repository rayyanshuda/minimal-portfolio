import Link from "next/link";

const mono = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: "'Spline Sans Mono', monospace",
  ...extra,
});

export default function RhSubpageHeader({ title }: { title: string }) {
  return (
    <header>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <h1 style={{ margin: 0, fontSize: 46, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.015em" }}>{title}</h1>
        <Link href="/" aria-label="Back to home" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="rh-avatar" style={{ position: "relative", display: "inline-flex", alignItems: "center", flex: "none" }}>
            <span
              className="rh-bubble"
              style={mono({
                position: "absolute",
                right: "calc(100% + 12px)",
                top: "50%",
                whiteSpace: "nowrap",
                background: "var(--spotify-card-bg)",
                color: "var(--spotify-card-text)",
                fontSize: 10.5,
                letterSpacing: "0.04em",
                padding: "7px 10px",
                borderRadius: 2,
              })}
            >
              i&apos;ll take you home
            </span>
            <img src="/hermes-statue.png" alt="rayyan huda" style={{ height: 66, width: "auto", display: "block", opacity: 0.92 }} />
          </span>
        </Link>
      </div>
      <div className="rh-div" style={{ marginTop: 28, height: 1 }} />
    </header>
  );
}
