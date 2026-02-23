"use client";

type DigestModel = {
  id_template: string;
  name: string;
};

type Props = {
  models: DigestModel[];
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  handleSearch: () => void;
  loading: boolean;
};

export default function DigestSearchBar({
  models,
  selectedModelId,
  setSelectedModelId,
  handleSearch,
  loading,
}: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">
        Digest
      </h1>

      <div className="flex gap-4 items-center">
        <select
          value={selectedModelId}
          onChange={(e) =>
            setSelectedModelId(e.target.value)
          }
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">
            Flux global (sans modèle)
          </option>

          {models.map((m) => (
            <option
              key={m.id_template}
              value={m.id_template}
            >
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-black text-white text-sm rounded px-4 py-2"
        >
          {loading ? "Recherche…" : "Rechercher"}
        </button>
      </div>
    </div>
  );
}
