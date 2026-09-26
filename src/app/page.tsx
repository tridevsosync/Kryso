import type { Metadata } from "next";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "Kryso Music Academy | Premier Concert & Sound Studio, Pune",
  description:
    "Find your rhythm at Kryso Music Academy in Pune. Experience live stage coaching, music production & DJing, instrument mastery, and exclusive music releases.",
  openGraph: {
    title: "Kryso Music Academy — Learn Music, Enjoy Concerts",
    description: "Live stage energy, 1-on-1 instrument coaching, sound production and artist releases in Pune, Maharashtra.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
