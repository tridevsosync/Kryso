"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Instagram, Menu, Phone, Mail, MapPin, ShieldAlert, Wrench, X, Youtube, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveEnquiry, useStored } from "@/lib/kryso-storage";
import { siteSettings } from "@/data/catalog";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseError, setCourseError] = useState(false);
  const [courseNames, setCourseNames] = useState<string[]>(() => {
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
  const [settings, setSettings] = useStored("admin-settings", siteSettings);

  // Sync site settings from MongoDB so maintenance mode and footer update globally
  useEffect(() => {
    fetch("/api/collections?name=site_settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remote =
            data.items.find((it: { id?: string }) => it.id === "contact_info" || it.id === "site_config") ||
            data.items[0];
          if (remote) {
            setSettings((prev) => ({ ...prev, ...remote }));
          }
        }
      })
      .catch(() => {});
  }, [setSettings]);

  // Fetch latest courses from MongoDB/collections API so only real courses created in Admin appear
  useEffect(() => {
    fetch("/api/collections?name=academy_courses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const names = data.items
            .map((item: { name?: string }) => item.name?.trim())
            .filter((name: string | undefined): name is string => Boolean(name));
          if (names.length > 0) {
            setCourseNames(Array.from(new Set(names)));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const openEnquiry = (event?: Event) => {
      const custom = event as CustomEvent<{ course?: string }>;
      if (custom?.detail?.course) {
        setSelectedCourse(custom.detail.course);
      }
      setCourseError(false);
      setEnquiryOpen(true);
    };
    window.addEventListener("kryso:open-enquiry", openEnquiry);
    return () => {
      window.removeEventListener("kryso:open-enquiry", openEnquiry);
    };
  }, []);

  const links = [
    { label: "Kryso", to: "/" },
    { label: "Music", to: "/music" },
    { label: "Academy", to: "/academy" },
    { label: "Contact", to: "/contact" },
  ];

  // If Maintenance Mode is enabled and current route is not admin, show Under Maintenance page
  if (settings.isMaintenanceMode && !pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 relative isolate overflow-hidden">
        {/* Glowing atmospheric stage effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 size-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none -z-10" />

        <header className="page-shell flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2" aria-label="KRYSO home">
            <Image
              src="/kryso-logo.png"
              alt="KRYSO"
              width={140}
              height={49}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            <span className="size-2 rounded-full bg-amber-400 animate-ping" />
            Maintenance Mode Active
          </span>
        </header>

        <main className="page-shell flex-1 flex flex-col items-center justify-center text-center my-12 max-w-2xl mx-auto">
          <div className="size-20 rounded-3xl bg-secondary/80 border border-border flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10">
            <Wrench size={34} className="animate-spin text-primary" style={{ animationDuration: "6s" }} />
          </div>

          <p className="eyebrow text-primary">System Tune-up</p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {settings.maintenanceTitle || "Under Scheduled Maintenance"}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
            {settings.maintenanceMessage ||
              "We are currently tuning our audio servers and studio gear to bring you a better musical experience. We will be back online shortly!"}
          </p>

          {/* Quick Contact & Socials during maintenance */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Phone size={14} className="text-primary" /> Call Studio
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Mail size={14} className="text-primary" /> Email Support
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Instagram size={14} className="text-primary" /> Instagram
              </a>
            )}
          </div>
        </main>

        <footer className="page-shell flex flex-wrap items-center justify-between gap-4 py-4 border-t border-border/40 text-xs text-muted-foreground">
          <span>{settings.footerText || "© 2026 Kryso Music Academy. All music, all heart."}</span>
          <Link href="/admin" className="hover:text-primary transition-colors font-medium">
            Admin Access →
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="page-shell flex h-[76px] items-center justify-between gap-4 lg:gap-8">
          <Link href="/" className="flex items-center shrink-0 py-1 group" aria-label="KRYSO home">
            <Image
              src="/kryso-logo.png"
              alt="KRYSO"
              width={140}
              height={49}
              priority
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
            {links.map((link) => {
              const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`text-sm font-semibold transition-colors hover:text-primary ${
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => {
                setCourseError(false);
                setEnquiryOpen(true);
              }}
              className="hidden h-10 rounded-full px-5 font-bold shadow-md shadow-primary/20 hover:bg-primary/90 sm:inline-flex"
            >
              Enquiry now <ArrowUpRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:bg-secondary"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="page-shell grid gap-1 border-t border-border bg-background py-3 md:hidden">
            {links.map((link) => {
              const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
              return (
                <Link
                  onClick={() => setMobileOpen(false)}
                  key={link.to}
                  href={link.to}
                  className={`rounded-md px-3 py-3 font-semibold transition-colors ${
                    isActive ? "bg-secondary text-primary font-bold" : "text-foreground hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button
              onClick={() => {
                setCourseError(false);
                setEnquiryOpen(true);
                setMobileOpen(false);
              }}
              className="mt-2 rounded-full font-bold shadow-md shadow-primary/20"
            >
              Enquiry now
            </Button>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-card text-card-foreground">
        <div className="page-shell section-space grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block py-1 group" aria-label="KRYSO home">
              <Image
                src="/kryso-logo.png"
                alt="KRYSO"
                width={130}
                height={45}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              {settings.footerDescription || settings.tagline || "Learn Music and Enjoy Music"}. A concert-grade music academy in Pune where passion meets world-class mentorship.
            </p>
            <div className="mt-5 flex items-center gap-3 text-muted-foreground">
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 hover:border-primary hover:text-primary transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 hover:border-primary hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 hover:border-primary hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="eyebrow">Explore</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <Link href="/music" className="hover:text-primary transition-colors">
                Music tracks & releases
              </Link>
              <Link href="/academy" className="hover:text-primary transition-colors">
                Music classes & academy
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact & studio visits
              </Link>
            </div>
          </div>
          <div>
            <p className="eyebrow">Say hello</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone size={14} className="text-primary shrink-0" /> {settings.phone}
                </a>
              )}
              {settings.altPhone && (
                <a href={`tel:${settings.altPhone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone size={14} className="text-primary shrink-0" /> {settings.altPhone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={14} className="text-primary shrink-0" /> {settings.email}
                </a>
              )}
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-primary shrink-0" /> {settings.address || "Pune, Maharashtra, India"}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50">
          <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-muted-foreground">
            <span>{settings.footerText || "© 2026 Kryso Music Academy. All music, all heart."}</span>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin login
            </Link>
          </div>
        </div>
      </footer>

      {/* Course Enquiry Modal Dialog */}
      <Dialog
        open={enquiryOpen}
        onOpenChange={(open) => {
          setEnquiryOpen(open);
          if (!open) {
            setSubmitted(false);
            setCourseError(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border text-card-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground">Course Enquiry & Audition</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select your desired course below. Our mentors will reach out with batches, timing, and fee details.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="rounded-xl bg-secondary/80 border border-primary/30 p-8 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 size={28} />
              </div>
              <p className="mt-4 font-display text-xl font-bold text-foreground">Enquiry Received!</p>
              <p className="mt-2 text-sm text-foreground">
                Thank you! We have registered your enquiry for:
              </p>
              <div className="mt-3 inline-block rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5 text-sm font-extrabold text-primary">
                🎵 {selectedCourse}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Our faculty will contact you shortly on your provided phone number.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full border-border hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedCourse("");
                  setEnquiryOpen(false);
                }}
              >
                Close Window
              </Button>
            </div>
          ) : (
            <form
              className="grid gap-4 mt-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!selectedCourse || selectedCourse.trim() === "") {
                  setCourseError(true);
                  return;
                }

                const data = new FormData(event.currentTarget);
                saveEnquiry({
                  kind: "course",
                  name: String(data.get("name") ?? "").trim(),
                  phone: String(data.get("phone") ?? "").trim(),
                  email: String(data.get("email") ?? "").trim(),
                  course: selectedCourse.trim(),
                  message: String(data.get("message") ?? "").trim(),
                });
                setSubmitted(true);
              }}
            >
              {/* Mandatory Course Selection */}
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
                  name="course"
                  required
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    if (e.target.value) setCourseError(false);
                  }}
                  className={`h-11 rounded-lg border bg-background px-3 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    courseError ? "border-destructive ring-1 ring-destructive" : "border-border"
                  }`}
                >
                  <option value="" disabled className="bg-background text-muted-foreground">
                    -- Choose a course (Required) * --
                  </option>
                  {courseNames.map((name) => (
                    <option key={name} value={name} className="bg-background text-foreground font-semibold">
                      {name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Select the instrument or vocal discipline you want to learn.
                </p>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Your Name <span className="text-primary">*</span>
                  <Input
                    name="name"
                    required
                    placeholder="Enter your full name"
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
                Notes or Questions
                <Textarea
                  name="message"
                  placeholder="Prior experience, preferred timing, or questions for the mentor..."
                  rows={3}
                  className="bg-background border-border text-foreground focus-visible:ring-primary"
                />
              </label>

              <Button
                type="submit"
                className="h-11 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 mt-2"
              >
                Submit Course Enquiry <ArrowUpRight size={16} />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SectionHeading({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{label}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}