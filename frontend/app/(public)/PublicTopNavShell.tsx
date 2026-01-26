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

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const navItems = [
    { href: "/news", label: "News" },
    { href: "/members", label: "Membres" },
    { href: "/events", label: "Événements" },
    { href: "/curator", label: "Curator" },
    { href: "/membership", label: "Membership" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <header className="sticky top-0 z-40 bg-ratecard-blue text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          {/* LEFT — LOGO + NAV */}
          <div className="flex items-center gap-10">
            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <img
                src="/assets/brand/ratecard-logo.png"
                alt="Ratecard"
                className="h-7 w-auto"
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      transition
                      ${
                        active
                          ? "text-white underline underline-offset-8"
                          : "text-white/80 hover:text-white"
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
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/newsletter"
              className="text-white/80 hover:text-white transition"
            >
              <Mail size={18} />
            </Link>

            <Link
              href="/linkedin"
              className="text-white/80 hover:text-white transition"
            >
              <Linkedin size={18} />
            </Link>
          </div>

          {/* MOBILE BURGER */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
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
                src="/assets/brand/ratecard-logo.png"
                alt="Ratecard"
                className="h-6"
              />
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>

            {/* NAV */}
            <nav className="flex flex-col gap-5 p-6 text-base font-medium">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      ${
                        active
                          ? "text-ratecard-blue"
                          : "text-gray-900"
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
              <Link
                href="/newsletter"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-gray-700"
              >
                <Mail size={16} />
                Newsletter
              </Link>

              <Link
                href="/linkedin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-gray-700"
              >
                <Linkedin size={16} />
                LinkedIn
              </Link>
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
