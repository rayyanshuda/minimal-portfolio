export type ContentSpacing = "pre" | "pre-wrap" | "pre-line" | "normal";

export type ContentPiece = {
  id: string;
  title: string;
  body: string;
  caption?: string;
  order?: number;
  spacing?: ContentSpacing;
  className?: string;
};
