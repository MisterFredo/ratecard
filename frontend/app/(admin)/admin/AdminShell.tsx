"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  UserCircle,
  Tags,
  CalendarDays,
  Layers,
  Newspaper,
  Mail,
  Share2,
} from "lucide-react";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navItems = [
    { href: "/admin/content", label: "Analyses", icon: Layers },

    { href: "/admin/news", label: "News", icon: Newspaper },

    {
      href: "/admin/linkedin/compose",
      label: "LinkedIn",
      icon: Share2,
    },

    {
      href: "/admin/digest", // ✅ nouveau chemin
      label: "Digest",
      icon: Mail,
    },

    { href: "/admin/company", label: "Sociétés", icon: Building2 },
    { href: "/admin/person", label: "Personnes", icon: UserCircle },
    { href: "/admin/topic", label: "Topics", icon: Tags },
    { href: "/admin/event", label: "Événements", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-ratecard-blue text-white p-6 space-y-10 flex flex-col">
        <div>
          <h1 className="text-xl font-semibold">
            Ratecard Admin
          </h1>
          <p className="text-xs opacity-80 mt-1">
            Gestion éditoriale
          </p>
        </div>

        <nav className="space-y-1 text-sm flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded
                  ${
                    active
                      ? "bg-white text-ratecard-blue font-semibold"
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

        <div className="text-xs opacity-60">
          © {new Date().getFullYear()} Ratecard
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 p-10 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
