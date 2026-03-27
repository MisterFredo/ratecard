"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu,
  X,
  Building2,
  Tag,
  Box,
  Hash,
  Radar, // ✅ icône radar
} from "lucide-react";

export default function CuratorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(path: string) {
    if (!pathname) return false;
    const clean = pathname.split("?")[0];
    return clean === path || clean.startsWith(path + "/");
  }

  /* =========================================================
     NAV
  ========================================================= */

  const navData = [
    { href: "/", label: "Feed", icon: Home }, // rename
    { href: "/numbers", label: "Numbers", icon: Hash },
    { href: "/radars", label: "Radar", icon: Radar },
  ];

  const navEntities = [
    { href: "/companies", label: "Sociétés", icon: Building2 },
    { href: "/topics", label: "Topics", icon: Tag },
    { href: "/solutions", label: "Solutions", icon: Box },
  ];

  /* ========================================================= */

  const renderNav = (items: typeof navData) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition
            ${
              active
                ? "bg-teal-100 text-teal-900 font-semibold"
                : "text-gray-700 hover:bg-slate-100"
            }
          `}
        >
          <Icon size={18} />
          <span>{item.label}</span>
        </Link>
      );
    });

  /* ========================================================= */

  const Sidebar = (
    <>
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
        className="mb-10 block"
      >
        <span className="text-xl font-semibold tracking-wide text-teal-700">
          Curator
        </span>
      </Link>

      {/* DATA */}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
          Data
        </div>
        <nav className="space-y-2 text-sm">
          {renderNav(navData)}
        </nav>
      </div>

      {/* ENTITIES */}
      <div className="mt-8">
        <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
          Entities
        </div>
        <nav className="space-y-2 text-sm">
          {renderNav(navEntities)}
        </nav>
      </div>

      <div className="text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} Curator
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop */}
      <aside className="hidden md:flex w-56 bg-slate-50 border-r p-6 flex-col">
        {Sidebar}
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-4/5 max-w-xs bg-slate-50 p-6 flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 bg-gray-50">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
          <button onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <span className="font-semibold text-teal-700">
            Curator
          </span>
        </div>

        <div className="p-4 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
