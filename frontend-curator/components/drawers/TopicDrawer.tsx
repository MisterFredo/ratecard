"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

/* =========================================================
   TYPES
========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
  excerpt?: string | null;
  published_at: string;
};

type TopicData = {
  id_topic: string;
  items: FeedItem[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TopicDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    leftDrawer,
    openRightDrawer,
    closeLeftDrawer,
  } = useDrawer();

  const [data, setData] = useState<TopicData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
    onClose?.();
    closeLeftDrawer();

    if (
      leftDrawer.mode === "route" &&
      pathname.startsWith("/topics")
    ) {
      router.push("/topics", { scroll: false });
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/topic/${id}/view`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, [id]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[90] flex">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={close}
      />

      <aside
        className={`
          relative mr-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex justify-between">
          <h1 className="text-xl font-semibold">
            Topic
          </h1>

          <button onClick={close}>
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-8 space-y-6">
          {data.items.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun contenu pour ce topic.
            </p>
          ) : (
            data.items.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  openRightDrawer(
                    item.type === "news"
                      ? "news"
                      : "analysis",
                    item.id,
                    "silent"
                  )
                }
                className="
                  cursor-pointer p-4 rounded-lg
                  border hover:bg-gray-50
                "
              >
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">
                    {item.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {item.type}
                  </span>
                </div>

                {item.excerpt && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.excerpt}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
