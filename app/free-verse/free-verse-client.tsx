"use client";

import { useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";
import PoemBody from "@/app/components/poem-body";
import type { ContentPiece } from "@/app/lib/content-types";

type FreeVerseClientProps = {
  verses: ContentPiece[];
};

export default function FreeVerseClient({ verses }: FreeVerseClientProps) {
  const [activeVerseId, setActiveVerseId] = useState<string>("");

  const selectedVerse = verses.find((verse) => verse.id === activeVerseId) ?? null;
  const headingText = selectedVerse?.title ?? "free verse";

  return (
    <RhPageShell
      activeContentId={activeVerseId || "free-verse"}
      contentsItems={verses.map((verse) => ({
        id: verse.id,
        label: verse.title,
        onSelect: () => setActiveVerseId(verse.id),
      }))}
    >
      <RhSubpageHeader title={headingText} caption={selectedVerse?.caption} />

      <section className="section" id="free-verse" style={{ marginTop: 46 }}>
        {selectedVerse ? (
          <PoemBody
            body={selectedVerse.body}
            spacing={selectedVerse.spacing}
            className={selectedVerse.className}
          />
        ) : (
          <>
            <p className="muted">
              excerpts of stories that i've written. there is no full story.
            </p>
          </>
        )}
      </section>
    </RhPageShell>
  );
}
