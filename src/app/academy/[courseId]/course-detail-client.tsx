"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Check,
  Flame,
  GraduationCap,
  Headphones,
  Heart,
  HelpCircle,
  Layers,
  MapPin,
  Mic2,
  Music2,
  PhoneCall,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  User,
  UsersRound,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import {
  type Course,
  type Teacher,
  type SyllabusModule,
  type StudioGearItem,
  defaultSyllabusModules,
  defaultStudioGearItems,
} from "@/data/catalog";
import { formatImageUrl } from "@/lib/media-utils";
import { CourseEnrollmentModal } from "@/components/enrollment-modal";
import { EnquiryButton } from "@/app/enquiry-button";

interface CourseDetailClientProps {
  courseId: string;
}

const studioIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Mic2,
  Volume2,
  Tv,
  Music2,
  Calendar,
  ShieldCheck,
  Radio,
  Headphones,
  Sparkles,
  Layers,
  Award,
  GraduationCap,
  Heart,
  Star,
  UsersRound,
};

export function CourseDetailClient({ courseId }: CourseDetailClientProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [curriculumList, setCurriculumList] = useState<SyllabusModule[]>([]);
  const [studioGearList, setStudioGearList] = useState<StudioGearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollModalCourse, setEnrollModalCourse] = useState<Course | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"syllabus" | "mentor" | "studio" | "faqs">("syllabus");

  const decodedCourseId = decodeURIComponent(courseId).trim();

  useEffect(() => {
    const sortList = (list: Course[]) =>
      [...list].sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== null && !isNaN(Number(a.order)) ? Number(a.order) : 9999;
        const orderB = b.order !== undefined && b.order !== null && !isNaN(Number(b.order)) ? Number(b.order) : 9999;
        return orderA - orderB;
      });

    // 1. Fetch courses
    const loadCourses = fetch("/api/collections?name=academy_courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setCourses(sortList(data.items));
        } else {
          try {
            const stored =
              localStorage.getItem("kryso:admin-courses-v3") ||
              localStorage.getItem("admin-courses-v3");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setCourses(sortList(parsed));
            }
          } catch {}
        }
      })
      .catch(() => {});

    // 2. Fetch teachers
    const loadTeachers = fetch("/api/collections?name=academy_teachers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setTeachers(data.items);
        } else {
          try {
            const stored =
              localStorage.getItem("kryso:admin-teachers-v3") ||
              localStorage.getItem("admin-teachers-v3");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setTeachers(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Fetch curriculum / syllabus
    const loadCurriculum = fetch("/api/collections?name=academy_curriculum")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setCurriculumList(data.items);
        } else {
          try {
            const stored = localStorage.getItem("admin-curriculum-v3");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setCurriculumList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});

    // 4. Fetch studio gear & campus
    const loadStudioGear = fetch("/api/collections?name=academy_studio_gear")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setStudioGearList(data.items);
        } else {
          try {
            const stored = localStorage.getItem("admin-studio-gear-v3");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setStudioGearList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});

    Promise.all([loadCourses, loadTeachers, loadCurriculum, loadStudioGear]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Find the active course
  const currentCourse = useMemo(() => {
    if (!courses.length) return null;
    return (
      courses.find(
        (c) =>
          c.id === courseId ||
          c.id === decodedCourseId ||
          c.name?.toLowerCase() === decodedCourseId.toLowerCase() ||
          encodeURIComponent(c.name || "") === courseId ||
          c.name?.toLowerCase().replace(/\s+/g, "-") === decodedCourseId.toLowerCase()
      ) || null
    );
  }, [courses, courseId, decodedCourseId]);

  // Find the associated teacher
  const teacherProfile = useMemo(() => {
    if (!currentCourse) return null;
    const instructorName = (
      currentCourse.instructor ||
      (currentCourse as unknown as { teacherName?: string }).teacherName ||
      ""
    ).trim().toLowerCase();

    if (!instructorName) return null;

    return (
      teachers.find(
        (t) =>
          t.name.toLowerCase() === instructorName ||
          t.id.toLowerCase() === instructorName ||
          t.name.toLowerCase().includes(instructorName) ||
          instructorName.includes(t.name.toLowerCase())
      ) || null
    );
  }, [currentCourse, teachers]);

  // Other courses list (excluding current course)
  const otherCourses = useMemo(() => {
    if (!currentCourse) return courses;
    return courses.filter(
      (c) =>
        c.id !== currentCourse.id &&
        c.name?.toLowerCase() !== currentCourse.name?.toLowerCase()
    );
  }, [courses, currentCourse]);

  // Calculate pricing & discounts
  const sellingPrice = Number(
    currentCourse?.fees ||
      (currentCourse as unknown as { price?: number })?.price ||
      0
  );
  const actualPrice = Number(
    currentCourse?.actualPrice ||
      (currentCourse as unknown as { originalPrice?: number })?.originalPrice ||
      0
  );
  const hasDiscount = actualPrice > sellingPrice && sellingPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((actualPrice - sellingPrice) / actualPrice) * 100)
    : 0;

  const instructorName =
    currentCourse?.instructor ||
    (currentCourse as unknown as { teacherName?: string })?.teacherName ||
    "Kryso Concert Faculty";

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const courseFaqs = [
    {
      q: "Do I need to own an instrument before joining?",
      a: "No! All students get free access to our concert-grade instruments (acoustic & electric guitars, Yamaha keyboards, acoustic drum kits, violins) inside our sound-treated studios during and between lessons.",
    },
    {
      q: "Are the lessons 1-on-1 or in small groups?",
      a: "We offer both personalized 1-on-1 mentorship and small peer groups (max 3-4 students). This ensures your mentor can tailor every exercise specifically to your fingers, learning pace, and musical taste.",
    },
    {
      q: "How does the online enrollment & payment work?",
      a: "You can click 'Enroll Now' to complete your admission instantly via Razorpay (UPI, Credit/Debit Cards, NetBanking). You will receive an official GST invoice and a confirmation call from our campus coordinator within 2 hours.",
    },
    {
      q: "Will I get to perform on stage?",
      a: "Yes! Kryso organizes periodic student concert recitals, jam nights, and studio recording sessions in Pune where students perform live with acoustic stage lighting and audio recording.",
    },
    {
      q: "What if I need to reschedule a class?",
      a: "We offer flexible scheduling. You can notify your mentor or campus desk 24 hours in advance to reschedule your session to a convenient weekend or evening slot.",
    },
  ];

  return (
    <SiteShell>
      {/* Top Breadcrumb & Share Bar */}
      <div className="border-b border-border/80 bg-card/40 backdrop-blur-md sticky top-16 z-30">
        <div className="page-shell py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground overflow-hidden">
            <Link href="/" className="hover:text-primary transition-colors shrink-0">
              Home
            </Link>
            <span className="text-border">/</span>
            <Link href="/academy" className="hover:text-primary transition-colors shrink-0">
              Academy
            </Link>
            <span className="text-border">/</span>
            <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-xs">
              {currentCourse?.name || decodedCourseId}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-all"
              title="Share course link"
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="text-emerald-400" /> Copied Link
                </>
              ) : (
                <>
                  <Share2 size={13} /> Share
                </>
              )}
            </button>
            <Link
              href="/academy"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <ArrowLeft size={13} /> All Courses
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-shell section-space">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] animate-pulse">
            <div className="space-y-6">
              <div className="h-8 w-36 bg-card rounded-full border border-border" />
              <div className="h-14 w-3/4 bg-card rounded-2xl border border-border" />
              <div className="h-28 w-full bg-card rounded-2xl border border-border" />
              <div className="h-64 w-full bg-card rounded-3xl border border-border" />
            </div>
            <div className="h-[480px] w-full bg-card rounded-3xl border border-border" />
          </div>
        </div>
      ) : !currentCourse ? (
        /* Course not found fallback */
        <div className="page-shell section-space">
          <div className="mx-auto max-w-xl text-center border border-dashed border-border rounded-3xl p-8 sm:p-14 bg-card/60 backdrop-blur-md">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
              <GraduationCap size={32} />
            </div>
            <h1 className="mt-5 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              Course Details Not Found
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We couldn&apos;t find an active curriculum matching &ldquo;{decodedCourseId}&rdquo;.
              It may have been renamed or updated.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/academy">
                <Button className="rounded-full px-6 h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  <ArrowLeft size={15} className="mr-2" /> Explore Academy Programs
                </Button>
              </Link>
              <EnquiryButton className="rounded-full px-6 h-11 font-bold border-border">
                Register Custom Enquiry
              </EnquiryButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 via-background to-background">
            {/* Ambient concert glows */}
            <div className="absolute top-10 left-1/4 -z-10 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute top-40 right-10 -z-10 size-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="page-shell py-8 sm:py-12 lg:py-16 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
              {/* Left Details Column */}
              <div>
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <span className="rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={13} className="animate-spin-slow" /> Kryso Certified Program
                  </span>
                  {currentCourse.level && (
                    <span className="rounded-full bg-secondary border border-border px-3 py-1 text-xs font-semibold text-foreground">
                      {currentCourse.level}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-extrabold text-emerald-400">
                      Save {discountPercent}% Today
                    </span>
                  )}
                </div>

                {/* Main Course Title */}
                <h1 className="mt-4 font-display text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] text-foreground tracking-tight">
                  {currentCourse.name}
                </h1>

                {/* Tagline / Overview */}
                <p className="mt-4 text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground/90 max-w-2xl">
                  {currentCourse.description ||
                    "Master hands-on technique, harmonic ear training, and live concert performance. Taught 1-on-1 by active touring artists in our Pune acoustic rehearsal studios."}
                </p>

                {/* Rating & Social Proof */}
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-y border-border/70 py-3.5">
                  <div className="flex items-center gap-1 text-amber-400 font-extrabold">
                    <Star size={15} className="fill-amber-400" />
                    <span>4.9 / 5.0</span>
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <UsersRound size={14} className="text-primary" />
                    <span>120+ Students Enrolled</span>
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <MapPin size={14} className="text-primary" />
                    <span>Pune Studio Campus</span>
                  </div>
                </div>

                {/* Key feature pills */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="rounded-2xl border border-border bg-card/80 p-3.5 flex items-center gap-3 transition-colors hover:border-primary/40">
                    <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Duration</p>
                      <p className="font-bold text-xs sm:text-sm text-foreground">{currentCourse.duration || "Flexible Schedule"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/80 p-3.5 flex items-center gap-3 transition-colors hover:border-primary/40">
                    <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <UsersRound size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Format</p>
                      <p className="font-bold text-xs sm:text-sm text-foreground">1-on-1 / Small Group</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/80 p-3.5 flex items-center gap-3 col-span-2 sm:col-span-1 transition-colors hover:border-primary/40">
                    <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Certificate</p>
                      <p className="font-bold text-xs sm:text-sm text-foreground">Recital Certified</p>
                    </div>
                  </div>
                </div>

                {/* Action CTA row */}
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={() => setEnrollModalCourse(currentCourse)}
                    className="h-12 rounded-full px-8 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Enroll Now (Instant Checkout) <ArrowRight size={16} />
                  </Button>
                  <EnquiryButton className="h-12 rounded-full px-7 font-bold border-border bg-card hover:bg-secondary text-foreground text-xs sm:text-sm flex items-center justify-center">
                    Book Free Studio Demo <ArrowUpRight size={15} className="ml-1.5 text-primary" />
                  </EnquiryButton>
                </div>
              </div>

              {/* Right Media & Pricing Card (Sticky Glassmorphic) */}
              <div className="lg:sticky lg:top-28 rounded-3xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/50 transition-all hover:border-primary/40">
                {/* Course Media Image / Artwork */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-secondary">
                  {currentCourse.imageUrl ? (
                    <Image
                      src={formatImageUrl(currentCourse.imageUrl)}
                      alt={currentCourse.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-full grid place-items-center bg-gradient-to-br from-secondary via-background to-secondary text-muted-foreground">
                      <div className="text-center p-6">
                        <span className="font-display text-5xl">{currentCourse.icon || "🎵"}</span>
                        <p className="mt-3 font-display font-bold text-foreground text-sm">{currentCourse.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent" />

                  {/* Level & Discount tags */}
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-foreground border border-border">
                      {currentCourse.level || "All Skill Levels"}
                    </span>
                    {hasDiscount && (
                      <span className="rounded-full bg-emerald-500/90 text-white font-extrabold px-3 py-1 text-xs shadow-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Pricing & Booking Details */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex items-baseline justify-between border-b border-border pb-5">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tuition Fee</p>
                      <div className="mt-1 flex items-baseline gap-2.5">
                        <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary drop-shadow-sm">
                          ₹{sellingPrice.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm sm:text-base text-muted-foreground line-through">
                            ₹{actualPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasDiscount && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-400">
                        SAVE ₹{(actualPrice - sellingPrice).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* What is Included Checklist */}
                  <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                    <p className="font-bold text-foreground text-xs uppercase tracking-wider">What&apos;s Included:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>Dedicated Artist Mentor: <strong className="text-foreground">{instructorName}</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>Free studio rehearsal & instrument access</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>Live recital stage jam & recording session</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>Official Kryso Recital Grade Certificate</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>Instant Razorpay checkout & GST tax invoice</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2.5">
                    <Button
                      onClick={() => setEnrollModalCourse(currentCourse)}
                      className="w-full h-12 rounded-full font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-sm transition-all hover:scale-[1.01]"
                    >
                      Enroll Now (Razorpay Secure)
                    </Button>
                    <EnquiryButton className="w-full h-11 rounded-full font-bold border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs">
                      Enquire with Academy Counselor
                    </EnquiryButton>
                  </div>

                  {/* Trust assurance */}
                  <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                    <span>100% Safe Razorpay Gateway · Instant Tax Receipt</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Jump Tabbed Navigation */}
          <div className="border-b border-border bg-card/60 backdrop-blur-md">
            <div className="page-shell flex items-center gap-2 sm:gap-4 overflow-x-auto py-3 no-scrollbar text-xs sm:text-sm">
              {[
                { id: "syllabus", label: "Curriculum & Syllabus", icon: BookOpen },
                { id: "mentor", label: "Mentor & Faculty", icon: User },
                { id: "studio", label: "Studio Gear & Campus", icon: Radio },
                { id: "faqs", label: "FAQs & Admission", icon: HelpCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-bold transition-all shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Tab Content Section */}
          <section className="page-shell section-space">
            {/* 1. SYLLABUS TAB */}
            {activeTab === "syllabus" && (
              <div className="space-y-12">
                <div>
                  <SectionHeading
                    label="Structured Learning Journey"
                    title="Course Curriculum & Milestones"
                    text="From your first notes to confident concert stage jamming—here is how you will progress step by step."
                  />
                  {currentCourse.syllabusOverview && (
                    <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs sm:text-sm text-foreground leading-relaxed">
                      <strong className="text-primary font-bold">Course Syllabus Focus: </strong>
                      {currentCourse.syllabusOverview}
                    </div>
                  )}
                </div>

                {/* Dynamic Modules Timeline / Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {(() => {
                    const rawList = curriculumList.length > 0 ? curriculumList : defaultSyllabusModules;
                    // Check for course-specific syllabus modules first
                    const courseSpecific = rawList.filter(
                      (m) =>
                        m.courseName &&
                        (m.courseName.toLowerCase() === currentCourse.name.toLowerCase() ||
                          m.courseName === currentCourse.id)
                    );
                    const modulesToDisplay =
                      courseSpecific.length > 0
                        ? courseSpecific
                        : rawList.filter(
                            (m) => !m.courseName || m.courseName === "All Courses" || m.courseName === ""
                          );
                    const activeModules = modulesToDisplay.length > 0 ? modulesToDisplay : defaultSyllabusModules;

                    return activeModules.map((module) => {
                      const topicList = Array.isArray(module.topics)
                        ? module.topics
                        : typeof module.topics === "string"
                        ? module.topics
                            .split(",")
                            .map((t: string) => t.trim())
                            .filter(Boolean)
                        : [];

                      return (
                        <div
                          key={module.id || module.step || module.title}
                          className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                        >
                          <div>
                            <span className="font-display text-3xl font-extrabold text-primary/30">
                              {module.step || "01"}
                            </span>
                            <h3 className="mt-3 font-display text-base sm:text-lg font-bold text-foreground">
                              {module.title}
                            </h3>
                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                              {module.desc}
                            </p>
                          </div>

                          {topicList.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-border/80">
                              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">Key Topics:</p>
                              <ul className="space-y-1.5 text-xs text-muted-foreground">
                                {topicList.map((t: string) => (
                                  <li key={t} className="flex items-center gap-1.5">
                                    <span className="size-1 rounded-full bg-primary shrink-0" />
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* About this Program / Methodology */}
                <div className="rounded-3xl border border-border bg-secondary/30 p-6 sm:p-10 grid gap-6 lg:grid-cols-[1fr_1.5fr] items-center">
                  <div>
                    <span className="eyebrow">The Kryso Method</span>
                    <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-foreground">
                      Music Education Designed for Real Players
                    </h3>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <p>
                      {currentCourse.description ||
                        "Our curriculum is designed to eliminate the frustration of dry, rote exercises. We combine essential music theory with immediate song playing, ensuring every class feels productive and rewarding."}
                    </p>
                    <p>
                      Whether you are an absolute beginner touching the strings for the first time or looking to sharpen your improvisation skills, our artist faculty adapts the syllabus directly to your musical ambitions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MENTOR & FACULTY TAB */}
            {activeTab === "mentor" && (
              <div className="space-y-10">
                <SectionHeading
                  label="Artist Mentorship"
                  title="Meet Your Instructor"
                  text="Learn directly from active concert musicians and dedicated music educators."
                />

                <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-3xl -z-10" />

                  <div className="grid gap-8 md:grid-cols-[220px_1fr] items-center">
                    {/* Mentor Photo */}
                    <div className="flex flex-col items-center text-center">
                      {teacherProfile?.avatarUrl ? (
                        <div className="relative size-36 sm:size-44 rounded-3xl overflow-hidden border-2 border-primary/40 shadow-xl shadow-primary/15">
                          <Image
                            src={formatImageUrl(teacherProfile.avatarUrl)}
                            alt={teacherProfile.name}
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid size-36 sm:size-44 place-items-center rounded-3xl bg-gradient-to-br from-primary/20 to-secondary text-primary border-2 border-primary/30">
                          <User size={64} />
                        </div>
                      )}

                      <span className="mt-3 rounded-full bg-primary/15 border border-primary/30 px-3 py-0.5 text-[11px] font-extrabold text-primary">
                        Verified Kryso Educator
                      </span>
                    </div>

                    {/* Mentor Bio & Credentials */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                          {teacherProfile?.name || instructorName}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-primary">
                          {teacherProfile?.specialization || "Concert Performance & Masterclass Instructor"}
                        </p>
                        {teacherProfile?.experience && (
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock3 size={13} className="text-primary" /> {teacherProfile.experience} of Live & Studio Experience
                          </p>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        {teacherProfile?.bio ||
                          `${instructorName} is an acclaimed musician and educator at Kryso Music Academy. Known for an encouraging, attentive teaching style, they specialize in breaking down intricate techniques into fun, actionable steps while fostering true musical expressiveness.`}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                        <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border">
                          <p className="font-bold text-foreground text-xs">1-on-1 Attention</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Personalized pace</p>
                        </div>
                        <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border">
                          <p className="font-bold text-foreground text-xs">Touring Artist</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Real stage experience</p>
                        </div>
                        <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border col-span-2 sm:col-span-1">
                          <p className="font-bold text-foreground text-xs">100+ Students</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Mentored in Pune</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. STUDIO & CAMPUS TAB */}
            {activeTab === "studio" && (
              <div className="space-y-10">
                <SectionHeading
                  label="Acoustic Excellence"
                  title="Pune Campus & Studio Infrastructure"
                  text="Experience world-class acoustic treatment, recording interfaces, and pro concert gear."
                />

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(studioGearList.length > 0 ? studioGearList : defaultStudioGearItems).map((item) => {
                    const iconKey = item.icon || "Mic2";
                    const Icon = studioIcons[iconKey] || Mic2;
                    return (
                      <div
                        key={item.id || item.title}
                        className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                              <Icon size={22} />
                            </div>
                            {item.category && (
                              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-4 font-display text-base font-bold text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. FAQS TAB */}
            {activeTab === "faqs" && (
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <SectionHeading
                    label="Got Questions?"
                    title="Frequently Asked Questions"
                    text="Everything you need to know about joining Kryso Music Academy."
                  />
                </div>

                <div className="space-y-3 mt-8">
                  {courseFaqs.map((faq, index) => {
                    const isOpen = activeFaq === index;
                    return (
                      <div
                        key={faq.q}
                        className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : index)}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 font-display text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            size={18}
                            className={`text-primary shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* EXPLORE OTHER COURSES SECTION */}
          {otherCourses.length > 0 && (
            <section className="border-t border-border bg-secondary/30">
              <div className="page-shell section-space">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <SectionHeading
                    label="Explore Other Programs"
                    title="Other Courses at Kryso Academy"
                    text="Discover more instruments, vocals, and sound production courses taught by our concert artists."
                  />
                  <Link href="/academy" className="shrink-0">
                    <Button
                      variant="outline"
                      className="rounded-full px-5 h-10 font-bold border-border hover:bg-secondary text-foreground text-xs"
                    >
                      View All {courses.length} Courses <ArrowRight size={14} className="ml-1.5 text-primary" />
                    </Button>
                  </Link>
                </div>

                {/* Other Courses Grid */}
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {otherCourses.map((other) => {
                    const otherSelling = Number(
                      other.fees ||
                        (other as unknown as { price?: number })?.price ||
                        0
                    );
                    const otherActual = Number(
                      other.actualPrice ||
                        (other as unknown as { originalPrice?: number })
                          ?.originalPrice ||
                        0
                    );
                    const otherHasDiscount =
                      otherActual > otherSelling && otherSelling > 0;
                    const otherDiscountPercent = otherHasDiscount
                      ? Math.round(
                          ((otherActual - otherSelling) / otherActual) * 100
                        )
                      : 0;
                    const otherInstructor =
                      other.instructor ||
                      (other as unknown as { teacherName?: string })
                        ?.teacherName ||
                      "Kryso Faculty";

                    return (
                      <article
                        key={other.id || other.name}
                        className="group relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.03] hover:-translate-y-1.5 z-0 hover:z-10 flex flex-col justify-between"
                      >
                        {/* Artwork */}
                        <div className="relative h-48 w-full overflow-hidden bg-secondary">
                          {other.imageUrl ? (
                            <Image
                              src={formatImageUrl(other.imageUrl)}
                              alt={other.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="size-full grid place-items-center bg-gradient-to-br from-secondary via-background to-secondary text-muted-foreground">
                              <span className="text-4xl">{other.icon || "🎵"}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                          {/* Level / Discount badges */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-foreground border border-border/80">
                              {other.level || "All Levels"}
                            </span>
                            {otherHasDiscount && (
                              <span className="rounded-full bg-emerald-500/90 text-white font-extrabold px-2.5 py-1 text-[10px] shadow-sm">
                                {otherDiscountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {other.duration && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-muted-foreground border border-border/80">
                                <Clock3 size={11} className="text-primary" /> {other.duration}
                              </span>
                            </div>
                          )}

                          {/* Price Tag on Image */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="font-display text-xl font-extrabold text-primary drop-shadow-md">
                                ₹{otherSelling.toLocaleString("en-IN")}
                              </span>
                              {otherActual > otherSelling && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{otherActual.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {other.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                              <User size={13} className="text-primary shrink-0" /> Mentor:{" "}
                              <strong className="text-foreground">{otherInstructor}</strong>
                            </p>
                            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                              {other.description ||
                                "Comprehensive hands-on training with acoustic instruments, theory, and live concert jam sessions."}
                            </p>
                          </div>

                          {/* Action buttons: Know More, Enroll Now & Free Demo Call (Appears on Hover) */}
                          <div className="mt-5 pt-4 border-t border-border/60">
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href={`/academy/${encodeURIComponent(other.id || other.name)}`}
                                className="w-full"
                              >
                                <Button
                                  variant="outline"
                                  className="w-full h-10 rounded-full font-bold border-border hover:bg-secondary hover:border-primary/50 text-foreground text-xs cursor-pointer"
                                >
                                  Know More
                                </Button>
                              </Link>
                              <Button
                                onClick={() => setEnrollModalCourse(other)}
                                className="w-full h-10 rounded-full font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 text-xs cursor-pointer"
                              >
                                Enroll Now
                              </Button>
                            </div>

                            {/* Book Your Free Demo Today Button (Appears on Card Hover) */}
                            <div className="overflow-hidden transition-all duration-300 ease-out md:max-h-0 md:opacity-0 md:-translate-y-1 md:pointer-events-none group-hover:max-h-16 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2.5 group-hover:pointer-events-auto max-md:max-h-16 max-md:opacity-100 max-md:mt-2.5">
                              <a
                                href="tel:9767378750"
                                className="relative group/demo w-full flex items-center justify-center gap-2 rounded-full overflow-hidden bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] animate-gradient-flow px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg animate-demo-pulse hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer border border-orange-400/40"
                              >
                                {/* Sweeping metallic light sheen */}
                                <span className="pointer-events-none absolute inset-0 -top-1 -bottom-1 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-demo-shimmer -z-0" />

                                {/* Live Ringing Phone Icon with Pulsing Radar Aura */}
                                <span className="relative flex items-center justify-center size-5 rounded-full bg-white/25 border border-white/40 shrink-0 z-10 shadow-xs">
                                  <span className="absolute size-full rounded-full bg-white/40 animate-ping" />
                                  <PhoneCall size={11} className="text-white animate-phone-ring" />
                                </span>

                                {/* Button Text */}
                                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-extrabold tracking-wide">
                                  Book Your Free Demo Today
                                </span>

                                {/* Sparkle Icon */}
                                <Sparkles size={13} className="text-amber-200 animate-pulse shrink-0 z-10" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Sticky Mobile Enrollment Bottom Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border p-3.5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Tuition Fee</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-xl font-extrabold text-primary">
                    ₹{sellingPrice.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{actualPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setEnrollModalCourse(currentCourse)}
                className="h-11 rounded-full px-6 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-xs flex items-center gap-1.5"
              >
                Enroll Now <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Course Enrollment Checkout Modal */}
      {enrollModalCourse && (
        <CourseEnrollmentModal
          course={enrollModalCourse}
          onClose={() => setEnrollModalCourse(null)}
        />
      )}
    </SiteShell>
  );
}
