import "./globals.css";

export const metadata = {
  title: "Ratecard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
