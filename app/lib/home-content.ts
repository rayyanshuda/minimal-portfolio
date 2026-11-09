/* Homepage content, shared by the classic page and every alternate layout in app/home-layouts. */

export type ProjectCategory = "cv" | "ml" | "swe" | "ai";
export type Filter = "all" | ProjectCategory;


export const sectionNav = [
  { id: "work", label: "work" },
  { id: "projects", label: "projects" },
  { id: "research", label: "research" },
  { id: "writing", label: "writing" },
  { id: "passions", label: "passions" },
  { id: "connect", label: "connect" },
];

export const work = [
  { name: "CloudAct CPA", href: "https://cloudact.ca/", note: "testing and developing ai agents" },
  { name: "WATonomous", href: "https://www.watonomous.ca/", note: "robotics and AI software design for autonomous vehicles" },
  { name: "github", href: "https://github.com/rayyanshuda", note: "miscellaneous projects" },
  { name: "systems design engineering @ uwaterloo", href: "https://uwaterloo.ca/systems-design-engineering/", note: "undergraduate studies" },
];

export const allProjects: { cats: ProjectCategory[]; name: string; href: string; desc: string }[] = [
  { cats: ["swe", "ai"], name: "research assistant agent",             href: "https://github.com/rayyanshuda/research-assistant",  desc: "an agent that answers questions about PDFs or notes you upload, with citations back to the source file and page." },
  { cats: ["cv", "ml"], name: "wildfire detection",                   href: "https://github.com/rayyanshuda/wildfire-detection",  desc: "spotting fire and smoke in wilderness photos, and measuring the advantages of CNN architecture and pretraining." },
  { cats: ["swe", "ai"], name: "clinical trials visualization agent", href: "https://github.com/rayyanshuda/ctgov-viz-agent",  desc: "turns natural-language clinical trial questions into visual specs (graphs, tables, histograms, scatter plots, etc.) from ClinicalTrials.gov data" },
  { cats: ["cv", "ml"], name: "parking space occupancy classifier",   href: "https://github.com/rayyanshuda/skin-lesion-class",   desc: "marks every spot in a lot free or taken from a single fixed-camera frame." },
  { cats: ["cv"],       name: "deep learning skin lesion classifier", href: "https://github.com/rayyanshuda/skin-lesion-class",   desc: "detecting skin cancer by analyzing dermoscopic images with deep learning." },
  { cats: ["ml"],       name: "ai voice assistant agent",             href: "https://github.com/rayyanshuda/ai-voice-assistant",  desc: "an offline conversational agent with system-level commands and live transcription." },
  { cats: ["swe"],      name: "url shortener",                        href: "https://github.com/rayyanshuda/url-shortener",       desc: "turns a long url, with an optional custom alias, into a short, shareable link." }
];


export const blogs = [
  { name: "machine learning", tag: "essay", href: "/blog/machine-learning" },
  { name: "3d modelling", tag: "essay", href: "/blog/3d-modelling" },
];

export const research = [
  { name: "decomposing group dro", tag: "paper", href: "/research/group-dro" },
];

export const filterDefs: { key: Filter; label: string }[] = [
  { key: "all", label: "all" },
  { key: "cv",  label: "computer vision" },
  { key: "ml",  label: "machine learning" },
  { key: "ai",  label: "ai" },
  { key: "swe", label: "software" },
];

export const catLabel = (cat: ProjectCategory): string =>
  filterDefs.find((f) => f.key === cat)?.label ?? cat;

export const intro = {
  name: "rayyan huda",
  subtitle: "machine learning · computer vision · software",
  lede: "systems design engineering at waterloo, building computer-vision and machine-learning systems. i write and take pictures sometimes.",
};

export const passions = [
  { name: "poetry", href: "/poetry" },
  { name: "photography", href: "/photography" },
  { name: "free verse", href: "/free-verse" },
];

export const connect = {
  line: "always glad to talk",
  lineItalic: "models, code, or a good poem.",
  links: [
    { name: "email", href: "mailto:rayyanshuda@gmail.com" },
    { name: "linkedin", href: "https://www.linkedin.com/in/rayyanhuda/" },
    { name: "twitter", href: "https://x.com/rayyanshuda" },
    { name: "github", href: "https://github.com/rayyanshuda" },
  ],
};

/** A photo from /photography used as the lead image on the broadsheet homepage. */
export const featuredPhoto = {
  src: "/photographs_pics/plane_sunrise2.JPG",
  alt: "sunset over sioux narrows from a plane window",
  caption: "arguably the best sunset i've taken — over sioux narrows, june 2025.",
};
