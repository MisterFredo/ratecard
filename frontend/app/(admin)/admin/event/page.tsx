"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type EventRow = {
  ID_EVENT: string;
  LABEL: string;
  EXTERNAL_URL?: string | null;

  MEDIA_SQUARE_ID?: string | null;
  MEDIA_RECTANGLE_ID?: string | null;
};

export default function EventList() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get("/event/list");
        setEvents(res.events || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement");
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Events (assets)
        </h1>

        <Link
          href="/admin/event/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Ajouter
        </Link>
      </div>

      {/* STATE */}
      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : events.length === 0 ? (
        <p className="italic text-gray-500">
          Aucun event
        </p>
      ) : (
        <div className="space-y-4">

          {events.map((e) => {
            const squareUrl = e.MEDIA_SQUARE_ID
              ? `${GCS}/events/EVENT_${e.ID_EVENT}_square.jpg`
              : null;

            const rectUrl = e.MEDIA_RECTANGLE_ID
              ? `${GCS}/events/EVENT_${e.ID_EVENT}_rect.jpg`
              : null;

            return (
              <div
                key={e.ID_EVENT}
                className="
                  flex items-center justify-between
                  border rounded-lg p-3
                  hover:bg-gray-50
                "
              >

                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* RECT (hero) */}
                  {rectUrl && (
                    <img
                      src={rectUrl}
                      className="h-12 w-auto rounded border"
                    />
                  )}

                  {/* TEXT */}
                  <div>
                    <div className="font-medium">
                      {e.LABEL}
                    </div>

                    {e.EXTERNAL_URL && (
                      <div className="text-xs text-gray-500 truncate max-w-[300px]">
                        {e.EXTERNAL_URL}
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">

                  {/* SQUARE */}
                  {squareUrl && (
                    <img
                      src={squareUrl}
                      className="w-10 h-10 rounded border object-cover"
                    />
                  )}

                  {/* ACTION */}
                  <Link
                    href={`/admin/event/edit/${e.ID_EVENT}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Modifier
                  </Link>

                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
