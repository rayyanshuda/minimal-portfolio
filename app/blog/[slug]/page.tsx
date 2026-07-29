import { notFound } from "next/navigation";
import { loadContentPieces } from "@/app/lib/load-content";
import BlogPostClient from "./blog-post-client";

export function generateStaticParams() {
  return loadContentPieces("blog").map((post) => ({ slug: post.id }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = loadContentPieces("blog");
  const post = posts.find((p) => p.id === slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} posts={posts} />;
}
