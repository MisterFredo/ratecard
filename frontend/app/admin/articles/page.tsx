// frontend/app/admin/articles/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.get("/articles/list").then((res) => {
      setArticles(res.articles);
    });
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Link href="/admin/articles/create" className="bg-black text-white px-4 py-2 rounded">
          + Créer un article
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Titre</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.ID_ARTICLE} className="border-b hover:bg-gray-50">
              <td className="p-2">{a.TITRE}</td>
              <td className="p-2">{a.DATE_PUBLICATION}</td>
              <td className="p-2">
                <Link href={`/admin/articles/edit/${a.ID_ARTICLE}`} className="underline">
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
