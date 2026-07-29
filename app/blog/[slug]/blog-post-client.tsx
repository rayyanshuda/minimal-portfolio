"use client";

import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";
import BlogBody from "@/app/components/blog-body";
import type { ContentPiece } from "@/app/lib/content-types";

type BlogPostClientProps = {
  post: ContentPiece;
  posts: ContentPiece[];
};

export default function BlogPostClient({ post, posts }: BlogPostClientProps) {
  return (
    <RhPageShell
      activeContentId={post.id}
      contentsItems={posts.map((p) => ({
        id: p.id,
        label: p.title,
        href: `/blog/${p.id}`,
      }))}
    >
      <RhSubpageHeader title={post.title} caption={post.caption} />

      <section className="section" id={post.id} style={{ marginTop: 46 }}>
        <BlogBody body={post.body} />
      </section>
    </RhPageShell>
  );
}
