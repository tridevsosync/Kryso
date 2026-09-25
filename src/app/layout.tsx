import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kryso Music Academy — Learn Music & Live Concerts",
  description: "Concert sound, music lessons and instruments in Pune, Maharashtra.",
  authors: [{ name: "Lovable" }],
  openGraph: {
    title: "Kryso Music Academy",
    description: "Learn music and enjoy concerts in Pune.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lovable",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${dmSans.variable} ${manrope.variable}`}>
      <body className="antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
