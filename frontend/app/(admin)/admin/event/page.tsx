"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type EventRow = {
  ID_EVENT: string;
  LABEL: string;

  HOME_LABEL?: string | null;
  HOME_ORDER?: number | null;
  IS_ACTIVE_HOME?: boolean | null;
  IS_ACTIVE_NAV?: boolean | null;

  EVENT_COLOR?: string | null;

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
        alert("❌ Erreur chargement événements");
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Événements</h1>

        <Link
          href="/admin/event/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter un événement
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : events.length === 0 ? (
        <p className="italic text-gray-500">Aucun événement.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Label</th>
              <th className="p-2">Home</th>
              <th className="p-2">Nav</th>
              <th className="p-2">Ordre</th>
              <th className="p-2">Couleur</th>
              <th className="p-2">Carré</th>
              <th className="p-2">Rectangle</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const squareUrl = e.MEDIA_SQUARE_ID
                ? `${GCS}/events/EVENT_${e.ID_EVENT}_square.jpg`
                : null;

              const rectUrl = e.MEDIA_RECTANGLE_ID
                ? `${GCS}/events/EVENT_${e.ID_EVENT}_rect.jpg`
                : null;

              return (
                <tr
                  key={e.ID_EVENT}
                  className="border-b hover:bg-gray-50"
                >
                  {/* LABEL */}
                  <td className="p-2">
                    <div className="font-medium">{e.LABEL}</div>
                    {e.HOME_LABEL && (
                      <div className="text-xs text-gray-500">
                        Home : {e.HOME_LABEL}
                      </div>
                    )}
                  </td>

                  {/* HOME */}
                  <td className="p-2">
                    {e.IS_ACTIVE_HOME ? "✅" : "—"}
                  </td>

                  {/* NAV */}
                  <td className="p-2">
                    {e.IS_ACTIVE_NAV ? "✅" : "—"}
                  </td>

                  {/* ORDER */}
                  <td className="p-2">
                    {e.HOME_ORDER ?? "—"}
                  </td>

                  {/* COLOR */}
                  <td className="p-2">
                    {e.EVENT_COLOR ? (
                      <span
                        className="inline-block w-4 h-4 rounded"
                        style={{
                          backgroundColor: e.EVENT_COLOR,
                        }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* SQUARE */}
                  <td className="p-2">
                    {squareUrl ? (
                      <img
                        src={squareUrl}
                        className="w-12 h-12 border rounded object-cover"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* RECTANGLE */}
                  <td className="p-2">
                    {rectUrl ? (
                      <img
                        src={rectUrl}
                        className="h-10 border rounded"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-2 text-right">
                    <Link
                      href={`/admin/event/edit/${e.ID_EVENT}`}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
