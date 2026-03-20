"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";
import { trackEvent } from "@/lib/analytics";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* ========================================================= */

type Topic = {
  id_topic: string;
  label: string;
};

type Solution = {
  id_solution: string;
  name: string;
};

type NewsData = {
  id_news: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  published_at: string;

  visual_rect_id?: string | null;

  company: {
    id_company: string;
    name: string;
    media_logo_rectangle_id?: string | null;
  };

  topics?: Topic[];
  solutions?: Solution[];
};

/* ========================================================= */

type Props = {
  id: string;
  onClose?: () => void;
};

/* ========================================================= */

export default function NewsDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    rightDrawer,
    openLeftDrawer,
    closeRightDrawer,
    openNewsletterDrawer,
  } = useDrawer();

  const [data, setData] = useState<NewsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isCurator = pathname.startsWith("/feed");

  /* =========================================================
     CLOSE
  ========================================================= */

  function close() {
    setIsOpen(false);
    onClose?.();
    closeRightDrawer();

    if (
      rightDrawer.mode === "route" &&
      pathname.startsWith("/news")
    ) {
      router.push("/news", { scroll: false });
    }
  }

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(
          `/curator/item/${id}/detail?type=news`
        );

        const payload = res?.data ?? res;

        setData(payload);

        trackEvent("view_news_drawer", {
          news_id: payload.id_news,
          news_title: payload.title,
          company_name: payload.company?.name || null,
          source: isCurator ? "curator" : "ratecard",
        });

        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error("❌ NewsDrawer load error", e);
      }
    }

    load();
  }, [id, isCurator]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (!data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
        <div className="bg-white px-4 py-2 rounded text-sm">
          Loading…
        </div>
      </div>
    );
  }

  /* =========================================================
     VISUAL
  ========================================================= */

  const visualSrc = data.visual_rect_id
    ? `${GCS_BASE_URL}/news/${data.visual_rect_id}`
    : data.company?.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.company.media_logo_rectangle_id}`
    : null;

  /* =========================================================
     BADGES
  ========================================================= */

  const badges = [
    ...(data.topics ?? []).map((t) => ({
      label: t.label,
      type: "topic",
    })),
    ...(data.solutions ?? []).map((s) => ({
      label: s.name,
      type: "solution",
    })),
  ];

  function getBadgeClass(type?: string) {
    switch (type) {
      case "solution":
        return "bg-purple-50 text-purple-600 border border-purple-100";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
      />

      {/* DRAWER */}
      <aside
        className={`
          relative ml-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 space-y-3">

          <div className="flex justify-between items-start">
            <div className="space-y-1 max-w-xl">

              {/* COMPANY */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openLeftDrawer("member", data.company.id_company, "silent");
                }}
                className="text-xs uppercase tracking-wide text-gray-400 hover:text-ratecard-blue"
              >
                {data.company.name}
              </button>

              <h1 className="text-xl font-semibold text-gray-900">
                {data.title}
              </h1>
            </div>

            <button onClick={close}>
              <X size={18} />
            </button>
          </div>

          {/* BADGES */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <span
                  key={`${b.label}-${i}`}
                  className={`
                    px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide
                    ${getBadgeClass(b.type)}
                  `}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* HERO */}
        {visualSrc && (
          <div className="w-full bg-white flex justify-center border-b border-gray-200">
            <div className="w-full max-w-[680px] h-[260px] flex items-center justify-center">
              <img
                src={visualSrc}
                alt={data.title}
                className="max-h-[85%] max-w-[85%] object-contain"
              />
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-8">

          {data.excerpt && (
            <p className="text-base font-medium text-gray-800">
              {data.excerpt}
            </p>
          )}

          {data.body && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: data.body,
              }}
            />
          )}

          {/* FOOTER */}
          <div className="pt-4 border-t text-xs text-gray-400">
            Publié le{" "}
            {new Date(data.published_at).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </aside>
    </div>
  );
}
