import "./globals.css";
import { DrawerProvider } from "@/contexts/DrawerContext";
import DrawerContent from "@/components/DrawerContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900 antialiased">
        <DrawerProvider>
          {children}
          <DrawerContent />
        </DrawerProvider>
      </body>
    </html>
  );
}
