"use client";

import { KeyboardEvent, useState } from "react";
import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";

type PhotoCard = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  date: string;
};

const photoCards: PhotoCard[] = [
  {
    id: "photo-1",
    src: "/photographs_pics/sunset1.JPG",
    alt: "Sunset landscape photo",
    caption: "sunset study",
    date: "Apr 2026",
  },
  {
    id: "photo-2",
    src: "/photographs_pics/farm_sunset.jpg",
    alt: "Farm sunset photo",
    caption: "farm sunset",
    date: "May 2026",
  },
  {
    id: "photo-3",
    src: "/photographs_pics/sunrise1.jpg",
    alt: "Sunrise photo",
    caption: "sunrise",
    date: "Jun 2026",
  },
  {
    id: "photo-4",
    src: "/photographs_pics/greenery_forest.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-5",
    src: "/photographs_pics/bridge_sunset1.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-6",
    src: "/photographs_pics/bridge_sunset2.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-7",
    src: "/photographs_pics/bridge_sunset3.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-8",
    src: "/photographs_pics/monotone_alley.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-9",
    src: "/photographs_pics/plane_sunrise1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-10",
    src: "/photographs_pics/raining_petals.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-11",
    src: "/photographs_pics/steam_clock.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-12",
    src: "/photographs_pics/train_tracks.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-13",
    src: "/photographs_pics/van_train_station.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-14",
    src: "/photographs_pics/art_museum.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-15",
    src: "/photographs_pics/bridge_sunset4.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-16",
    src: "/photographs_pics/mountains.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-17",
    src: "/photographs_pics/pakistan1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-18",
    src: "/photographs_pics/pakistan2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-19",
    src: "/photographs_pics/plane_sunrise2.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-20",
    src: "/photographs_pics/sombr_poster.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-21",
    src: "/photographs_pics/sunset2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-22",
    src: "/photographs_pics/the_well1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-23",
    src: "/photographs_pics/the_well2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-24",
    src: "/photographs_pics/tor_train_station.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-25",
    src: "/photographs_pics/tor_train_tracks.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-26",
    src: "/photographs_pics/waterloo_1a.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-27",
    src: "/photographs_pics/waterloo_park1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-28",
    src: "/photographs_pics/waterloo_park2.JPG",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-29",
    src: "/photographs_pics/waterloo_sunset1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-30",
    src: "/photographs_pics/winter_waterloo.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-31",
    src: "/photographs_pics/sunset_pose1.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
  {
    id: "photo-32",
    src: "/photographs_pics/sunset_pose2.jpg",
    alt: "Forest greenery photo",
    caption: "greenery",
    date: "Jul 2026",
  },
];

export default function PhotographyPage() {
  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());

  const toggleFlipped = (photoId: string) => {
    setFlippedIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleFlipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, photoId: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleFlipped(photoId);
  };

  const photoColumns = photoCards.reduce<PhotoCard[][]>(
    (columns, photo, index) => {
      columns[index % 4].push(photo);
      return columns;
    },
    [[], [], [], []],
  );

  const scrollToPhotographySection = () => {
    const target = document.getElementById("photography");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#photography");
  };

  return (
    <RhPageShell
      activeContentId="photography"
      contentsItems={[
        { id: "photography", label: "photography", href: "#photography", onSelect: scrollToPhotographySection },
      ]}
    >
      <RhSubpageHeader title="photography" />

      <section className="section photography-section" id="photography" style={{ marginTop: 46 }}>
        <div className="photography-grid">
          {photoColumns.map((column, columnIndex) => (
            <div key={`column-${columnIndex}`} className="photo-column">
              {column.map((photo) => {
                const isFlipped = flippedIds.has(photo.id);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className="photo-card"
                    onClick={() => toggleFlipped(photo.id)}
                    onKeyDown={(event) => handleFlipKeyDown(event, photo.id)}
                    aria-pressed={isFlipped}
                    aria-label={`${photo.caption}, ${photo.date}`}
                  >
                    <div className={`photo-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                      <div className="photo-card-face photo-card-front">
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                      </div>
                      <div className="photo-card-face photo-card-back">
                        <span className="photo-caption">{photo.caption}</span>
                        <span className="photo-date">{photo.date}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </RhPageShell>
  );
}
