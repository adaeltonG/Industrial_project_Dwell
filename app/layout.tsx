import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
