"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { getFeedItems } from "@/lib/feed/getFeedItems";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 état des filtres
  const [params, setParams] = useState({
    query: "",
    topic_ids: [] as string[],
    company_ids: [] as string[],
    solution_ids: [] as string[],
    types: [] as string[],
    news_types: [] as string[],
  });

  // 🔥 trigger de reload contrôlé
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================
     LOAD
  ============================ */

  async function load(reset = false) {
    if (loading) return;

    setLoading(true);

    const currentOffset = reset ? 0 : offset;

    const res = await getFeedItems({
      ...params,
      limit: LIMIT,
      offset: currentOffset,
    });

    if (reset) {
      setItems(res.items);
      setOffset(LIMIT);
    } else {
      setItems((prev) => [...prev, ...res.items]);
      setOffset((prev) => prev + LIMIT);
    }

    setHasMore(res.items.length === LIMIT);

    setLoading(false);
  }

  /* ============================
     INITIAL LOAD
  ============================ */

  useEffect(() => {
    load(true);
    // eslint-disable-next-line
  }, []);

  /* ============================
     RELOAD CONTROLLED
  ============================ */

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
    // eslint-disable-next-line
  }, [reloadKey]);

  /* ============================
     HELPERS
  ============================ */

  function updateParams(patch: Partial<typeof params>) {
    setParams((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  function triggerSearch() {
    setReloadKey((k) => k + 1);
  }

  function handleReset() {
    setParams({
      query: "",
      topic_ids: [],
      company_ids: [],
      solution_ids: [],
      types: [],
      news_types: [],
    });

    setReloadKey((k) => k + 1);
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      {/* ============================
         HEADER
      ============================ */}
      <FeedHeader
        query={params.query}
        setQuery={(v) => updateParams({ query: v })}

        types={params.types}
        setTypes={(v) => updateParams({ types: v })}

        newsTypes={params.news_types}
        setNewsTypes={(v) => updateParams({ news_types: v })}

        topicIds={params.topic_ids}
        setTopicIds={(v) => updateParams({ topic_ids: v })}

        companyIds={params.company_ids}
        setCompanyIds={(v) => updateParams({ company_ids: v })}

        solutionIds={params.solution_ids}
        setSolutionIds={(v) => updateParams({ solution_ids: v })}

        onSearch={triggerSearch}
        onReset={handleReset}
      />

      {/* ============================
         FEED
      ============================ */}
      <FeedList
        items={items}
        loading={loading}
        onSelectItem={setSelectedItem}
        onLoadMore={() => load(false)}
        hasMore={hasMore}
      />

      {/* ============================
         DRAWERS
      ============================ */}

      {selectedItem?.type === "analysis" && (
        <AnalysisDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {selectedItem?.type === "news" && (
        <NewsDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
