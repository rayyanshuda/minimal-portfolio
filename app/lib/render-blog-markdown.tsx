import type { ReactNode } from "react";
import { isSafeHref, parseInlineMarkdown } from "./markdown-inline";
import { renderMathToHtml } from "./render-math";

const FENCE_MARKER = /^```/;
const HEADER_LINE = /^(#{1,6})\s+(.+)$/;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const UL_ITEM = /^[-*]\s+(.+)$/;
const OL_ITEM = /^\d+\.\s+(.+)$/;
const HR_LINE = /^(-{3,}|\*{3,}|_{3,})$/;
const BLOCKQUOTE_LINE = /^>\s?(.*)$/;
const VIDEO_BLOCK_START = /^<video\b/i;
const VIDEO_BLOCK_END = /<\/video>$/i;
const VIDEO_WIDTH_ATTR = /^<video\b[^>]*\swidth="(\d+)"/i;
const VIDEO_SOURCE_TAG = /<source\b[^>]*>/i;
const SRC_ATTR = /\bsrc="([^"]+)"/i;
const TYPE_ATTR = /\btype="([^"]+)"/i;
const MATH_BLOCK_MARKER = /^\$\$$/;
const MATH_BLOCK_INLINE = /^\$\$(.+)\$\$$/;

function renderMathBlock(tex: string, key: string): ReactNode {
  return (
    <div key={key} className="rh-blog-math-scroll">
      <div className="rh-blog-math-display" dangerouslySetInnerHTML={{ __html: renderMathToHtml(tex.trim(), true) }} />
    </div>
  );
}

function splitBlocks(body: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];
  let inFence = false;

  for (const rawLine of body.split("\n")) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("```")) {
      if (!inFence) {
        if (current.length > 0) {
          blocks.push(current);
          current = [];
        }
        inFence = true;
        current.push(trimmed);
      } else {
        current.push(trimmed);
        blocks.push(current);
        current = [];
        inFence = false;
      }
      continue;
    }

    if (inFence) {
      current.push(rawLine);
      continue;
    }

    if (trimmed.length === 0) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    current.push(trimmed);
  }

  if (current.length > 0) blocks.push(current);
  return blocks;
}

function splitTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparatorRow(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
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

function collectOrderedItems(lines: string[]): string[] | null {
  if (!OL_ITEM.test(lines[0])) return null;

  const items: string[] = [];
  for (const line of lines) {
    const match = line.match(OL_ITEM);
    if (match) {
      items.push(match[1]);
    } else {
      items[items.length - 1] += ` ${line}`;
    }
  }
  return items;
}

function mergeAdjacentOrderedLists(blocks: string[][]): string[][] {
  const merged: string[][] = [];
  for (const block of blocks) {
    const previous = merged[merged.length - 1];
    if (previous && OL_ITEM.test(previous[0]) && OL_ITEM.test(block[0])) {
      previous.push(...block);
    } else {
      merged.push([...block]);
    }
  }
  return merged;
}

function renderVideo(lines: string[], key: string): ReactNode | null {
  const joined = lines.join(" ");
  const sourceTagMatch = joined.match(VIDEO_SOURCE_TAG);
  if (!sourceTagMatch) return null;

  const srcMatch = sourceTagMatch[0].match(SRC_ATTR);
  if (!srcMatch) return null;

  const src = srcMatch[1].trim();
  if (!isSafeHref(src)) return null;

  const type = sourceTagMatch[0].match(TYPE_ATTR)?.[1];
  const widthMatch = joined.match(VIDEO_WIDTH_ATTR);

  return (
    <video
      key={key}
      className="rh-blog-video"
      controls
      width={widthMatch ? Number(widthMatch[1]) : undefined}
    >
      <source src={src} type={type} />
    </video>
  );
}

function renderTable(lines: string[], key: string): ReactNode {
  const headerCells = splitTableRow(lines[0]);
  const bodyRows = lines.slice(2).map((line) => splitTableRow(line));

  return (
    <div key={key} className="rh-blog-table-scroll">
      <table className="rh-blog-table">
        <thead>
          <tr>
            {headerCells.map((cell, index) => (
              <th key={`${key}-h${index}`}>{parseInlineMarkdown(cell, `${key}-h${index}-`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={`${key}-r${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${key}-r${rowIndex}-c${cellIndex}`}>
                  {parseInlineMarkdown(cell, `${key}-r${rowIndex}-c${cellIndex}-`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function renderBlogMarkdown(body: string): ReactNode {
  const blocks = mergeAdjacentOrderedLists(splitBlocks(body));

  return blocks.map((lines, index) => {
    const key = `b${index}`;

    if (lines.length >= 2 && FENCE_MARKER.test(lines[0]) && FENCE_MARKER.test(lines[lines.length - 1])) {
      const code = lines.slice(1, -1).join("\n");
      return (
        <div key={key} className="rh-blog-pre-scroll">
          <pre className="rh-blog-pre">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    if (lines.length === 1) {
      if (HR_LINE.test(lines[0])) {
        return <hr key={key} className="rh-blog-hr" />;
      }

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

      const mathInlineMatch = lines[0].match(MATH_BLOCK_INLINE);
      if (mathInlineMatch) {
        return renderMathBlock(mathInlineMatch[1], key);
      }
    }

    if (lines.length >= 2 && lines[0].includes("|") && isTableSeparatorRow(lines[1])) {
      return renderTable(lines, key);
    }

    if (lines.length >= 2 && MATH_BLOCK_MARKER.test(lines[0]) && MATH_BLOCK_MARKER.test(lines[lines.length - 1])) {
      return renderMathBlock(lines.slice(1, -1).join(" "), key);
    }

    if (VIDEO_BLOCK_START.test(lines[0]) && VIDEO_BLOCK_END.test(lines[lines.length - 1])) {
      const video = renderVideo(lines, key);
      if (video) return video;
    }

    if (lines.every((line) => UL_ITEM.test(line))) {
      const items = lines.map((line) => line.match(UL_ITEM)![1]);
      return renderList(items, false, key);
    }

    const orderedItems = collectOrderedItems(lines);
    if (orderedItems) {
      return renderList(orderedItems, true, key);
    }

    if (lines.every((line) => BLOCKQUOTE_LINE.test(line))) {
      const inner = lines.map((line) => line.match(BLOCKQUOTE_LINE)![1]).join(" ");
      return (
        <blockquote key={key} className="rh-blog-blockquote">
          {parseInlineMarkdown(inner, `${key}-`)}
        </blockquote>
      );
    }

    return (
      <p key={key} className="rh-blog-paragraph muted">
        {parseInlineMarkdown(lines.join(" "), `${key}-`)}
      </p>
    );
  });
}
