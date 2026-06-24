import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Lane — Your AI Journal",
  description: "A journal that remembers. Write your thoughts, and let AI resurface your past.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
