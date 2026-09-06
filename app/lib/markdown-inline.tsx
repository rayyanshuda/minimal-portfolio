import { Fragment, type ReactNode } from "react";
import { renderMathToHtml } from "./render-math";

const LINK_START = /^\[([^\]]+)\]\(([^)]+)\)/;
const BOLD_START = /^\*\*([^*]+)\*\*|^__([^_]+)__/;
const ITALIC_START = /^\*([^*]+)\*|^_([^_]+)_/;
const SUPERSCRIPT_START = /^\$\^([^$]+)\$/;
const MATH_INLINE_START = /^\$([^$\n]+)\$/;

export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

export function isExternalHref(href: string): boolean {
  const trimmed = href.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

export function parseInlineMarkdown(text: string, keyPrefix = ""): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(LINK_START);
    if (linkMatch) {
      const href = linkMatch[2].trim();
      const label = linkMatch[1];
      if (isSafeHref(href)) {
        nodes.push(
          <a
            key={`${keyPrefix}l${key++}`}
            href={href}
            className="rh-poem-link"
            {...(isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {parseInlineMarkdown(label, `${keyPrefix}lt${key}-`)}
          </a>,
        );
      } else {
        nodes.push(<Fragment key={`${keyPrefix}t${key++}`}>{linkMatch[0]}</Fragment>);
      }
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const boldMatch = remaining.match(BOLD_START);
    if (boldMatch) {
      const value = boldMatch[1] ?? boldMatch[2];
      nodes.push(
        <strong key={`${keyPrefix}b${key++}`}>{parseInlineMarkdown(value, `${keyPrefix}bi${key}-`)}</strong>,
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(ITALIC_START);
    if (italicMatch) {
      const value = italicMatch[1] ?? italicMatch[2];
      nodes.push(<em key={`${keyPrefix}i${key++}`}>{parseInlineMarkdown(value, `${keyPrefix}ii${key}-`)}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const superscriptMatch = remaining.match(SUPERSCRIPT_START);
    if (superscriptMatch) {
      nodes.push(
        <sup key={`${keyPrefix}s${key++}`}>{parseInlineMarkdown(superscriptMatch[1], `${keyPrefix}si${key}-`)}</sup>,
      );
      remaining = remaining.slice(superscriptMatch[0].length);
      continue;
    }

    const mathMatch = remaining.match(MATH_INLINE_START);
    if (mathMatch) {
      nodes.push(
        <span
          key={`${keyPrefix}m${key++}`}
          className="rh-blog-math-inline"
          dangerouslySetInnerHTML={{ __html: renderMathToHtml(mathMatch[1], false) }}
        />,
      );
      remaining = remaining.slice(mathMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/[\[*_$]/);
    if (nextSpecial === -1) {
      nodes.push(<Fragment key={`${keyPrefix}t${key++}`}>{remaining}</Fragment>);
      break;
    }

    if (nextSpecial > 0) {
      nodes.push(<Fragment key={`${keyPrefix}t${key++}`}>{remaining.slice(0, nextSpecial)}</Fragment>);
      remaining = remaining.slice(nextSpecial);
      continue;
    }

    nodes.push(<Fragment key={`${keyPrefix}t${key++}`}>{remaining[0]}</Fragment>);
    remaining = remaining.slice(1);
  }

  return nodes;
}
