"use client";

import { useEffect } from "react";
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
     SAFE DEFAULTS (🔥 CRITIQUE)
  ========================================================= */

  useEffect(() => {
    setHeaderConfig((prev) => ({
      ...prev,

      // 🔥 sécurise les nouveaux champs
      topBarEnabled:
        prev.topBarEnabled !== undefined
          ? prev.topBarEnabled
          : true,

      topBarColor: prev.topBarColor || "#84CC16",
      periodColor: prev.periodColor || "#84CC16",

      // 🔥 intro unifiée
      introHtml: prev.introHtml ?? "",
    }));
  }, [setHeaderConfig]);

  /* ========================================================= */

  return (
    <section className="border border-gray-200 rounded-lg bg-white px-4 py-4 space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Configuration
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3">

        {/* MAIN TEXT */}
        <HeaderMainFields
          headerConfig={headerConfig}
          setHeaderConfig={setHeaderConfig}
        />

        {/* BRANDING / COLORS */}
        <HeaderBranding
          headerConfig={headerConfig}
          setHeaderConfig={setHeaderConfig}
        />

        {/* INTRO RICH TEXT */}
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
