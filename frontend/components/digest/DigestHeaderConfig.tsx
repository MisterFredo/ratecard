"use client";

import type { HeaderConfig } from "@/types/newsletter";

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
  return (
    <section className="border border-gray-200 rounded-lg bg-white px-4 py-4 space-y-3">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Configuration
        </h2>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={headerConfig.showTopicStats ?? false}
            onChange={(e) =>
              setHeaderConfig((prev) => ({
                ...prev,
                showTopicStats: e.target.checked,
              }))
            }
            className="h-3 w-3"
          />
          <span>Afficher baromètre (preview)</span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3">

        {/* Titre */}
        <input
          type="text"
          placeholder="Titre newsletter"
          value={headerConfig.title}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm"
        />

        {/* Mode */}
        <select
          value={headerConfig.mode}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              mode: e.target.value as
                | "ratecard"
                | "client",
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm"
        >
          <option value="ratecard">
            Ratecard (branding)
          </option>
          <option value="client">
            Client (white label)
          </option>
        </select>

        {/* Sous-titre */}
        <input
          type="text"
          placeholder="Sous-titre"
          value={headerConfig.subtitle ?? ""}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              subtitle: e.target.value,
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm col-span-2"
        />

        {/* Image header */}
        <input
          type="text"
          placeholder="URL image header (optionnel)"
          value={headerConfig.imageUrl ?? ""}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              imageUrl: e.target.value,
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm col-span-2"
        />

        {/* INTRODUCTION */}
        <textarea
          placeholder="Introduction de la newsletter..."
          value={introText}
          onChange={(e) =>
            setIntroText(e.target.value)
          }
          className="
            border border-gray-200
            rounded
            px-3 py-2
            text-sm
            min-h-[90px]
            col-span-2
            resize-y
          "
        />
      </div>
    </section>
  );
}
