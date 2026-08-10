import { notFound } from "next/navigation";
import { loadContentPieces } from "@/app/lib/load-content";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";
import BlogBody from "@/app/components/blog-body";
import ProjectLinkButtons from "@/app/components/project-link-buttons";

export function generateStaticParams() {
  return loadContentPieces("research").map((piece) => ({ slug: piece.id }));
}

export default async function ResearchPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pieces = loadContentPieces("research");
  const piece = pieces.find((p) => p.id === slug);

  if (!piece) notFound();

  return (
    <RhPageShell
      activeContentId={piece.id}
      contentsItems={pieces.map((p, index) => ({
        id: p.id,
        label: (
          <>
            <span className="rh-clink-num">{String(index + 1).padStart(2, "0")}</span>
            {p.title}
          </>
        ),
        href: `/research/${p.id}`,
      }))}
    >
      <RhSubpageHeader
        title={piece.title}
        caption={
          piece.caption || piece.links?.length ? (
            <>
              {piece.caption}
              <ProjectLinkButtons links={piece.links} />
            </>
          ) : undefined
        }
      />

      <section className="section" id="research" style={{ marginTop: 46 }}>
        <BlogBody body={piece.body} />
      </section>
    </RhPageShell>
  );
}
