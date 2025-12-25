// frontend/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Ratecard",
  description: "Ratecard — articles, insights et nouveautés du marché adtech",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
