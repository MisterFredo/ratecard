"use client";

type PublishMode = "NOW" | "SCHEDULE";

type Props = {
  status: string;

  publishMode: PublishMode;
  publishAt: string;
  publishing?: boolean;

  onChangeMode: (mode: PublishMode) => void;
  onChangeDate: (value: string) => void;

  onPublish: () => void;
};

export default function StepPublish({
  status,
  publishMode,
  publishAt,
  publishing = false,
  onChangeMode,
  onChangeDate,
  onPublish,
}: Props) {

  const isScheduleInvalid =
    publishMode === "SCHEDULE" && !publishAt;

  const previewDate =
    publishMode === "NOW"
      ? new Date().toLocaleString()
      : publishAt
        ? new Date(publishAt).toLocaleString()
        : null;

  function handlePublish() {

    if (publishing) return;

    if (publishMode === "SCHEDULE" && !publishAt) {
      alert("Merci de sélectionner une date.");
      return;
    }

    onPublish();
  }

  function renderStatus() {

    if (status === "PUBLISHED") {
      return (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm">
          <strong>Publié</strong>
        </div>
      );
    }

    if (status === "SCHEDULED") {
      return (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded p-3 text-sm">
          <strong>Publication planifiée</strong>
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 text-sm">
        <strong>Brouillon</strong>
      </div>
    );
  }

  return (

    <div className="space-y-6">

      {/* STATUS */}
      {renderStatus()}

      {/* MODE */}
      <div className="space-y-4">

        <div className="text-sm font-medium">
          Publication
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={publishMode === "NOW"}
            onChange={() => onChangeMode("NOW")}
          />
          Publier immédiatement
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={publishMode === "SCHEDULE"}
            onChange={() => onChangeMode("SCHEDULE")}
          />
          Planifier
        </label>

      </div>

      {/* DATE */}
      {publishMode === "SCHEDULE" && (

        <div className="space-y-2">

          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => onChangeDate(e.target.value)}
            className={`border rounded p-2 w-full text-sm ${
              !publishAt ? "border-red-400" : ""
            }`}
          />

          {!publishAt && (
            <div className="text-xs text-red-500">
              Sélectionner une date.
            </div>
          )}

        </div>

      )}

      {/* PREVIEW DATE */}
      {previewDate && status !== "PUBLISHED" && (

        <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700">
          <strong>Date prévue :</strong> {previewDate}
        </div>

      )}

      {/* ACTION */}
      <button
        onClick={handlePublish}
        disabled={publishing || isScheduleInvalid}
        className={`w-full px-4 py-2 rounded text-white text-sm transition ${
          publishing || isScheduleInvalid
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {publishing
          ? "Publication..."
          : "Publier"}
      </button>

    </div>

  );
}
