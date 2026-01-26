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
    { href: "/membership", label: "Membership" },
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = active(href);

    return (
      <Link
        href={href}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition
          ${
            isActive
              ? "bg-white/20 text-white"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          TOP NAV — DESKTOP
      ===================================================== */}
      <header className="hidden md:block sticky top-0 z-40">
        <div
          className="
            bg-gradient-to-r
            from-ratecard-blue
            to-ratecard-green
          "
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <img
                src="/assets/brand/ratecard-logo-white.png"
                alt="Ratecard"
                className="h-8 w-auto"
              />
            </Link>

            {/* NAV */}
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-5 text-white/80">
              <Link href="https://www.linkedin.com/company/ratecard-adnovia/">
                <Linkedin
                  size={18}
                  className="hover:text-white transition"
                />
              </Link>

              <Link href="/newsletter">
                <Mail
                  size={18}
                  className="hover:text-white transition"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          TOP NAV — MOBILE
      ===================================================== */}
      <div
        className="
          md:hidden sticky top-0 z-40
          bg-gradient-to-r
          from-ratecard-blue
          to-ratecard-green
          px-4 py-3 flex items-center justify-between
        "
      >
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="text-white" />
        </button>

        <Link href="/">
          <img
            src="/assets/brand/ratecard-logo-white.png"
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

            <nav className="space-y-4 text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    active(item.href)
                      ? "text-ratecard-blue"
                      : "text-gray-800"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t space-y-4 text-sm text-gray-600">
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

