"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type NumberItem = {
  ID_NUMBER: string;
  LABEL: string;
  VALUE: number | null;
  UNIT: string;
  CONTEXT: string;
  STATUS: string;
};

export default function NumbersRawPanel() {

  const [items, setItems] = useState<NumberItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD
  ========================================================= */

  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/numbers/pending");
      setItems(res.items || []);
      setSelected([]);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* =========================================================
     SELECT
  ========================================================= */

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(items.map((i) => i.ID_NUMBER));
  }

  function unselectAll() {
    setSelected([]);
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  async function validateBulk() {

    if (selected.length === 0) return;

    await api.post("/numbers/structured/bulk-validate", selected);
    load();
  }

  async function rejectBulk() {

    if (selected.length === 0) return;

    await api.post("/numbers/structured/bulk-reject", selected);
    load();
  }

  async function updateItem(item: NumberItem) {

    await api.put("/numbers/structured/update", {
      id_number: item.ID_NUMBER,
      label: item.LABEL,
      value: item.VALUE,
      unit: item.UNIT,
      context: item.CONTEXT,
      status: "EDITED",
    });

    load();
  }

  /* =========================================================
     UI
  ========================================================= */

  if (loading) return <p>Chargement…</p>;

  return (

    <div className="space-y-6">

      {/* HEADER ACTIONS */}
      <div className="flex gap-4 text-sm">

        <button onClick={selectAll} className="underline">
          Tout sélectionner
        </button>

        <button onClick={unselectAll} className="underline">
          Tout désélectionner
        </button>

        <span className="ml-auto text-gray-400">
          {selected.length} sélectionnés
        </span>

      </div>

      <div className="flex gap-2">

        <button
          onClick={validateBulk}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          VALIDATE
        </button>

        <button
          onClick={rejectBulk}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          REJECT
        </button>

      </div>

      {/* TABLE */}
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

                {/* CHECKBOX */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.ID_NUMBER)}
                    onChange={() => toggle(item.ID_NUMBER)}
                  />
                </td>

                {/* LABEL */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.LABEL || ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.ID_NUMBER === item.ID_NUMBER
                            ? { ...i, LABEL: e.target.value }
                            : i
                        )
                      )
                    }
                  />
                </td>

                {/* VALUE */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.VALUE ?? ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.ID_NUMBER === item.ID_NUMBER
                            ? { ...i, VALUE: Number(e.target.value) }
                            : i
                        )
                      )
                    }
                  />
                </td>

                {/* UNIT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.UNIT || ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.ID_NUMBER === item.ID_NUMBER
                            ? { ...i, UNIT: e.target.value }
                            : i
                        )
                      )
                    }
                  />
                </td>

                {/* CONTEXT */}
                <td className="p-3">
                  <input
                    className="border p-1 w-full"
                    value={item.CONTEXT || ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.ID_NUMBER === item.ID_NUMBER
                            ? { ...i, CONTEXT: e.target.value }
                            : i
                        )
                      )
                    }
                  />
                </td>

                {/* ACTION */}
                <td className="p-3 text-right">

                  <button
                    onClick={() => updateItem(item)}
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

    </div>

  );

}
