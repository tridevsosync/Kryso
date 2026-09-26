"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock3, Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
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

  const contactCards = [
    {
      Icon: MapPin,
      name: "Visit Us",
      info: address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
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
        <div className="page-shell py-16 sm:py-20">
          <p className="eyebrow">We&apos;d love to hear from you</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl text-foreground">
            Let&apos;s talk <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">music.</span>
          </h1>
          <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
            Questions about concert coaching, classes or studio visits? Drop us a note or call our Pune academy directly.
          </p>
        </div>
      </section>

      <section className="page-shell section-space grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
        {/* Left column: Live Contact details */}
        <div>
          <SectionHeading label="Find us in Pune" title="Say hello, or come visit the studio." />
          <div className="mt-8 grid gap-4">
            {contactCards.map(({ Icon, name, info, href }) => (
              <div
                key={name}
                className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/50"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{name}</p>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-0.5 block truncate font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {info}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex min-h-40 flex-col justify-between bg-secondary/80 border border-border rounded-xl p-5">
            <span className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <MapPin size={15} /> Pune, Maharashtra
            </span>
            <div>
              <p className="font-display text-xl font-bold text-foreground">A place for live music, near you.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Get in touch for sound studio walkthroughs, auditions, and instrument trials.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <Clock3 size={15} className="text-primary shrink-0" />
              <span>Mon – Sat: 10:00 AM – 8:30 PM · Sundays for masterclasses</span>
            </div>
          </div>
        </div>

        {/* Right column: Workable Contact Form */}
        <div className="border border-border bg-card p-6 sm:p-9 rounded-2xl shadow-xl">
          <p className="eyebrow">Direct Contact Form</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">Send us a Message</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in your details below and our team will get back to you within 24 hours.
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
    </SiteShell>
  );
}
