"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

import DigestHeaderConfig from "@/components/digest/DigestHeaderConfig";
import type { HeaderConfig } from "@/types/newsletter";

export default function TemplateCreatePage() {
  const router = useRouter();

  /* =========================================================
     STATE
  ========================================================= */

  const [name, setName] = useState("");

  const [topics, setTopics] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [newsTypes, setNewsTypes] = useState<string[]>([]);

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "",
    subtitle: "",
    period: "",
    headerCompany: undefined,
    showTopicStats: false,
    topBarEnabled: true,
    topBarColor: "#84CC16",
    periodColor: "#84CC16",
    introHtml: "",
  });

  const [introText, setIntroText] = useState("");

  const [loading, setLoading] = useState(false);

  /* =========================================================
     SAVE
  ========================================================= */

  async function handleSave() {
    setLoading(true);

    const payload = {
      name,
      topics,
      companies,
      news_types: newsTypes,
      header_config: headerConfig,
      intro_text: introText,
    };

    try {
      await api.post("/admin/digest/template", payload);
      router.push("/admin/digest/templates");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6 max-w-2xl">

      <h1 className="text-lg font-semibold">
        Nouveau template
      </h1>

      <div className="bg-white border rounded-lg p-4 space-y-3">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du template"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          value={topics.join(",")}
          onChange={(e) =>
            setTopics(e.target.value.split(",").map((s) => s.trim()))
          }
          placeholder="Topics (ids séparés par ,)"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          value={companies.join(",")}
          onChange={(e) =>
            setCompanies(e.target.value.split(",").map((s) => s.trim()))
          }
          placeholder="Companies (ids)"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          value={newsTypes.join(",")}
          onChange={(e) =>
            setNewsTypes(e.target.value.split(",").map((s) => s.trim()))
          }
          placeholder="News types"
          className="w-full border rounded px-3 py-2 text-sm"
        />

      </div>

      <DigestHeaderConfig
        headerConfig={headerConfig}
        setHeaderConfig={setHeaderConfig}
        introText={introText}
        setIntroText={setIntroText}
      />

      <div className="flex gap-3">

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-black text-white text-sm rounded"
        >
          {loading ? "Enregistrement…" : "Créer"}
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
