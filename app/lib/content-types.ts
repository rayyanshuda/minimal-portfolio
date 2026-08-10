export type ContentSpacing = "pre" | "pre-wrap" | "pre-line" | "normal";

export type ProjectLink = {
  url: string;
  label?: string;
};

export type ContentPiece = {
  id: string;
  title: string;
  body: string;
  caption?: string;
  links?: ProjectLink[];
  order?: number;
  spacing?: ContentSpacing;
  className?: string;
};
