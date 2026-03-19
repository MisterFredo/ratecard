import "./globals.css";

import CuratorShell from "@/components/layout/CuratorShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <CuratorShell>{children}</CuratorShell>
      </body>
    </html>
  );
}
