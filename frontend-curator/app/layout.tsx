import DrawerHost from "@/components/drawers/DrawerHost";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <DrawerHost />
      </body>
    </html>
  );
}
