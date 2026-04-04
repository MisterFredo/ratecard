"use client";

import type { HeaderConfig } from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  setHeaderConfig: React.Dispatch<
    React.SetStateAction<HeaderConfig>
  >;
};

export default function HeaderMainFields({
  headerConfig,
  setHeaderConfig,
}: Props) {
  return (
    <>
      {/* TITLE */}
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
        className="border border-gray-200 rounded px-3 py-1.5 text-sm col-span-2"
      />

      {/* PERIOD + COLOR */}
      <div className="col-span-2 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Période (ex : semaine du 27 mars)"
          value={headerConfig.period ?? ""}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              period: e.target.value,
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm flex-1"
        />

        <input
          type="color"
          value={headerConfig.periodColor || "#84CC16"}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              periodColor: e.target.value,
            }))
          }
          className="h-8 w-10 border rounded"
          title="Couleur période"
        />
      </div>

      {/* SUBTITLE */}
      <input
        type="text"
        placeholder="Sous-titre (optionnel)"
        value={headerConfig.subtitle ?? ""}
        onChange={(e) =>
          setHeaderConfig((prev) => ({
            ...prev,
            subtitle: e.target.value,
          }))
        }
        className="border border-gray-200 rounded px-3 py-1.5 text-sm col-span-2"
      />
    </>
  );
}
