"use client";

import { useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";
import BlogBody from "@/app/components/blog-body";
import type { ContentPiece } from "@/app/lib/content-types";

type MlJourneyClientProps = {
  pieces: ContentPiece[];
};

export default function MlJourneyClient({ pieces }: MlJourneyClientProps) {
  const [activePieceId, setActivePieceId] = useState<string>("");

  const selectedPiece = pieces.find((piece) => piece.id === activePieceId) ?? null;
  const headingText = selectedPiece?.title ?? "my machine learning journey";

  return (
    <RhPageShell
      activeContentId={activePieceId || "ml-journey"}
      contentsItems={pieces.map((piece, index) => ({
        id: piece.id,
        label: (
          <>
            <span className="rh-clink-num">{String(index + 1).padStart(2, "0")}</span>
            {piece.title}
          </>
        ),
        onSelect: () => setActivePieceId(piece.id),
      }))}
    >
      <RhSubpageHeader title={headingText} caption={selectedPiece?.caption} />

      <section className="section" id="ml-journey" style={{ marginTop: 46 }}>
        {selectedPiece ? (
          <BlogBody body={selectedPiece.body} />
        ) : (
          <>
            <p className="muted">these are my machine learning projects. included in each blog is 
                                the idea behind the project, exploring the data, hypothesis, results, 
                                analysis, conclusion, and more.
            </p>
            <br />
            <p className="muted">click on a project title from contents to read it.</p>
          </>
        )}
      </section>
    </RhPageShell>
  );
}
