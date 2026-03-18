"use client";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 mt-6">

      {/* INFO */}
      <div>
        Page {page} / {totalPages}
      </div>

      {/* BUTTONS */}
      <div className="flex items-center gap-2">

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="
            px-3 py-1 rounded border
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-gray-50
          "
        >
          ← Précédent
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="
            px-3 py-1 rounded border
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-gray-50
          "
        >
          Suivant →
        </button>

      </div>
    </div>
  );
}
