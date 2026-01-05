"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../globals.css";

import {
  Building2,
  UserCircle,
  Tags,
  CalendarDays,
  Layers,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  function active(path: string) {
    return pathname?.startsWith(path);
  }

  const navItems = [
    {
      href: "/admin/content",
      label: "Contenus",
      icon: Layers,
    },
    {
      href: "/admin/company",
      label: "Sociétés",
      icon: Building2,
    },
    {
      href: "/admin/person",
      label: "Personnes",
      icon: UserCircle,
    },
    {
      href: "/admin/topic",
      label: "Topics",
      icon: Tags,
    },
    {
      href: "/admin/event",
      label: "Événements",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-ratecard-blue text-white p-6 space-y-10 shadow-xl flex flex-col">
        {/* HEADER */}
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            Ratecard Admin
          </h1>
          <p className="text-xs opacity-80 mt-1">
            Gestion éditoriale
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 text-sm flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded transition
                  ${
                    isActive
                      ? "bg-white text-ratecard-blue font-semibold shadow-sm"
                      : "hover:bg-ratecard-green/20"
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="text-xs opacity-60">
          © {new Date().getFullYear()} Ratecard
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
