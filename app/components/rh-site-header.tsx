import Link from "next/link";
import type { ReactNode } from "react";

type RhSiteHeaderProps = {
  title: string;
  subtitle?: string;
  caption?: string;
  lede?: ReactNode;
  bubbleText: string;
  avatarHref?: string;
};

function HeaderAvatar({ bubbleText, href }: { bubbleText: string; href?: string }) {
  const image = (
    <img src="/hermes-statue.png" alt="" className="rh-site-header__avatar-img" />
  );

  return (
    <span className="rh-avatar rh-site-header__avatar">
      <span className="rh-bubble">{bubbleText}</span>
      {href ? (
        <Link href={href} aria-label="Back to home" className="rh-site-header__avatar-link">
          {image}
        </Link>
      ) : (
        image
      )}
    </span>
  );
}

export default function RhSiteHeader({ title, subtitle, caption, lede, bubbleText, avatarHref }: RhSiteHeaderProps) {
  return (
    <header className="rh-site-header">
      <div className="rh-site-header__row">
        <div className="rh-site-header__title-block">
          <h1 className="rh-site-header__title">{title}</h1>
          {caption ? <div className="rh-site-header__caption rh-muted">{caption}</div> : null}
          {subtitle ? <div className="rh-site-header__subtitle rh-muted">{subtitle}</div> : null}
        </div>
        <HeaderAvatar bubbleText={bubbleText} href={avatarHref} />
      </div>
      {lede ?? null}
      <div className="rh-div rh-site-header__divider" />
    </header>
  );
}
