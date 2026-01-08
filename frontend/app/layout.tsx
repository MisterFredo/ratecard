import "./globals.css";
import Image from "next/image";
import Link from "next/link";

import { DrawerProvider } from "@/contexts/DrawerContext";
import DrawerContent from "@/components/DrawerContent";

export const metadata = {
  title: "Ratecard",
  description:
    "Analyses, signaux et décryptages issus des événements Ratecard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900 antialiased">
        <DrawerProvider>

          {/* HEADER */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-10">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-transparent-768x178.png"
                  alt="Ratecard"
                  width={140}
                  height={32}
                  priority
                />
              </Link>

              <nav className="flex items-center gap-6 text-sm font-medium">
                <Link
                  href="/news"
                  className="text-ratecard-blue hover:underline"
                >
                  News
                </Link>
                <Link href="/event/le-touquet" className="hover:underline">
                  Le Touquet
                </Link>
                <Link href="/event/paris" className="hover:underline">
                  Paris
                </Link>
                <Link href="/event/miami" className="hover:underline">
                  Miami
                </Link>
              </nav>
            </div>
          </header>

          {/* CONTENT */}
          <main className="max-w-7xl mx-auto px-6 py-10">
            {children}
          </main>

          {/* DRAWER GLOBAL */}
          <DrawerContent />

          {/* FOOTER */}
          <footer className="border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-600 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <Link
                  href="/newsletter"
                  className="hover:underline text-ratecard-green font-medium"
                >
                  Recevoir les analyses Ratecard
                </Link>
                <Link
                  href="https://www.linkedin.com/company/ratecard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Suivre Ratecard sur LinkedIn
                </Link>
                <Link href="/events" className="hover:underline">
                  Découvrir les prochains événements
                </Link>
              </div>

              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Ratecard — Tous droits réservés
              </p>
            </div>
          </footer>

        </DrawerProvider>
      </body>
    </html>
  );
}
