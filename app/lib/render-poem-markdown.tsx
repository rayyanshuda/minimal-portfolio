import { Fragment, type ReactNode } from "react";
import { parseInlineMarkdown } from "./markdown-inline";

const HEADER_LINE = /^(#{1,6})\s+(.+)$/;

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
