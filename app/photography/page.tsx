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

// Newest at the top — add new pics at the top as photo-32, photo-33, etc. photo-1 is oldest (bottom).
const photoCards: PhotoCard[] = [
  {
    id: "photo-31",
    src: "/photographs_pics/art_museum.jpg",
    alt: "art museum pic",
    caption: "we were trying to larp to get performative pics and this one was pretty good",
    date: "February 7th, 2026",
  },
  {
    id: "photo-30",
    src: "/photographs_pics/mountains.JPG",
    alt: "mountains over dubai",
    caption: "mountains over dubai",
    date: "December 13th, 2025",
  },
  {
    id: "photo-29",
    src: "/photographs_pics/pakistan2.JPG",
    alt: "sunset in karachi",
    caption: "my first sunset in karachi captured",
    date: "November 15th, 2025",
  },
  {
    id: "photo-28",
    src: "/photographs_pics/pakistan1.jpg",
    alt: "pakistan motorcycle",
    caption: "pakistan summed up in one pic",
    date: "November 7th, 2025",
  },
  {
    id: "photo-27",
    src: "/photographs_pics/sunset_pose2.jpg",
    alt: "shadow sunset wall pic",
    caption: "wait it was kinda fire i got too much hate for it",
    date: "July 29th, 2025",
  },
  {
    id: "photo-26",
    src: "/photographs_pics/sunset_pose1.jpg",
    alt: "shadow sunset wall pic",
    caption: "my take on tumblr girl poses",
    date: "July 29th, 2025",
  },
  {
    id: "photo-25",
    src: "/photographs_pics/tor_train_tracks.jpg",
    alt: "toronto train tracks",
    caption: "this gives me thomas the tank engine vibes iykwim",
    date: "June 29th, 2025",
  },
  {
    id: "photo-24",
    src: "/photographs_pics/tor_train_station.jpg",
    alt: "toronto trains station",
    caption: "vancouver's train station was better imo",
    date: "June 29th, 2025",
  },
  {
    id: "photo-23",
    src: "/photographs_pics/the_well2.jpg",
    alt: "toronto mall - the well",
    caption: "open mall is a really cool aesthetic",
    date: "June 29th, 2025",
  },
  {
    id: "photo-22",
    src: "/photographs_pics/the_well1.jpg",
    alt: "toronto mall - the well",
    caption: "first time in the well",
    date: "June 29th, 2025",
  },
  {
    id: "photo-21",
    src: "/photographs_pics/sombr_poster.jpg",
    alt: "sombr poster in toronto dt",
    caption: "sombr poster in toronto dt (when i still liked his music)",
    date: "June 29th, 2025",
  },
  {
    id: "photo-20",
    src: "/photographs_pics/sunset2.jpg",
    alt: "sunset on a bus",
    caption: "sunset on a bus back to waterloo after a day in mississauga",
    date: "June 28th",
  },
  {
    id: "photo-19",
    src: "/photographs_pics/bridge_sunset4.jpg",
    alt: "bridge sunset pic",
    caption: "going back to waterloo after eid",
    date: "June 8th, 2025",
  },
  {
    id: "photo-18",
    src: "/photographs_pics/plane_sunrise2.JPG",
    alt: "sunset over sioux narrows",
    caption: "arguably the best sunset i've taken",
    date: "June 5th, 2025",
  },
  {
    id: "photo-17",
    src: "/photographs_pics/waterloo_1a.jpg",
    alt: "last pic of waterloo 1a",
    caption: "taken after my final exam of first term of university",
    date: "December 14th, 2024",
  },
  {
    id: "photo-16",
    src: "/photographs_pics/winter_waterloo.jpg",
    alt: "waterloo park lake winter pic",
    caption: "winter wonterland yk",
    date: "December 1st, 2024",
  },
  {
    id: "photo-15",
    src: "/photographs_pics/waterloo_park2.JPG",
    alt: "silver lake",
    caption: "waterloo park lake - silver lake",
    date: "October 16th, 2024",
  },
  {
    id: "photo-14",
    src: "/photographs_pics/waterloo_park1.jpg",
    alt: "silver lake",
    caption: "i walked this park at night a lot",
    date: "October 16th, 2024",
  },
  {
    id: "photo-13",
    src: "/photographs_pics/waterloo_sunset1.jpg",
    alt: "sunset pic outside my waterloo 1a dorm",
    caption: "the net makes it look like im caged in which i lowkey felt like i was",
    date: "September 25th, 2024",
  },
  {
    id: "photo-12",
    src: "/photographs_pics/plane_sunrise1.jpg",
    alt: "sunrise in toronto",
    caption: "first sunrise in toronto before going to waterloo",
    date: "August 29th,2024",
  },
  {
    id: "photo-11",
    src: "/photographs_pics/bridge_sunset3.JPG",
    alt: "Forest greenery photo",
    caption: "last day in van before uni",
    date: "August 28th, 2024",
  },
  {
    id: "photo-10",
    src: "/photographs_pics/bridge_sunset2.JPG",
    alt: "bridge sunset 2",
    caption: "i used this for my 18th birthday pic",
    date: "August 28th, 2024",
  },
  {
    id: "photo-9",
    src: "/photographs_pics/bridge_sunset1.JPG",
    alt: "bridge sunset",
    caption: "i think that's portmann bridge?",
    date: "August 28th,2024",
  },
  {
    id: "photo-8",
    src: "/photographs_pics/sunrise1.jpg",
    alt: "Sunrise photo",
    caption: "i was scared and excited to move out i couldn't sleep",
    date: "July 10th, 2024",
  },
  {
    id: "photo-7",
    src: "/photographs_pics/greenery_forest.jpg",
    alt: "Forest greenery photo",
    caption: "tynehead - i got lost",
    date: "July 7th, 2024",
  },
  {
    id: "photo-6",
    src: "/photographs_pics/raining_petals.jpg",
    alt: "raining petals",
    caption: "you can't see it, but it was raining",
    date: "April 2nd, 2024",
  },
  {
    id: "photo-5",
    src: "/photographs_pics/train_tracks.jpg",
    alt: "zoomed train tracks",
    caption: "justin's pic i like it a lot",
    date: "September 16th, 2023",
  },
  {
    id: "photo-4",
    src: "/photographs_pics/van_train_station.jpg",
    alt: "railway station",
    caption: "canadian pacific railway station - SOME trains are cool ok",
    date: "July 3rd, 2023",
  },
  {
    id: "photo-3",
    src: "/photographs_pics/steam_clock.jpg",
    alt: "vancouver steam clock",
    caption: "it puffs once every 15 min i dont get how its an attraction",
    date: "July 3rd, 2023",
  },
  {
    id: "photo-2",
    src: "/photographs_pics/monotone_alley.jpg",
    alt: "Forest greenery photo",
    caption: "downtown vancouver - gives me memento vibes for some reason",
    date: "July 3rd, 2023",
  },
  {
    id: "photo-1",
    src: "/photographs_pics/farm_sunset.jpg",
    alt: "Farm sunset photo",
    caption: "farm sunset",
    date: "June 30th, 2023",
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
      <RhSubpageHeader title="photography" caption="click on the pictures to know about them" />

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
                        <img
                          src={photo.src}
                          alt=""
                          aria-hidden="true"
                          className="photo-card-back-image"
                        />
                        <div className="photo-card-back-content">
                          <span className="photo-caption">{photo.caption}</span>
                          <span className="photo-date">{photo.date}</span>
                        </div>
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
