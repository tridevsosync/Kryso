"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock3,
  Disc3,
  Flame,
  GraduationCap,
  Headphones,
  MapPin,
  Mic,
  Music2,
  Phone,
  Radio,
  Sliders,
  Sparkles,
  UsersRound,
  Volume2,
} from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { EnquiryButton } from "./enquiry-button";
import { HomeSpotlight } from "@/components/home-spotlight";
import { useStored } from "@/lib/kryso-storage";
import { siteSettings } from "@/data/catalog";

const DISCIPLINES = [
  {
    id: "dj-production",
    courseName: "DJing & Music Production",
    icon: Disc3,
    badge: "Studio & Electronic",
    description:
      "Master Ableton Live, Logic Pro, Pioneer DJ decks, beat construction, EQ mixing, and club-ready transitions.",
    tags: ["Ableton & Logic", "Pioneer Decks", "Mixing & Drops"],
  },
  {
    id: "guitar",
    courseName: "Guitar",
    icon: Volume2,
    badge: "Electric & Acoustic",
    description:
      "From first chords to screaming solos, master acoustic fingerstyle, electric rock riffs, bass, and stage tone.",
    tags: ["Acoustic & Electric", "Solo Techniques", "Pedalboard Tone"],
  },
  {
    id: "piano",
    courseName: "Piano",
    icon: Music2,
    badge: "Keys & Synths",
    description:
      "Build a deep classical foundation, learn modern pop chords, arpeggios, sheet reading, and synthesizer design.",
    tags: ["88-Key Piano", "Chord Harmony", "Stage Synthesizers"],
  },
  {
    id: "drums",
    courseName: "Drums",
    icon: Radio,
    badge: "Rhythm & Tempo",
    description:
      "Develop rock-solid meter, four-limb independence, dynamic groove control, and high-energy kit performance.",
    tags: ["Acoustic Kits", "Rudiment Speed", "Double Kick Grooves"],
  },
  {
    id: "vocals",
    courseName: "Vocal singing",
    icon: Mic,
    badge: "Voice & Stage",
    description:
      "Unlock full vocal range, pitch accuracy, breath stamina, microphone control, and live stage presence.",
    tags: ["Vocal Warmups", "Pitch Control", "Stage Presence"],
  },
  {
    id: "sound-engineering",
    courseName: "Sound Engineering",
    icon: Sliders,
    badge: "Audio & Acoustics",
    description:
      "Learn live PA rigging, multitrack recording, acoustics, microphone placement, compression, and final mastering.",
    tags: ["Studio Console", "Microphone Lab", "Mastering Stems"],
  },
];

export function HomeClient() {
  const [settings] = useStored("admin-settings", siteSettings);
  const [activeTab, setActiveTab] = useState<"all" | "instruments" | "production">("all");

  const filteredDisciplines = DISCIPLINES.filter((d) => {
    if (activeTab === "all") return true;
    if (activeTab === "production") return d.id === "dj-production" || d.id === "sound-engineering";
    if (activeTab === "instruments") return d.id !== "dj-production" && d.id !== "sound-engineering";
    return true;
  });

  const primaryPhone = settings.phone || "+91 87678 28945";
  const studioAddress = settings.address || "Pune, Maharashtra, India";

  return (
    <SiteShell>
      {/* 1. HERO SPOTLIGHT CAROUSEL */}
      <section className="relative isolate min-h-[620px] overflow-hidden bg-background text-foreground md:min-h-[680px] flex items-center py-6 sm:py-10 border-b border-border/80">
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
          <div className="page-shell mb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary shadow-sm">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              KRYSO MUSIC ACADEMY · PUNE
            </div>
          </div>
          <HomeSpotlight />
        </div>
      </section>

      {/* 2. STATS & LIVE HIGHLIGHTS BAR */}
      <section className="relative -mt-6 z-20 page-shell">
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
              desc: "Sound-treated studios & high-end gear",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-card/95 p-6 sm:p-7 flex flex-col justify-between transition-colors hover:bg-secondary/70 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                    {item.number}
                  </span>
                  <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Icon size={17} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="font-display text-sm sm:text-base font-bold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CORE DISCIPLINES & ACADEMY SHOWCASE */}
      <section className="page-shell section-space">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            label="What You Can Master"
            title="Explore Disciplines & Coaching"
            text="Choose your primary instrument or production track. Every class pairs essential theory with live playing."
          />

          {/* Discipline Category Switcher */}
          <div className="flex rounded-full bg-secondary p-1 border border-border shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Disciplines
            </button>
            <button
              onClick={() => setActiveTab("instruments")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === "instruments"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Instruments & Voice
            </button>
            <button
              onClick={() => setActiveTab("production")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === "production"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              DJ & Production
            </button>
          </div>
        </div>

        {/* Disciplines Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDisciplines.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className="group relative rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid size-12 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <Icon size={24} />
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                      {d.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {d.courseName}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {d.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5 pt-2">
                    {d.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-2.5 pt-4 border-t border-border/60">
                  <Link href="/academy" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full h-10 rounded-full font-bold border-border hover:bg-secondary hover:border-primary/50 text-foreground transition-all text-xs"
                    >
                      Know More
                    </Button>
                  </Link>
                  <EnquiryButton
                    course={d.courseName}
                    className="w-full h-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all text-xs"
                  >
                    Enroll Now
                  </EnquiryButton>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center">
          <Link href="/academy">
            <Button
              variant="outline"
              className="rounded-full px-7 h-11 font-bold border-border hover:bg-secondary text-sm"
            >
              View Academy Details & Curriculum <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. THE KRYSO METHOD & PHILOSOPHY */}
      <section className="border-y border-border bg-secondary/30 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-[120px]" />

        <div className="page-shell section-space grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeading
              label="Why Choose Kryso"
              title="Music lessons built around people, not just textbooks."
              text="We believe music belongs to everyone. From your very first chord, we guide you to play with expression, confidence, and stage readiness."
            />

            <div className="mt-8 space-y-4 text-sm text-foreground">
              {[
                "1-on-1 personalized attention tailored to your exact learning style.",
                "High-end instruments & acoustic-treated practice rooms available for rehearsal.",
                "Recitals, ensemble rehearsals, and jam nights with fellow musicians.",
                "Flexible class timings fitting around your school or work schedule.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-primary mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="leading-6">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <EnquiryButton className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
                Book Free Trial Class <ArrowUpRight size={16} />
              </EnquiryButton>
              <Link
                href="/contact"
                className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                Visit our Pune studio <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Pillars Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
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
                  className="rounded-2xl border border-border bg-card/80 p-6 shadow-md transition-all hover:border-primary/40 hover:-translate-y-1"
                >
                  <div className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <h4 className="mt-4 font-display text-base font-bold text-foreground">
                    {pillar.title}
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm leading-6 text-muted-foreground">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. KRYSO MUSIC HUB SHOWCASE */}
      <section className="page-shell section-space">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            label="Kryso Sound Studio"
            title="Music Releases & Audio Stems"
            text="Discover original tracks, master recordings, and live performance sets produced by the Kryso artist collective."
          />
          <Link href="/music" className="inline-flex items-center gap-2 pb-1 font-bold text-primary hover:text-primary/80">
            Explore All Music <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-gradient-to-br from-card via-secondary/70 to-card p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 size-80 rounded-full bg-primary/15 blur-[100px]" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/30 px-3.5 py-1 text-xs font-bold text-primary">
              <Headphones size={14} /> Official Music Library
            </div>

            <h3 className="mt-5 font-display text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Stream exclusive singles, mixes and master audio files.
            </h3>

            <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
              Our artist community creates and publishes original music. Follow Kryso on YouTube, Instagram, or Facebook to unlock protected high-fidelity MP4 tracks and stems directly in your browser.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/music">
                <Button className="h-12 rounded-full px-8 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 text-sm">
                  Listen & Unlock Tracks <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <EnquiryButton
                course="DJing & Music Production"
                variant="outline"
                className="h-12 rounded-full px-7 font-bold border-border hover:bg-secondary text-sm"
              >
                Music Production Enquiry
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDIO VISIT & LOCATION ZONE */}
      <section className="border-t border-border bg-secondary/40">
        <div className="page-shell section-space grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              label="Visit Us In Pune"
              title="A Creative Home for Every Musician."
              text="Drop by our Pune academy for an instrument walkthrough, trial consultation, or to check out the rehearsal facilities."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <MapPin size={15} /> Location
                </div>
                <p className="mt-2 font-semibold text-foreground text-sm">{studioAddress}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Maharashtra, India</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Clock3 size={15} /> Studio Timings
                </div>
                <p className="mt-2 font-semibold text-foreground text-sm">Mon – Sat: 10:00 AM – 8:30 PM</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sunday masterclasses & gigs</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={`tel:${primaryPhone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Phone size={14} className="text-primary" /> Call Ahead: {primaryPhone}
              </a>
              <Link
                href="/contact"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                Contact & Studio Directions <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="relative isolate min-h-[300px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl p-8 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Walkthroughs & Auditions</span>
              <h4 className="font-display text-2xl font-bold text-foreground">
                Experience the studio sound before you enroll.
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Meet our instructors, test the acoustic instruments, and discuss which curriculum best matches your schedule and goals.
              </p>
            </div>

            <div className="pt-6">
              <EnquiryButton className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 w-full sm:w-auto">
                Schedule a Studio Walkthrough <ArrowUpRight size={16} />
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRE-FOOTER INSPIRATIONAL CTA */}
      <section className="relative isolate overflow-hidden border-t border-border bg-gradient-to-r from-background via-secondary to-background py-16 sm:py-20 text-foreground">
        <div className="page-shell flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="eyebrow">Your First Chord Awaits</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Come as you are. Leave ready for the <span className="text-primary">stage.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Book a consultation with our faculty coordinator today. Let&apos;s talk rhythm, timing, and making great music together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <EnquiryButton className="h-12 rounded-full px-8 font-bold shadow-xl shadow-primary/25 hover:bg-primary/90 text-sm">
              Book Audition / Enquiry <ArrowUpRight size={17} />
            </EnquiryButton>
            <Link href="/academy">
              <Button
                variant="outline"
                className="h-12 rounded-full px-7 font-bold border-border hover:bg-secondary text-sm"
              >
                Browse Academy
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
