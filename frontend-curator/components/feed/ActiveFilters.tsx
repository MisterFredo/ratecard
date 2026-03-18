"use client";

type Props = {
  badge?: string;
  onClear: () => void;
};

export default function ActiveFilters({ badge, onClear }: Props) {
  if (!badge) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">Filtré par :</span>

      <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
        <span className="font-medium">{badge}</span>

        <button
          onClick={onClear}
          className="text-xs hover:text-teal-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
