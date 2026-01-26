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

  const navItems = [
    { href: "/news", label: "News" },
    { href: "/members", label: "Membres" },
    { href: "/events", label: "Événements" },
    { href: "/curator", label: "Curator" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP NAV — MOBILE
      ===================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b">
        <div className="h-[3px] bg-ratecard-blue" />

        <div className="px-4 py-3 flex items-center justify-between">
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
      </div>

      {/* =====================================================
          MOBILE MENU — VERSION PROPRE
      ===================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <aside className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white flex flex-col">
            {/* HEADER */}
            <div className="p-6 flex items-center justify-between border-b">
              <img
                src="/assets/brand/ratecard-logo.png"
                alt="Ratecard"
                className="h-7"
              />
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>

            {/* NAV PRINCIPALE */}
            <nav className="px-6 py-6 space-y-4 text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block ${
                    active(item.href)
                      ? "text-ratecard-blue"
                      : "text-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="px-6 py-6 border-t">
              <Link
                href="/membership"
                onClick={() => setMobileOpen(false)}
                className="
                  block text-center
                  px-4 py-2 rounded-full
                  border border-ratecard-blue
                  text-ratecard-blue font-medium
                  hover:bg-ratecard-blue hover:text-white
                  transition
                "
              >
                Membership
              </Link>
            </div>

            {/* CANAUX */}
            <div className="mt-auto px-6 py-6 border-t space-y-4 text-sm text-gray-600">
              <Link
                href="https://www.linkedin.com/company/ratecard-adnovia/"
                className="flex items-center gap-2"
              >
                <Linkedin size={16} /> LinkedIn
              </Link>

              <Link
                href="/newsletter"
                className="flex items-center gap-2"
              >
                <Mail size={16} /> Newsletter
              </Link>
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
