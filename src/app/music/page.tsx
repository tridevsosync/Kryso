import type { Metadata } from "next";
import { MusicShopClient } from "./music-client";

export const metadata: Metadata = {
  title: "The Music Shop | Kryso Music Academy, Pune",
  description: "Shop guitars, keyboards, pianos, drums and more at the Kryso Music Academy shop in Pune.",
  openGraph: {
    title: "The Music Shop | Kryso Music Academy",
    description: "Find an instrument you'll love at Kryso Music Academy, Pune.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MusicPage() {
  return <MusicShopClient />;
}
