"use client";

import { useEffect, useState, useRef } from "react";
import { useDrawer } from "@/contexts/DrawerContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

type BreveItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  company?: string;
};

export default function CuratorNewsFeed() {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const { openRightDrawer } = useDrawer();

  const [items, setItems] = useState<BreveItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);

  async function load(reset = false) {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
    });

    if (!reset && cursor) {
      params.append("cursor", cursor);
    }

    const res = await fetch(
      `${API_BASE}/curator/news?${params.toString()}`,
      { cache: "no-store" }
    );

    const json = await res.json();

    const newItems = json.items || [];

    if (reset) {
      setItems(newItems);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }

    if (newItems.length < PAGE_SIZE) {
      setHasMore(false);
      setCursor(null);
    } else {
      setCursor(newItems[newItems.length - 1].published_at);
    }

    setLoading(false);
  }

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    load(true);
  }, []);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          load();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [cursor, hasMore]);

  function toggleItem(id: string) {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  return (
    <section className="space-y-4">

      {items.map((b) => {
        const isOpen = openItems.includes(b.id);

        return (
          <article
            key={b.id}
            className="border-b border-gray-100 pb-4"
          >

            {/* DATE */}
            <div className="text-[11px] text-gray-400 mb-1">
              {new Date(b.published_at).toLocaleDateString("fr-FR")}
            </div>

            {/* COMPANY */}
            {b.company && (
              <div className="text-xs text-gray-700 mb-0.5">
                {b.company}
              </div>
            )}

            {/* TITLE */}
            <h2
              onClick={() => toggleItem(b.id)}
              className="text-[15px] font-medium leading-snug cursor-pointer hover:text-gray-900 transition"
            >
              {b.title}
            </h2>

            {/* EXCERPT */}
            {isOpen && b.excerpt && (
              <div className="mt-2 space-y-2 max-w-3xl">

                <p className="text-sm text-gray-600 leading-relaxed">
                  {b.excerpt}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRightDrawer("news", b.id, "silent");
                  }}
                  className="text-[11px] font-medium text-gray-400 hover:text-gray-900 transition"
                >
                  Voir le détail →
                </button>

              </div>
            )}

          </article>
        );
      })}

      {loading && (
        <div className="text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}

      {hasMore && <div ref={observerRef} className="h-6" />}
    </section>
  );
}
