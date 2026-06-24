"use client";

import { useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";

type Verse = {
  id: string;
  title: string;
  body: string;
};

const verses: Verse[] = [
  {
    id: "verse-1",
    title: "glass rain",
    body: "placeholder free verse text. this is where the selected piece will appear.",
  },
  {
    id: "verse-2",
    title: "city after midnight",
    body: "placeholder free verse text. this is where the selected piece will appear.",
  },
  {
    id: "verse-3",
    title: "the long exhale",
    body: "placeholder free verse text. this is where the selected piece will appear.",
  },
];

export default function FreeVersePage() {
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
      <RhSubpageHeader title={headingText} />

      <section className="section" id="free-verse" style={{ marginTop: 46 }}>
        {selectedVerse ? <p>{selectedVerse.body}</p> : null}
      </section>
    </RhPageShell>
  );
}
