"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Newspaper,
  Linkedin,
  Mail,
  Menu,
  X,
} from "lucide-react";

type EventNavItem = {
  label: string;
  url: string;
};

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
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const mainNav = [
    { href: "/analysis", label: "Analyses", icon: FileText },
    { href: "/news", label: "News", icon: Newspaper },
  ];

  const SidebarContent = (
    <>
      {/* ===== LOGO ===== */}
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
        className="mb-10 block"
      >
        <img
          src="/assets/brand/ratecard-logo.png"
          alt="Ratecard"
          className="max-w-[160px]"
        />
      </Link>

      {/* ===== NAV PRINCIPALE ===== */}
      <nav className="space-y-2 text-sm">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = active(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
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
        {events.map((e) => (
          <a
            key={e.label}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded"
          >
            {e.label}
          </a>
        ))}
      </nav>

      {/* ===== SÉPARATEUR ===== */}
      <div className="my-6 border-t border-white/20" />

      {/* ===== ACTIONS ===== */}
      <div className="space-y-3 text-sm">
        <a
          href="https://www.linkedin.com/company/ratecard-adnovia/"
          target="_blank"
          className="flex items-center gap-2 opacity-90 hover:opacity-100"
        >
          <Linkedin size={16} />
          6 000+ followers
        </a>

        <a
          href="/newsletter"
          className="flex items-center gap-2 opacity-90 hover:opacity-100"
        >
          <Mail size={16} />
          25 000+ abonnés
        </a>
      </div>

      <div className="text-xs opacity-60 mt-6">
        © {new Date().getFullYear()} Ratecard
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-64 bg-ratecard-blue text-white p-6 flex-col">
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
              className="absolute top-4 right-4"
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
            Ratecard
          </Link>
        </div>

        <div className="p-4 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

