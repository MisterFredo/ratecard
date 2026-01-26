"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Newspaper,
  Users,
  Linkedin,
  Mail,
  Menu,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type EventNavItem = {
  label: string;
  url: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PublicShell({
  children,
  events = [],
}: {
  children: React.ReactNode;
  events?: EventNavItem[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function active(path: string) {
    if (pathname === path) return true;
    return pathname.startsWith(path + "/");
  }

  /* =========================================================
     NAVIGATION PRINCIPALE (ÉDITORIALISÉE)
  ========================================================= */
  const mainNav = [
    {
      href: "/analysis",
      label: "Lectures du marché",
      icon: FileText,
    },
    {
      href: "/news",
      label: "Signaux & annonces",
      icon: Newspaper,
    },
    {
      href: "/members",
      label: "Écosystème",
      icon: Users,
    },
  ];

  /* =========================================================
     SIDEBAR CONTENT (DESKTOP + MOBILE)
  ========================================================= */
  const SidebarContent = (
    <>
      {/* ===== LOGO / IDENTITÉ ===== */}
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
        className="mb-6 block"
      >
        <span className="text-2xl font-semibold text-white tracking-wide">
          ratecard
        </span>

        <p className="mt-2 text-xs text-white/70 leading-snug">
          Décryptage & lecture stratégique
          <br />
          de l’écosystème AdTech & Media
        </p>
      </Link>

      {/* ===== NAV PRINCIPALE ===== */}
      <nav className="space-y-1 text-sm">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = active(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md transition
                ${
                  isActive
                    ? "bg-white text-ratecard-blue font-semibold border-l-4 border-ratecard-green"
                    : "text-white/90 hover:bg-ratecard-green/20"
                }
              `}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===== SÉPARATEUR ===== */}
      <div className="my-6 border-t border-white/20" />

      {/* ===== ÉVÉNEMENTS / TEMPS FORTS ===== */}
      {events.length > 0 && (
        <nav className="space-y-1 text-sm">
          <div className="px-3 mb-2 text-xs uppercase tracking-wide text-white/50">
            Temps forts
          </div>

          {events.map((e) => (
            <a
              key={e.label}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              {e.label}
            </a>
          ))}
        </nav>
      )}

      {/* ===== SÉPARATEUR ===== */}
      <div className="my-6 border-t border-white/20" />

      {/* ===== ACTIONS ===== */}
      <div className="space-y-3 text-sm">
        <a
          href="https://www.linkedin.com/company/ratecard-adnovia/"
          target="_blank"
          className="flex items-center gap-2 text-white/90 hover:text-white transition"
        >
          <Linkedin size={16} />
          6 000+ followers
        </a>

        <a
          href="/newsletter"
          className="flex items-center gap-2 text-white/90 hover:text-white transition"
        >
          <Mail size={16} />
          25 000+ abonnés
        </a>
      </div>

      <div className="text-xs text-white/50 mt-8">
        © {new Date().getFullYear()} Ratecard
      </div>
    </>
  );

  /* =========================================================
     LAYOUT
  ========================================================= */
  return (
    <div className="min-h-screen flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-60 bg-ratecard-blue text-white p-6 flex-col">
        {SidebarContent}
      </aside>

      {/* ===== MOBILE SIDEBAR ===== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-4/5 max-w-xs bg-ratecard-blue text-white p-6 flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 bg-gray-50">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
          <button onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <Link href="/" className="font-semibold">
            ratecard
          </Link>
        </div>

        <div className="p-4 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
