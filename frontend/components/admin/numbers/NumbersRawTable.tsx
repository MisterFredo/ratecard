"use client";

/* =========================================================
   TYPES
========================================================= */

type TopicItem = {
  label: string;     // 🔥 uniquement label (pas d’id)
  checked: boolean;
};

type RawNumberItem = {
  id_content: string;
  label: string;
  value: string;
  unit: string;
  context: string;
  topics?: TopicItem[];
};

type Props = {
  items: RawNumberItem[];
  selected: string[];
  getId: (item: RawNumberItem) => string;
  onToggle: (item: RawNumberItem) => void;
  onSave: (item: RawNumberItem) => void;
  onChange: (item: RawNumberItem) => void; // 🔥 important
};

/* ========================================================= */

export default function NumbersRawTable({
  items,
  selected,
  getId,
  onToggle,
  onSave,
  onChange,
}: Props) {

  return (

    <div className="border rounded overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 w-10"></th>
            <th className="p-3">Label</th>
            <th className="p-3 w-24">Value</th>
            <th className="p-3 w-24">Unit</th>
            <th className="p-3">Context</th>
            <th className="p-3">Topics</th>
            <th className="p-3 w-32 text-right">Action</th>
          </tr>
        </thead>

        <tbody>

          {items.map((item) => {

            const id = getId(item);

            return (

              <tr key={id} className="border-t">

                {/* CHECK */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(id)}
                    onChange={() => onToggle(item)}
                  />
                </td>

                {/* LABEL */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.label}
                    onChange={(e) =>
                      onChange({ ...item, label: e.target.value })
                    }
                  />
                </td>

                {/* VALUE */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.value}
                    onChange={(e) =>
                      onChange({ ...item, value: e.target.value })
                    }
                  />
                </td>

                {/* UNIT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.unit}
                    onChange={(e) =>
                      onChange({ ...item, unit: e.target.value })
                    }
                  />
                </td>

                {/* CONTEXT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.context}
                    onChange={(e) =>
                      onChange({ ...item, context: e.target.value })
                    }
                  />
                </td>

                {/* TOPICS */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">

                    {(item.topics || []).map((t, idx) => (

                      <label
                        key={`${t.label}_${idx}`}
                        className="flex items-center gap-1 text-xs"
                      >

                        <input
                          type="checkbox"
                          checked={t.checked}
                          onChange={(e) => {

                            const updatedTopics =
                              item.topics?.map((x, i) =>
                                i === idx
                                  ? { ...x, checked: e.target.checked }
                                  : x
                              ) || [];

                            onChange({
                              ...item,
                              topics: updatedTopics,
                            });

                          }}
                        />

                        {t.label}

                      </label>

                    ))}

                  </div>
                </td>

                {/* ACTION */}
                <td className="p-3 text-right">
                  <button
                    onClick={() => onSave(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    VALIDATE
                  </button>
                </td>

              </tr>

            );

          })}

          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-400">
                Aucun chiffre à traiter
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}
