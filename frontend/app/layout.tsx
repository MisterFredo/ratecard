import "./globals.css";
import { DrawerProvider } from "@/contexts/DrawerContext";
import GlobalDrawer from "@/components/drawers/GlobalDrawer";

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
          <GlobalDrawer />
        </DrawerProvider>
      </body>
    </html>
  );
}
