"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Clock3,
  GraduationCap,
  Heart,
  Info,
  Music2,
  PhoneCall,
  Search,
  Star,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { type Course } from "@/data/catalog";
import { formatImageUrl } from "@/lib/media-utils";
import { EnquiryButton } from "../enquiry-button";
import { CourseEnrollmentModal } from "@/components/enrollment-modal";
import { AcademySpotlight } from "@/components/academy-spotlight";

const perks = [
  { icon: Award, title: "Experienced teachers", text: "Learn with working concert musicians who love to teach." },
  { icon: Heart, title: "A friendly room", text: "Start at your own pace, with no prior experience needed." },
  { icon: UsersRound, title: "Personal attention", text: "Small group and one-to-one learning, your way." },
  { icon: Music2, title: "Make music together", text: "Practice sessions and real chances to play on stage." },
  { icon: GraduationCap, title: "A real foundation", text: "Build practical skills as well as musical understanding." },
  { icon: Clock3, title: "Timings that fit", text: "Ask about lesson times that work with your week." },
];

export function AcademyClient() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [enrollModalCourse, setEnrollModalCourse] = useState<Course | null>(null);
  const [testimonialList, setTestimonialList] = useState<{ name: string; course: string; text: string }[]>([]);
  const [galleryList, setGalleryList] = useState<{ id: string; imageUrl?: string; caption?: string }[]>([]);
  const [review, setReview] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    // Fetch courses from MongoDB collection
    fetch("/api/collections?name=academy_courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setCourseList(data.items);
        } else {
          try {
            const stored = localStorage.getItem("kryso:admin-courses-v3") || localStorage.getItem("admin-courses-v3");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setCourseList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch testimonials
    fetch("/api/collections?name=academy_testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setTestimonialList(data.items);
        }
      })
      .catch(() => {});

    // Fetch gallery photos
    fetch("/api/collections?name=academy_gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setGalleryList(data.items);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered & searched courses (sorted by display order)
  const filteredCourses = useMemo(() => {
    return courseList
      .filter((course) => {
        const matchSearch =
          searchQuery === "" ||
          course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchLevel =
          selectedLevel === "all" ||
          course.level?.toLowerCase().includes(selectedLevel.toLowerCase());

        return matchSearch && matchLevel;
      })
      .sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== null && !isNaN(Number(a.order)) ? Number(a.order) : 9999;
        const orderB = b.order !== undefined && b.order !== null && !isNaN(Number(b.order)) ? Number(b.order) : 9999;
        return orderA - orderB;
      });
  }, [courseList, searchQuery, selectedLevel]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || 1;
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  // Unique levels from courses
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    courseList.forEach((c) => {
      if (c.level) set.add(c.level.trim());
    });
    return Array.from(set);
  }, [courseList]);

  return (
    <SiteShell>
      {/* 1. HERO SPOTLIGHT CAROUSEL SECTION */}
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border py-4 sm:py-6 lg:py-8">
        {/* Stage background textures */}
        <Image
          src={heroImage}
          alt="Academy concert rehearsal hall"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_35%] opacity-35 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-radial-[at_center] from-background/55 via-background/85 to-background" />

        {/* Ambient Stage Glow */}
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />

        <div className="w-full">
          <div className="page-shell mb-2 sm:mb-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-primary shadow-sm">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              <span className="truncate">KRYSO MUSIC ACADEMY & STUDIO · PUNE</span>
            </div>
          </div>
          <AcademySpotlight />
        </div>
      </section>

      {/* 2. STATS & HIGHLIGHTS BANNER */}
      <section className="relative -mt-4 sm:-mt-6 z-20 page-shell">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border shadow-2xl backdrop-blur-xl">
          {[
            { word: "Start", line: "with the basics", desc: "No prior experience needed" },
            { word: "Explore", line: "your own sound", desc: "1-on-1 personalized path" },
            { word: "Practice", line: "with good people", desc: "Acoustic-treated studio" },
            { word: "Perform", line: "on live stage", desc: "Real concert recitals" },
          ].map((item, i) => (
            <div
              key={item.word}
              className={`p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition-colors ${
                i === 1 || i === 2
                  ? "bg-primary/95 text-primary-foreground font-bold shadow-inner"
                  : "bg-card/95 text-foreground"
              }`}
            >
              <div>
                <span className="font-display text-xl sm:text-2xl font-extrabold">{item.word}</span>
                <p className="mt-1 text-xs sm:text-sm font-semibold opacity-90 leading-tight">{item.line}</p>
              </div>
              <p className="mt-2 text-[11px] opacity-75">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC COURSES SHOWCASE SECTION (ABOVE OUR APPROACH) */}
      <section id="courses" className="page-shell section-space">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            label="Curriculums & Classes"
            title={
              <>
                Choose Your <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">Course</span>
              </>
            }
            text="Explore classes taught by concert artists at our Pune academy."
          />
          {courseList.length > 0 && (
            <span className="pb-1 text-xs font-semibold text-muted-foreground">
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
            </span>
          )}
        </div>

        {/* Search & Level Filters (shown when courses exist) */}
        {courseList.length > 0 && (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search courses, instructors..."
                className="h-10 pl-10 bg-card border-border rounded-full text-foreground focus-visible:ring-primary"
              />
            </div>

            {availableLevels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setSelectedLevel("all");
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === "all"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Levels
                </button>
                {availableLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedLevel(lvl);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course Cards / Empty State */}
        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl border border-border bg-card/50 animate-pulse p-6" />
            ))}
          </div>
        ) : courseList.length === 0 ? (
          /* Empty state: No hardcoded dummy courses */
          <div className="mt-10 rounded-2xl border border-dashed border-border py-16 px-6 text-center bg-card/40">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
              <GraduationCap size={32} />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">No Courses Published Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Classes and curriculums added through the Admin Panel will appear here automatically.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <EnquiryButton className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
                Register Custom Course Enquiry <ArrowUpRight size={16} />
              </EnquiryButton>
            </div>
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border py-12 text-center bg-card/30">
            <p className="font-semibold text-foreground">No courses match your filter.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing your search query or level filter.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedLevel("all");
              }}
              className="mt-4 rounded-full text-xs cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCourses.map((course) => {
              const sellingPrice = Number(course.fees || (course as unknown as { price?: number }).price || 0);
              const actualPrice = Number(course.actualPrice || (course as unknown as { originalPrice?: number }).originalPrice || 0);
              const hasDiscount = actualPrice > sellingPrice && sellingPrice > 0;
              const discountPercent = hasDiscount ? Math.round(((actualPrice - sellingPrice) / actualPrice) * 100) : 0;
              const teacher = course.instructor || (course as unknown as { teacherName?: string }).teacherName;

              return (
                <article
                  key={course.id || course.name}
                  className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.03] hover:-translate-y-1.5 z-0 hover:z-10 flex flex-col justify-between"
                >
                  {/* Full-width Card Cover Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-secondary">
                    {course.imageUrl ? (
                      <Image
                        src={formatImageUrl(course.imageUrl)}
                        alt={course.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full grid place-items-center bg-gradient-to-br from-secondary via-background to-secondary text-muted-foreground">
                        <Music2 size={40} className="text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                    {/* Level Badge & Discount Pill on top of cover image */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      {course.level && (
                        <span className="rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-foreground border border-border/80">
                          {course.level}
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="rounded-full bg-emerald-500/90 text-white font-extrabold px-2.5 py-1 text-[10px] shadow-sm">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {course.duration && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-muted-foreground border border-border/80">
                          <Clock3 size={11} className="text-primary" /> {course.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {course.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                        {course.description || "Comprehensive music coaching and practical performance technique."}
                      </p>

                      <div className="mt-4 space-y-2 border-t border-border/80 pt-3.5 text-xs">
                        {teacher && (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-medium">Teacher Name:</span>
                            <strong className="font-bold text-foreground">{teacher}</strong>
                          </div>
                        )}
                        {(sellingPrice > 0 || actualPrice > 0) && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Price:</span>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <span className="font-extrabold text-primary text-base">
                                ₹{sellingPrice.toLocaleString("en-IN")}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{actualPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                              {hasDiscount && (
                                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400">
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {course.duration && (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-medium">Duration:</span>
                            <span className="font-semibold text-foreground">{course.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Know More, Enroll Now & Free Demo Call (Appears on Hover) */}
                    <div className="mt-5 pt-3 border-t border-border/60">
                      <div className="grid grid-cols-2 gap-2.5">
                        <Link
                          href={`/academy/${encodeURIComponent(course.id || course.name)}`}
                          className="w-full"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 rounded-full border-border hover:bg-secondary hover:border-primary/50 text-foreground font-bold text-xs transition-all cursor-pointer"
                          >
                            Know More <Info size={13} className="ml-1 text-primary" />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          onClick={() => setEnrollModalCourse(course)}
                          className="h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer"
                        >
                          Enroll Now <ArrowRight size={13} className="ml-1" />
                        </Button>
                      </div>

                      {/* Book Your Free Demo Today Button (Appears on Card Hover) */}
                      <div className="overflow-hidden transition-all duration-300 ease-out md:max-h-0 md:opacity-0 md:-translate-y-1 md:pointer-events-none group-hover:max-h-16 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2.5 group-hover:pointer-events-auto max-md:max-h-16 max-md:opacity-100 max-md:mt-2.5">
                        <a
                          href="tel:9767378750"
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f05a14] via-[#ff6a20] to-[#f05a14] bg-[length:200%_auto] hover:bg-right px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer"
                        >
                          <PhoneCall size={14} className="animate-bounce shrink-0" />
                          <span>Book Your Free Demo Today</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-full px-3 text-xs cursor-pointer"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <span className="px-3 text-xs font-semibold text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-full px-3 text-xs cursor-pointer"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </section>

      {/* 4. APPROACH & MISSION SECTION */}
      <section className="page-shell section-space grid gap-12 lg:grid-cols-2 border-t border-border/80">
        <div>
          <SectionHeading label="Our approach" title="Good teaching. Great music. No pressure." />
          <p className="mt-5 leading-7 text-muted-foreground">
            Kryso is a place for curious people of all ages to slow down, listen, and learn. Our teachers meet you where
            you are—whether you have never touched an instrument or you&apos;re ready to take your playing further.
          </p>
          <p className="mt-4 leading-7 text-muted-foreground">
            We believe music belongs to everyone. Every lesson pairs a thoughtful foundation with time to play songs you
            actually love.
          </p>
        </div>
        <div className="grid content-start gap-6 border-l-2 border-primary pl-6">
          <div>
            <p className="eyebrow">Our mission</p>
            <p className="mt-2 font-display text-xl font-bold text-foreground">Make music education joyful, accessible and personal.</p>
          </div>
          <div>
            <p className="eyebrow">Our vision</p>
            <p className="mt-2 font-display text-xl font-bold text-foreground">A community where everyone feels at home with music.</p>
          </div>
          <div>
            <p className="eyebrow">In the studio</p>
            <p className="mt-2 leading-7 text-muted-foreground">
              A bright, welcoming practice space, instruments to explore, and friendly guidance whenever you need it.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PERKS & SUPPORT SECTION */}
      <section className="border-y border-border bg-secondary/40">
        <div className="page-shell section-space">
          <SectionHeading
            label="A good place to learn"
            title="The right kind of support."
            text="Music lessons built around people—not just pages in a book."
          />
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t border-border pt-5">
                <Icon size={20} className="text-primary" />
                <h2 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (rendered only when actual testimonials exist) */}
      {testimonialList.length > 0 && (
        <section className="border-y border-border bg-linear-to-r from-secondary via-background to-secondary">
          <div className="page-shell section-space grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-center">
            <div>
              <SectionHeading
                label="From our students"
                title="The best part is making music together."
                text="A few words from people who've started their own musical journeys with us."
              />
              <div className="mt-7 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  aria-label="Previous review"
                  onClick={() => setReview((review + testimonialList.length - 1) % testimonialList.length)}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  aria-label="Next review"
                  onClick={() => setReview((review + 1) % testimonialList.length)}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="bg-card border border-border p-7 sm:p-10 rounded-2xl shadow-xl">
              <div className="flex gap-1 text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="mt-5 font-display text-xl font-semibold leading-8 text-foreground">
                “{testimonialList[review]?.text || "Learning music at Kryso has been transformational."}”
              </p>
              <div className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid size-11 place-items-center rounded-full border border-primary/40 bg-primary/20 font-display font-bold text-primary">
                  {testimonialList[review]?.name?.charAt(0) || "K"}
                </span>
                <div>
                  <p className="font-bold text-foreground">{testimonialList[review]?.name || "Kryso Performer"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{testimonialList[review]?.course || "Music"} student</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section (dynamic if gallery items exist, or clean branded grid) */}
      {galleryList.length > 0 ? (
        <section className="page-shell py-16">
          <SectionHeading label="Academy Moments" title="Life Inside Kryso Studio" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {galleryList.map((item) => (
              <div
                key={item.id}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.caption || "Academy photo"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-secondary text-primary">
                    <Sparkles size={24} />
                  </div>
                )}
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 p-3 text-xs font-semibold text-foreground">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Course Detail Modal ("Know More") */}
      <Dialog open={Boolean(detailCourse)} onOpenChange={(open) => !open && setDetailCourse(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border text-foreground shadow-2xl p-4 sm:p-7">
          {detailCourse && (
            <div>
              <DialogHeader className="text-left">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                    {detailCourse.name}
                  </DialogTitle>
                  {detailCourse.level && (
                    <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-primary shrink-0">
                      {detailCourse.level}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-muted-foreground text-xs mt-1">
                  Course details, faculty mentorship & admission information at Kryso Music Academy Pune.
                </DialogDescription>
              </DialogHeader>

              {/* Course Image */}
              {detailCourse.imageUrl ? (
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary">
                  <Image
                    src={formatImageUrl(detailCourse.imageUrl)}
                    alt={detailCourse.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              {/* Key Details Grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="rounded-xl border border-border bg-secondary/60 p-3 sm:p-3.5">
                  <span className="text-muted-foreground font-medium block">Teacher Name</span>
                  <span className="mt-1 block font-bold text-foreground text-sm">
                    {detailCourse.instructor || (detailCourse as unknown as { teacherName?: string }).teacherName || "Academy Artist Faculty"}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-secondary/60 p-3 sm:p-3.5">
                  <span className="text-muted-foreground font-medium block">Price / Fees</span>
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    <span className="font-extrabold text-primary text-sm">
                      ₹{Number(detailCourse.fees || (detailCourse as unknown as { price?: number }).price || 0).toLocaleString("en-IN")}
                    </span>
                    {Number(detailCourse.actualPrice || (detailCourse as unknown as { originalPrice?: number }).originalPrice || 0) > Number(detailCourse.fees || (detailCourse as unknown as { price?: number }).price || 0) && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{Number(detailCourse.actualPrice || (detailCourse as unknown as { originalPrice?: number }).originalPrice || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-400">
                          {Math.round(((Number(detailCourse.actualPrice || (detailCourse as unknown as { originalPrice?: number }).originalPrice || 0) - Number(detailCourse.fees || (detailCourse as unknown as { price?: number }).price || 0)) / Number(detailCourse.actualPrice || (detailCourse as unknown as { originalPrice?: number }).originalPrice || 0)) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {detailCourse.duration && (
                  <div className="rounded-xl border border-border bg-secondary/60 p-3 sm:p-3.5">
                    <span className="text-muted-foreground font-medium block">Duration</span>
                    <span className="mt-1 block font-bold text-foreground text-sm">
                      {detailCourse.duration}
                    </span>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-secondary/60 p-3 sm:p-3.5">
                  <span className="text-muted-foreground font-medium block">Format</span>
                  <span className="mt-1 block font-bold text-foreground text-sm">
                    1-on-1 & Live Stage Jams
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 sm:mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description & Syllabus
                </h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-secondary/40 p-3.5 sm:p-4 rounded-xl border border-border/50">
                  {detailCourse.description || "Comprehensive practical coaching with professional instruments, rehearsal hall walkthroughs, and concert performances."}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setDetailCourse(null)}
                  className="rounded-full border-border text-xs font-bold hover:bg-secondary h-10"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const selected = detailCourse;
                    setDetailCourse(null);
                    setEnrollModalCourse(selected);
                  }}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 px-6 h-10"
                >
                  Enroll Now in {detailCourse.name} <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Enrollment & Razorpay Payment Modal */}
      {enrollModalCourse && (
        <CourseEnrollmentModal
          course={enrollModalCourse}
          onClose={() => setEnrollModalCourse(null)}
        />
      )}
    </SiteShell>
  );
}
