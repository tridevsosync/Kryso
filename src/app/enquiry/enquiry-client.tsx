"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, GraduationCap, ArrowRight, Loader2, Sparkles, BookOpen } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { saveEnquiry } from "@/lib/kryso-storage";

const DEFAULT_COURSES = [
  "Guitar",
  "Piano",
  "Keyboard",
  "Drums",
  "Violin",
  "Flute",
  "Harmonium",
  "Tabla",
  "Vocal singing",
];

export function EnquiryClient() {
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseError, setCourseError] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/collections?name=academy_courses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const names = data.items
            .map((c: { name?: string }) => c.name?.trim())
            .filter((n: string | undefined): n is string => Boolean(n));
          if (names.length > 0) {
            setCourses(Array.from(new Set([...names, ...DEFAULT_COURSES])));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border">
        <Image
          src={heroImage}
          alt="Academy studio"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_25%] opacity-35 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/60" />
        <div className="page-shell py-16 sm:py-20">
          <p className="eyebrow">Admissions & Auditions</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl text-foreground">
            Course <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">Enquiry</span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Select your discipline of interest and take your first step toward musical mastery with Kryso Academy Pune.
          </p>
        </div>
      </section>

      <section className="page-shell section-space grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <SectionHeading
            label="Why Learn With Us"
            title="Concert-grade training for beginners and performers."
          />

          <div className="mt-8 space-y-4">
            <div className="flex gap-4 rounded-xl border border-border bg-card/60 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <GraduationCap size={20} />
              </span>
              <div>
                <p className="font-bold text-foreground">1-on-1 & Small Group Coaching</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Individual attention from active stage artists and conservatory educators.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-border bg-card/60 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="font-bold text-foreground">Live Stage & Jam Experience</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Regular recitals, studio recording sessions, and masterclasses at our Pune studio.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-border bg-card/60 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <BookOpen size={20} />
              </span>
              <div>
                <p className="font-bold text-foreground">Flexible Batches & Certification</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Weekend and weekday morning/evening batches tailored to school and working professionals.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Explore All Classes</p>
            <p className="mt-1 text-sm text-foreground">Want to browse the detailed syllabus and fee breakdown?</p>
            <Link
              href="/academy"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              View Academy Curriculum <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Course Enquiry Form */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-9 shadow-xl">
          <p className="eyebrow">Student Registration</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">Book Your Free Trial / Audition</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please select the course you are interested in. A course selection is mandatory.
          </p>

          {sent ? (
            <div className="mt-8 grid justify-items-center bg-secondary/80 border border-primary/30 rounded-xl p-8 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 size={30} />
              </div>
              <p className="mt-4 font-display text-xl font-bold text-foreground">Enquiry Submitted!</p>
              <p className="mt-2 text-sm text-foreground">
                We have received your enquiry for:
              </p>
              <div className="mt-2 inline-block rounded-full bg-primary/15 border border-primary/40 px-4 py-1.5 text-sm font-extrabold text-primary">
                🎵 {selectedCourse}
              </div>
              <p className="mt-3 text-xs text-muted-foreground max-w-sm">
                Our faculty coordinator will call you to schedule your studio visit or introductory trial class.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full border-border hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setSent(false);
                  setSelectedCourse("");
                }}
              >
                Submit Another Course Enquiry
              </Button>
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedCourse || selectedCourse.trim() === "") {
                  setCourseError(true);
                  return;
                }

                setSubmitting(true);
                const data = new FormData(e.currentTarget);
                const name = String(data.get("name") ?? "").trim();
                const phone = String(data.get("phone") ?? "").trim();
                const email = String(data.get("email") ?? "").trim();
                const message = String(data.get("message") ?? "").trim();

                saveEnquiry({
                  kind: "course",
                  name,
                  phone,
                  email,
                  course: selectedCourse.trim(),
                  message,
                });

                setSubmitting(false);
                setSent(true);
              }}
            >
              {/* Mandatory Course Dropdown */}
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                <span className="flex items-center justify-between">
                  <span>
                    Select Course <span className="text-primary">*</span>
                  </span>
                  {courseError && (
                    <span className="text-xs font-semibold text-destructive animate-pulse">
                      * Please select a course
                    </span>
                  )}
                </span>
                <select
                  required
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    if (e.target.value) setCourseError(false);
                  }}
                  className={`h-11 rounded-lg border bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    courseError ? "border-destructive ring-1 ring-destructive" : "border-border"
                  }`}
                >
                  <option value="" disabled className="bg-background text-muted-foreground font-normal">
                    -- Choose a course (Required) * --
                  </option>
                  {courses.map((c) => (
                    <option key={c} value={c} className="bg-background text-foreground font-semibold">
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  User must select a course before submitting.
                </p>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Your Full Name <span className="text-primary">*</span>
                  <Input
                    name="name"
                    required
                    placeholder="Enter your name"
                    className="bg-background border-border text-foreground focus-visible:ring-primary"
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Phone Number <span className="text-primary">*</span>
                  <Input
                    name="phone"
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="bg-background border-border text-foreground focus-visible:ring-primary"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Email Address
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com (optional)"
                  className="bg-background border-border text-foreground focus-visible:ring-primary"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Your Goals / Musical Background
                <Textarea
                  name="message"
                  rows={3}
                  placeholder="Are you a beginner or have some experience? Which batch timing suits you?"
                  className="bg-background border-border text-foreground focus-visible:ring-primary"
                />
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  <>
                    Confirm Course Enquiry <ArrowRight size={16} className="ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
