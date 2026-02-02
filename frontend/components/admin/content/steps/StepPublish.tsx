"use client";

type PublishMode = "NOW" | "SCHEDULE";

type Props = {
  publishMode: PublishMode;
  publishAt: string;

  publishing?: boolean;

  onChangeMode: (mode: PublishMode) => void;
  onChangeDate: (value: string) => void;

  onPublish: () => void;
};

export default function StepPublish({
  publishMode,
  publishAt,
  publishing = false,
  onChangeMode,
  onChangeDate,
  onPublish,
}: Props) {
  return (
    <div className="space-y-5">
      {/* STATUS */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
        <strong>Brouillon</strong> — ce contenu n’est pas encore publié.
      </div>

      <p className="text-sm text-gray-600">
        Choisissez quand publier le contenu.  
        La date sélectionnée sera utilisée comme date officielle de publication.
      </p>

      {/* MODE (UI ONLY) */}
      <div className="space-y-3">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            checked={publishMode === "NOW"}
            onChange={() => onChangeMode("NOW")}
          />
          <span>
            <strong>Publier maintenant</strong>
            <div className="text-xs text-gray-500">
              Publication immédiate.
            </div>
          </span>
        </label>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            checked={publishMode === "SCHEDULE"}
            onChange={() => onChangeMode("SCHEDULE")}
          />
          <span>
            <strong>Planifier la publication</strong>
            <div className="text-xs text-gray-500">
              Publication automatique à la date choisie.
            </div>
          </span>
        </label>
      </div>

      {/* DATE */}
      {publishMode === "SCHEDULE" && (
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Date et heure de publication
          </label>
          <input
            type="datetime-local"
            className="border rounded p-2 w-full"
            value={publishAt}
            onChange={(e) => onChangeDate(e.target.value)}
          />
        </div>
      )}

      {/* ACTION */}
      <div className="pt-2">
        <button
          onClick={onPublish}
          disabled={publishing}
          className={`px-5 py-2 rounded text-white ${
            publishing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {publishing ? "Publication en cours…" : "Publier le contenu"}
        </button>
      </div>
    </div>
  );
}

