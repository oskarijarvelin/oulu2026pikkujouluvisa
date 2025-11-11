import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import ThemeProvider from "@/components/providers/theme-provider";

const rubik = localFont({
  src: "../public/assets/fonts/Rubik-VariableFont_wght.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oulu2026 Pikkujouluvisa",
  description: "Interaktiivinen jouluvisa Oulu2026-tapahtumaan. Testaa tietosi ja kilpaile huipputuloksista!",
  keywords: ["Oulu2026", "pikkujouluvisa", "visa", "joulu", "quiz"],
  authors: [{ name: "Oulu2026" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#002147" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body className={rubik.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
