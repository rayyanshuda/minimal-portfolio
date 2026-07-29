import { loadContentPieces } from "@/app/lib/load-content";
import HomeClient from "@/app/home-client";

export default function Home() {
  const posts = loadContentPieces("blog");
  const blogs = [
    ...posts.map((post) => ({ name: post.title, tag: post.tag ?? "essay", href: `/blog/${post.id}` })),
    { name: "3d modelling", tag: "essay", href: "/blog/3d-modelling" },
  ];

  return <HomeClient blogs={blogs} />;
}
