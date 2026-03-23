"use client";

type NumberItem = {
  ID_NUMBER: string;
  LABEL: string;
  VALUE: number | null;
  UNIT: string;
  CONTEXT: string;
};

type Props = {
  items: NumberItem[];
  selected: string[];
  onToggle: (id: string) => void;
  onChange: (item: NumberItem) => void;
  onSave: (item: NumberItem) => void;
};

export default function NumbersRawTable({
  items,
  selected,
  onToggle,
  onChange,
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

          {items.map((item) => (

            <tr key={item.ID_NUMBER} className="border-t">

              {/* CHECK */}
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selected.includes(item.ID_NUMBER)}
                  onChange={() => onToggle(item.ID_NUMBER)}
                />
              </td>

              {/* LABEL */}
              <td className="p-3">
                <input
                  className="border p-1 w-full"
                  value={item.LABEL || ""}
                  onChange={(e) =>
                    onChange({ ...item, LABEL: e.target.value })
                  }
                />
              </td>

              {/* VALUE */}
              <td className="p-3">
                <input
                  className="border p-1 w-full"
                  value={item.VALUE ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...item,
                      VALUE: Number(e.target.value),
                    })
                  }
                />
              </td>

              {/* UNIT */}
              <td className="p-3">
                <input
                  className="border p-1 w-full"
                  value={item.UNIT || ""}
                  onChange={(e) =>
                    onChange({ ...item, UNIT: e.target.value })
                  }
                />
              </td>

              {/* CONTEXT */}
              <td className="p-3">
                <input
                  className="border p-1 w-full"
                  value={item.CONTEXT || ""}
                  onChange={(e) =>
                    onChange({ ...item, CONTEXT: e.target.value })
                  }
                />
              </td>

              {/* ACTION */}
              <td className="p-3 text-right">
                <button
                  onClick={() => onSave(item)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  SAVE
                </button>
              </td>

            </tr>

          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-400">
                Aucun chiffre à valider
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}
