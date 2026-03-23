"use client";

type RawNumberItem = {
  id_content: string;
  chiffre: string;
};

type ParsedItem = {
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
  onSave: (item: RawNumberItem, parsed: ParsedItem) => void;
};

export default function NumbersRawTable({
  items,
  selected,
  getId,
  onToggle,
  onSave,
}: Props) {

  /* =========================================================
     LOCAL STATE (PARSED VALUES)
  ========================================================= */

  const parse = (text: string): ParsedItem => {
    // 🔥 parsing simple (fallback safe)
    return {
      label: text,
      value: "",
      unit: "",
      context: "",
    };
  };

  return (

    <div className="border rounded overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 w-10"></th>
            <th className="p-3">Raw</th>
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
            const parsed = parse(item.chiffre);

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

                {/* RAW */}
                <td className="p-3 text-gray-600">
                  {item.chiffre}
                </td>

                {/* LABEL */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    defaultValue={parsed.label}
                    onChange={(e) => parsed.label = e.target.value}
                  />
                </td>

                {/* VALUE */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    defaultValue={parsed.value}
                    onChange={(e) => parsed.value = e.target.value}
                  />
                </td>

                {/* UNIT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    defaultValue={parsed.unit}
                    onChange={(e) => parsed.unit = e.target.value}
                  />
                </td>

                {/* CONTEXT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    defaultValue={parsed.context}
                    onChange={(e) => parsed.context = e.target.value}
                  />
                </td>

                {/* ACTION */}
                <td className="p-3 text-right">
                  <button
                    onClick={() => onSave(item, parsed)}
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
