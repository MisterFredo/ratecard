"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin, Mail, Menu, X } from "lucide-react";

export default function PublicTopNavShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function active(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={
        active(href)
          ? "text-ratecard-blue"
          : "hover:text-ratecard-blue"
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP NAV — DESKTOP
      ===================================================== */}
      <header className="hidden md:block bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/brand/ratecard-logo.png"
              alt="Ratecard"
              className="h-8 w-auto"
            />
          </Link>

          {/* NAV PRINCIPALE — À PLAT */}
          <nav className="flex items-center gap-8 text-sm font-medium">
            {navLink("/news", "News")}
            {navLink("/members", "Membres")}

            <a
              href="https://ratecard.fr/evenements/#event"
              target="_blank"
              className="hover:text-ratecard-blue"
            >
              Événements
            </a>

            {navLink("/curator", "Curator")}

            <Link
              href="/membership"
              className="hover:text-ratecard-blue"
            >
              Membership
            </Link>
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
          TOP NAV — MOBILE
      ===================================================== */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
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
        <div className="p-4 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
