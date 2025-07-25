import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PitchMoto - Where Startups Meet Investors",
  description: "Connect with investors and discover innovative startups on PitchMoto platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
