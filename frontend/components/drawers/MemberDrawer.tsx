"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type MemberData = {
  id_company: string;
  name: string;
  description?: string | null;
  media_logo_rectangle_id?: string | null;
  news: {
    id_news: string;
    title: string;
    excerpt?: string | null;
    published_at: string;
  }[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

export default function MemberDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const { openRightDrawer } = useDrawer();

  const [data, setData] = useState<MemberData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
    if (onClose) onClose();
    router.push("/members", { scroll: false });
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/member/${id}`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  if (!data) return null;

  const visualUrl = data.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.media_logo_rectangle_id}`
    : null;

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
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex justify-between">
          <h1 className="text-xl font-semibold">{data.name}</h1>
          <button onClick={close}>
            <X size={18} />
          </button>
        </div>

        {/* LOGO */}
        {visualUrl && (
          <div className="flex justify-center bg-gray-50 py-8">
            <img
              src={visualUrl}
              alt={data.name}
              className="max-h-[140px] w-auto object-contain"
            />
          </div>
        )}

        {/* CONTENT */}
        <div className="px-5 py-8 space-y-10">
          {/* DESCRIPTION HTML */}
          {data.description && (
            <div
              className="
                prose prose-sm max-w-2xl
                prose-p:my-4
                prose-ul:my-4
                prose-li:my-1
                prose-strong:font-semibold
              "
              dangerouslySetInnerHTML={{
                __html: data.description,
              }}
            />
          )}

          {/* NEWS */}
          <section className="pt-8 border-t space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Actualités
            </h2>

            <ul className="space-y-3">
              {data.news.map((n) => (
                <li
                  key={n.id_news}
                  onClick={() =>
                    openRightDrawer("news", n.id_news)
                  }
                  className="cursor-pointer p-4 rounded border hover:bg-gray-50"
                >
                  <h3 className="text-sm font-medium">
                    {n.title}
                  </h3>
                  {n.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {n.excerpt}
                    </p>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(n.published_at).toLocaleDateString("fr-FR")}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
