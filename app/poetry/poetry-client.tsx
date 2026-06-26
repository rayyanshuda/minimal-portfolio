"use client";

import { useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";
import PoemBody from "@/app/components/poem-body";
import type { ContentPiece } from "@/app/lib/content-types";

type PoetryClientProps = {
  poems: ContentPiece[];
};

export default function PoetryClient({ poems }: PoetryClientProps) {
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
      <RhSubpageHeader title={headingText} caption={selectedPoem?.caption} />

      <section className="section" id="poetry" style={{ marginTop: 46 }}>
        {selectedPoem ? (
          <PoemBody
            body={selectedPoem.body}
            spacing={selectedPoem.spacing}
            className={selectedPoem.className}
          />
        ) : (
          <>
            <p className="muted">
              these pieces are a collection of thoughts and imagined perspectives. sometimes they come
              from my own feelings; other times, they are inspired by what i imagine someone else
              might feel in a particular moment.
            </p>
            <br />
            <p className="muted">click on a poem title from contents to read it.</p>
          </>
        )}
      </section>
    </RhPageShell>
  );
}
