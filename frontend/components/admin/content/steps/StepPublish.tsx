"use client";

type PublishMode = "NOW" | "SCHEDULE";

type Props = {
  publishMode: PublishMode;
  publishAt: string;
  publishing?: boolean;

  onChangeMode: (mode: PublishMode) => void;
  onChangeDate: (value: string) => void;

  onPublish: () => void;
  onBack?: () => void;
};

export default function StepPublish({
  publishMode,
  publishAt,
  publishing = false,
  onChangeMode,
  onChangeDate,
  onPublish,
  onBack,
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
      alert("Merci de sélectionner une date de publication.");
      return;
    }

    onPublish();
  }


  return (

    <div className="space-y-6">


      {/* STATUS */}

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
        <strong>Statut :</strong> Brouillon — ce contenu n’est pas encore publié.
      </div>


      <p className="text-sm text-gray-600">
        Sélectionnez le moment de publication.
        La date choisie deviendra la date officielle du contenu.
      </p>


      {/* MODE */}

      <div className="space-y-4">

        <label className="flex items-start gap-3 cursor-pointer">

          <input
            type="radio"
            checked={publishMode === "NOW"}
            onChange={() => onChangeMode("NOW")}
          />

          <div>
            <strong>Publier immédiatement</strong>

            <div className="text-xs text-gray-500">
              La date actuelle sera utilisée.
            </div>

          </div>

        </label>


        <label className="flex items-start gap-3 cursor-pointer">

          <input
            type="radio"
            checked={publishMode === "SCHEDULE"}
            onChange={() => onChangeMode("SCHEDULE")}
          />

          <div>
            <strong>Planifier</strong>

            <div className="text-xs text-gray-500">
              Vous pouvez choisir une date passée ou future.
            </div>

          </div>

        </label>

      </div>


      {/* DATE INPUT */}

      {publishMode === "SCHEDULE" && (

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Date et heure de publication
          </label>

          <input
            type="datetime-local"
            className={`border rounded p-2 w-full ${
              !publishAt ? "border-red-400" : ""
            }`}
            value={publishAt}
            onChange={(e) => onChangeDate(e.target.value)}
          />

          {!publishAt && (

            <p className="text-xs text-red-500">
              Veuillez sélectionner une date.
            </p>

          )}

        </div>

      )}


      {/* PREVIEW DATE */}

      {previewDate && (

        <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700">

          <strong>Date officielle :</strong> {previewDate}

        </div>

      )}


      {/* ACTIONS */}

      <div className="flex gap-4 pt-2">

        {onBack && (

          <button
            onClick={onBack}
            className="px-4 py-2 border rounded"
          >
            Retour
          </button>

        )}

        <button
          onClick={handlePublish}
          disabled={publishing || isScheduleInvalid}
          className={`px-5 py-2 rounded text-white transition ${
            publishing || isScheduleInvalid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >

          {publishing
            ? "Publication en cours…"
            : "Publier le contenu"}

        </button>

      </div>

    </div>

  );
}
