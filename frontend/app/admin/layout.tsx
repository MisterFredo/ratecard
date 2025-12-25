// frontend/app/admin/layout.tsx

import Link from "next/link";
import "../globals.css";  // ⭐⭐ Correction ici

export const metadata = {
  title: "Ratecard Admin",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-xl font-semibold">Ratecard Admin</h2>

        <nav className="space-y-2">
          <Link href="/admin/articles" className="block hover:text-gray-200">
            Articles
          </Link>
          <Link href="/admin/company" className="block hover:text-gray-200">
            Sociétés
          </Link>
          <Link href="/admin/person" className="block hover:text-gray-200">
            Intervenants
          </Link>
          <Link href="/admin/axes" className="block hover:text-gray-200">
            Axes éditoriaux
          </Link>
        </nav>
      </aside>

      {/* CONTENT WRAPPER */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
