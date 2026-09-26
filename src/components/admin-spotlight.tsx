"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCheck,
  CloudUpload,
  Database,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStored } from "@/lib/kryso-storage";
import { defaultSpotlightSlides, type SpotlightSlide } from "@/data/catalog";
import defaultHeroImage from "@/assets/dj-producer-hero.png";

type ServiceStatus = {
  mongodb: {
    connected: boolean;
    configured: boolean;
    database: string;
    error?: string;
  };
  cloudinary: {
    configured: boolean;
    cloudName?: string;
    status?: string;
    error?: string;
  };
};

export function SpotlightManager() {
  const [slides, setSlides] = useStored<SpotlightSlide[]>("admin-spotlight-slides", defaultSpotlightSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveTarget, setSaveTarget] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load slides from MongoDB on mount
  useEffect(() => {
    fetch("/api/spotlight")
      .then((res) => res.json())
      .then((data) => {
        if (data?.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch((err) => {
        console.warn("Could not load from MongoDB:", err);
      });

    // Check Cloudinary & MongoDB health
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data?.services) {
          setStatus(data.services);
        }
      })
      .catch(() => {});
  }, [setSlides]);

  const safeIndex = Math.min(activeIndex, Math.max(0, slides.length - 1));
  const activeSlide = slides[safeIndex] || defaultSpotlightSlides[0];

  const updateActiveSlide = (fields: Partial<SpotlightSlide>) => {
    setSaved(false);
    setSlides((prev) => {
      const next = [...prev];
      if (next[safeIndex]) {
        next[safeIndex] = { ...next[safeIndex], ...fields };
      }
      return next;
    });
  };

  const handleAddSlide = () => {
    setSaved(false);
    const newSlide: SpotlightSlide = {
      id: `slide-${Date.now()}`,
      title: "Identify Yourself as pro DJ Music producer",
      description:
        "Tomorrowland Academy is where music creators grow, at every stage of their journey. From first mixes to polished productions, from online courses to in-person experiences, each step is designed to build skills, confidence and artistic identity.",
      primaryBtnText: "View all courses",
      primaryBtnLink: "/academy",
      secondaryBtnText: "Join the Community",
      secondaryBtnLink: "enquiry",
      imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790413445/kryso/spotlight/dj_producer_hero_spotlight.png",
      tag: "PRO DJ & MUSIC PRODUCTION",
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveIndex(slides.length);
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (slides.length <= 1) {
      alert("At least one slide must remain.");
      return;
    }
    setSaved(false);
    setSlides((prev) => prev.filter((_, i) => i !== indexToDelete));
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleResetDefaults = () => {
    if (confirm("Reset spotlight slides back to the default Pro DJ / Tomorrowland card?")) {
      setSlides(defaultSpotlightSlides);
      setActiveIndex(0);
      setSaved(true);
      setSaveTarget("Defaults restored");
    }
  };

  // Upload image directly to Cloudinary via Next.js API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kryso/spotlight");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload image.");
      }

      updateActiveSlide({ imageUrl: data.url });
      setSaveTarget(`Uploaded to Cloudinary (${data.provider})`);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Save to both MongoDB (via API) and localStorage
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const data = await res.json();

      if (data?.savedTo === "mongodb") {
        setSaveTarget("Saved to MongoDB Database & Browser Cache");
      } else {
        setSaveTarget("Saved to Browser Cache (MongoDB offline)");
      }
    } catch {
      setSaveTarget("Saved to Browser Cache");
    }

    setSaved(true);
  };

  return (
    <div className="space-y-8">
      {/* Service Status Notification Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2.5 rounded-full ${
                status?.cloudinary.configured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CloudUpload size={14} className="text-primary" /> Cloudinary Image Cloud
              </p>
              <p className="text-[11px] text-muted-foreground">
                {status?.cloudinary.configured
                  ? `Active (Cloud: ${status.cloudinary.cloudName})`
                  : "Checking Cloudinary credentials..."}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            Workable & Ready
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2.5 rounded-full ${
                status?.mongodb.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Database size={14} className="text-primary" /> MongoDB Database
              </p>
              <p className="text-[11px] text-muted-foreground">
                {status?.mongodb.connected
                  ? `Connected (DB: ${status.mongodb.database})`
                  : "Workable (Configured in .env + Local Sync)"}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              status?.mongodb.connected
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
            }`}
          >
            {status?.mongodb.connected ? "Connected" : "Ready / Atlas Whitelist"}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles size={14} /> HOMEPAGE HERO SPOTLIGHT MANAGER
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Hero Spotlight & DJ Producer Banner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the hero banner on the homepage. Edit headlines, descriptions, buttons, and upload stage photos to Cloudinary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="rounded-full border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
          >
            <Undo2 size={14} className="mr-1" /> Reset defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAddSlide}
            className="rounded-full font-bold shadow-md shadow-primary/20 text-xs"
          >
            <Plus size={14} className="mr-1" /> Add slide
          </Button>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            type="button"
            onClick={() => {
              setActiveIndex(idx);
              setSaved(false);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              idx === safeIndex
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span>Slide {idx + 1}:</span>
            <span className="max-w-[140px] truncate">{slide.title || "Untitled"}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h2 className="font-display text-lg font-bold text-foreground">
              Edit Slide {safeIndex + 1}
            </h2>
            {slides.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSlide(safeIndex)}
                className="text-destructive hover:bg-destructive/10 text-xs font-semibold"
              >
                <Trash2 size={14} className="mr-1" /> Remove slide
              </Button>
            )}
          </div>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tag Badge
            <Input
              value={activeSlide.tag || ""}
              placeholder="e.g. PRO DJ & MUSIC PRODUCTION"
              onChange={(e) => updateActiveSlide({ tag: e.target.value })}
              className="bg-background border-border text-foreground font-normal text-sm"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Headline Title
            <Input
              value={activeSlide.title || ""}
              placeholder="Identify Yourself as pro DJ Music producer"
              onChange={(e) => updateActiveSlide({ title: e.target.value })}
              className="bg-background border-border text-foreground font-bold text-sm"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description Text
            <Textarea
              rows={4}
              value={activeSlide.description || ""}
              placeholder="Tomorrowland Academy is where music creators grow..."
              onChange={(e) => updateActiveSlide({ description: e.target.value })}
              className="bg-background border-border text-foreground font-normal text-sm leading-relaxed"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Primary Button Text
              <Input
                value={activeSlide.primaryBtnText || ""}
                placeholder="View all courses"
                onChange={(e) => updateActiveSlide({ primaryBtnText: e.target.value })}
                className="bg-background border-border text-foreground text-sm font-normal"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Primary Button Link
              <Input
                value={activeSlide.primaryBtnLink || ""}
                placeholder="/academy"
                onChange={(e) => updateActiveSlide({ primaryBtnLink: e.target.value })}
                className="bg-background border-border text-foreground text-sm font-normal"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Secondary Button Text
              <Input
                value={activeSlide.secondaryBtnText || ""}
                placeholder="Join the Community"
                onChange={(e) => updateActiveSlide({ secondaryBtnText: e.target.value })}
                className="bg-background border-border text-foreground text-sm font-normal"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Secondary Button Link
              <Input
                value={activeSlide.secondaryBtnLink || ""}
                placeholder="enquiry or /contact"
                onChange={(e) => updateActiveSlide({ secondaryBtnLink: e.target.value })}
                className="bg-background border-border text-foreground text-sm font-normal"
              />
              <span className="text-[11px] text-muted-foreground font-normal">
                Type <strong className="text-primary">enquiry</strong> for modal or a URL like <strong className="text-primary">/contact</strong>.
              </span>
            </label>
          </div>

          {/* Cloudinary Image Upload Section */}
          <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary" /> Slide Image & Cloudinary Upload
              </span>
              {uploading && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Loader2 size={13} className="animate-spin" /> Uploading to Cloudinary...
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="cloudinary-upload-input"
              />
              <label
                htmlFor="cloudinary-upload-input"
                className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <CloudUpload size={14} /> Upload image to Cloudinary
              </label>
              <span className="text-xs text-muted-foreground">or edit the URL below directly</span>
            </div>

            {uploadError && (
              <p className="text-xs text-destructive font-medium">{uploadError}</p>
            )}

            <Input
              value={activeSlide.imageUrl || ""}
              placeholder="https://res.cloudinary.com/... or /dj-producer-hero.png"
              onChange={(e) => updateActiveSlide({ imageUrl: e.target.value })}
              className="bg-background border-border text-foreground text-sm font-normal"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/70">
            <Button
              type="submit"
              className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              Save slide changes
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on homepage."}
              </span>
            )}
          </div>
        </form>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Realtime Live Preview</p>
            <span className="text-xs text-muted-foreground">Updates as you edit</span>
          </div>

          <div className="rounded-3xl border border-border/90 bg-card p-6 shadow-2xl space-y-5">
            {activeSlide.tag && (
              <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                {activeSlide.tag}
              </span>
            )}
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
              {activeSlide.title || "Identify Yourself as pro DJ Music producer"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
              {activeSlide.description || "Tomorrowland Academy is where music creators grow..."}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm">
                {activeSlide.primaryBtnText || "View all courses"} <ArrowRight size={13} />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f05a14] px-4 py-2 text-xs font-bold text-white shadow-sm">
                {activeSlide.secondaryBtnText || "Join the Community"} <ArrowRight size={13} />
              </span>
            </div>

            <div className="relative isolate aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-secondary mt-3">
              {activeSlide.imageUrl && activeSlide.imageUrl !== "/dj-producer-hero.png" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeSlide.imageUrl}
                  alt={activeSlide.title}
                  className="size-full object-cover"
                />
              ) : (
                <Image
                  src={defaultHeroImage}
                  alt="DJ preview"
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
