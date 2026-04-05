"use client";

import { useEffect, useRef } from "react";
import type { HeaderConfig } from "@/types/newsletter";

import HeaderMainFields from "./HeaderMainFields";
import HeaderBranding from "./HeaderBranding";
import HeaderIntroEditor from "./HeaderIntroEditor";

type Props = {
  headerConfig: HeaderConfig;
  setHeaderConfig: React.Dispatch<
    React.SetStateAction<HeaderConfig>
  >;

  introText: string;
  setIntroText: (value: string) => void;
};

export default function DigestHeaderConfig({
  headerConfig,
  setHeaderConfig,
  introText,
  setIntroText,
}: Props) {

  /* =========================================================
     SAFE DEFAULTS
  ========================================================= */

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setHeaderConfig((prev) => ({
      ...prev,

      /* ===============================
         VARIANT
      =============================== */
      variant: prev.variant || "media",

      /* ===============================
         TOP BAR
      =============================== */
      topBarEnabled:
        prev.topBarEnabled !== undefined
          ? prev.topBarEnabled
          : true,

      topBarColor: prev.topBarColor || "#84CC16",

      /* ===============================
         COLORS
      =============================== */
      periodColor: prev.periodColor || "#84CC16",

      /* ===============================
         INTRO
      =============================== */
      introHtml:
        prev.introHtml ??
        (introText || ""),

      /* ===============================
         MEDIA DEFAULTS (NEW)
      =============================== */
      heroLink: prev.heroLink || "",
      heroImageUrl: prev.heroImageUrl || "",
      logoLink: prev.logoLink || "",

      /* ===============================
         BACKWARD COMPAT
      =============================== */
      title: prev.title || "",
      subtitle: prev.subtitle ?? "",
      period: prev.period ?? "",
    }));
  }, [setHeaderConfig, introText]);

  /* ========================================================= */

  return (
    <section className="border border-gray-200 rounded-lg bg-white px-4 py-4 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Configuration
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3">

        {/* ===============================
            MAIN TEXT
        =============================== */}
        <HeaderMainFields
          headerConfig={headerConfig}
          setHeaderConfig={setHeaderConfig}
        />

        {/* ===============================
            BRANDING
        =============================== */}
        <HeaderBranding
          headerConfig={headerConfig}
          setHeaderConfig={setHeaderConfig}
        />

        {/* ===============================
            MEDIA (NEW)
        =============================== */}
        <div className="col-span-2 border-t pt-3 space-y-2">

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Media (Header)
          </div>

          {/* HERO LINK */}
          <input
            type="text"
            placeholder="Lien du visuel (hero)"
            className="w-full border rounded px-2 py-1 text-sm"
            value={headerConfig.heroLink || ""}
            onChange={(e) =>
              setHeaderConfig((prev) => ({
                ...prev,
                heroLink: e.target.value,
              }))
            }
          />

          {/* HERO IMAGE URL */}
          <input
            type="text"
            placeholder="URL image (optionnel)"
            className="w-full border rounded px-2 py-1 text-sm"
            value={headerConfig.heroImageUrl || ""}
            onChange={(e) =>
              setHeaderConfig((prev) => ({
                ...prev,
                heroImageUrl: e.target.value,
              }))
            }
          />

          {/* LOGO LINK */}
          <input
            type="text"
            placeholder="Lien du logo (optionnel)"
            className="w-full border rounded px-2 py-1 text-sm"
            value={headerConfig.logoLink || ""}
            onChange={(e) =>
              setHeaderConfig((prev) => ({
                ...prev,
                logoLink: e.target.value,
              }))
            }
          />

        </div>

        {/* ===============================
            INTRO (HTML EDITOR)
        =============================== */}
        <HeaderIntroEditor
          headerConfig={headerConfig}
          setHeaderConfig={setHeaderConfig}
          introText={introText}
          setIntroText={setIntroText}
        />

      </div>
    </section>
  );
}
