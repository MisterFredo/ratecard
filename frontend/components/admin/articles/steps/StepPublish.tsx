"use client";

type Props = {
  publishMode: "NOW" | "SCHEDULE";
  publishAt: string;

  onChangeMode: (mode: "NOW" | "SCHEDULE") => void;
  onChangeDate: (value: string) => void;

  onPublish: () => void;
};

export default function StepPublish({
  publishMode,
  publishAt,
  onChangeMode,
  onChangeDate,
  onPublish,
}: Props) {
  return (
    <div className="space-y-4">

      <p className="text-sm text-gray-600">
        Choisissez quand publier l’article.
      </p>

      {/* MODE */}
      <div className="space-y-2">
        <label className="block">
          <input
            type="radio"
            checked={publishMode === "NOW"}
            onChange={() => onChangeMode("NOW")}
          />{" "}
          Publier maintenant
        </label>

        <label className="block">
          <input
            type="radio"
            checked={publishMode === "SCHEDULE"}
            onChange={() => onChangeMode("SCHEDULE")}
          />{" "}
          Planifier la publication
        </label>
      </div>

      {/* DATE */}
      {publishMode === "SCHEDULE" && (
        <div>
          <label className="text-sm font-medium block mb-1">
            Date et heure de publication
          </label>
          <input
            type="datetime-local"
            className="border rounded p-2"
            value={publishAt}
            onChange={(e) => onChangeDate(e.target.value)}
          />
        </div>
      )}

      {/* ACTION */}
      <button
        onClick={onPublish}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Publier l’article
      </button>
    </div>
  );
}
