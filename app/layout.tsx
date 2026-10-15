import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LawChat CRM", template: "%s · LawChat CRM" },
  description: "LawChat pazarlama CRM'i",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#EEF1F6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
