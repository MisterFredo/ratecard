"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();

  const isNew = params.id === "new";

  const [name, setName] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [newsTypes, setNewsTypes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD (EDIT)
  ========================= */

  useEffect(() => {
    if (isNew) return;

    async function load() {
      const res = await api.get(`/admin/digest/template/${params.id}`);
      const tpl = res.template;

      setName(tpl.name || "");
      setTopics(tpl.topics || []);
      setCompanies(tpl.companies || []);
      setNewsTypes(tpl.news_types || []);
    }

    load();
  }, [params.id]);

  /* =========================
     SAVE
  ========================= */

  async function handleSave() {
    setLoading(true);

    const payload = {
      name,
      topics,
      companies,
      news_types: newsTypes,
    };

    try {
      if (isNew) {
        await api.post("/admin/digest/template", payload);
      } else {
        await api.put(`/admin/digest/template/${params.id}`, payload);
      }

      router.push("/admin/digest/templates");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-6 max-w-xl">

      <h1 className="text-lg font-semibold">
        {isNew ? "Nouveau template" : "Modifier template"}
      </h1>

      <div className="space-y-4">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du template"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          value={topics.join(",")}
          onChange={(e) =>
            setTopics(
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          placeholder="Topics (ids séparés par ,)"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          value={companies.join(",")}
          onChange={(e) =>
            setCompanies(
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          placeholder="Companies (ids)"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          value={newsTypes.join(",")}
          onChange={(e) =>
            setNewsTypes(
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          placeholder="News types"
          className="w-full border rounded px-3 py-2 text-sm"
        />

      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-black text-white text-sm rounded"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>

        <button
          onClick={() => router.push("/admin/digest/templates")}
          className="px-4 py-2 border text-sm rounded"
        >
          Annuler
        </button>
      </div>

    </div>
  );
}
