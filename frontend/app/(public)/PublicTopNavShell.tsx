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

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = active(href);
    return (
      <Link
        href={href}
        className={`
          relative text-sm font-medium transition
          ${isActive ? "text-ratecard-blue" : "text-gray-700 hover:text-ratecard-blue"}
        `}
      >
        {label}
        {isActive && (
          <span className="absolute left-0 -bottom-2 h-[2px] w-full bg-ratecard-blue rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* =====================================================
          DESKTOP HEADER
      ===================================================== */}
      <header className="hidden md:block sticky top-0 z-40 bg-white border-b">
        {/* fine brand bar */}
        <div className="h-[2px] bg-ratecard-blue" />

        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/brand/ratecard-logo.png"
              alt="Ratecard"
              className="h-8 w-auto"
            />
          </Link>

          {/* NAV */}
          <nav className="flex items-center gap-10">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}

            {/* CTA MEMBERSHIP */}
            <Link
              href="/membership"
              className="
                text-sm font-medium
                px-4 py-1.5 rounded-full
                border border-gray-300
                text-gray-800
                hover:border-ratecard-blue
                hover:text-ratecard-blue
                transition
              "
            >
              Membership
            </Link>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-5 text-gray-600">
            <Link
              href="https://www.linkedin.com/company/ratecard-adnovia/"
              className="hover:text-ratecard-blue transition"
            >
              <Linkedin size={18} />
            </Link>

            <Link
              href="/newsletter"
              className="hover:text-ratecard-blue transition"
            >
              <Mail size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b">
        <div className="h-[2px] bg-ratecard-blue" />
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
          MOBILE MENU
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

            {/* NAV */}
            <nav className="px-6 py-6 space-y-5 text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={active(item.href) ? "text-ratecard-blue" : "text-gray-800"}
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

            {/* FOOTER */}
            <div className="mt-auto px-6 py-6 border-t space-y-4 text-sm text-gray-600">
              <Link
                href="https://www.linkedin.com/company/ratecard-adnovia/"
                className="flex items-center gap-2"
              >
                <Linkedin size={16} /> LinkedIn
              </Link>

              <Link href="/newsletter" className="flex items-center gap-2">
                <Mail size={16} /> Newsletter
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="flex-1">
        <div className="p-4 md:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
