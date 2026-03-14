"use client";

type SourceItem = {
  id_source: string;
  label: string;
};

export default function StockFilters({
  sources,
  status,
  sourceId,
  onStatusChange,
  onSourceChange,
}: {
  sources: SourceItem[];
  status: string;
  sourceId: string;
  onStatusChange: (v: string) => void;
  onSourceChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-4">

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="">Tous les statuts</option>
        <option value="ERROR">Erreur</option>
        <option value="STORED">Stored</option>
        <option value="PROCESSING">Processing</option>
        <option value="PROCESSED">Processed</option>
      </select>

      <select
        value={sourceId}
        onChange={(e) => onSourceChange(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="">Toutes les sources</option>
        {sources.map((s) => (
          <option key={s.id_source} value={s.id_source}>
            {s.label}
          </option>
        ))}
      </select>

    </div>
  );
}
