"use client";

import Link from "next/link";

type EventItem = {
  tag: string;
  title: string;
  by: string;
  location: string;
  dates: string;
  focus: string;
  url: string;

  visuals: {
    main: string;
    secondary?: string;
    shape: "rect" | "square";
  };
};

const events: EventItem[] = [
  {
    tag: "Flagship Ratecard",
    title: "Rencontres Ratecard #23",
    by: "by Ratecard",
    location: "Le Touquet – Westminster",
    dates: "Mercredi 1er & jeudi 2 juillet 2026",
    focus: "100% AdTech : AdOps, CTV, DOOH, Agentique…",
    url: "https://events.ratecard.fr/ratecard-meetings-touquet-2026",
    visuals: {
      main: "/assets/brand/LeTouquet.jpg",
      secondary: "/assets/brand/LeTouquet_Partners.png",
      shape: "rect",
    },
  },
  {
    tag: "Co-organisation",
    title: "E-Retail Meetings #4",
    by: "by Ratecard & Retail4Brands",
    location: "Paris – Le Grand Rex & The Hoxton",
    dates: "31 mars & 1er avril 2026",
    focus: "100% E-Retail",
    url: "https://events.ratecard.fr/retail-meetings-avril-2026",
    visuals: {
      main: "/assets/brand/Paris.jpg",
      secondary: "/assets/brand/Paris_Partners.png",
      shape: "rect",
    },
  },
  {
    tag: "Reseller exclusif",
    title: "POSSIBLE",
    by: "by MMA / A Hyve Event",
    location: "Miami – Fontainebleau & Eden Rock",
    dates: "du 27 au 29 avril 2026",
    focus: "100% Innovation",
    url: "https://possibleevent.com/",
    visuals: {
      main: "/assets/brand/Miami.jpg",
      shape: "square",
    },
  },
  {
    tag: "Cérémonie Ratecard",
    title: "Ratecard Stars #5",
    by: "by Ratecard",
    location: "Paris – La Coupole",
    dates: "Jeudi 12 novembre 2026",
    focus: "100% Awards",
    url: "https://www.eventbrite.fr/e/billets-ratecard-stars-5-1409217981919",
    visuals: {
      main: "/assets/brand/Stars.jpeg",
      shape: "rect",
    },
  },
];

export default function EventsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
      {/* =====================================================
          HERO
      ===================================================== */}
      <header className="text-center space-y-6">
        <span className="text-sm uppercase tracking-widest text-ratecard-blue">
          Événements
        </span>

        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
          Les événements Ratecard
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-700 leading-relaxed">
          Ratecard conçoit, co-organise et accompagne des événements
          structurants pour l’écosystème AdTech, Retail Media et innovation.
        </p>
      </header>

      {/* =====================================================
          EVENTS LIST
      ===================================================== */}
      <section className="space-y-24">
        {events.map((event) => (
          <article
            key={event.title}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            {/* VISUELS */}
            <div className="space-y-4">
              <div
                className={`overflow-hidden rounded-2xl bg-gray-100 ${
                  event.visuals.shape === "square"
                    ? "aspect-square"
                    : "aspect-[16/9]"
                }`}
              >
                <img
                  src={event.visuals.main}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {event.visuals.secondary && (
                <div className="overflow-hidden rounded-xl bg-gray-100 aspect-[16/9]">
                  <img
                    src={event.visuals.secondary}
                    alt={`${event.title} – partenaires`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* TEXTE */}
            <div className="space-y-5">
              <span className="inline-block text-xs uppercase tracking-wide text-ratecard-blue">
                {event.tag}
              </span>

              <h2 className="text-2xl font-semibold text-gray-900">
                {event.title}
              </h2>

              <p className="text-sm text-gray-500">{event.by}</p>

              <ul className="text-gray-700 space-y-1">
                <li>{event.location}</li>
                <li>{event.dates}</li>
                <li className="font-medium">{event.focus}</li>
              </ul>

              <Link
                href={event.url}
                target="_blank"
                className="inline-block text-ratecard-blue font-medium hover:underline"
              >
                Découvrir l’événement →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
