import type { Metadata } from "next";
import { EnquiryClient } from "./enquiry-client";

export const metadata: Metadata = {
  title: "Course Enquiry & Admissions | Kryso Music Academy",
  description: "Enquire about guitar, piano, drums, vocals, flute, violin, and tabla courses at Kryso Music Academy Pune.",
};

export default function EnquiryPage() {
  return <EnquiryClient />;
}
