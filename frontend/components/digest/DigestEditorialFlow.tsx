// frontend/components/digest/DigestEditorialFlow.tsx

"use client";

import { useMemo } from "react";

import type {
  DigestContentItem,
  DigestEditorialItem,
} from "@/types/digest";

/* ========================================================= */

type Props = {
  editorialOrder: DigestEditorialItem[];

  contents: DigestContentItem[];

  setEditorialOrder: React.Dispatch<
    React.SetStateAction<
      DigestEditorialItem[]
    >
  >;
};

/* ========================================================= */

export default function DigestEditorialFlow({
  editorialOrder,

  contents,

  setEditorialOrder,
}: Props) {

  /* =======================================================
     INDEX MAPS
  ======================================================= */

  const contentsMap =
    useMemo(
      () =>
        Object.fromEntries(
          contents.map(
            (c) => [c.id, c]
          )
        ),

      [contents]
    );

  /* =======================================================
     RESOLVE SOURCE
  ======================================================= */

  function resolveSource(
    item: DigestEditorialItem
  ) {

    switch (
      item.type
    ) {

      case "content":
        return contentsMap[
          item.id
        ];

      default:
        return null;
    }
  }

  /* =======================================================
     LABEL
  ======================================================= */

  function getLabel(
    type:
      DigestEditorialItem["type"]
  ) {

    switch (
      type
    ) {

      case "content":
        return "contenu";

      default:
        return type;
    }
  }

  /* =======================================================
     TITLE
  ======================================================= */

  function getTitle(
    source: any
  ) {

    if (!source) {
      return "";
    }

    return (
      source.title ||
      ""
    );
  }

  /* =======================================================
     ACTIONS
  ======================================================= */

  function moveUp(
    index: number
  ) {

    if (
      index === 0
    ) {
      return;
    }

    setEditorialOrder(
      (prev) => {

        const updated = [
          ...prev,
        ];

        [
          updated[
            index - 1
          ],

          updated[index],
        ] = [
          updated[index],

          updated[
            index - 1
          ],
        ];

        return updated;
      }
    );
  }

  function moveDown(
    index: number
  ) {

    if (
      index ===
      editorialOrder.length -
        1
    ) {
      return;
    }

    setEditorialOrder(
      (prev) => {

        const updated = [
          ...prev,
        ];

        [
          updated[
            index + 1
          ],

          updated[index],
        ] = [
          updated[index],

          updated[
            index + 1
          ],
        ];

        return updated;
      }
    );
  }

  function removeItem(
    index: number
  ) {

    setEditorialOrder(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    editorialOrder.length ===
    0
  ) {

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <section className="space-y-2">

      <h2 className="text-sm font-semibold tracking-tight">
        Flux éditorial
      </h2>

      <div className="border border-gray-200 rounded-lg bg-white divide-y">

        {editorialOrder.map(
          (
            item,
            index
          ) => {

            const source =
              resolveSource(
                item
              );

            if (!source) {
              return null;
            }

            return (

              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >

                <div className="flex items-start gap-2 min-w-0">

                  <span className="text-[10px] uppercase tracking-wide text-gray-400 shrink-0">

                    {getLabel(
                      item.type
                    )}

                  </span>

                  <span className="text-gray-900 font-medium truncate">

                    {getTitle(
                      source
                    )}

                  </span>

                </div>

                <div className="flex items-center gap-1 text-xs">

                  <button
                    onClick={() =>
                      moveUp(
                        index
                      )
                    }
                    className="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() =>
                      moveDown(
                        index
                      )
                    }
                    className="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() =>
                      removeItem(
                        index
                      )
                    }
                    className="px-1.5 py-0.5 border border-gray-200 rounded text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>

    </section>
  );
}
