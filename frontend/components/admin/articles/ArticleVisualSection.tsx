"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Topic = {
  id_topic: string;
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

type VisualSource =
  | "TOPIC"
  | "COMPANY"
  | "PERSON"
  | "ARTICLE_UPLOAD"
  | "ARTICLE_AI";

type Props = {
  articleId: string;
  title: string;
  excerpt: string;
  topics: Topic[];
  companies?: Company[];
  persons?: Person[];
};

export default function ArticleVisualSection({
  articleId,
  title,
  excerpt,
  topics,
  companies = [],
  persons = [],
}: Props) {
  const [loading, setLoading] = useState(false);
  const [visualSource, setVisualSource] = useState<VisualSource | null>(null);

  const [squareFilename, setSquareFilename] = useState<string | null>(null);
  const [rectFilename, setRectFilename] = useState<string | null>(null);

  /* ---------------------------------------------------------
     UTILS
  --------------------------------------------------------- */
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const res = reader.result?.toString() || "";
        resolve(res.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.readAsDataURL(file);
    });
  }

  function gcsUrl(filename: string) {
    return `${GCS_BASE_URL}/articles/${filename}`;
  }

  function guardAI() {
    if (!title.trim()) {
      alert("Le titre est requis.");
      return false;
    }
    if (!excerpt.trim()) {
      alert("L’accroche (excerpt) est requise.");
      return false;
    }
    if (!topics.length) {
      alert("Au moins un topic est requis.");
      return false;
    }
    return true;
  }

  /* ---------------------------------------------------------
     ACTIONS
  --------------------------------------------------------- */

  async function useEntityVisual(
    type: "TOPIC" | "COMPANY" | "PERSON",
    id: string
  ) {
    setLoading(true);
    try {
      const res = await api.post("/visuals/article/use-entity", {
        id_article: articleId,
        source_type: type,
        source_id: id,
      });

      setSquareFilename(res.filenames.square || null);
      setRectFilename(res.filenames.rectangle || null);
      setVisualSource(type);
    } catch (e) {
      alert("Erreur association visuel");
    }
    setLoading(false);
  }

  async function uploadArticleVisual(file: File, format: "square" | "rectangle") {
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/article/upload", {
        id_article: articleId,
        format,
        base64_image: base64,
      });

      if (format === "square") setSquareFilename(res.filename);
      if (format === "rectangle") setRectFilename(res.filename);

      setVisualSource("ARTICLE_UPLOAD");
    } catch (e) {
      alert("Erreur upload visuel");
    }
    setLoading(false);
  }

  async function generateAI() {
    if (!guardAI()) return;

    setLoading(true);
    try {
      const res = await api.post("/visuals/article/generate-ai", {
        id_article: articleId,
        title,
        excerpt,
        topics: topics.map((t) => t.label),
      });

      setSquareFilename(res.filenames.square);
      setRectFilename(res.filenames.rectangle);
      setVisualSource("ARTICLE_AI");
    } catch (e) {
      alert("Erreur génération IA");
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="border rounded p-4 space-y-4 bg-white">
      <h3 className="text-lg font-semibold text-ratecard-blue">
        Visuel de l’article
      </h3>

      {loading && (
        <p className="text-sm text-gray-500">Traitement en cours…</p>
      )}

      {/* PREVIEW */}
      {(rectFilename || squareFilename) && (
        <div className="space-y-2">
          {rectFilename && (
            <img
              src={gcsUrl(rectFilename)}
              className="w-full max-w-xl rounded border"
            />
          )}
          {!rectFilename && squareFilename && (
            <img
              src={gcsUrl(squareFilename)}
              className="w-64 rounded border"
            />
          )}
          <p className="text-xs text-gray-500">
            Source du visuel : {visualSource}
          </p>
        </div>
      )}

      {/* OPTIONS */}
      <div className="space-y-2">
        {/* TOPIC */}
        {topics.length > 0 && (
          <button
            onClick={() =>
              useEntityVisual("TOPIC", topics[0].id_topic)
            }
            className="px-4 py-2 border rounded w-full text-left"
          >
            Utiliser le visuel du topic : {topics[0].label}
          </button>
        )}

        {/* COMPANY */}
        {companies.length > 0 && (
          <button
            onClick={() =>
              useEntityVisual("COMPANY", companies[0].id_company)
            }
            className="px-4 py-2 border rounded w-full text-left"
          >
            Utiliser le visuel de la société : {companies[0].name}
          </button>
        )}

        {/* PERSON */}
        {persons.length > 0 && (
          <button
            onClick={() =>
              useEntityVisual("PERSON", persons[0].id_person)
            }
            className="px-4 py-2 border rounded w-full text-left"
          >
            Utiliser le visuel de la personne : {persons[0].name}
          </button>
        )}

        {/* ARTICLE UPLOAD */}
        <label className="px-4 py-2 border rounded w-full block cursor-pointer">
          Importer un visuel spécifique à l’article
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files &&
              uploadArticleVisual(e.target.files[0], "rectangle")
            }
          />
        </label>

        {/* ARTICLE AI */}
        <button
          onClick={generateAI}
          className="px-4 py-2 bg-ratecard-blue text-white rounded w-full"
        >
          Générer un visuel via l’assistant (IA)
        </button>
      </div>
    </div>
  );
}
