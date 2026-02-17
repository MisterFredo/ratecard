"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin, Mail, Menu, X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

export default function PublicTopNavShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ On utilise la bonne fonction
  const { openNewsletterDrawer } = useDrawer();

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const navItems = [
    { href: "/breves", label: "News" },
    { href: "/members", label: "Membres" },
    { href: "/events", label: "Événements" },
    { href: "/membership", label: "Membership" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP NAV
      ===================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="h-1 bg-ratecard-blue" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/brand/ratecard-logo.jpeg"
                alt="Ratecard"
                className="h-7 w-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-1.5 rounded-full transition
                      ${
                        active
                          ? "text-ratecard-blue border border-ratecard-blue"
                          : "text-ratecard-blue hover:border hover:border-ratecard-blue/40"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT — ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {/* Newsletter → Drawer */}
            <button
              onClick={() => openNewsletterDrawer("silent")}
              className="
                px-3 py-1.5 rounded-full
                text-ratecard-blue
                hover:border hover:border-ratecard-blue/40
                transition
              "
              aria-label="Newsletter"
            >
              <Mail size={16} />
            </button>

            {/* LinkedIn → URL externe */}
            <a
              href="https://www.linkedin.com/company/ratecard-adnovia/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-3 py-1.5 rounded-full
                text-ratecard-blue
                hover:border hover:border-ratecard-blue/40
                transition
              "
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
          </div>

          {/* MOBILE BURGER */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-ratecard-blue"
            aria-label="Menu"
          >
            <Menu />
          </button>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <aside className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">
              <img
                src="/assets/brand/ratecard-logo.jpeg"
                alt="Ratecard"
                className="h-6"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="text-ratecard-blue"
                aria-label="Fermer"
              >
                <X />
              </button>
            </div>

            {/* NAV */}
            <nav className="flex flex-col gap-4 p-6 text-base font-medium">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      px-3 py-2 rounded-lg transition
                      ${
                        active
                          ? "text-ratecard-blue border border-ratecard-blue"
                          : "text-gray-800 hover:border hover:border-ratecard-blue/40"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* ACTIONS */}
            <div className="mt-auto p-6 border-t space-y-4 text-sm">
              <button
                onClick={() => {
                  openNewsletterDrawer("silent");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-ratecard-blue"
              >
                <Mail size={16} />
                Newsletter
              </button>

              <a
                href="https://www.linkedin.com/company/ratecard-adnovia/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-ratecard-blue"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="flex-1">
        <div className="p-4 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
