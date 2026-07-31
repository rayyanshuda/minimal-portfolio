import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentPiece, ContentSpacing } from "./content-types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

const VALID_SPACING = new Set<ContentSpacing>(["pre", "pre-wrap", "pre-line", "normal"]);

function parseContentFile(filePath: string): ContentPiece {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  if (typeof data.id !== "string" || !data.id) {
    throw new Error(`Missing id in ${filePath}`);
  }
  if (typeof data.title !== "string" || !data.title) {
    throw new Error(`Missing title in ${filePath}`);
  }

  const spacing =
    typeof data.spacing === "string" && VALID_SPACING.has(data.spacing as ContentSpacing)
      ? (data.spacing as ContentSpacing)
      : undefined;

  return {
    id: data.id,
    title: data.title,
    body: content.trim(),
    caption: typeof data.caption === "string" ? data.caption : undefined,
    order: typeof data.order === "number" ? data.order : undefined,
    spacing,
    className: typeof data.className === "string" ? data.className : undefined,
  };
}

export function loadContentPieces(section: string): ContentPiece[] {
  const dir = path.join(CONTENT_ROOT, section);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();

  const pieces = files.map((name) => parseContentFile(path.join(dir, name)));

  return pieces.sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });
}
