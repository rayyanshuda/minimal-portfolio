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
      contentsItems={pieces.map((piece) => ({
        id: piece.id,
        label: piece.title,
        onSelect: () => setActivePieceId(piece.id),
      }))}
    >
      <RhSubpageHeader title={headingText} caption={selectedPiece?.caption} />

      <section className="section" id="ml-journey" style={{ marginTop: 46 }}>
        {selectedPiece ? (
          <BlogBody body={selectedPiece.body} />
        ) : (
          <>
            <p className="muted">write your disclaimer here.</p>
            <br />
            <p className="muted">click on a machine learning journey title from contents to read it.</p>
          </>
        )}
      </section>
    </RhPageShell>
  );
}
