import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CoccolaTag Premium",
  description: "Smart ID per Pet – Sicurezza, Allerta, Anti-Furto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
