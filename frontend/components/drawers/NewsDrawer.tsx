"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";

type NewsData = {
  id_news: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  published_at: string;
  visual_rect_url: string;
  company: {
    id_company: string;
    name: string;
  };
};

export default function NewsDrawer({
  id,
}: {
  id: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<NewsData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/news/${id}`);
        setData(res);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => router.back()}
      />

      {/* DRAWER */}
      <aside className="relative ml-auto w-full md:w-[640px] bg-white shadow-xl overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {data.company.name}
          </div>
          <button onClick={() => router.back()}>
            <X size={18} />
          </button>
        </div>

        {/* VISUAL */}
        <img
          src={data.visual_rect_url}
          alt={data.title}
          className="w-full h-64 object-cover"
        />

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          <h1 className="text-xl font-semibold leading-tight">
            {data.title}
          </h1>

          {data.excerpt && (
            <p className="text-gray-700 font-medium">
              {data.excerpt}
            </p>
          )}

          {data.body && (
            <div className="prose prose-sm max-w-none">
              {data.body}
            </div>
          )}

          <p className="text-xs text-gray-400">
            Publié le{" "}
            {new Date(data.published_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </aside>
    </div>
  );
}
