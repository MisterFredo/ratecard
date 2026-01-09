import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* HEADER PUBLIC */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-10">
          <Link href="/">
            <Image
              src="/logo-transparent-768x178.png"
              alt="Ratecard"
              width={140}
              height={32}
              priority
            />
          </Link>

          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/news">News</Link>
            <Link href="/event/le-touquet">Le Touquet</Link>
            <Link href="/event/paris">Paris</Link>
            <Link href="/event/miami">Miami</Link>
          </nav>
        </div>
      </header>

      {/* CONTENU PUBLIC */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>

      {/* FOOTER PUBLIC */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-600">
          © {new Date().getFullYear()} Ratecard
        </div>
      </footer>
    </>
  );
}
