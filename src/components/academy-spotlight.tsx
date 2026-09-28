"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useStored } from "@/lib/kryso-storage";
import { formatImageUrl } from "@/lib/media-utils";
import defaultHeroImage from "@/assets/dj-producer-hero.png";

export interface AcademySpotlightImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
}

export const defaultAcademySpotlightImages: AcademySpotlightImage[] = [
  {
    id: "img-dj-denim",
    url: "https://res.cloudinary.com/tridevsosync/image/upload/v1790413445/kryso/spotlight/dj_producer_hero_spotlight.png",
    alt: "Pro DJ Music Producer in Denim Jacket",
    caption: "Tomorrowland Certified DJ & Producer",
  },
  {
    id: "img-dj-console",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
    alt: "Live Club Decks & Studio Mixer",
    caption: "Pioneer DJ Decks & Live Sound Mixing",
  },
  {
    id: "img-studio-prod",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
    alt: "Music Studio & Audio Production",
    caption: "Acoustic Sanctuary & Studio Gear",
  },
  {
    id: "img-live-stage",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    alt: "Live Concert Energy & Lighting",
    caption: "Live Stage Focus & Concert Performance",
  },
];

export function AcademySpotlight() {
  const [storedImages] = useStored<AcademySpotlightImage[]>(
    "admin-academy-spotlight-images",
    defaultAcademySpotlightImages
  );
  const [mongoImages, setMongoImages] = useState<AcademySpotlightImage[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync with MongoDB API if configured
  useEffect(() => {
    fetch("/api/collections?name=academy_spotlight_images")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setMongoImages(data.items);
        }
      })
      .catch(() => {});
  }, []);

  const activeImages =
    mongoImages && mongoImages.length > 0
      ? mongoImages
      : storedImages && storedImages.length > 0
      ? storedImages
      : defaultAcademySpotlightImages;

  const safeIndex = currentImageIndex % activeImages.length;
  const currentImage = activeImages[safeIndex];

  const handleNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
  }, [activeImages.length]);

  const handlePrev = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  }, [activeImages.length]);

  // Auto-advance images every 5.5 seconds (paused on hover)
  useEffect(() => {
    if (activeImages.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [activeImages.length, isPaused, handleNext]);

  const handleScrollToCourses = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("kryso:open-enquiry", {
        detail: { course: "PRO DJ & MUSIC PRODUCTION" },
      })
    );
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    if (diff > 50) {
      handleNext();
      setTouchStart(null);
    } else if (diff < -50) {
      handlePrev();
      setTouchStart(null);
    }
  };

  return (
    <section className="relative isolate w-full py-4 sm:py-8 md:py-10">
      <div className="relative mx-auto max-w-[1360px] px-2 sm:px-4 lg:px-8">
        <div
          className="relative flex items-center gap-2 sm:gap-4 lg:gap-6"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow Navigation (visible on tablet/desktop) */}
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="hidden sm:grid size-10 lg:size-12 place-items-center rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-all hover:border-primary hover:text-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20 shrink-0 z-20 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft size={19} className="transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Card Container */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-7 items-stretch">
            {/* Left Content Card */}
            <div className="order-2 lg:order-1 relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-md">
              <div>
                {/* Badge */}
                <div className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-primary">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span>PRO DJ & MUSIC PRODUCTION</span>
                </div>

                {/* Title */}
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold leading-[1.15] sm:leading-[1.12] tracking-tight text-foreground">
                  Identify Yourself as pro DJ Music producer
                </h1>

                {/* Description */}
                <p className="mt-3 sm:mt-5 text-xs sm:text-sm lg:text-base leading-relaxed text-muted-foreground/90 max-w-xl">
                  Tomorrowland Academy is where music creators grow, at every stage of their journey. From first mixes
                  to polished productions, from online courses to in-person experiences, each step is designed to build
                  skills, confidence and artistic identity.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={handleScrollToCourses}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] text-center cursor-pointer"
                >
                  View all courses <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleOpenEnquiry}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f05a14] px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold text-white shadow-md shadow-[#f05a14]/25 transition-all hover:bg-[#e04f0d] hover:scale-[1.02] text-center cursor-pointer"
                >
                  enquiry <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Image Card (Dynamic & Changeable) */}
            <div className="order-1 lg:order-2 relative isolate min-h-[260px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[460px] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-secondary/80 shadow-2xl group">
              {/* Dynamic Image with Smooth Transition */}
              {currentImage?.url && currentImage.url !== "/dj-producer-hero.png" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={currentImage.id || currentImage.url}
                  src={formatImageUrl(currentImage.url)}
                  alt={currentImage.alt || "Pro DJ Music Producer"}
                  className="absolute inset-0 size-full object-cover object-center transition-all duration-700 animate-fadeIn"
                />
              ) : (
                <Image
                  src={defaultHeroImage}
                  alt="Pro DJ Music Producer"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="absolute inset-0 size-full object-cover object-center transition-all duration-700 brightness-95 contrast-110"
                />
              )}

              {/* Gradient overlay for aesthetic depth */}
              <div className="absolute inset-0 bg-linear-to-t from-background/50 via-transparent to-transparent pointer-events-none" />

              {/* Image Caption & Slide Counter Badge (Bottom overlay) */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none z-10">
                {currentImage?.caption ? (
                  <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-md px-3 py-1 text-[10px] sm:text-xs font-semibold text-foreground/90 border border-border/60">
                    {currentImage.caption}
                  </span>
                ) : (
                  <span />
                )}
                {activeImages.length > 1 && (
                  <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-primary border border-border/60">
                    {safeIndex + 1} / {activeImages.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Arrow Navigation (visible on tablet/desktop) */}
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="hidden sm:grid size-10 lg:size-12 place-items-center rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-all hover:border-primary hover:text-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20 shrink-0 z-20 backdrop-blur-md cursor-pointer"
          >
            <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Navigation Controls & Image Indicators */}
        <div className="mt-4 sm:mt-6 flex items-center justify-between sm:justify-center gap-3 px-2">
          {/* Mobile Prev Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="sm:hidden grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
          </button>

          {/* Indicators */}
          {activeImages.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {activeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    index === safeIndex
                      ? "w-6 sm:w-8 bg-primary shadow-sm shadow-primary/30"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Mobile Next Button */}
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="sm:hidden grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
