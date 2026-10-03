"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Instagram, Menu, Phone, Mail, MapPin, ShieldAlert, Wrench, X, Youtube, Facebook, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveEnquiry, useStored } from "@/lib/kryso-storage";
import { siteSettings } from "@/data/catalog";
import { SpotifyIcon } from "@/components/spotify-icon";

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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "KRYSO", to: "/" },
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
            {settings.spotifyUrl && (
              <a
                href={settings.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-emerald-500 hover:text-emerald-400 transition-colors"
              >
                <SpotifyIcon size={14} className="text-emerald-400" /> Spotify
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

  const phoneDisplay = settings.altPhone || settings.phone || "+91 97673 78750";
  const phoneClean = phoneDisplay.replace(/[^0-9+]/g, "");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---------------------------------------------------- */}
      {/* WONDERFUL MODERN NAVBAR HEADER                       */}
      {/* ---------------------------------------------------- */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#030712]/90 backdrop-blur-2xl border-b border-orange-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-2 sm:py-2.5"
            : "bg-[#030712]/75 backdrop-blur-xl border-b border-border/70 py-3 sm:py-3.5"
        }`}
      >
        {/* Subtle Glowing Laser Ambient Accent Line at Bottom of Navbar */}
        <div className="absolute bottom-0 inset-x-0 h-[1.5px] animate-navbar-laser pointer-events-none opacity-85" />

        <div className="page-shell flex items-center justify-between gap-3 sm:gap-6">
          {/* 1. Left: Brand Logo with dynamic neon glow */}
          <Link href="/" className="flex items-center gap-3 shrink-0 py-0.5 group" aria-label="KRYSO home">
            <div className="relative">
              <Image
                src="/kryso-logo.png"
                alt="KRYSO"
                width={140}
                height={49}
                priority
                className="h-7 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_14px_rgba(249,115,22,0.7)]"
              />
            </div>
          </Link>

          {/* 2. Center: Floating Frosted Glass Capsule Navigation with smooth animations */}
          <nav className="hidden md:flex items-center p-1.5 rounded-full bg-secondary/70 border border-border/80 backdrop-blur-xl shadow-lg shadow-black/20 gap-1.5 relative overflow-hidden group/nav">
            {/* Ambient light shimmer effect across capsule */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 -z-0" />

            {links.map((link) => {
              const isActive = link.to === "/" ? pathname === "/" : link.to.startsWith("/#") ? false : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`relative px-4 py-1.5 rounded-full text-xs lg:text-sm font-extrabold tracking-wide transition-all duration-300 cursor-pointer select-none ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black shadow-lg shadow-orange-500/30 scale-105 animate-nav-active-pill z-10 font-black"
                      : "text-muted-foreground hover:text-white hover:bg-white/10 hover:shadow-[0_0_12px_rgba(249,115,22,0.15)] hover:scale-105"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-amber-300 blur-[2px] -z-10" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Live Call Studio with Border Glow */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Studio Call Button */}
            <a
              href={`tel:${phoneClean}`}
              className="relative overflow-hidden group/call inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-black px-3.5 sm:px-5 h-9 sm:h-10 font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.04] active:scale-95 transition-all text-xs sm:text-sm cursor-pointer border border-orange-300/60 animate-border-glow-call"
              title={`Call Studio: ${phoneDisplay}`}
              aria-label={`Call Studio: ${phoneDisplay}`}
            >
              {/* Sweeping metallic light sheen */}
              <span className="pointer-events-none absolute inset-0 -top-1 -bottom-1 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-demo-shimmer -z-0" />

              <span className="relative flex size-2 shrink-0 z-10">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-white opacity-90"></span>
                <span className="relative inline-flex rounded-full size-2 bg-white"></span>
              </span>
              <Phone size={13} className="shrink-0 z-10 group-hover/call:animate-phone-ring" />
              <span className="hidden sm:inline font-mono font-extrabold tracking-tight z-10">{phoneDisplay}</span>
              <span className="sm:hidden font-bold z-10">Call</span>
            </a>

            {/* Mobile Hamburger Toggle Button with smooth rotation transition */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden text-foreground hover:bg-secondary size-9 rounded-full border border-border/80 cursor-pointer transition-transform duration-300 ${
                mobileOpen ? "rotate-90 bg-secondary" : "rotate-0"
              }`}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={19} className="text-orange-400" /> : <Menu size={19} />}
            </Button>
          </div>
        </div>

        {/* 4. Mobile Navigation Dropdown Sheet with Staggered Entrance */}
        {mobileOpen && (
          <div className="page-shell mt-3 border-t border-orange-500/30 bg-[#030712]/95 backdrop-blur-2xl py-4 md:hidden animate-in fade-in-50 slide-in-from-top-4 duration-300 rounded-b-3xl shadow-2xl shadow-black/60 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {links.map((link, idx) => {
                const isActive = link.to === "/" ? pathname === "/" : link.to.startsWith("/#") ? false : pathname.startsWith(link.to);
                return (
                  <Link
                    onClick={() => setMobileOpen(false)}
                    key={link.to}
                    href={link.to}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 font-extrabold text-xs sm:text-sm transition-all border duration-300 animate-in fade-in-50 slide-in-from-left-2 ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-orange-300 shadow-md shadow-orange-500/25 animate-border-glow-orange font-black"
                        : "bg-secondary/60 text-foreground border-border/60 hover:bg-secondary hover:border-orange-500/40 hover:text-orange-400"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={14} className={isActive ? "text-black" : "opacity-60"} />
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={`tel:${phoneClean}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 h-11 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 font-extrabold text-black shadow-lg shadow-orange-500/25 text-xs sm:text-sm hover:opacity-95 transition-all cursor-pointer font-mono border border-orange-300/60 animate-border-glow-call"
              >
                <Phone size={15} />
                <span>Call Studio: {phoneDisplay}</span>
              </a>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="relative isolate bg-[#030712] text-white border-t border-blue-900/50 overflow-hidden">
        {/* Subtle Ambient Navy & Orange Glow in Footer */}
        <div className="pointer-events-none absolute top-0 left-1/4 size-96 rounded-full bg-blue-600/10 blur-3xl -z-10" />
        <div className="pointer-events-none absolute bottom-0 right-10 size-80 rounded-full bg-orange-500/10 blur-3xl -z-10" />

        <div className="page-shell py-12 sm:py-16">
          <div className="grid gap-10 sm:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
            {/* Col 1: Brand & Bio Story */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="inline-block py-1 group" aria-label="KRYSO home">
                <Image
                  src="/kryso-logo.png"
                  alt="KRYSO"
                  width={140}
                  height={49}
                  priority
                  className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
              <p className="max-w-md text-xs sm:text-sm leading-relaxed text-blue-200/80">
                {settings.footerDescription || `${settings.tagline || "Learn Music and Enjoy Music"}. Concert-grade sound, original releases, and world-class studio training in Pune.`}
              </p>

              {/* Social Streaming Row */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {/* 1. Spotify */}
                <a
                  href={settings.spotifyUrl || "https://open.spotify.com/artist/25uQC0WgX9Kmk64XiiF7UH"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full border border-blue-900/60 bg-[#0B152B]/80 grid place-items-center text-blue-200 hover:border-[#1DB954] hover:text-[#1DB954] hover:bg-[#1DB954]/10 transition-all hover:scale-110 shadow-xs"
                  aria-label="Spotify"
                  title="Listen on Spotify"
                >
                  <SpotifyIcon size={16} />
                </a>

                {/* 2. Instagram */}
                <a
                  href={settings.instagramUrl || "https://www.instagram.com/_krysomusic"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full border border-blue-900/60 bg-[#0B152B]/80 grid place-items-center text-blue-200 hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/10 transition-all hover:scale-110 shadow-xs"
                  aria-label="Instagram"
                  title="Instagram (@_krysomusic)"
                >
                  <Instagram size={16} />
                </a>

                {/* 3. YouTube */}
                <a
                  href={settings.youtubeUrl || "https://www.youtube.com/@krysomusic"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full border border-blue-900/60 bg-[#0B152B]/80 grid place-items-center text-blue-200 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all hover:scale-110 shadow-xs"
                  aria-label="YouTube"
                  title="YouTube (@krysomusic)"
                >
                  <Youtube size={16} />
                </a>

                {/* 4. Facebook */}
                <a
                  href={settings.facebookUrl || "https://www.facebook.com/krysomusic"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full border border-blue-900/60 bg-[#0B152B]/80 grid place-items-center text-blue-200 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all hover:scale-110 shadow-xs"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook size={16} />
                </a>

                {/* 5. WhatsApp */}
                <a
                  href={`https://wa.me/${(settings.altPhone || settings.phone || "919767378750").replace(/[^0-9]/g, "")}?text=Hello%20Kryso%2C%20I%20would%20like%20to%20connect!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full border border-blue-900/60 bg-[#0B152B]/80 grid place-items-center text-blue-200 hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all hover:scale-110 shadow-xs"
                  aria-label="WhatsApp"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                </a>
              </div>
            </div>

            {/* Col 2: Navigation / Explore */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">
                Explore Kryso
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-blue-200/80">
                <li>
                  <Link href="/" className="hover:text-orange-400 transition-colors inline-block">
                    Official Spotlight & Press
                  </Link>
                </li>
                <li>
                  <Link href="/music" className="hover:text-orange-400 transition-colors inline-block">
                    Music Tracks & Audio Releases
                  </Link>
                </li>
                <li>
                  <Link href="/academy" className="hover:text-orange-400 transition-colors inline-block">
                    Kryso Music Academy & Courses
                  </Link>
                </li>
                <li>
                  <Link href="/#techrider" className="hover:text-orange-400 transition-colors inline-block">
                    Stage Techrider Specifications
                  </Link>
                </li>
                <li>
                  <Link href="/#downloads" className="hover:text-orange-400 transition-colors inline-block">
                    Media & Press Downloads
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-orange-400 transition-colors inline-block">
                    Contact & Bookings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Direct Inquiries */}
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">
                Connect & Bookings
              </p>
              <div className="space-y-2.5 text-xs sm:text-sm text-blue-200/80">
                <a
                  href={`tel:${(settings.phone || "+91 97673 78750").replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2.5 hover:text-orange-400 transition-colors group"
                >
                  <span className="size-7 rounded-lg bg-orange-500/15 text-orange-400 grid place-items-center shrink-0 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                    <Phone size={13} />
                  </span>
                  <span>Primary: <strong className="text-white">{settings.phone || "+91 97673 78750"}</strong></span>
                </a>

                {settings.altPhone && (
                  <a
                    href={`tel:${settings.altPhone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-2.5 hover:text-orange-400 transition-colors group"
                  >
                    <span className="size-7 rounded-lg bg-orange-500/15 text-orange-400 grid place-items-center shrink-0 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                      <Phone size={13} />
                    </span>
                    <span>Studio: <strong className="text-white">{settings.altPhone}</strong></span>
                  </a>
                )}

                <a
                  href={`mailto:${settings.email || "krysomusic@gmail.com"}`}
                  className="flex items-center gap-2.5 hover:text-orange-400 transition-colors truncate group"
                >
                  <span className="size-7 rounded-lg bg-orange-500/15 text-orange-400 grid place-items-center shrink-0 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                    <Mail size={13} />
                  </span>
                  <span className="truncate">{settings.email || "krysomusic@gmail.com"}</span>
                </a>

                <div className="flex items-start gap-2.5 pt-1">
                  <span className="size-7 rounded-lg bg-orange-500/15 text-orange-400 grid place-items-center shrink-0 mt-0.5">
                    <MapPin size={13} />
                  </span>
                  <span className="leading-snug">{settings.address || "Pune, Maharashtra, India"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Admin Access Bar */}
        <div className="border-t border-blue-900/50 bg-[#070F1E]/80">
          <div className="page-shell flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs text-blue-200/70 text-center sm:text-left">
            <span>{settings.footerText || "© 2026 Kryso Music Academy. All music, all heart."}</span>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="hover:text-orange-400 text-blue-300 font-semibold transition-colors">
                Admin Console →
              </Link>
            </div>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border text-card-foreground shadow-2xl p-5 sm:p-7 w-[calc(100%-2rem)] sm:w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl sm:text-2xl text-foreground">Course Enquiry & Audition</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
              Select your desired course below. Our mentors will reach out with schedule, timing, and fee details.
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
                  Select the course discipline you want to learn.
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

      {/* Floating Action Buttons - Bottom Right (WhatsApp & Call in Circle) */}
      {!pathname.startsWith("/admin") && (
        <aside
          aria-label="Quick contact"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center gap-3 print:hidden"
        >
          {/* Call Button */}
          <a
            href="tel:9767378750"
            aria-label="Call Kryso Music Academy (9767378750)"
            title="Call 9767378750"
            className="group flex size-12 sm:size-13 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-orange-500 text-primary-foreground shadow-xl shadow-primary/35 hover:scale-110 hover:shadow-primary/50 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
          >
            <Phone size={20} className="shrink-0 animate-bounce" />
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/918767828945?text=Hello%20Kryso%20Music%20Academy%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses!"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Kryso Music Academy on WhatsApp (8767828945)"
            title="WhatsApp 8767828945"
            className="group flex size-12 sm:size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-600/35 hover:bg-[#20bd5a] hover:scale-110 hover:shadow-emerald-600/50 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
          >
            <WhatsAppIcon size={22} className="shrink-0" />
          </a>
        </aside>
      )}
    </div>
  );
}

export function WhatsAppIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function SectionHeading({ label, title, text }: { label: string; title: React.ReactNode; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{label}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}