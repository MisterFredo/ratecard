"use client";

import { Trash2, Play } from "lucide-react";

type RawItem = {
  id_raw: string;
  source_id: string;
  source_name: string | null;
  source_title: string;
  date_source?: string | null;
  status: string;
  error_message?: string | null;
  created_at: string;
  import_type?: string | null;
};

export default function StockTable({
  raws,
  onDestock,
  onRetry,
  onDelete,
  onOpen,
}: {
  raws: RawItem[];
  onDestock: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (raw: RawItem) => void;
}) {

  function getStatusClasses(status: string) {
    if (status === "STORED") return "bg-yellow-100 text-yellow-700";
    if (status === "PROCESSING") return "bg-blue-100 text-blue-700";
    if (status === "PROCESSED") return "bg-green-100 text-green-700";
    if (status === "ERROR") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR");
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 border-b text-left text-gray-700">
          <th className="p-2">Source</th>
          <th className="p-2">Titre</th>
          <th className="p-2">Date</th>
          <th className="p-2">Import</th>
          <th className="p-2">Statut</th>
          <th className="p-2 text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {raws.map((r) => (
          <tr
            key={r.id_raw}
            className="border-b hover:bg-gray-50 transition cursor-pointer"
            onClick={() => onOpen(r)}
          >
            <td className="p-2 text-gray-600">
              {r.source_name || r.source_id}
            </td>

            <td className="p-2 font-medium">
              {r.source_title}
            </td>

            <td className="p-2 text-gray-600">
              {formatDate(r.date_source)}
            </td>

            <td className="p-2">
              <span className="text-xs px-2 py-1 rounded bg-gray-200">
                {r.import_type || "—"}
              </span>
            </td>

            <td className="p-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(r.status)}`}>
                {r.status}
              </span>
            </td>

            <td
              className="p-2 text-right space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
              {r.status === "STORED" && (
                <button
                  onClick={() => onDestock(r.id_raw)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Play size={16} />
                </button>
              )}

              {r.status === "ERROR" && (
                <button
                  onClick={() => onRetry(r.id_raw)}
                  className="text-orange-600 hover:text-orange-800"
                >
                  ↺
                </button>
              )}

              <button
                onClick={() => onDelete(r.id_raw)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
