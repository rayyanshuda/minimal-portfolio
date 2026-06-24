"use client";

import { useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";

type Poem = {
  id: string;
  title: string;
  body: string;
};

const poems: Poem[] = [
  {
    id: "poem-1",
    title: "first draft of silence",
    body: "placeholder poem text. this is where the selected poem will appear.",
  },
  {
    id: "poem-2",
    title: "between two winters",
    body: "placeholder poem text. this is where the selected poem will appear.",
  },
  {
    id: "poem-3",
    title: "notes to the moon",
    body: "placeholder poem text. this is where the selected poem will appear.",
  },
];

export default function PoetryPage() {
  const [activePoemId, setActivePoemId] = useState<string>("");

  const selectedPoem = poems.find((poem) => poem.id === activePoemId) ?? null;
  const headingText = selectedPoem?.title ?? "poetry";

  return (
    <RhPageShell
      activeContentId={activePoemId || "poetry"}
      contentsItems={poems.map((poem) => ({
        id: poem.id,
        label: poem.title,
        onSelect: () => setActivePoemId(poem.id),
      }))}
    >
      <RhSubpageHeader title={headingText} />

      <section className="section" id="poetry" style={{ marginTop: 46 }}>
        {selectedPoem ? (
          <p>{selectedPoem.body}</p>
        ) : (
          <p className="muted">placeholder text for the poetry body. select a poem title from contents.</p>
        )}
      </section>
    </RhPageShell>
  );
}
