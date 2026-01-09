"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutList,
  FileText,
  Newspaper,
  Linkedin,
  Mail,
} from "lucide-react";

type EventNavItem = {
  slug: string;
  label: string;
};

export default function PublicShell({
  children,
  events = [],
}: {
  children: React.ReactNode;
  events?: EventNavItem[];
}) {
  const pathname = usePathname();

  function active(path: string) {
    return pathname === path || pathname?.startsWith(path);
  }

  const mainNav = [
    { href: "/", label: "Flux", icon: LayoutList },
    { href: "/analysis", label: "Analyses", icon: FileText },
    { href: "/news", label: "News", icon: Newspaper },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-ratecard-blue text-white p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-semibold">Ratecard</h1>
          <p className="text-xs opacity-80 mt-1">
            Lectures du marché
          </p>
        </div>

        {/* ===== NAV PRINCIPALE ===== */}
        <nav className="space-y-2 text-sm">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded ${
                  isActive
                    ? "bg-white text-ratecard-blue font-semibold"
                    : "hover:bg-ratecard-green/20"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ===== SÉPARATEUR ===== */}
        <div className="my-6 border-t border-white/20" />

        {/* ===== ÉVÉNEMENTS ===== */}
        <nav className="space-y-1 text-sm">
          {events.map((e) => {
            const isActive = active(`/event/${e.slug}`);

            return (
              <Link
                key={e.slug}
                href={`/event/${e.slug}`}
                className={`block px-3 py-2 rounded ${
                  isActive
                    ? "bg-white/90 text-ratecard-blue font-medium"
                    : "hover:bg-ratecard-green/20"
                }`}
              >
                {e.label}
              </Link>
            );
          })}
        </nav>

        {/* ===== SÉPARATEUR ===== */}
        <div className="my-6 border-t border-white/20" />

        {/* ===== ACTIONS ===== */}
        <div className="space-y-2 text-sm">
          <a
            href="https://www.linkedin.com/company/ratecard"
            target="_blank"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>

          <a
            href="/newsletter"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Mail size={16} />
            Newsletter
          </a>
        </div>

        <div className="text-xs opacity-60 mt-6">
          © {new Date().getFullYear()} Ratecard
        </div>
      </aside>

      {/* ===== MAIN CONTENT (WIDTH CONSTRAINED) ===== */}
      <main className="flex-1 bg-gray-50">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
