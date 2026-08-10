import { getLinkLabel } from "@/app/lib/link-label";
import type { ProjectLink } from "@/app/lib/content-types";

type ProjectLinkButtonsProps = {
  links?: ProjectLink[];
};

export default function ProjectLinkButtons({ links }: ProjectLinkButtonsProps) {
  if (!links || links.length === 0) return null;

  return (
    <>
      {links.map((link) => (
        <a key={link.url} className="rh-caption-button" href={link.url} target="_blank" rel="noopener noreferrer">
          {getLinkLabel(link.url, link.label)}
        </a>
      ))}
    </>
  );
}
