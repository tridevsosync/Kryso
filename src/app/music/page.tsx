import type { Metadata } from "next";
import { MusicShopClient } from "./music-client";

export const metadata: Metadata = {
  title: "Music Releases & Exclusive Downloads | KRYSO",
  description: "Explore official music releases, studio master tracks, and exclusive download packages by KRYSO.",
  openGraph: {
    title: "Music Releases & Exclusive Downloads | KRYSO",
    description: "Explore official music releases, studio master tracks, and exclusive download packages by KRYSO.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MusicPage() {
  return <MusicShopClient />;
}
