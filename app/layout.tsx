import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dwell",
  description: "A secure multi-vendor product discovery frontend prototype."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></body>
    </html>
  );
}
