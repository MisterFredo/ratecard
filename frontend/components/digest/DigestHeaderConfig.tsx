"use client";

type HeaderConfig = {
  title: string;
  subtitle?: string;
  coverImageUrl?: string;
  mode: "ratecard" | "client";
};

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

        <input
          type="text"
          placeholder="Sous-titre"
          value={headerConfig.subtitle}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              subtitle: e.target.value,
            }))
          }
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="URL image header (optionnel)"
          value={headerConfig.coverImageUrl}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              coverImageUrl: e.target.value,
            }))
          }
          className="border rounded px-3 py-2 text-sm col-span-2"
        />

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
