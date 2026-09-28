"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useStored } from "@/lib/kryso-storage";
import { defaultSpotlightSlides, type SpotlightSlide } from "@/data/catalog";
import { formatImageUrl } from "@/lib/media-utils";
import defaultHeroImage from "@/assets/dj-producer-hero.png";

export function HomeSpotlight() {
  const [storedSlides] = useStored<SpotlightSlide[]>("admin-spotlight-slides", defaultSpotlightSlides);
  const [mongoSlides, setMongoSlides] = useState<SpotlightSlide[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync with MongoDB API on mount
  useEffect(() => {
    fetch("/api/spotlight")
      .then((res) => res.json())
      .then((data) => {
        if (data?.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          setMongoSlides(data.slides);
        }
      })
      .catch(() => {
        // Offline / fallback to storedSlides
      });
  }, []);

  const activeSlides =
    mongoSlides && mongoSlides.length > 0
      ? mongoSlides
      : storedSlides && storedSlides.length > 0
      ? storedSlides
      : defaultSpotlightSlides;

  // Auto-advance slides every 6.5s
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const safeIndex = currentIndex % activeSlides.length;
  const currentSlide = activeSlides[safeIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handleSecondaryClick = (e: React.MouseEvent) => {
    if (currentSlide.secondaryBtnLink === "enquiry" || currentSlide.secondaryBtnLink === "#enquiry") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("kryso:open-enquiry"));
    }
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
    <section className="relative isolate w-full py-4 sm:py-8 md:py-12">
      <div className="relative mx-auto max-w-[1360px] px-2 sm:px-4 lg:px-8">
        <div
          className="relative flex items-center gap-2 sm:gap-4 lg:gap-6"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Left Arrow Navigation (visible on tablet/desktop) */}
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="hidden sm:grid size-10 lg:size-12 place-items-center rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-all hover:border-primary hover:text-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20 shrink-0 z-20 backdrop-blur-md"
          >
            <ArrowLeft size={19} className="transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Carousel Content Container */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-7 items-stretch">
            {/* Text Card (order-2 on mobile, order-1 on desktop) */}
            <div className="order-2 lg:order-1 relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-md">
              <div>
                {currentSlide.tag && (
                  <div className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-primary">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="truncate max-w-[240px] sm:max-w-none">{currentSlide.tag}</span>
                  </div>
                )}
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold leading-[1.15] sm:leading-[1.12] tracking-tight text-foreground">
                  {currentSlide.title}
                </h2>
                <p className="mt-3 sm:mt-5 text-xs sm:text-sm lg:text-base leading-relaxed text-muted-foreground/90 max-w-xl">
                  {currentSlide.description}
                </p>
              </div>

              <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
                <Link
                  href={currentSlide.primaryBtnLink || "/academy"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] text-center"
                >
                  {currentSlide.primaryBtnText || "View all courses"} <ArrowRight size={16} />
                </Link>

                {currentSlide.secondaryBtnLink === "enquiry" || currentSlide.secondaryBtnLink === "#enquiry" ? (
                  <button
                    type="button"
                    onClick={handleSecondaryClick}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f05a14] px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold text-white shadow-md shadow-[#f05a14]/25 transition-all hover:bg-[#e04f0d] hover:scale-[1.02] text-center"
                  >
                    {currentSlide.secondaryBtnText || "Join the Community"} <ArrowRight size={16} />
                  </button>
                ) : (
                  <Link
                    href={currentSlide.secondaryBtnLink || "/contact"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f05a14] px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold text-white shadow-md shadow-[#f05a14]/25 transition-all hover:bg-[#e04f0d] hover:scale-[1.02] text-center"
                  >
                    {currentSlide.secondaryBtnText || "Join the Community"} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>

            {/* Image Card (order-1 on mobile, order-2 on desktop) */}
            <div className="order-1 lg:order-2 relative isolate min-h-[240px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[460px] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-secondary/80 shadow-2xl">
              {currentSlide.imageUrl && currentSlide.imageUrl !== "/dj-producer-hero.png" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formatImageUrl(currentSlide.imageUrl)}
                  alt={currentSlide.title}
                  className="absolute inset-0 size-full object-cover object-center transition-all duration-700"
                />
              ) : (
                <Image
                  src={defaultHeroImage}
                  alt={currentSlide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="absolute inset-0 size-full object-cover object-center transition-all duration-700 brightness-95 contrast-110"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Arrow Navigation (visible on tablet/desktop) */}
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="hidden sm:grid size-10 lg:size-12 place-items-center rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-all hover:border-primary hover:text-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20 shrink-0 z-20 backdrop-blur-md"
          >
            <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Navigation Controls & Slide Indicators */}
        <div className="mt-4 sm:mt-6 flex items-center justify-between sm:justify-center gap-3 px-2">
          {/* Mobile Prev Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="sm:hidden grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <ArrowLeft size={14} />
          </button>

          {/* Indicators */}
          {activeSlides.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === safeIndex ? "w-6 sm:w-8 bg-primary shadow-sm shadow-primary/30" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Mobile Next Button */}
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="sm:hidden grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

