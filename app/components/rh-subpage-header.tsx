import RhSiteHeader from "@/app/components/rh-site-header";

export default function RhSubpageHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <RhSiteHeader
      title={title}
      caption={caption}
      bubbleText="i'll take you home"
      avatarHref="/"
    />
  );
}
