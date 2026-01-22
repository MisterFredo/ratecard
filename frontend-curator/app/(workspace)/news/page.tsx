"use client";

import NewsScreen from "@shared/components/news/NewsScreen";

/**
 * Page News — Curator (workspace)
 * - Accès privé (login requis)
 * - Outil de veille
 * - Même surface que Ratecard
 * - Contexte de travail (analyses, sociétés, topics)
 */
export default function WorkspaceNewsPage() {
  return <NewsScreen mode="workspace" />;
}
