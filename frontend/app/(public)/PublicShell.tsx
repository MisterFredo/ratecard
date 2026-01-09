"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutList,
  FileText,
  Newspaper,
  Linkedin,
  Mail,
  CalendarDays,
} from "lucide-react";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function active(path: string) {
    return pathname === path || pathname?.startsWith(path);
  }

  const navItems = [
    { href: "/", label: "Flux", icon: LayoutList },
    { href: "/analysis", label: "Analyses", icon: FileText },
    { href: "/news", label: "News", icon: Newspaper },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-ratecard-blue text-white p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-semibold">Ratecard</h1>
          <p className="text-xs opacity-80 mt-1">
            Lectures du marché
          </p>
        </div>

        <nav className="space-y-2 text-sm flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
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

        {/* ACTIONS */}
        <div className="space-y-3 text-sm pt-6 border-t border-white/20">
          <a
            href="https://www.linkedin.com/company/ratecard"
            target="_blank"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>

          <a
            href="/newsletter"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Mail size={16} />
            Newsletter
          </a>

          <a
            href="https://events.ratecard.fr"
            target="_blank"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <CalendarDays size={16} />
            Événements
          </a>
        </div>

        <div className="text-xs opacity-60 mt-6">
          © {new Date().getFullYear()} Ratecard
        </div>
      </aside>

      <main className="flex-1 p-10 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
