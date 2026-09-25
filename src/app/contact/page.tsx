import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "Contact Kryso Music Academy | Pune",
  description:
    "Talk to Kryso Music Academy about music classes, instruments and visiting us in Pune, Maharashtra.",
  openGraph: {
    title: "Contact Kryso Music Academy",
    description: "Get in touch about music classes and instruments in Pune.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
