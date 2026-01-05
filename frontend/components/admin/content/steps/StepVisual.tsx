"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Topic = {
  id_topic: string;
  label: string;
};

type Event = {
  id_event: string;
  label: string;
};

type Company = {
  id_company: string;
  name: string;
};

type Person = {
  id_person: string;
  name: string;
};

type Props = {
  contentId: string;

  topics: Topic[];
  events: Event[];
  companies: Company[];
  persons: Person[];

  rectUrl: string | null;
  onUpdated: (url: string | null) => void;
  onNext: () => void;
};

export default function StepVisual({
  contentId,
  topics,
  events,
  companies,
  persons,
  rectUrl,
  onUpdated,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     Helpers GCS (réutilisation visuels entités)
  --------------------------------------------------------- */
  function topicRect(id: string) {
    return `${GCS}/topics/TOPIC_${id}_rect.jpg`;
  }

  function eventRect(id: string) {
    return `${GCS}/events/EVENT_${id}_rect.jpg`;
  }

  function companyRect(id: string) {
    return `${GCS}/companies/COMPANY_${id}_rect.jpg`;
  }

  function personRect(id: string) {
    return `${GCS}/persons/PERSON_${id}_rect.jpg`;
  }

  /* ---------------------------------------------------------
     Upload manuel (Content)
  --------------------------------------------------------- */
  async function upload(file: File) {
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/content/upload", {
        id_content: contentId,
        base64_image: base64,
      });

      if (res.status !== "ok") {
        throw new Error("Upload failed");
      }

      onUpdated(`${GCS}/content/CONTENT_${contentId}_rect.jpg`);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel");
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     Génération IA (Topic uniquement)
  --------------------------------------------------------- */
  async function generateFromTopic(topic: Topic) {
    setLoading(true);
    try {
      const res = await api.post("/visuals/content/generate-ai", {
        id_content: contentId,
        id_topic: topic.id_topic,
        angle_title: "", // déjà stocké côté content
        excerpt: "",     // déjà stocké côté content
      });

      if (res.status !== "ok") {
        throw new Error("Generation failed");
      }

      onUpdated(`${GCS}/content/CONTENT_${contentId}_AI_rect.jpg`);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur génération visuel IA");
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     Utils
  --------------------------------------------------------- */
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result?.toString() || "";
        resolve(result.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Choisissez le visuel principal du contenu (format rectangulaire).
      </p>

      {/* VISUEL ACTUEL */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Visuel actuel</p>
        {rectUrl ? (
          <img
            src={rectUrl}
            className="w-full max-w-3xl rounded border shadow bg-white"
          />
        ) : (
          <p className="italic text-gray-400">Aucun visuel</p>
        )}
      </div>

      {/* 1️⃣ VISUELS D’ENTITÉS */}
      <div className="space-y-3">
        <h4 className="font-semibold">Utiliser un visuel existant</h4>

        {topics.map((t) => (
          <button
            key={`topic-${t.id_topic}`}
            onClick={() => onUpdated(topicRect(t.id_topic))}
            className="px-3 py-2 border rounded"
          >
            Topic — {t.label}
          </button>
        ))}

        {events.map((e) => (
          <button
            key={`event-${e.id_event}`}
            onClick={() => onUpdated(eventRect(e.id_event))}
            className="px-3 py-2 border rounded"
          >
            Événement — {e.label}
          </button>
        ))}

        {companies.map((c) => (
          <button
            key={`company-${c.id_company}`}
            onClick={() => onUpdated(companyRect(c.id_company))}
            className="px-3 py-2 border rounded"
          >
            Société — {c.name}
          </button>
        ))}

        {persons.map((p) => (
          <button
            key={`person-${p.id_person}`}
            onClick={() => onUpdated(personRect(p.id_person))}
            className="px-3 py-2 border rounded"
          >
            Personne — {p.name}
          </button>
        ))}
      </div>

      {/* 2️⃣ UPLOAD MANUEL */}
      <div className="space-y-2">
        <h4 className="font-semibold">Uploader un visuel spécifique</h4>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && upload(e.target.files[0])
          }
        />
      </div>

      {/* 3️⃣ GÉNÉRATION IA (TOPIC UNIQUEMENT) */}
      {topics.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Génération IA</h4>
          <button
            onClick={() => generateFromTopic(topics[0])}
            className="px-4 py-2 border rounded"
          >
            Générer à partir du topic « {topics[0].label} »
          </button>
        </div>
      )}

      {/* CONTINUER */}
      <button
        onClick={onNext}
        disabled={loading}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer vers aperçu
      </button>
    </div>
  );
}
