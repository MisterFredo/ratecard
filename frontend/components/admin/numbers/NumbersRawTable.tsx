"use client";

type RawNumberItem = {
  id_content: string;
  label: string;
  value: string;
  unit: string;
  context: string;
};

type Props = {
  items: RawNumberItem[];
  selected: string[];
  getId: (item: RawNumberItem) => string;
  onToggle: (item: RawNumberItem) => void;
  onSave: (item: RawNumberItem) => void;
};

export default function NumbersRawTable({
  items,
  selected,
  getId,
  onToggle,
  onSave,
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
                    onChange={(e) => item.label = e.target.value}
                  />
                </td>

                {/* VALUE */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.value}
                    onChange={(e) => item.value = e.target.value}
                  />
                </td>

                {/* UNIT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.unit}
                    onChange={(e) => item.unit = e.target.value}
                  />
                </td>

                {/* CONTEXT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.context}
                    onChange={(e) => item.context = e.target.value}
                  />
                </td>

                {/* TOPICS */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">

                    {(item.topics || []).map((t) => (

                      <label key={t.id} className="flex items-center gap-1 text-xs">

                        <input
                          type="checkbox"
                          checked={t.checked}
                          onChange={(e) => {
                            const updated = {
                              ...item,
                              topics: item.topics?.map((x) =>
                                x.id === t.id
                                  ? { ...x, checked: e.target.checked }
                                  : x
                              ),
                            };
                            onChange(updated); // 🔥 important
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
              <td colSpan={6} className="p-6 text-center text-gray-400">
                Aucun chiffre à traiter
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}
