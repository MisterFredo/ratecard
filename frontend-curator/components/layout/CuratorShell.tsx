"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PenTool,
  Folder,
  Layers,
  Menu,
  X,
} from "lucide-react";

export default function WorkspaceShell({
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

  const nav = [
    { href: "/", label: "Feed", icon: Home },
    { href: "/studio", label: "Studio", icon: PenTool },
    { href: "/library", label: "Library", icon: Folder },
    { href: "/outputs", label: "Outputs", icon: Layers },
  ];

  const Sidebar = (
    <>
      {/* Logo */}
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
        className="mb-10 block"
      >
        <span className="text-xl font-semibold tracking-wide text-teal-700">
          Curator
        </span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 text-sm">
        {nav.map((item) => {
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
        })}
      </nav>

      {/* Footer */}
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

        <div className="p-4 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
