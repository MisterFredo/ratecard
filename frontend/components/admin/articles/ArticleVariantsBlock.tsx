"use client";

import { useState } from "react";

type Props = {
  intro: string;
  outro: string;
  linkedinPostText: string;
  carouselCaption: string;

  onChange: (data: {
    intro?: string;
    outro?: string;
    linkedinPostText?: string;
    carouselCaption?: string;
  }) => void;

  onIAAction?: (
    field: "intro" | "outro" | "linkedin" | "carousel"
  ) => void;
};

export default function ArticleVariantsBlock({
  intro,
  outro,
  linkedinPostText,
  carouselCaption,
  onChange,
  onIAAction,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded bg-white">

      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 border-b"
      >
        <h2 className="text-lg font-semibold text-ratecard-blue">
          Variantes éditoriales
        </h2>
        <span className="text-sm text-gray-500">
          {open ? "Masquer" : "Afficher"}
        </span>
      </button>

      {/* CONTENT */}
      {open && (
        <div className="space-y-6 p-4">

          {/* ---------------------------------------
              INTRO
          ---------------------------------------- */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Intro (idée forte)
              </label>
              {onIAAction && (
                <button
                  onClick={() => onIAAction("intro")}
                  className="text-xs text-ratecard-blue underline"
                >
                  Proposer une intro (IA)
                </button>
              )}
            </div>
            <textarea
              value={intro}
              onChange={(e) => onChange({ intro: e.target.value })}
              className="border rounded p-2 w-full h-20"
            />
          </div>

          {/* ---------------------------------------
              OUTRO
          ---------------------------------------- */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Outro (à retenir)
              </label>
              {onIAAction && (
                <button
                  onClick={() => onIAAction("outro")}
                  className="text-xs text-ratecard-blue underline"
                >
                  Proposer une conclusion (IA)
                </button>
              )}
            </div>
            <textarea
              value={outro}
              onChange={(e) => onChange({ outro: e.target.value })}
              className="border rounded p-2 w-full h-20"
            />
          </div>

          {/* ---------------------------------------
              LINKEDIN POST TEXT
          ---------------------------------------- */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Texte du post LinkedIn
              </label>
              {onIAAction && (
                <button
                  onClick={() => onIAAction("linkedin")}
                  className="text-xs text-ratecard-blue underline"
                >
                  Générer pour LinkedIn (IA)
                </button>
              )}
            </div>
            <textarea
              value={linkedinPostText}
              onChange={(e) =>
                onChange({ linkedinPostText: e.target.value })
              }
              className="border rounded p-2 w-full h-24"
            />
          </div>

          {/* ---------------------------------------
              CAROUSEL CAPTION
          ---------------------------------------- */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Légende carousel
              </label>
              {onIAAction && (
                <button
                  onClick={() => onIAAction("carousel")}
                  className="text-xs text-ratecard-blue underline"
                >
                  Proposer une légende (IA)
                </button>
              )}
            </div>
            <textarea
              value={carouselCaption}
              onChange={(e) =>
                onChange({ carouselCaption: e.target.value })
              }
              className="border rounded p-2 w-full h-16"
            />
          </div>

        </div>
      )}
    </div>
  );
}
