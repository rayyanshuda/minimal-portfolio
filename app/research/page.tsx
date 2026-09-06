import { loadContentPieces } from "@/app/lib/load-content";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";

export default function ResearchPage() {
  const pieces = loadContentPieces("research");

  return (
    <RhPageShell
      activeContentId="research"
      contentsItems={pieces.map((piece, index) => ({
        id: piece.id,
        label: (
          <>
            <span className="rh-clink-num">{String(index + 1).padStart(2, "0")}</span>
            {piece.title}
          </>
        ),
        href: `/research/${piece.id}`,
      }))}
    >
      <RhSubpageHeader title="research" />

      <section className="section" id="research" style={{ marginTop: 46 }}>
        <p className="muted">these are write-ups that go outside the standard ml curriculum,
                            reproducing papers, running ablations, and reporting what actually
                            held up.
        </p>
        <br />
        <p className="muted">click on a project title from contents to read it.</p>
      </section>
    </RhPageShell>
  );
}
