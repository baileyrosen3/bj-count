import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/retro.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Blackjack Counter",
  description: "A simple blackjack counting app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
