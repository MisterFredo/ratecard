"use client";

import type { HeaderConfig } from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  setHeaderConfig: React.Dispatch<
    React.SetStateAction<HeaderConfig>
  >;
};

export default function DigestHeaderConfig({
  headerConfig,
  setHeaderConfig,
}: Props) {
  return (
    <section className="space-y-4 border p-6 rounded bg-white">
      <h2 className="text-sm font-semibold">
        Configuration Header
      </h2>

      <div className="grid grid-cols-2 gap-6">
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
          className="border rounded px-3 py-2 text-sm"
        />

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
          className="border rounded px-3 py-2 text-sm"
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
          className="border rounded px-3 py-2 text-sm col-span-2"
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
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="ratecard">
            Mode Ratecard
          </option>
          <option value="client">
            Mode Client
          </option>
        </select>
      </div>
    </section>
  );
}
