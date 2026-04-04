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
     SAFE DEFAULTS (🔥 EXECUTION ONCE)
     → évite loop + override user
  ========================================================= */

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setHeaderConfig((prev) => ({
      ...prev,

      /* ===============================
         VARIANT (CORE)
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
         INTRO (SOURCE UNIQUE)
      =============================== */
      introHtml:
        prev.introHtml ??
        (introText || ""), // 🔥 sync initial

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
    <section className="border border-gray-200 rounded-lg bg-white px-4 py-4 space-y-4">

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
