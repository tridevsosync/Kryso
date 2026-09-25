"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useStored } from "@/lib/kryso-storage";
import { defaultSpotlightSlides, type SpotlightSlide } from "@/data/catalog";
import defaultHeroImage from "@/assets/dj-producer-hero.png";

export function HomeSpotlight() {
  const [slides] = useStored<SpotlightSlide[]>("admin-spotlight-slides", defaultSpotlightSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : defaultSpotlightSlides;
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

  return (
    <section className="page-shell py-12 md:py-16">
      <div className="relative flex items-center gap-3 sm:gap-5">
        {/* Left Arrow Navigation */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="group grid size-9 sm:size-11 place-items-center rounded-full border border-border/80 bg-card/90 text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/20 shrink-0 z-10"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Carousel Content Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* Left Text Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-7 sm:p-10 lg:p-14 shadow-2xl backdrop-blur-md">
            <div>
              {currentSlide.tag && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-primary">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  {currentSlide.tag}
                </div>
              )}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-[1.12] tracking-tight text-foreground">
                {currentSlide.title}
              </h2>
              <p className="mt-5 sm:mt-6 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xl">
                {currentSlide.description}
              </p>
            </div>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={currentSlide.primaryBtnLink || "/academy"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 sm:px-7 py-3 text-sm sm:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02]"
              >
                {currentSlide.primaryBtnText || "View all courses"} <ArrowRight size={17} />
              </Link>

              {currentSlide.secondaryBtnLink === "enquiry" || currentSlide.secondaryBtnLink === "#enquiry" ? (
                <button
                  type="button"
                  onClick={handleSecondaryClick}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f05a14] px-6 sm:px-7 py-3 text-sm sm:text-base font-bold text-white shadow-md shadow-[#f05a14]/20 transition-all hover:bg-[#e04f0d] hover:scale-[1.02]"
                >
                  {currentSlide.secondaryBtnText || "Join the Community"} <ArrowRight size={17} />
                </button>
              ) : (
                <Link
                  href={currentSlide.secondaryBtnLink || "/contact"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f05a14] px-6 sm:px-7 py-3 text-sm sm:text-base font-bold text-white shadow-md shadow-[#f05a14]/20 transition-all hover:bg-[#e04f0d] hover:scale-[1.02]"
                >
                  {currentSlide.secondaryBtnText || "Join the Community"} <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </div>

          {/* Right Image Card */}
          <div className="relative isolate min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] overflow-hidden rounded-3xl border border-border/80 bg-secondary/80 shadow-2xl">
            {currentSlide.imageUrl && currentSlide.imageUrl !== "/dj-producer-hero.png" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentSlide.imageUrl}
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

        {/* Right Arrow Navigation */}
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="group grid size-9 sm:size-11 place-items-center rounded-full border border-border/80 bg-card/90 text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/20 shrink-0 z-10"
        >
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Slide Indicators */}
      {activeSlides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                index === safeIndex ? "w-7 bg-primary shadow-sm shadow-primary/30" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
