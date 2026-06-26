import type { ContentSpacing } from "@/app/lib/content-types";
import { renderPoemMarkdown } from "@/app/lib/render-poem-markdown";

type PoemBodyProps = {
  body: string;
  spacing?: ContentSpacing;
  className?: string;
};

export default function PoemBody({ body, spacing = "pre-wrap", className }: PoemBodyProps) {
  const classes = ["rh-poem-body", className].filter(Boolean).join(" ");
  const isBlackout = className?.includes("rh-poem-blackout");

  if (isBlackout) {
    const cols = Math.max(0, ...body.split("\n").map((line) => line.length));

    return (
      <div className="rh-poem-blackout-scroll">
        <pre
          className={classes}
          style={{
            whiteSpace: spacing,
            margin: 0,
            ["--rh-blackout-cols" as string]: cols,
          }}
        >
          {body}
        </pre>
      </div>
    );
  }

  return (
    <div className={classes} style={{ whiteSpace: spacing }}>
      {renderPoemMarkdown(body)}
    </div>
  );
}
