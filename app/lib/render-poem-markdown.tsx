import { Fragment, type ReactNode } from "react";

const HEADER_LINE = /^(#{1,6})\s+(.+)$/;
const LINK_START = /^\[([^\]]+)\]\(([^)]+)\)/;
const BOLD_START = /^\*\*([^*]+)\*\*|^__([^_]+)__/;
const ITALIC_START = /^\*([^*]+)\*|^_([^_]+)_/;

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function isExternalHref(href: string): boolean {
  const trimmed = href.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

function parseInlineMarkdown(text: string, keyPrefix = ""): ReactNode[] {
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

    const nextSpecial = remaining.search(/[\[*_]/);
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

function renderHeading(level: number, text: string, key: string): ReactNode {
  const className = `rh-poem-heading rh-poem-heading--h${level}`;
  const children = parseInlineMarkdown(text, `${key}-`);

  switch (level) {
    case 1:
      return <h1 className={className}>{children}</h1>;
    case 2:
      return <h2 className={className}>{children}</h2>;
    case 3:
      return <h3 className={className}>{children}</h3>;
    case 4:
      return <h4 className={className}>{children}</h4>;
    case 5:
      return <h5 className={className}>{children}</h5>;
    default:
      return <h6 className={className}>{children}</h6>;
  }
}

export function renderPoemMarkdown(body: string): ReactNode {
  const lines = body.split("\n");

  return lines.map((line, index) => {
    const headerMatch = line.match(HEADER_LINE);
    const lineNode = headerMatch
      ? renderHeading(headerMatch[1].length, headerMatch[2], `h${index}`)
      : parseInlineMarkdown(line, `p${index}-`);

    return (
      <Fragment key={index}>
        {lineNode}
        {index < lines.length - 1 ? "\n" : null}
      </Fragment>
    );
  });
}
