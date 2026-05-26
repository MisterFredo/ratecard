"use client";

type EditorialFlowItem = {
  id: string;
  type: string;
  label: string;
  title: string;
};

type Props = {
  items: EditorialFlowItem[];

  setItems: React.Dispatch<
    React.SetStateAction<EditorialFlowItem[]>
  >;
};

export default function DeliveryEditorialFlow({
  items,
  setItems,
}: Props) {

  /* =========================================
     ACTIONS
  ========================================= */

  function moveUp(index: number) {

    if (index === 0) return;

    setItems((prev) => {

      const updated = [...prev];

      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  }

  function moveDown(index: number) {

    if (index === items.length - 1) return;

    setItems((prev) => {

      const updated = [...prev];

      [updated[index + 1], updated[index]] = [
        updated[index],
        updated[index + 1],
      ];

      return updated;
    });
  }

  function removeItem(index: number) {

    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  /* =========================================
     EMPTY
  ========================================= */

  if (items.length === 0) {

    return (

      <section className="space-y-2">

        <h2 className="text-sm font-semibold tracking-tight">
          Flux éditorial
        </h2>

        <div className="border border-gray-200 rounded-lg bg-white px-4 py-4 text-xs text-gray-400 text-center">
          Aucun élément sélectionné
        </div>

      </section>
    );
  }

  /* =========================================
     RENDER
  ========================================= */

  return (

    <section className="space-y-2">

      <h2 className="text-sm font-semibold tracking-tight">
        Flux éditorial
      </h2>

      <div className="border border-gray-200 rounded-lg bg-white divide-y">

        {items.map((item, index) => (

          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between px-3 py-2 text-sm"
          >

            <div className="flex items-start gap-2 min-w-0">

              <span className="text-[10px] uppercase tracking-wide text-gray-400 shrink-0">
                {item.label}
              </span>

              <span className="text-gray-900 font-medium truncate">
                {item.title}
              </span>

            </div>

            <div className="flex items-center gap-1 text-xs">

              <button
                onClick={() => moveUp(index)}
                className="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-50"
              >
                ↑
              </button>

              <button
                onClick={() => moveDown(index)}
                className="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-50"
              >
                ↓
              </button>

              <button
                onClick={() => removeItem(index)}
                className="px-1.5 py-0.5 border border-gray-200 rounded text-red-600 hover:bg-red-50"
              >
                ✕
              </button>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}
