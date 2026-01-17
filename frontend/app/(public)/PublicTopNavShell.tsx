"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin, Mail, Menu, X, ChevronDown } from "lucide-react";

type EventNavItem = {
  label: string;
  url: string;
};

export default function PublicTopNavShell({
  children,
  events = [],
}: {
  children: React.ReactNode;
  events?: EventNavItem[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function active(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP NAV — DESKTOP
      ===================================================== */}
      <header className="hidden md:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/brand/ratecard-logo.png"
              alt="Ratecard"
              className="h-8 w-auto"
            />
          </Link>

          {/* NAV CENTRALE */}
          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link
              href="/news"
              className={active("/news") ? "text-ratecard-blue" : "hover:text-ratecard-blue"}
            >
              News
            </Link>

            <Link
              href="/members"
              className={active("/members") ? "text-ratecard-blue" : "hover:text-ratecard-blue"}
            >
              Membres
            </Link>

            {/* ÉVÉNEMENTS */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-ratecard-blue">
                Événements <ChevronDown size={14} />
              </button>

              <div className="absolute left-0 top-full mt-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                {events.map((e) => (
                  <a
                    key={e.label}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {e.label}
                  </a>
                ))}

                <a
                  href="https://ratecard.fr/evenements/#event"
                  target="_blank"
                  className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 border-t"
                >
                  Tous les événements
                </a>
              </div>
            </div>

            {/* NOS PRODUITS */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-ratecard-blue">
                Nos produits <ChevronDown size={14} />
              </button>

              <div className="absolute left-0 top-full mt-2 w-56 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                <Link
                  href="/curator"
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Curator
                </Link>

                <a
                  href="https://ratecard.fr/offre-ratecard-membership/"
                  target="_blank"
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Membership
                </a>
              </div>
            </div>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-5 text-sm">
            <a
              href="https://www.linkedin.com/company/ratecard-adnovia/"
              target="_blank"
              className="hover:text-ratecard-blue"
            >
              <Linkedin size={18} />
            </a>

            <a
              href="/newsletter"
              className="hover:text-ratecard-blue"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)}>
          <Menu />
        </button>

        <Link href="/">
          <img
            src="/assets/brand/ratecard-logo.png"
            alt="Ratecard"
            className="h-7"
          />
        </Link>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <aside className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white p-6 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end mb-6"
            >
              <X />
            </button>

            <nav className="space-y-4 text-sm font-medium">
              <Link href="/news" onClick={() => setMobileOpen(false)}>
                News
              </Link>
              <Link href="/members" onClick={() => setMobileOpen(false)}>
                Membres
              </Link>

              <a
                href="https://ratecard.fr/evenements/#event"
                target="_blank"
              >
                Événements
              </a>

              <Link href="/curator" onClick={() => setMobileOpen(false)}>
                Curator
              </Link>

              <a
                href="https://ratecard.fr/offre-ratecard-membership/"
                target="_blank"
              >
                Membership
              </a>
            </nav>

            <div className="mt-auto space-y-4 text-sm">
              <a
                href="https://www.linkedin.com/company/ratecard-adnovia/"
                target="_blank"
                className="flex items-center gap-2"
              >
                <Linkedin size={16} /> LinkedIn
              </a>

              <a
                href="/newsletter"
                className="flex items-center gap-2"
              >
                <Mail size={16} /> Newsletter
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="flex-1">
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
