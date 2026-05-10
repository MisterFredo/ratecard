"use client";

type SourceItem = {
  id_source: string;
  label: string;
};

export default function StockFilters({
  sources,
  status,
  sourceId,
  importType,
  contentType,
  total,
  onStatusChange,
  onSourceChange,
  onImportTypeChange,
  onContentTypeChange,
}: {
  sources: SourceItem[];
  status: string;
  sourceId: string;
  importType: string;
  contentType: string;
  total: number;
  onStatusChange: (v: string) => void;
  onSourceChange: (v: string) => void;
  onImportTypeChange: (v: string) => void;
  onContentTypeChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center">

      {/* STATUS */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="">Tous statuts</option>
        <option value="ERROR">Erreur</option>
        <option value="STORED">Stored</option>
        <option value="PROCESSING">Processing</option>
        <option value="PROCESSED">Processed</option>
      </select>

      {/* SOURCE */}
      <select
        value={sourceId}
        onChange={(e) => onSourceChange(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="">Toutes sources</option>
        {sources.map((s) => (
          <option key={s.id_source} value={s.id_source}>
            {s.label}
          </option>
        ))}
      </select>

      {/* IMPORT TYPE */}
      <select
        value={importType}
        onChange={(e) => onImportTypeChange(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="">Tous imports</option>
        <option value="FILE">Fichier</option>
        <option value="URL">URL</option>
      </select>

      {/* CONTENT TYPE */}
      <select
        value={contentType}
        onChange={(e) => onContentTypeChange(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="">Tous contenus</option>
        <option value="ANALYSIS">Analysis</option>
        <option value="NEWS">News</option>
      </select>

      {/* TOTAL */}
      <div className="text-sm text-gray-600 ml-auto">
        {total} résultat(s)
      </div>

    </div>
  );
}
