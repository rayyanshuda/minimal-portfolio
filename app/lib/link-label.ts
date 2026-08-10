const KNOWN_LABELS: Record<string, string> = {
  "github.com": "github",
  "kaggle.com": "kaggle",
  "arxiv.org": "arxiv",
  "huggingface.co": "huggingface",
};

export function getLinkLabel(url: string, override?: string): string {
  if (override) return override;

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return KNOWN_LABELS[hostname] ?? "link";
  } catch {
    return "link";
  }
}
