"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  CalendarDays,
  Mail,
  Linkedin,
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
    { href: "/", label: "Flux", icon: Newspaper },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/events", label: "Événements", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-ratecard-blue text-white p-6 space-y-10 flex flex-col">
        <div>
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

        {/* ACTIONS RELATIONNELLES */}
        <div className="space-y-2 text-sm">
          <a
            href="https://www.linkedin.com/company/ratecard"
            target="_blank"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Linkedin size={16} />
            Suivre sur LinkedIn
          </a>

          <a
            href="/newsletter"
            className="flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Mail size={16} />
            Recevoir la newsletter
          </a>
        </div>

        <div className="text-xs opacity-60">
          © {new Date().getFullYear()} Ratecard
        </div>
      </aside>

      <main className="flex-1 p-10 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
