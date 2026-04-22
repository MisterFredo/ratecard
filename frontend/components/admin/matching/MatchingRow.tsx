type Props = {
  item: any;
  list: any[];
  tab: "solutions" | "companies";
  selected: any;
  setSelected: any;
  checked: any;
  setChecked: any;
  processing: string | null;
  applyMatch: (v: string) => void;
  ignore: (v: string) => void;
};

export default function MatchingRow({
  item,
  list,
  tab,
  selected,
  setSelected,
  checked,
  setChecked,
  processing,
  applyMatch,
  ignore
}: Props) {

  return (
    <tr className="border-t">

      {/* CHECK */}
      <td className="p-3">
        <input
          type="checkbox"
          checked={checked[item.value] || false}
          onChange={(e) =>
            setChecked({
              ...checked,
              [item.value]: e.target.checked
            })
          }
        />
      </td>

      {/* VALUE + HINT */}
      <td className="p-3 font-medium">
        {item.value}

        {item.type_hint === "solution" && (
          <span className="ml-2 text-purple-500 text-xs">Solution</span>
        )}

        {item.type_hint === "company" && (
          <span className="ml-2 text-blue-500 text-xs">Company</span>
        )}
      </td>

      {/* COUNT */}
      <td className="p-3 text-gray-500">
        {item.count}
      </td>

      {/* SELECT */}
      <td className="p-3">

        <select
          className="border p-2 rounded w-full"
          value={selected[item.value] || ""}
          onChange={(e) =>
            setSelected({
              ...selected,
              [item.value]: e.target.value
            })
          }
        >
          <option value="">Sélectionner</option>

          {list.map((l: any) => (
            <option
              key={tab === "solutions" ? l.id_solution : l.id_company}
              value={tab === "solutions" ? l.id_solution : l.id_company}
            >
              {l.name}
            </option>
          ))}

        </select>

      </td>

      {/* ACTIONS */}
      <td className="p-3 flex justify-end gap-2">

        <button
          onClick={() => applyMatch(item.value)}
          disabled={processing === item.value}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          MATCH
        </button>

        <button
          onClick={() => ignore(item.value)}
          disabled={processing === item.value}
          className="bg-gray-400 text-white px-3 py-1 rounded"
        >
          IGNORE
        </button>

      </td>

    </tr>
  );
}
