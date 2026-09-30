"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Clock3,
  Flame,
  GraduationCap,
  Headphones,
  Lock,
  MapPin,
  Music,
  Music2,
  Pause,
  Phone,
  PhoneCall,
  Play,
  Sliders,
  Sparkles,
  Tag,
  Unlock,
  User,
  UsersRound,
} from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { EnquiryButton } from "./enquiry-button";
import { HomeSpotlight } from "@/components/home-spotlight";
import { CourseEnrollmentModal } from "@/components/enrollment-modal";
import { useStored } from "@/lib/kryso-storage";
import { siteSettings, type Course, type MusicTrack } from "@/data/catalog";
import { formatImageUrl, formatAudioUrl } from "@/lib/media-utils";

export function HomeClient() {
  const [settings] = useStored("admin-settings", siteSettings);

  // Dynamic Academy Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrollModalCourse, setEnrollModalCourse] = useState<Course | null>(null);

  // Dynamic Music Tracks state
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Fetch Academy Courses from MongoDB & localStorage (sorted by order)
  useEffect(() => {
    const sortList = (list: Course[]) =>
      [...list].sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== null && !isNaN(Number(a.order)) ? Number(a.order) : 9999;
        const orderB = b.order !== undefined && b.order !== null && !isNaN(Number(b.order)) ? Number(b.order) : 9999;
        return orderA - orderB;
      });

    fetch("/api/collections?name=academy_courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setCourses(sortList(data.items));
        } else {
          try {
            const stored = localStorage.getItem("admin-courses-v3");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setCourses(sortList(parsed));
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  // 2. Fetch Music Tracks from MongoDB & localStorage
  useEffect(() => {
    fetch("/api/collections?name=music_tracks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setTracks(data.items);
        } else {
          try {
            const stored = localStorage.getItem("admin-music-tracks-v1");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setTracks(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setTracksLoading(false));
  }, []);

  // Audio preview playback toggle
  const handleTogglePlay = (track: MusicTrack) => {
    if (!track.audioUrl) return;

    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const resolvedAudioUrl = formatAudioUrl(track.audioUrl);
      const audio = new Audio(resolvedAudioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(track.id);
    }
  };

  const primaryPhone = settings.phone || "+91 87678 28945";
  const studioAddress = settings.address || "Pune, Maharashtra, India";

  return (
    <SiteShell>
      {/* 1. HERO SPOTLIGHT CAROUSEL */}
      <section className="relative isolate min-h-[500px] sm:min-h-[600px] md:min-h-[660px] overflow-hidden bg-background text-foreground flex items-center py-4 sm:py-8 md:py-10 border-b border-border/80">
        <Image
          src={heroImage}
          alt="Concert stage background atmosphere"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[62%_center] opacity-35 brightness-75 contrast-125"
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
          <HomeSpotlight />
        </div>
      </section>

      {/* 2. STATS & LIVE HIGHLIGHTS BAR */}
      <section className="relative -mt-4 sm:-mt-6 z-20 page-shell">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border shadow-2xl backdrop-blur-xl">
          {[
            {
              icon: Flame,
              number: "100%",
              title: "Live Stage Focus",
              desc: "Periodic recitals & real concert jam experience",
            },
            {
              icon: UsersRound,
              number: "1-on-1",
              title: "Artist Mentorship",
              desc: "Coached by active touring & studio musicians",
            },
            {
              icon: GraduationCap,
              number: "All Ages",
              title: "Beginner to Pro",
              desc: "Personalized syllabus adapted to your pace",
            },
            {
              icon: MapPin,
              number: "Pune Campus",
              title: "Acoustic Sanctuary",
              desc: "Sound-treated studios & high-end pro gear",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-card/95 p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition-colors hover:bg-secondary/70 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-primary">
                    {item.number}
                  </span>
                  <div className="grid size-8 sm:size-9 place-items-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Icon size={16} />
                  </div>
                </div>
                <div className="mt-2.5 sm:mt-3">
                  <p className="font-display text-xs sm:text-sm lg:text-base font-bold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ACADEMY COURSES SHOWCASE SECTION */}
      <section className="page-shell section-space">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <SectionHeading
            label="Kryso Academy Programs"
            title="Master Your Instrument & Sound"
            text="Explore certified courses designed for aspiring artists and stage performers. Learn theory, technique, and live concert performance."
          />
          <Link href="/academy" className="shrink-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-full px-5 sm:px-6 h-10 sm:h-11 font-bold border-border hover:bg-secondary text-foreground text-xs sm:text-sm"
            >
              View Full Academy Curriculum <ArrowRight size={15} className="ml-2 text-primary" />
            </Button>
          </Link>
        </div>

        {/* Dynamic Courses Grid */}
        {coursesLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-border bg-card/60 animate-pulse" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => {
              const selling = Number(course.fees || (course as unknown as { price?: number }).price || 0);
              const actual = Number(course.actualPrice || (course as unknown as { originalPrice?: number }).originalPrice || 0);
              const discountPercent =
                actual > selling && selling > 0
                  ? Math.round(((actual - selling) / actual) * 100)
                  : 0;
              const teacher = course.instructor || (course as unknown as { teacherName?: string }).teacherName || "Kryso Faculty";

              return (
                <div
                  key={course.id || course.name}
                  className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.03] hover:-translate-y-1.5 z-0 hover:z-10 flex flex-col justify-between"
                >
                  {/* Course Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-secondary">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
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

                    {/* Level / Duration Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-foreground border border-border/80">
                        {course.level || "All Levels"}
                      </span>
                      {discountPercent > 0 && (
                        <span className="rounded-full bg-emerald-500/90 text-white font-extrabold px-2.5 py-1 text-[10px] shadow-sm">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-muted-foreground border border-border/80">
                        <Clock size={11} className="text-primary" /> {course.duration || "1 Month"}
                      </span>
                    </div>

                    {/* Price on Bottom Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-extrabold text-primary drop-shadow-md">
                          ₹{selling.toLocaleString("en-IN")}
                        </span>
                        {actual > selling && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{actual.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Details Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {course.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <User size={13} className="text-primary shrink-0" /> Mentor:{" "}
                        <strong className="text-foreground">{teacher}</strong>
                      </p>
                      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {course.description || "Comprehensive hands-on training with acoustic instruments, theory, and live concert jam sessions."}
                      </p>
                    </div>

                    {/* Card Actions: Know More, Enroll Now & Free Demo Call (Appears on Hover) */}
                    <div className="mt-5 pt-4 border-t border-border/60">
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/academy/${encodeURIComponent(course.id || course.name)}`} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full h-10 rounded-full font-bold border-border hover:bg-secondary hover:border-primary/50 text-foreground text-xs cursor-pointer"
                          >
                            Know More
                          </Button>
                        </Link>
                        <Button
                          onClick={() => setEnrollModalCourse(course)}
                          className="w-full h-10 rounded-full font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 text-xs cursor-pointer"
                        >
                          Enroll Now
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center bg-card/40">
            <GraduationCap size={40} className="mx-auto text-primary/60 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground">Academy Curriculum Active</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Our mentors teach Guitar, Piano, Drums, Vocals, DJing, and Sound Production with personalized 1-on-1 coaching.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/academy">
                <Button className="rounded-full px-6 font-bold text-xs">
                  Visit Academy Page <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. KRYSO MUSIC RELEASES & AUDIO HUB */}
      <section className="border-t border-border bg-gradient-to-b from-secondary/20 via-background to-secondary/30 relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-1/3 size-96 rounded-full bg-primary/10 blur-[130px]" />

        <div className="page-shell section-space">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <SectionHeading
              label="Kryso Sound Studio Releases"
              title="Original Music & Master Audio"
              text="Stream exclusive singles, live DJ sets, and studio recordings produced by the Kryso artist collective in Pune."
            />
            <Link href="/music" className="shrink-0">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full px-5 sm:px-6 h-10 sm:h-11 font-bold border-border hover:bg-secondary text-foreground text-xs sm:text-sm"
              >
                Open Music Library <ArrowRight size={15} className="ml-2 text-primary" />
              </Button>
            </Link>
          </div>

          {/* Dynamic Tracks Grid */}
          {tracksLoading ? (
            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl border border-border bg-card/60 animate-pulse" />
              ))}
            </div>
          ) : tracks.length > 0 ? (
            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.slice(0, 6).map((track) => {
                const isPlaying = playingTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className="group relative rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Track Artwork & Play overlay */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-secondary mb-3.5 sm:mb-4">
                        {track.imageUrl ? (
                          <Image
                            src={formatImageUrl(track.imageUrl)}
                            alt={track.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="size-full grid place-items-center bg-secondary text-muted-foreground">
                            <Headphones size={36} className="text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                        {/* Status Badges */}
                        <div className="absolute top-2.5 left-2.5">
                          {track.isLocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 text-black font-extrabold px-2.5 py-0.5 text-[10px] shadow-sm">
                              <Lock size={10} /> Social Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white font-extrabold px-2.5 py-0.5 text-[10px] shadow-sm">
                              <Unlock size={10} /> Free Stream
                            </span>
                          )}
                        </div>

                        {/* Play / Pause Floating Trigger */}
                        {track.audioUrl && (
                          <button
                            onClick={() => handleTogglePlay(track)}
                            className={`absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-lg transition-transform ${
                              isPlaying
                                ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/30"
                                : "bg-background/90 text-foreground hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                            }`}
                            aria-label={isPlaying ? "Pause audio" : "Play audio preview"}
                          >
                            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
                          </button>
                        )}
                      </div>

                      {/* Track Title & Artist */}
                      <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {track.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                        <span>By {track.singer || "Kryso Artists"}</span>
                        {track.genre && (
                          <>
                            <span>•</span>
                            <span className="text-primary">{track.genre}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
                      <Link
                        href="/music"
                        className="text-xs font-bold text-primary hover:text-primary/80 inline-flex items-center gap-1"
                      >
                        {track.isLocked ? "Unlock Track" : "Listen Full Audio"} <ArrowRight size={13} />
                      </Link>

                      {track.downloadCount !== undefined && track.downloadCount > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          {track.downloadCount} downloads
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 sm:mt-10 rounded-2xl border border-dashed border-border p-6 sm:p-10 text-center bg-card/40">
              <Headphones size={36} className="mx-auto text-primary/60 mb-3" />
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">Kryso Sound Studio</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Listen to original productions, DJ stems, and vocal sessions recorded in our Pune studio.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/music">
                  <Button className="rounded-full px-6 font-bold text-xs">
                    Explore Music Shop <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. THE KRYSO METHOD & PHILOSOPHY */}
      <section className="border-y border-border bg-secondary/30 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-[120px]" />

        <div className="page-shell section-space grid gap-8 sm:gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeading
              label="Why Choose Kryso"
              title="Music lessons built around people, not just textbooks."
              text="We believe music belongs to everyone. From your very first chord, we guide you to play with expression, confidence, and stage readiness."
            />

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 text-xs sm:text-sm text-foreground">
              {[
                "1-on-1 personalized attention tailored to your exact learning style.",
                "High-end instruments & acoustic-treated practice rooms available for rehearsal.",
                "Recitals, ensemble rehearsals, and jam nights with fellow musicians.",
                "Flexible class timings fitting around your school or work schedule.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2.5 sm:gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-primary mt-0.5">
                    <CheckCircle2 size={13} />
                  </div>
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <EnquiryButton className="h-11 rounded-full px-6 sm:px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 text-xs sm:text-sm">
                Book Free Trial Class <ArrowUpRight size={15} />
              </EnquiryButton>
              <Link
                href="/contact"
                className="text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center justify-center gap-1.5 py-2"
              >
                Visit our Pune studio <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Pillars Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {[
              {
                icon: Award,
                title: "Concert Faculty",
                desc: "Instructors who actively perform live and record in professional sound studios.",
              },
              {
                icon: Music2,
                title: "Stage Jams",
                desc: "Regular stage opportunities so you experience the real rush of performing for an audience.",
              },
              {
                icon: Sliders,
                title: "Modern Tech",
                desc: "Learn with current industry standards: Ableton, logic boards, and pro monitoring.",
              },
              {
                icon: Sparkles,
                title: "Creative Community",
                desc: "Join a vibrant Pune network of vocalists, producers, drummers, and guitarists.",
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-border bg-card/80 p-5 sm:p-6 shadow-md transition-all hover:border-primary/40 hover:-translate-y-1"
                >
                  <div className="grid size-10 sm:size-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon size={18} />
                  </div>
                  <h4 className="mt-3 sm:mt-4 font-display text-sm sm:text-base font-bold text-foreground">
                    {pillar.title}
                  </h4>
                  <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. STUDIO VISIT & LOCATION ZONE */}
      <section className="border-t border-border bg-secondary/40">
        <div className="page-shell section-space grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              label="Visit Us In Pune"
              title="A Creative Home for Every Musician."
              text="Drop by our Pune academy for an instrument walkthrough, trial consultation, or to check out the rehearsal facilities."
            />

            <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <MapPin size={14} /> Location
                </div>
                <p className="mt-1.5 font-semibold text-foreground text-sm">{studioAddress}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Maharashtra, India</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Clock3 size={14} /> Studio Timings
                </div>
                <p className="mt-1.5 font-semibold text-foreground text-sm">Mon – Sat: 10:00 AM – 8:30 PM</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sunday masterclasses & gigs</p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href={`tel:${primaryPhone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 sm:px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors text-center"
              >
                <Phone size={14} className="text-primary" /> Call Ahead: {primaryPhone}
              </a>
              <Link
                href="/contact"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center justify-center gap-1 py-1"
              >
                Contact & Studio Directions <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="relative isolate min-h-[260px] sm:min-h-[300px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl p-5 sm:p-8 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">Walkthroughs & Auditions</span>
              <h4 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Experience the studio sound before you enroll.
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Meet our instructors, test the acoustic instruments, and discuss which curriculum best matches your schedule and goals.
              </p>
            </div>

            <div className="pt-5 sm:pt-6">
              <EnquiryButton className="h-11 rounded-full px-6 sm:px-7 font-bold shadow-lg shadow-primary/20 w-full sm:w-auto text-xs sm:text-sm">
                Schedule a Studio Walkthrough <ArrowUpRight size={15} />
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRE-FOOTER INSPIRATIONAL CTA */}
      <section className="relative isolate overflow-hidden border-t border-border bg-gradient-to-r from-background via-secondary to-background py-12 sm:py-16 md:py-20 text-foreground">
        <div className="page-shell flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-xl">
            <p className="eyebrow">Your First Chord Awaits</p>
            <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
              Come as you are. Leave ready for the <span className="text-primary">stage.</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">
              Book a consultation with our faculty coordinator today. Let&apos;s talk rhythm, timing, and making great music together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
            <EnquiryButton className="h-11 sm:h-12 rounded-full px-6 sm:px-8 font-bold shadow-xl shadow-primary/25 hover:bg-primary/90 text-xs sm:text-sm text-center justify-center">
              Book Audition / Enquiry <ArrowUpRight size={16} />
            </EnquiryButton>
            <Link href="/academy" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 sm:h-12 rounded-full px-6 sm:px-7 font-bold border-border hover:bg-secondary text-xs sm:text-sm"
              >
                Browse Academy
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
