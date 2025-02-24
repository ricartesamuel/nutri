import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutri",
  description: "Crie e edite tabelas nutricionais de forma rápida e intuitiva.",
  generator: "Nutri",
  icons: {
    icon: "/favicon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
