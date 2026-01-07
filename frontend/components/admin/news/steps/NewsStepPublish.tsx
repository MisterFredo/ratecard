"use client";

type Props = {
  publishMode: "NOW" | "SCHEDULE";
  publishAt: string;
  publishing: boolean;

  onChangeMode: (mode: "NOW" | "SCHEDULE") => void;
  onChangeDate: (date: string) => void;
  onPublish: () => void;
};

export default function NewsStepPublish({
  publishMode,
  publishAt,
  publishing,
  onChangeMode,
  onChangeDate,
  onPublish,
}: Props) {
  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <label className="block font-medium">
          Mode de publication
        </label>

        <select
          className="border rounded p-2 w-full"
          value={publishMode}
          onChange={(e) =>
            onChangeMode(e.target.value as "NOW" | "SCHEDULE")
          }
        >
          <option value="NOW">Publier maintenant</option>
          <option value="SCHEDULE">Planifier</option>
        </select>
      </div>

      {publishMode === "SCHEDULE" && (
        <div className="space-y-2">
          <label className="block font-medium">
            Date de publication
          </label>
          <input
            type="datetime-local"
            className="border rounded p-2 w-full"
            value={publishAt}
            onChange={(e) => onChangeDate(e.target.value)}
          />
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={onPublish}
          disabled={publishing}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          {publishing ? "Publication…" : "Publier"}
        </button>
      </div>
    </div>
  );
}
