import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tour Guide Matcher",
  description: "Match prospective students with the perfect tour guides",
  icons: {
    icon: '/favic.ico',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-theme="corporate">
      <body className={`${inter.className} h-full`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
