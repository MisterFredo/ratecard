"use client";

export default function NumbersActions({
  selectedCount,
  onGenerate,
  onValidate,
  onPublish,
}: {
  selectedCount: number;
  onGenerate: () => void;
  onValidate: () => void;
  onPublish: () => void;
}) {

  return (
    <div className="flex gap-4 items-center">

      <span className="text-sm text-gray-500">
        {selectedCount} sélectionnés
      </span>

      <button
        onClick={onGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Numbers
      </button>

      <button
        onClick={onValidate}
        className="border px-4 py-2 rounded"
      >
        Validate
      </button>

      <button
        onClick={onPublish}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Publish
      </button>

    </div>
  );
}
