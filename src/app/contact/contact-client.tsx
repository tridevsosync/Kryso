"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock3, Mail, MapPin, Phone, Send, Loader2, Navigation, ExternalLink, Building2, Info } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { saveEnquiry, useStored } from "@/lib/kryso-storage";
import { siteSettings } from "@/data/catalog";

const INQUIRY_TYPES = [
  "General Inquiry",
  "Studio Visit & Tour",
  "Music Course & Training",
  "Live Audition",
  "Workshops & Events",
];

export function ContactClient() {
  const [settings, setSettings] = useStored("admin-settings", siteSettings);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inquiryType, setInquiryType] = useState("General Inquiry");
  const [courses, setCourses] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("admin-courses-v3");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed
              .map((c: { name?: string }) => c.name?.trim())
              .filter((n: string | undefined): n is string => Boolean(n));
          }
        }
      } catch {}
    }
    return [];
  });
  const [selectedCourse, setSelectedCourse] = useState("");

  // Sync latest site_settings & courses from MongoDB
  useEffect(() => {
    fetch("/api/collections?name=site_settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remote = data.items.find((item: { id?: string }) => item.id === "contact_info") || data.items[0];
          if (remote) {
            setSettings((prev) => ({ ...prev, ...remote }));
          }
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=academy_courses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const names = data.items
            .map((c: { name?: string }) => c.name?.trim())
            .filter((n: string | undefined): n is string => Boolean(n));
          if (names.length > 0) {
            setCourses(Array.from(new Set(names)));
          }
        }
      })
      .catch(() => {});
  }, [setSettings]);

  const primaryPhone = settings.phone || "+91 87678 28945";
  const altPhone = settings.altPhone || "+91 97673 78750";
  const email = settings.email || "krysomusicacademy@gmail.com";
  const address = settings.address || "Pune, Maharashtra, India";
  const mapLink = settings.mapUrl || "https://share.google/igDtrSdlRRRTOAV1m";

  const renderHeroTitle = (title: string) => {
    const trimmed = title.trim();
    const words = trimmed.split(/\s+/);
    if (words.length <= 1) {
      return <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">{trimmed}</span>;
    }
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")}{" "}
        <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">{lastWord}</span>
      </>
    );
  };

  const contactCards = [
    {
      Icon: MapPin,
      name: "Visit Us",
      info: address,
      href: mapLink,
    },
    {
      Icon: Phone,
      name: "Call Us (Primary)",
      info: primaryPhone,
      href: `tel:${primaryPhone.replace(/[^0-9+]/g, "")}`,
    },
    {
      Icon: Phone,
      name: "Alternate / WhatsApp",
      info: altPhone,
      href: `tel:${altPhone.replace(/[^0-9+]/g, "")}`,
    },
    {
      Icon: Mail,
      name: "Official Email",
      info: email,
      href: `mailto:${email}`,
    },
  ];

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border">
        <Image
          src={heroImage}
          alt="Concert studio atmosphere"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_25%] opacity-35 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/60" />
        <div className="page-shell py-10 sm:py-16 md:py-20">
          <p className="eyebrow">{settings.contactHeroEyebrow || "We'd love to hear from you"}</p>
          <h1 className="mt-2 sm:mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
            {renderHeroTitle(settings.contactHeroTitle || "Let's talk music.")}
          </h1>
          <p className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            {settings.contactHeroSubtitle || "Questions about concert coaching, classes or studio visits? Drop us a note or call our Pune academy directly."}
          </p>
        </div>
      </section>

      <section className="page-shell section-space grid gap-8 lg:gap-14 lg:grid-cols-[.85fr_1.15fr]">
        {/* Left column: Live Contact details */}
        <div>
          <SectionHeading
            label={settings.contactSectionLabel || "Find us in Pune"}
            title={settings.contactSectionTitle || "Say hello, or come visit the studio."}
          />
          <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4">
            {contactCards.map(({ Icon, name, info, href }) => (
              <div
                key={name}
                className="flex items-center gap-3.5 sm:gap-4 rounded-xl border border-border bg-card/60 p-3.5 sm:p-4 transition-colors hover:border-primary/50"
              >
                <span className="grid size-10 sm:size-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{name}</p>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-0.5 block truncate text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {info}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex min-h-36 sm:min-h-40 flex-col justify-between bg-secondary/80 border border-border rounded-xl p-4 sm:p-5">
            <span className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <MapPin size={14} /> {settings.contactLocationBadge || "Pune, Maharashtra"}
            </span>
            <div>
              <p className="font-display text-lg sm:text-xl font-bold text-foreground">
                {settings.contactStudioHeading || "A place for live music, near you."}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {settings.contactStudioDescription || "Get in touch for sound studio walkthroughs, auditions, and instrument trials."}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground border-t border-border/60 pt-3">
              <Clock3 size={14} className="text-primary shrink-0" />
              <span>{settings.contactStudioHours || "Mon – Sat: 10:00 AM – 8:30 PM · Sundays for masterclasses"}</span>
            </div>
          </div>
        </div>

        {/* Right column: Workable Contact Form */}
        <div className="border border-border bg-card p-5 sm:p-8 lg:p-9 rounded-2xl shadow-xl">
          <p className="eyebrow">{settings.contactFormEyebrow || "Direct Contact Form"}</p>
          <h2 className="mt-1.5 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {settings.contactFormTitle || "Send us a Message"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {settings.contactFormSubtitle || "Fill in your details below and our team will get back to you within 24 hours."}
          </p>

          {sent ? (
            <div role="status" className="mt-8 grid justify-items-center bg-secondary/80 border border-primary/30 rounded-xl p-10 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 size={30} />
              </div>
              <p className="mt-4 font-display text-xl font-bold text-foreground">Message Sent Successfully!</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Thank you for contacting Kryso Music Academy. Your message has been saved and forwarded to our team.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                onClick={() => {
                  setSent(false);
                  setSelectedCourse("");
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                const data = new FormData(e.currentTarget);
                const name = String(data.get("name") ?? "").trim();
                const phone = String(data.get("phone") ?? "").trim();
                const userEmail = String(data.get("email") ?? "").trim();
                const message = String(data.get("message") ?? "").trim();

                const combinedMessage = inquiryType !== "General Inquiry"
                  ? `[${inquiryType}] ${message}`
                  : message;

                saveEnquiry({
                  kind: "contact",
                  name,
                  phone,
                  email: userEmail,
                  course: selectedCourse || undefined,
                  message: combinedMessage,
                });

                setSubmitting(false);
                setSent(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Your Name <span className="text-primary">*</span>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Email Address <span className="text-primary">*</span>
                  <Input
                    name="email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="bg-background border-border text-foreground focus-visible:ring-primary"
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Inquiry Topic
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {INQUIRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {inquiryType === "Music Course & Training" && (
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Interested Course
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Choose a course (Optional) --</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Your Message <span className="text-primary">*</span>
                <Textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="How can we assist you? Tell us about your musical interest, questions, or visit requests..."
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
                    <Loader2 size={16} className="animate-spin mr-2" /> Sending message...
                  </>
                ) : (
                  <>
                    Send Message <Send size={16} className="ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                All messages are saved securely and delivered to Kryso administration.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Dynamic Google Map Section (Reference Image 3 Layout) */}
      {/* ---------------------------------------------------- */}
      <section className="page-shell pb-14 sm:pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary">
              {settings.contactMapEyebrow || "HEADQUARTERS LOCATION"}
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {settings.contactMapTitle || "Find Kryso Music Academy"}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
              {settings.contactMapSubtitle || settings.address || "Kryso Music Academy & Sound Studio, Pune, Maharashtra, India"}
            </p>
          </div>

          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black px-6 py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 shadow-lg shadow-amber-400/20 hover:scale-[1.03] shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Navigation size={15} className="fill-black" />
            <span>Get Driving Directions</span>
            <ExternalLink size={14} className="ml-0.5" />
          </a>
        </div>

        {/* Map Canvas Container */}
        <div className="relative mt-6 rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
          <iframe
            src={settings.mapEmbedUrl || "https://maps.google.com/maps?q=KRYSO+DJ+Academy+Pune&t=&z=15&ie=UTF8&iwloc=&output=embed"}
            className="w-full h-[400px] sm:h-[480px] md:h-[540px] border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Kryso Music Academy Location Map"
          />

          {/* Top-Left Location Badge (Reference Overlay) */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-[280px] sm:max-w-xs rounded-2xl bg-background/95 sm:bg-[#0B0F17]/90 backdrop-blur-md p-4 sm:p-5 border border-border/80 sm:border-white/10 shadow-2xl text-left pointer-events-auto">
            <h3 className="font-display font-extrabold text-xs sm:text-sm text-foreground tracking-tight uppercase">
              {settings.businessName || "KRYSO MUSIC ACADEMY"}
            </h3>
            <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wider">
              (Pune Headquarters &amp; Sound Studio)
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {settings.address || "Pune, Maharashtra, India"}
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-foreground">
              <span className="inline-flex items-center gap-1 text-amber-400">
                ★ 5.0
              </span>
              <span className="text-[11px] text-muted-foreground">(13 Reviews)</span>
              <Info size={13} className="text-muted-foreground" />
            </div>
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 hover:bg-secondary px-3 py-1.5 text-[11px] sm:text-xs font-bold text-foreground hover:text-primary border border-border transition-colors"
            >
              <ExternalLink size={12} className="text-primary" />
              <span>Open in Maps</span>
            </a>
          </div>

          {/* Bottom-Left Visiting Instructions Pill (Reference Overlay) */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 max-w-[300px] sm:max-w-sm md:max-w-md rounded-2xl bg-[#0B0F17]/95 backdrop-blur-md p-3.5 sm:p-4 border border-white/10 shadow-2xl flex items-start gap-3 pointer-events-auto">
            <div className="size-9 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 grid place-items-center shrink-0 mt-0.5">
              <Building2 size={16} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Visiting Instructions</h4>
              <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5 leading-relaxed">
                {settings.visitingInstructions || "Appointments recommended. Contact us ahead for studio walkthroughs & audition sessions."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
