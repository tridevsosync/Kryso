import type { Metadata } from "next";
import { CourseDetailClient } from "./course-detail-client";

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const decodedName = decodeURIComponent(courseId)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${decodedName} | Kryso Music Academy`,
    description: `Learn ${decodedName} at Kryso Music Academy Pune. Course syllabus, mentor profile, tuition details, and live concert studio sessions.`,
    openGraph: {
      title: `${decodedName} | Kryso Music Academy`,
      description: `Learn ${decodedName} at Kryso Music Academy Pune. Full course curriculum and mentor profile.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  return <CourseDetailClient courseId={courseId} />;
}
