"use client";

import HtmlEditor from "@/components/admin/HtmlEditor";
import type { HeaderConfig } from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  setHeaderConfig: React.Dispatch<
    React.SetStateAction<HeaderConfig>
  >;

  introText: string;
  setIntroText: (value: string) => void;
};

export default function HeaderIntroEditor({
  headerConfig,
  setHeaderConfig,
  introText,
  setIntroText,
}: Props) {

  const variant = headerConfig.variant || "media";

  /* =========================================================
     HELPERS (templates 🔥)
  ========================================================= */

  function applyTemplate(type: "media" | "consulting") {
    let template = "";

    if (type === "consulting") {
      template = `
<p><strong>Contexte.</strong> Décrivez ici le mouvement marché ou la tendance structurante.</p>

<p><strong>Enjeu.</strong> Expliquez pourquoi cela change la donne (business / produit / stratégie).</p>

<p><strong>À retenir.</strong> Donnez une lecture claire et actionnable.</p>
`;
    } else {
      template = `
<p>Voici les actualités clés de la semaine sur le marché.</p>

<p>Nous avons sélectionné les signaux les plus structurants pour vous aider à comprendre les évolutions en cours.</p>
`;
    }

    setHeaderConfig((prev) => ({
      ...prev,
      introHtml: template,
    }));

    setIntroText(template);
  }

  /* ========================================================= */

  return (
    <div className="col-span-2 space-y-3 border-t pt-4">

      {/* =====================================================
         HEADER EDITORIAL (NEW 🔥)
      ===================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">
            Editorial
          </div>
          <div className="text-[11px] text-gray-400">
            Bloc éditorial optionnel (après intro & chiffres)
          </div>
        </div>

        {/* TEMPLATE BUTTONS */}
        <div className="flex gap-2 text-xs">

          <button
            onClick={() => applyTemplate("media")}
            className="
              px-2 py-1
              border border-gray-200
              rounded
              hover:bg-gray-50
            "
          >
            Media
          </button>

          <button
            onClick={() => applyTemplate("consulting")}
            className="
              px-2 py-1
              border border-gray-200
              rounded
              hover:bg-gray-50
            "
          >
            Consulting
          </button>

        </div>
      </div>

      {/* =====================================================
         CONTEXT HINT
      ===================================================== */}
      <div className="text-[11px] text-gray-400 leading-relaxed">
        {variant === "consulting" ? (
          <>
            Structure recommandée : <br />
            <strong>Contexte → Enjeu → Lecture</strong>
          </>
        ) : (
          <>
            Lecture éditoriale pour contextualiser la sélection
          </>
        )}
      </div>

      {/* =====================================================
         EDITOR
      ===================================================== */}
      <HtmlEditor
        value={headerConfig.introHtml || introText || ""}
        onChange={(html) => {
          setHeaderConfig((prev) => ({
            ...prev,
            introHtml: html,
          }));

          setIntroText(html);
        }}
      />

    </div>
  );
}
