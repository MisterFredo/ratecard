"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

// STEPS
import NewsStepSource from "@/components/admin/news/steps/NewsStepSource";
import NewsStepContent from "@/components/admin/news/steps/NewsStepContent";
import NewsStepVisual from "@/components/admin/news/steps/NewsStepVisual";
import NewsStepPreview from "@/components/admin/news/steps/NewsStepPreview";
import NewsStepPublish from "@/components/admin/news/steps/NewsStepPublish";
import NewsStepLinkedIn from "@/components/admin/news/steps/NewsStepLinkedIn";

type Mode = "create" | "edit";

type Step =
  | "SOURCE"
  | "CONTENT"
  | "VISUAL"
  | "PREVIEW"
  | "PUBLISH"
  | "LINKEDIN";

type Props = {
  mode: Mode;
  newsId?: string;
};

export default function NewsStudio({ mode, newsId }: Props) {
  const searchParams = useSearchParams();

  /* =========================================================
     STATE — CORE
  ========================================================= */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  // société sélectionnée (format selector)
  const [company, setCompany] = useState<any | null>(null);
  // société complète (source de vérité)
  const [companyFull, setCompanyFull] = useState<any | null>(null);

  const [topics, setTopics] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  /* =========================================================
     STATE — VISUEL
  ========================================================= */
  const [mediaId, setMediaId] = useState<string | null>(null);

  /* =========================================================
     PUBLICATION
  ========================================================= */
  const [publishAt, setPublishAt] = useState<string>("");

  /* =========================================================
     META
  ========================================================= */
  const [internalNewsId, setInternalNewsId] = useState<string | null>(
    newsId || null
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState<Step>("SOURCE");

  /* =========================================================
     UTILS — STEP ORDER
  ========================================================= */
  const stepOrder: Step[] = [
    "SOURCE",
    "CONTENT",
    "VISUAL",
    "PREVIEW",
    "PUBLISH",
    "LINKEDIN",
  ];

  function isStepReached(target: Step) {
    return stepOrder.indexOf(step) >= stepOrder.indexOf(target);
  }

  /* =========================================================
     INIT STEP FROM URL (?step=LINKEDIN)
  ========================================================= */
  useEffect(() => {
    const stepParam = searchParams.get("step") as Step | null;

    if (stepParam && stepOrder.includes(stepParam)) {
      setStep(stepParam);
    }
  }, [searchParams]);

  /* =========================================================
     LOAD NEWS (EDIT MODE)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !newsId) return;

    async function load() {
      try {
        const res = await api.get(`/news/${newsId}`);
        const n = res.news;

        setTitle(n.TITLE || "");
        setExcerpt(n.EXCERPT || "");
        setBody(n.BODY || "");

        // Société — format attendu par CompanySelector
        setCompany(
          n.company
            ? {
                id_company: n.company.ID_COMPANY,
                name: n.company.NAME,
              }
            : null
        );

        // Topics — format attendu par TopicSelector
        setTopics(
          (n.topics || []).map((t: any) => ({
            id_topic: t.ID_TOPIC,
            label: t.LABEL,
          }))
        );

        setPersons(n.persons || []);

        // visuel news éventuel
        setMediaId(n.MEDIA_RECTANGLE_ID || null);

        // si aucun step imposé par l’URL
        if (!searchParams.get("step")) {
          setStep("CONTENT");
        }
      } catch (e) {
        console.error(e);
        alert("Erreur chargement news");
      }
    }

    load();
  }, [mode, newsId, searchParams]);

  /* =========================================================
     LOAD FULL COMPANY (SOURCE DE VÉRITÉ)
  ========================================================= */
  useEffect(() => {
    if (!company?.id_company && !company?.ID_COMPANY) {
      setCompanyFull(null);
      return;
    }

    const companyId =
      company.id_company || company.ID_COMPANY;

    async function loadCompany() {
      try {
        const res = await api.get(`/company/${companyId}`);
        setCompanyFull(res.company);
      } catch (e) {
        console.error("Erreur chargement société complète", e);
        setCompanyFull(null);
      }
    }

    loadCompany();
  }, [company]);

  /* =========================================================
     SAVE NEWS (CREATE / UPDATE)
  ========================================================= */
  async function saveNews() {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }

    if (!company) {
      alert("Société requise");
      return;
    }

    setSaving(true);

    const payload = {
      id_company: company.id_company || company.ID_COMPANY,
      title,
      excerpt,
      body,
      topics: topics.map((t) => t.id_topic),
      persons: persons.map((p) => p.id_person || p.ID_PERSON),
    };

    try {
      if (!internalNewsId) {
        const res = await api.post("/news/create", payload);
        setInternalNewsId(res.id_news);

        // Forcer le chargement société complète après création
        try {
          const companyId =
            company.id_company || company.ID_COMPANY;
          const resCompany = await api.get(
            `/company/${companyId}`
          );
          setCompanyFull(resCompany.company);
        } catch (e) {
          console.error(
            "Erreur chargement société après création",
            e
          );
        }
      } else {
        await api.put(`/news/update/${internalNewsId}`, payload);
      }

      setStep("VISUAL");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur sauvegarde news");
    }

    setSaving(false);
  }

  /* =========================================================
     PUBLISH NEWS
  ========================================================= */
  async function publishNews() {
    if (!internalNewsId) return;

    if (!mediaId && !companyFull?.MEDIA_LOGO_RECTANGLE_ID) {
      alert("Un visuel 16:9 est requis");
      return;
    }

    if (!publishAt) {
      alert("Veuillez définir une date de publication");
      return;
    }

    setPublishing(true);

    try {
      // 🔑 Conversion datetime-local -> ISO UTC
      const publishAtUTC = new Date(publishAt).toISOString();

      await api.post(`/news/publish/${internalNewsId}`, {
        publish_at: publishAtUTC,
      });

      alert("News publiée");
      setStep("LINKEDIN");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur publication news");
    } finally {
      setPublishing(false);
    }
  }


  /* =========================================================
     UI — STUDIO
  ========================================================= */
  return (
    <div className="space-y-6">
      {/* STEP 1 — SOURCE */}
      <details open={step === "SOURCE"} className="border rounded p-4">
        <summary
          className="font-semibold cursor-pointer"
          onClick={() => setStep("SOURCE")}
        >
          1. Source
        </summary>

        <NewsStepSource
          onGenerated={({ title, excerpt, body }) => {
            setTitle(title);
            setExcerpt(excerpt);
            setBody(body);
            setStep("CONTENT");
          }}
          onSkip={() => setStep("CONTENT")}
        />
      </details>

      {/* STEP 2 — CONTENT */}
      {isStepReached("CONTENT") && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("CONTENT")}
          >
            2. Contenu
          </summary>

          <NewsStepContent
            title={title}
            excerpt={excerpt}
            body={body}
            company={company}
            topics={topics}
            persons={persons}
            onChange={(d) => {
              if (d.title !== undefined) setTitle(d.title);
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.body !== undefined) setBody(d.body);
              if (d.company !== undefined) setCompany(d.company);
              if (d.topics !== undefined) setTopics(d.topics);
              if (d.persons !== undefined) setPersons(d.persons);
            }}
            onValidate={saveNews}
            saving={saving}
          />
        </details>
      )}

      {/* STEP 3 — VISUAL */}
      {isStepReached("VISUAL") && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("VISUAL")}
          >
            3. Visuel
          </summary>

          {internalNewsId && (
            <NewsStepVisual
              newsId={internalNewsId}
              mediaId={mediaId}
              companyMediaId={
                companyFull?.MEDIA_LOGO_RECTANGLE_ID || null
              }
              onUpdated={setMediaId}
              onNext={() => setStep("PREVIEW")}
            />
          )}
        </details>
      )}

      {/* STEP 4 — PREVIEW */}
      {isStepReached("PREVIEW") && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("PREVIEW")}
          >
            4. Aperçu
          </summary>

          {internalNewsId && (
            <NewsStepPreview
              newsId={internalNewsId}
              onNext={() => setStep("PUBLISH")}
            />
          )}
        </details>
      )}

      {/* STEP 5 — PUBLISH */}
      {isStepReached("PUBLISH") && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("PUBLISH")}
          >
            5. Publication
          </summary>

          {internalNewsId && (
            <NewsStepPublish
              publishAt={publishAt}
              publishing={publishing}
              onChangeDate={setPublishAt}
              onPublish={publishNews}
            />
          )}
        </details>
      )}

      {/* STEP 6 — LINKEDIN */}
      {isStepReached("LINKEDIN") && internalNewsId && (
        <details open={step === "LINKEDIN"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("LINKEDIN")}
          >
            6. Post LinkedIn
          </summary>

          <NewsStepLinkedIn
            newsId={internalNewsId}
            title={title}
            excerpt={excerpt}
          />
        </details>
      )}
    </div>
  );
}
