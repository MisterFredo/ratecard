"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type TopicRow = {
  ID_TOPIC: string;
  LABEL: string;
  TOPIC_AXIS?: "BUSINESS" | "FIELD";
  MEDIA_SQUARE_ID?: string | null;
  MEDIA_RECTANGLE_ID?: string | null;
};

export default function TopicList() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get("/topic/list");
        setTopics(res.topics || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement topics");
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Topics</h1>

        <Link
          href="/admin/topic/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter un topic
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : topics.length === 0 ? (
        <p className="italic text-gray-500">Aucun topic.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Label</th>
              <th className="p-2">Axe</th>
              <th className="p-2">Carré</th>
              <th className="p-2">Rectangle</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {topics.map((t) => {
              const squareUrl = t.MEDIA_SQUARE_ID
                ? `${GCS}/topics/TOPIC_${t.ID_TOPIC}_square.jpg`
                : null;

              const rectUrl = t.MEDIA_RECTANGLE_ID
                ? `${GCS}/topics/TOPIC_${t.ID_TOPIC}_rect.jpg`
                : null;

              return (
                <tr
                  key={t.ID_TOPIC}
                  className="border-b hover:bg-gray-50"
                >
                  {/* LABEL */}
                  <td className="p-2 font-medium">
                    {t.LABEL}
                  </td>

                  {/* AXIS */}
                  <td className="p-2">
                    {t.TOPIC_AXIS === "FIELD" ? (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        FIELD
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        BUSINESS
                      </span>
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
                      href={`/admin/topic/edit/${t.ID_TOPIC}`}
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

