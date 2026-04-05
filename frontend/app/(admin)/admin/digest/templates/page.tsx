"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Template = {
  id_template: string;
  name: string;
  topics: string[];
  companies: string[];
  news_types: string[];
  updated_at: string;
};

export default function DigestTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/digest/template");
      setTemplates(res.templates || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce template ?")) return;

    await api.delete(`/admin/digest/template/${id}`);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Templates Digest</h1>

        <Link
          href="/admin/digest/templates/new"
          className="px-3 py-2 bg-black text-white text-sm rounded"
        >
          Nouveau template
        </Link>
      </div>

      <div className="bg-white border rounded-lg divide-y">

        {loading && (
          <div className="p-4 text-sm text-gray-500">
            Chargement…
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            Aucun template
          </div>
        )}

        {templates.map((tpl) => (
          <div
            key={tpl.id_template}
            className="p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{tpl.name}</div>
              <div className="text-xs text-gray-500">
                {tpl.topics.length} topics · {tpl.companies.length} sociétés
              </div>
            </div>

            <div className="flex gap-2 text-sm">
              <Link
                href={`/admin/digest/templates/${tpl.id_template}`}
                className="px-2 py-1 border rounded"
              >
                Éditer
              </Link>

              <button
                onClick={() => handleDelete(tpl.id_template)}
                className="px-2 py-1 border rounded text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
