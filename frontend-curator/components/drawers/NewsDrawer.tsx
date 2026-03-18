"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

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
};

type Props = {
  id: string;
  onClose?: () => void;
};

export default function NewsDrawer({ id, onClose }: Props) {
  const { closeDrawer } = useDrawer();

  const [data, setData] = useState<NewsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
    onClose?.();
    closeDrawer("right");
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/news/${id}`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, [id]);

  if (!data) return null;

  const visualSrc = data.visual_rect_id
    ? `${GCS_BASE_URL}/news/${data.visual_rect_id}`
    : data.company?.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.company.media_logo_rectangle_id}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
      />

      <aside
        className={`
          relative ml-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase">
              {data.company.name}
            </div>
            <h1 className="text-xl font-semibold">
              {data.title}
            </h1>
          </div>

          <button onClick={close}>
            <X size={18} />
          </button>
        </div>

        {visualSrc && (
          <div className="w-full flex justify-center border-b">
            <div className="max-w-[680px] h-[260px] flex items-center">
              <img
                src={visualSrc}
                className="max-h-[85%] object-contain"
              />
            </div>
          </div>
        )}

        <div className="px-5 py-6 space-y-6">
          {data.excerpt && (
            <p className="font-medium">{data.excerpt}</p>
          )}

          {data.body && (
            <div
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}

          <div className="pt-4 border-t text-xs text-gray-400">
            Publié le{" "}
            {new Date(data.published_at).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </aside>
    </div>
  );
}
