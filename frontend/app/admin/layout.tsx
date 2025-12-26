"use client";

import Link from "next/link";
import "../globals.css";
import {
  Newspaper,
  Building2,
  UserCircle,
  Tags,
  ImageIcon
} from "lucide-react";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-ratecard-blue text-white p-6 space-y-8">

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-semibold tracking-wide">
            Ratecard Admin
          </h2>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-3 text-sm">

          <Link
            href="/admin/articles"
            className="flex items-center gap-2 hover:text-ratecard-green transition"
          >
            <Newspaper size={18} />
            <span>Articles</span>
          </Link>

          <Link
            href="/admin/company"
            className="flex items-center gap-2 hover:text-ratecard-green transition"
          >
            <Building2 size={18} />
            <span>Sociétés</span>
          </Link>

          <Link
            href="/admin/person"
            className="flex items-center gap-2 hover:text-ratecard-green transition"
          >
            <UserCircle size={18} />
            <span>Intervenants</span>
          </Link>

          <Link
            href="/admin/axes"
            className="flex items-center gap-2 hover:text-ratecard-green transition"
          >
            <Tags size={18} />
            <span>Axes éditoriaux</span>
          </Link>

          {/* MEDIA LIBRARY */}
          <Link
            href="/admin/media"
            className="flex items-center gap-2 hover:text-ratecard-green transition"
          >
            <ImageIcon size={18} />
            <span>Médias</span>
          </Link>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
