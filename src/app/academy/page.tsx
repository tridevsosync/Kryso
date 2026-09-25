import type { Metadata } from "next";
import { AcademyClient } from "./academy-client";

export const metadata: Metadata = {
  title: "Music Classes & Courses | Kryso Music Academy, Pune",
  description: "Explore guitar, piano, vocals, violin, tabla and more at Kryso Music Academy in Pune.",
  openGraph: {
    title: "Learn Music at Kryso Music Academy",
    description: "Music lessons for curious beginners and growing musicians in Pune.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function AcademyPage() {
  return <AcademyClient />;
}
