import "./globals.css";

export const metadata = {
  title: "Ratecard",
  description: "Ratecard — Editorial & Events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  );
}
