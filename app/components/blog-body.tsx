import { renderBlogMarkdown } from "@/app/lib/render-blog-markdown";

type BlogBodyProps = {
  body: string;
};

export default function BlogBody({ body }: BlogBodyProps) {
  return <div className="rh-blog-body">{renderBlogMarkdown(body)}</div>;
}
