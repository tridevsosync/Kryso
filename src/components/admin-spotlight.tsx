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
  GraduationCap,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStored } from "@/lib/kryso-storage";
import { defaultSpotlightSlides, type SpotlightSlide } from "@/data/catalog";
import {
  defaultAcademySpotlightImages,
  type AcademySpotlightImage,
} from "@/components/academy-spotlight";
import defaultHeroImage from "@/assets/dj-producer-hero.png";
import { formatImageUrl } from "@/lib/media-utils";

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
  const [managerTab, setManagerTab] = useState<"home" | "academy">("academy");

  // Home Slides State
  const [slides, setSlides] = useStored<SpotlightSlide[]>("admin-spotlight-slides", defaultSpotlightSlides);
  const [activeIndex, setActiveIndex] = useState(0);

  // Academy Spotlight Images State (Only images changeable for Academy card)
  const [academyImages, setAcademyImages] = useStored<AcademySpotlightImage[]>(
    "admin-academy-spotlight-images",
    defaultAcademySpotlightImages
  );
  const [activeAcademyImgIndex, setActiveAcademyImgIndex] = useState(0);

  const [saved, setSaved] = useState(false);
  const [saveTarget, setSaveTarget] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<ServiceStatus | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const academyFileInputRef = useRef<HTMLInputElement | null>(null);

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

    // Load Academy images from MongoDB collection
    fetch("/api/collections?name=academy_spotlight_images")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setAcademyImages(data.items);
        }
      })
      .catch(() => {});

    // Check Cloudinary & MongoDB health
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data?.services) {
          setStatus(data.services);
        }
      })
      .catch(() => {});
  }, [setSlides, setAcademyImages]);

  // Home slides calculations
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
    if (confirm("Reset homepage spotlight slides back to default?")) {
      setSlides(defaultSpotlightSlides);
      setActiveIndex(0);
      setSaved(true);
      setSaveTarget("Defaults restored");
    }
  };

  // Academy Image handlers
  const safeAcademyImgIndex = Math.min(activeAcademyImgIndex, Math.max(0, academyImages.length - 1));
  const activeAcademyImg = academyImages[safeAcademyImgIndex] || defaultAcademySpotlightImages[0];

  const updateActiveAcademyImage = (fields: Partial<AcademySpotlightImage>) => {
    setSaved(false);
    setAcademyImages((prev) => {
      const next = [...prev];
      if (next[safeAcademyImgIndex]) {
        next[safeAcademyImgIndex] = { ...next[safeAcademyImgIndex], ...fields };
      }
      return next;
    });
  };

  const handleAddAcademyImage = () => {
    setSaved(false);
    const newImg: AcademySpotlightImage = {
      id: `img-${Date.now()}`,
      url: "https://res.cloudinary.com/tridevsosync/image/upload/v1790413445/kryso/spotlight/dj_producer_hero_spotlight.png",
      alt: "Pro DJ Music Producer",
      caption: "New Studio & Academy Photo",
    };
    setAcademyImages((prev) => [...prev, newImg]);
    setActiveAcademyImgIndex(academyImages.length);
  };

  const handleDeleteAcademyImage = (indexToDelete: number) => {
    if (academyImages.length <= 1) {
      alert("At least one image must remain.");
      return;
    }
    setSaved(false);
    setAcademyImages((prev) => prev.filter((_, i) => i !== indexToDelete));
    setActiveAcademyImgIndex((prev) => Math.max(0, prev - 1));
  };

  const handleResetAcademyDefaults = () => {
    if (confirm("Reset Academy section spotlight images to default?")) {
      setAcademyImages(defaultAcademySpotlightImages);
      setActiveAcademyImgIndex(0);
      setSaved(true);
      setSaveTarget("Academy defaults restored");
    }
  };

  // Upload image to Cloudinary
  const handleUpload = async (file: File, onSuccess: (url: string) => void) => {
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

      onSuccess(data.url);
      setSaveTarget(`Uploaded to Cloudinary (${data.provider})`);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (academyFileInputRef.current) academyFileInputRef.current.value = "";
    }
  };

  // Save Home Slides
  const handleSaveHomeSlides = async (e: React.FormEvent) => {
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

  // Save Academy Images
  const handleSaveAcademyImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionName: "academy_spotlight_images",
          items: academyImages,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveTarget("Academy spotlight images synced to MongoDB & Browser Cache");
      } else {
        setSaveTarget("Saved to Browser Cache");
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

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-secondary/80 border border-border w-fit">
        <button
          type="button"
          onClick={() => {
            setManagerTab("academy");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            managerTab === "academy"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <GraduationCap size={15} /> Academy Section Spotlight (Only Images Changeable)
        </button>
        <button
          type="button"
          onClick={() => {
            setManagerTab("home");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            managerTab === "home"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Layers size={15} /> Homepage Hero Spotlight (Multi-Slide Text & Image)
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. ACADEMY SECTION SPOTLIGHT (ONLY IMAGES CHANGEABLE) */}
      {/* ---------------------------------------------------- */}
      {managerTab === "academy" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} /> ACADEMY SECTION SPOTLIGHT
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Academy Hero Card & Changeable Images
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                In the Academy section, the card content (<strong>Identify Yourself as pro DJ Music producer</strong>) is fixed, and only the right-side images rotate. Add or upload images below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetAcademyDefaults}
                className="rounded-full border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
              >
                <Undo2 size={14} className="mr-1" /> Reset images
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddAcademyImage}
                className="rounded-full font-bold shadow-md shadow-primary/20 text-xs"
              >
                <Plus size={14} className="mr-1" /> Add image
              </Button>
            </div>
          </div>

          {/* Image Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {academyImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => {
                  setActiveAcademyImgIndex(idx);
                  setSaved(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  idx === safeAcademyImgIndex
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <ImageIcon size={13} />
                <span>Image {idx + 1}</span>
                {img.caption && <span className="max-w-[120px] truncate opacity-80">({img.caption})</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Academy Image Editor Form (7 cols) */}
            <form
              onSubmit={handleSaveAcademyImages}
              className="lg:col-span-7 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Edit Image {safeAcademyImgIndex + 1} of {academyImages.length}
                </h2>
                {academyImages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAcademyImage(safeAcademyImgIndex)}
                    className="text-destructive hover:bg-destructive/10 text-xs font-semibold"
                  >
                    <Trash2 size={14} className="mr-1" /> Remove this image
                  </Button>
                )}
              </div>

              {/* Cloudinary Upload Section */}
              <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-primary" /> Image Upload & URL
                  </span>
                  {uploading && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Loader2 size={13} className="animate-spin" /> Uploading to Cloudinary...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={academyFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, (url) => updateActiveAcademyImage({ url }));
                    }}
                    className="hidden"
                    id="academy-cloudinary-upload-input"
                  />
                  <label
                    htmlFor="academy-cloudinary-upload-input"
                    className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors ${
                      uploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <CloudUpload size={14} /> Upload image to Cloudinary
                  </label>
                  <span className="text-xs text-muted-foreground">or paste any image URL below</span>
                </div>

                {uploadError && <p className="text-xs text-destructive font-medium">{uploadError}</p>}

                <Input
                  value={activeAcademyImg.url || ""}
                  placeholder="https://res.cloudinary.com/... or /dj-producer-hero.png"
                  onChange={(e) => updateActiveAcademyImage({ url: e.target.value })}
                  className="bg-background border-border text-foreground text-sm font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Caption / Overlay Label
                  <Input
                    value={activeAcademyImg.caption || ""}
                    placeholder="e.g. Pioneer DJ Decks & Live Mixing"
                    onChange={(e) => updateActiveAcademyImage({ caption: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Image Alt Description
                  <Input
                    value={activeAcademyImg.alt || ""}
                    placeholder="e.g. Pro DJ Music Producer"
                    onChange={(e) => updateActiveAcademyImage({ alt: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary font-bold">Note:</strong> On the Academy page, the headline (&quot;Identify Yourself as pro DJ Music producer&quot;), description and buttons are preserved exactly as shown, and the carousel will seamlessly cycle through the {academyImages.length} image(s) configured here.
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/70">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer"
                >
                  Save Academy Images
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on Academy page."}
                  </span>
                )}
              </div>
            </form>

            {/* Live Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Academy Card Preview</p>
                <span className="text-xs text-muted-foreground">Image {safeAcademyImgIndex + 1} of {academyImages.length}</span>
              </div>

              <div className="rounded-3xl border border-border/90 bg-card p-6 shadow-2xl space-y-5">
                <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  • PRO DJ & MUSIC PRODUCTION
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
                  Identify Yourself as pro DJ Music producer
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  Tomorrowland Academy is where music creators grow, at every stage of their journey. From first mixes to polished productions, from online courses to in-person experiences, each step is designed to build skills, confidence and artistic identity.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm">
                    View all courses <ArrowRight size={13} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f05a14] px-4 py-2 text-xs font-bold text-white shadow-sm">
                    enquiry <ArrowRight size={13} />
                  </span>
                </div>

                <div className="relative isolate aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-secondary mt-3">
                  {activeAcademyImg.url && activeAcademyImg.url !== "/dj-producer-hero.png" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formatImageUrl(activeAcademyImg.url)}
                      alt={activeAcademyImg.alt || "Academy DJ preview"}
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
                  {activeAcademyImg.caption && (
                    <div className="absolute bottom-2 left-2 rounded-full bg-background/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-foreground/90 border border-border/60">
                      {activeAcademyImg.caption}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. HOMEPAGE SPOTLIGHT (MULTI-SLIDE FULL CUSTOMIZATION) */}
      {/* ---------------------------------------------------- */}
      {managerTab === "home" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} /> HOMEPAGE HERO SPOTLIGHT MANAGER
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Homepage Spotlight Slides
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
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
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
            <form onSubmit={handleSaveHomeSlides} className="lg:col-span-7 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl">
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, (url) => updateActiveSlide({ imageUrl: url }));
                    }}
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
                  className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer"
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
                      src={formatImageUrl(activeSlide.imageUrl)}
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
      )}
    </div>
  );
}
