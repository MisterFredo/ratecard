"use client";

import NewsScreen from "@/components/news/NewsScreen";

export const dynamic = "force-dynamic";

/**
 * Page News publique — Ratecard
 * - Surface média
 * - URLs publiques
 * - Diffusion / SEO / newsletter
 */
export default function NewsPage() {
  return <NewsScreen mode="public" />;
}
