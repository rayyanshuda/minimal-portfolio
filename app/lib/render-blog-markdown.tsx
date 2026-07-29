import type { ReactNode } from "react";
import { isSafeHref, parseInlineMarkdown } from "./markdown-inline";

const HEADER_LINE = /^(#{1,6})\s+(.+)$/;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const UL_ITEM = /^[-*]\s+(.+)$/;
const OL_ITEM = /^\d+\.\s+(.+)$/;

function splitBlocks(body: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) blocks.push(current);
  return blocks;
}

function renderHeading(level: number, text: string, key: string): ReactNode {
  const className = `rh-blog-heading rh-blog-heading--h${level}`;
  const children = parseInlineMarkdown(text, `${key}-`);

  switch (level) {
    case 1:
      return <h1 key={key} className={className}>{children}</h1>;
    case 2:
      return <h2 key={key} className={className}>{children}</h2>;
    case 3:
      return <h3 key={key} className={className}>{children}</h3>;
    case 4:
      return <h4 key={key} className={className}>{children}</h4>;
    case 5:
      return <h5 key={key} className={className}>{children}</h5>;
    default:
      return <h6 key={key} className={className}>{children}</h6>;
  }
}

function renderList(items: string[], ordered: boolean, key: string): ReactNode {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag key={key} className="rh-blog-list">
      {items.map((item, index) => (
        <li key={`${key}-${index}`}>{parseInlineMarkdown(item, `${key}-${index}-`)}</li>
      ))}
    </ListTag>
  );
}

export function renderBlogMarkdown(body: string): ReactNode {
  const blocks = splitBlocks(body);

  return blocks.map((lines, index) => {
    const key = `b${index}`;

    if (lines.length === 1) {
      const headerMatch = lines[0].match(HEADER_LINE);
      if (headerMatch) {
        return renderHeading(headerMatch[1].length, headerMatch[2], key);
      }

      const imageMatch = lines[0].match(IMAGE_LINE);
      if (imageMatch) {
        const alt = imageMatch[1];
        const src = imageMatch[2].trim();
        if (isSafeHref(src)) {
          return <img key={key} src={src} alt={alt} className="rh-blog-image" />;
        }
      }
    }

    if (lines.every((line) => UL_ITEM.test(line))) {
      const items = lines.map((line) => line.match(UL_ITEM)![1]);
      return renderList(items, false, key);
    }

    if (lines.every((line) => OL_ITEM.test(line))) {
      const items = lines.map((line) => line.match(OL_ITEM)![1]);
      return renderList(items, true, key);
    }

    return (
      <p key={key} className="rh-blog-paragraph muted">
        {parseInlineMarkdown(lines.join(" "), `${key}-`)}
      </p>
    );
  });
}
