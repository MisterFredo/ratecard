"use client";

type Props = {
  publishAt: string;
  publishing: boolean;

  onChangeDate: (date: string) => void;
  onPublish: () => void;
};

export default function NewsStepPublish({
  publishAt,
  publishing,
  onChangeDate,
  onPublish,
}: Props) {
  function publishNow() {
    const now = new Date();
    const isoLocal = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    onChangeDate(isoLocal);
  }

  return (
    <div className="space-y-6 max-w-md">
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

        <p className="text-xs text-gray-500">
          Vous pouvez définir une date passée ou future.
          <br />
          Cette date sera utilisée comme date officielle de publication.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={publishNow}
          className="border border-gray-300 px-3 py-2 rounded text-sm"
        >
          Publier maintenant
        </button>

        <button
          onClick={onPublish}
          disabled={publishing || !publishAt}
          className="bg-ratecard-green text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {publishing ? "Publication…" : "Publier"}
        </button>
      </div>
    </div>
  );
}

