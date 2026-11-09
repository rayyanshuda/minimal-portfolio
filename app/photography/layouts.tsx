"use client";

// Photo card type + the journal layout used on the classic and broadsheet themes.

export type PhotoCard = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  date: string;
  /** record colors on the record store theme: [ring around the label, thin accent ring].
   *  Leave out to pick them automatically from the photo. */
  vinyl?: [string, string];
};

type LayoutProps = {
  photos: PhotoCard[];
  onOpen: (index: number) => void;
};

/* ------------------------------------------------------------------ */
/*  Journal: grouped by year, photo + caption side by side             */
/* ------------------------------------------------------------------ */

export function groupByYear(photos: PhotoCard[]) {
  const groups: { year: string; items: { photo: PhotoCard; index: number }[] }[] = [];
  let lastYear = "";
  photos.forEach((photo, index) => {
    const year = photo.date.match(/\d{4}/)?.[0] ?? lastYear;
    lastYear = year;
    const group = groups.at(-1);
    if (group && group.year === year) group.items.push({ photo, index });
    else groups.push({ year, items: [{ photo, index }] });
  });
  return groups;
}

export function JournalLayout({ photos, onOpen }: LayoutProps) {
  return (
    <div className="ph-journal">
      {groupByYear(photos).map((group) => (
        <section key={group.year} className="ph-journal-year">
          <header className="ph-journal-head">
            <span className="ph-journal-yr">{group.year}</span>
            <span className="ph-journal-count">
              {group.items.length} {group.items.length === 1 ? "photo" : "photos"}
            </span>
          </header>
          {group.items.map(({ photo, index }) => (
            <article key={photo.id} className="ph-journal-entry">
              <button
                type="button"
                className="ph-journal-photo"
                onClick={() => onOpen(index)}
                aria-label={`open ${photo.alt}`}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </button>
              <div className="ph-journal-text">
                <span className="ph-journal-date">{photo.date}</span>
                <p className="ph-journal-caption">{photo.caption}</p>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
