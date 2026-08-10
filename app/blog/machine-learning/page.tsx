import { loadContentPieces } from "@/app/lib/load-content";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";

export default function MlJourneyPage() {
  const pieces = loadContentPieces("machine-learning-journey");

  return (
    <RhPageShell
      activeContentId="ml-journey"
      contentsItems={pieces.map((piece, index) => ({
        id: piece.id,
        label: (
          <>
            <span className="rh-clink-num">{String(index + 1).padStart(2, "0")}</span>
            {piece.title}
          </>
        ),
        href: `/blog/machine-learning/${piece.id}`,
      }))}
    >
      <RhSubpageHeader title="machine learning" />

      <section className="section" id="ml-journey" style={{ marginTop: 46 }}>
        <p className="muted">these are my machine learning projects. included in each blog is
                            the idea behind the project, exploring the data, hypothesis, results,
                            analysis, conclusion, and more.
        </p>
        <br />
        <p className="muted">click on a project title from contents to read it.</p>
      </section>
    </RhPageShell>
  );
}
