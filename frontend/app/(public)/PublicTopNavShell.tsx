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

  const navLink = (href: string, label: string) => {
    const isActive = active(href);

    return (
      <Link
        href={href}
        className={`
          relative text-sm font-medium transition
          ${isActive ? "text-ratecard-blue" : "text-gray-700 hover:text-ratecard-blue"}
        `}
      >
        {label}

        {/* underline active */}
        {isActive && (
          <span
            className="
              absolute left-0 -bottom-2 h-[2px] w-full
              bg-ratecard-blue rounded-full
            "
          />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP NAV — DESKTOP
      ===================================================== */}
      <header className="hidden md:block bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/assets/brand/ratecard-logo.png"
              alt="Ratecard"
              className="h-8 w-auto"
            />
          </Link>

          {/* NAV PRINCIPALE */}
          <nav className="flex items-center gap-10">
            {navLink("/news", "News")}
            {navLink("/members", "Membres")}

            <a
              href="https://ratecard.fr/evenements/#event"
              target="_blank"
              className="text-sm font-medium text-gray-700 hover:text-ratecard-blue transition"
            >
              Événements
            </a>

            {navLink("/curator", "Curator")}

            <Link
              href="/membership"
              className="
                text-sm font-medium
                px-4 py-1.5 rounded-full
                border border-ratecard-blue/20
                text-ratecard-blue
                hover:bg-ratecard-blue hover:text-white
                transition
              "
            >
              Membership
            </Link>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-5 text-gray-600">
            <a
              href="https://www.linkedin.com/company/ratecard-adnovia/"
              target="_blank"
              className="hover:text-ratecard-blue transition"
            >
              <Linkedin size={18} />
            </a>

            <a
              href="/newsletter"
              className="hover:text-ratecard-blue transition"
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
              className="self-end mb-8"
            >
              <X />
            </button>

            <nav className="space-y-5 text-base font-medium">
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
                className="text-ratecard-blue"
              >
                Membership
              </a>
            </nav>

            <div className="mt-auto pt-6 border-t space-y-4 text-sm text-gray-600">
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
