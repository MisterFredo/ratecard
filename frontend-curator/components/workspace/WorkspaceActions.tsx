"use client";

/* ========================================================= */

type Props = {
  loading: boolean;

  hasContent: boolean;
  hasNumbers: boolean;

  onGenerate: (
    outputType:
      | "key_points"
      | "structure"
  ) => void;
};

/* ========================================================= */

export default function WorkspaceActions({
  loading,
  hasContent,
  hasNumbers,
  onGenerate,
}: Props) {

  return (
    <div
      className="
        p-3
        border-b
        space-y-2
      "
    >

      {/* KEY POINTS */}
      <button
        onClick={() =>
          onGenerate("key_points")
        }
        disabled={
          loading ||
          (!hasContent && !hasNumbers)
        }
        className="
          w-full
          py-2
          text-xs
          rounded-lg
          bg-black
          text-white
          disabled:opacity-50
        "
      >
        Key Points
      </button>

      {/* STRUCTURE */}
      <button
        onClick={() =>
          onGenerate("structure")
        }
        disabled={
          loading ||
          (!hasContent && !hasNumbers)
        }
        className="
          w-full
          py-2
          text-xs
          rounded-lg
          bg-gray-100
          text-gray-700
          disabled:opacity-50
        "
      >
        Structure Data
      </button>

    </div>
  );
}
