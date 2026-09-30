"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mic2,
  Music2,
  Sparkles,
  ArrowRight,
  Headphones,
  Sliders,
  Flame,
  Radio,
  Youtube,
  Instagram,
  Disc3,
  Play,
  Globe,
  MapPin,
  Users,
  Award,
  Download,
  ExternalLink,
  FileVideo,
  Image as ImageIcon,
  FolderDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/kryso-site";
import { useStored } from "@/lib/kryso-storage";
import {
  defaultKrysoPageImages,
  defaultKrysoPageConfig,
  defaultKrysoBiography,
  defaultKrysoShowsData,
  defaultKrysoDownloads,
  type KrysoPageImage,
  type KrysoPageConfig,
  type KrysoBiography,
  type KrysoShowsData,
  type KrysoDownloadItem,
} from "@/data/catalog";
import { formatImageUrl, getVideoSourceInfo } from "@/lib/media-utils";
import { SpotifyIcon } from "@/components/spotify-icon";

export function HomeClient() {
  const [images, setImages] = useStored<KrysoPageImage[]>("admin-kryso-images", defaultKrysoPageImages);
  const [config, setConfig] = useStored<KrysoPageConfig>("admin-kryso-config", defaultKrysoPageConfig);
  const [biography, setBiography] = useStored<KrysoBiography>("admin-kryso-biography", defaultKrysoBiography);
  const [shows, setShows] = useStored<KrysoShowsData>("admin-kryso-shows", defaultKrysoShowsData);
  const [downloads, setDownloads] = useStored<KrysoDownloadItem[]>("admin-kryso-downloads", defaultKrysoDownloads);
  const [downloadFilter, setDownloadFilter] = useState<"all" | "image" | "video">("all");

  const totalTimerSeconds = config?.timerSeconds && config.timerSeconds > 0 ? config.timerSeconds : 10;
  const [showVideo, setShowVideo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Take the 3 images (or configured images)
  const displayImages = images && images.length > 0 ? images.slice(0, 3) : defaultKrysoPageImages.slice(0, 3);

  // Sync latest images, config & biography from MongoDB
  useEffect(() => {
    fetch("/api/collections?name=kryso_page_images")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setImages(data.items);
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_page_config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteConfig = data.items[0];
          if (remoteConfig) setConfig((prev) => ({ ...prev, ...remoteConfig }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_biography")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteBio = data.items[0];
          if (remoteBio) setBiography((prev) => ({ ...prev, ...remoteBio }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_shows")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteShows = data.items[0];
          if (remoteShows) setShows((prev) => ({ ...prev, ...remoteShows }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_downloads")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setDownloads(data.items);
        }
      })
      .catch(() => {});
  }, [setImages, setConfig, setBiography, setShows, setDownloads]);

  // Rotate images evenly during the 10-second period (every ~3.33s for 3 images)
  useEffect(() => {
    if (showVideo || displayImages.length === 0) return;

    const rotationIntervalMs = Math.max(1500, Math.floor((totalTimerSeconds / displayImages.length) * 1000));
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [showVideo, displayImages.length, totalTimerSeconds]);

  // Switch to video exactly after 10 seconds (totalTimerSeconds)
  useEffect(() => {
    if (showVideo) return;

    const timer = setTimeout(() => {
      setShowVideo(true);
    }, totalTimerSeconds * 1000);

    return () => clearTimeout(timer);
  }, [showVideo, totalTimerSeconds]);

  // Auto-play the video when 10 seconds elapse
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  const activeVideoUrl =
    config?.videoUrl || "https://drive.google.com/file/d/1mrKNVwkgZOpQ7plrQ56z2C7u-gog3TPf/view?usp=sharing";
  const videoSource = getVideoSourceInfo(activeVideoUrl);
  const bio = biography || defaultKrysoBiography;
  const bioImageUrl = formatImageUrl(bio.imageUrl || "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing");

  return (
    <SiteShell>
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SHOWCASE: FULLSCREEN 3 IMAGES ROTATING & 10S VIDEO PLAYBACK */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative w-full h-[65vh] sm:h-[80vh] md:h-[calc(100vh-4.75rem)] min-h-[400px] sm:min-h-[520px] bg-black overflow-hidden select-none border-b border-border/80">
        {!showVideo ? (
          <div className="relative size-full">
            {displayImages.map((img, idx) => {
              const isActive = idx === currentImageIndex;
              const resolvedUrl = formatImageUrl(img.url || "/kryso-hero.jpg");

              return (
                <div
                  key={img.id || idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
                  }`}
                  style={{ transitionProperty: "opacity, transform" }}
                >
                  <Image
                    src={resolvedUrl}
                    alt={img.title || `Kryso Image ${idx + 1}`}
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative size-full bg-black">
            {videoSource.type === "drive" || videoSource.type === "youtube" ? (
              <iframe
                src={videoSource.src}
                className="size-full border-0"
                allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; accelerometer; gyroscope"
                allowFullScreen
                title={config?.videoTitle || "KRYSO Live Showcase"}
              />
            ) : (
              <video
                ref={videoRef}
                src={encodeURI(videoSource.src)}
                className="size-full object-cover"
                autoPlay
                playsInline
                muted
                controls
                loop
              />
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. KRYSO ARTIST BIOGRAPHY SECTION                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative bg-gradient-to-b from-background via-secondary/25 to-background py-16 sm:py-24 border-b border-border/70 overflow-hidden">
        {/* Ambient Stage Lighting */}
        <div className="pointer-events-none absolute top-1/3 left-10 size-[500px] rounded-full bg-primary/15 blur-[140px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 right-10 size-[450px] rounded-full bg-amber-500/10 blur-[130px] -z-10" />

        <div className="page-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* SIDE IMAGE (Left 5 Cols) */}
            <div className="lg:col-span-5 relative max-w-md mx-auto lg:max-w-none w-full">
              <div className="relative isolate rounded-3xl overflow-hidden border-2 border-border/80 bg-card/90 shadow-2xl group hover:border-primary/60 transition-all duration-500">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bioImageUrl}
                    alt={bio.name || "Kryso"}
                    className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-hero.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-85" />

                  {/* Badge Overlays on Image */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-primary border border-primary/40 shadow-lg">
                      <Mic2 size={13} className="text-primary animate-pulse" />
                      <span>{bio.role || "Rapper & Singer"}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-display text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                      {bio.name || "Kryso"}
                    </p>
                    <p className="text-xs text-white/80 font-semibold mt-0.5 drop-shadow">
                      Pune, Maharashtra · Founder of Kryso Music Academy
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Glow Ring */}
              <div className="pointer-events-none absolute -inset-2 rounded-[32px] bg-gradient-to-r from-primary/20 via-transparent to-amber-500/20 blur-xl -z-10" />
            </div>

            {/* BIOGRAPHY CONTENT (Right 7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary mb-3">
                  <Sparkles size={13} />
                  <span>ARTIST BIOGRAPHY</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                  Meet <span className="text-primary">{bio.name || "Kryso"}</span>
                </h2>

                <p className="mt-2 font-display text-base sm:text-lg font-bold text-primary/90">
                  {bio.tagline || "Rapper, Singer, Songwriter & Music Producer"}
                </p>
              </div>

              {/* Biography Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
                <p>
                  {bio.bioParagraph1 ||
                    "Kryso is an Indian rapper, singer, songwriter, and visionary music producer known for blending lyrical storytelling, explosive rap cadence, and melodic vocal hooks. Driven by a deep passion for musical experimentation, Kryso transforms raw street emotion and contemporary rhythms into chart-ready anthems."}
                </p>
                <p>
                  {bio.bioParagraph2 ||
                    "From rocking electrifying live concert stages to crafting immersive studio soundscapes, Kryso has built a distinct sonic identity across Hip-Hop, Pop, and Electronic genres. As the creative force behind Kryso Music Academy in Pune, he mentors the next generation of vocalists, rappers, and music creators with hands-on studio training and live stage discipline."}
                </p>
                {bio.bioParagraph3 && (
                  <p>{bio.bioParagraph3}</p>
                )}
              </div>

              {/* Social / Streaming Links & Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/70">
                {bio.spotifyUrl && (
                  <a
                    href={bio.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold px-5 h-11 text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                  >
                    <SpotifyIcon size={16} />
                    <span>Listen on Spotify</span>
                  </a>
                )}

                {bio.youtubeUrl && (
                  <a
                    href={bio.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-secondary text-foreground px-4 h-11 text-xs sm:text-sm font-bold transition-all"
                  >
                    <Youtube size={16} className="text-red-500" />
                    <span>YouTube</span>
                  </a>
                )}

                {bio.instagramUrl && (
                  <a
                    href={bio.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-secondary text-foreground px-4 h-11 text-xs sm:text-sm font-bold transition-all"
                  >
                    <Instagram size={16} className="text-pink-500" />
                    <span>Instagram</span>
                  </a>
                )}

                <Link href="/academy">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full px-5 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Explore Academy</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. KRYSO AS MUSIC PRODUCER SECTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate bg-card/60 py-16 sm:py-24 border-b border-border/70 overflow-hidden">
        {/* Atmospheric Soundwave Glow */}
        <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 size-[500px] rounded-full bg-primary/10 blur-[150px] -z-10" />

        <div className="page-shell">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-border/70">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary">
                <Sliders size={13} />
                <span>STUDIO PRODUCTION & SOUND ENGINEERING</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                Kryso as <span className="text-primary">Music Producer</span>
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                From raw acoustic sessions to high-octane electronic drops, Kryso produces, mixes, and masters original tracks with modern industry-standard DAWs, custom sound synthesis, and punchy vocal chains.
              </p>
            </div>

            {/* Explore KRYSO Music Action Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/music">
                <Button className="w-full sm:w-auto h-12 rounded-full px-8 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 text-sm cursor-pointer transition-all hover:scale-105">
                  <Disc3 size={17} className="mr-2 animate-spin" style={{ animationDuration: "8s" }} />
                  <span>Explore KRYSO Music</span>
                  <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Production Highlights Pillars */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-border bg-background/80 p-6 sm:p-7 shadow-lg space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shadow-xs">
                <Sliders size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">DAW & Sound Synthesis</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Advanced beat programming, MIDI orchestration, and hardware analog synthesis across Ableton Live, FL Studio, and Logic Pro.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-6 sm:p-7 shadow-lg space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shadow-xs">
                <Mic2 size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Vocal Processing & Tuning</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pristine vocal tuning, formant shifting, harmonic stacks, dynamic compression, and spatial widening tailored for rappers and singers.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-6 sm:p-7 shadow-lg space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shadow-xs">
                <Headphones size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Mixing & Master Loudness</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Club-tested low-end control, stereo imaging, and commercial loudness optimization ready for Spotify, Apple Music, and live concert rigs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. KRYSO SHOWS & FESTIVALS SECTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate bg-[#080202] text-white py-16 sm:py-24 border-b border-red-950/40 overflow-hidden">
        {/* Stage Concert Atmosphere & Red Glow Lights */}
        <div className="pointer-events-none absolute top-0 left-1/4 size-[600px] rounded-full bg-red-600/10 blur-[180px] -z-10" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 size-[500px] rounded-full bg-red-800/10 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-black -z-10" />

        <div className="page-shell">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-400">
              <Flame size={14} className="animate-pulse text-red-500" />
              <span>LIVE CONCERTS & TOURS</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              KRYSO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-300">SHOWS</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-medium">
              Electrifying marquee festival stages across India and iconic international venues worldwide.
            </p>
          </div>

          {/* Main Grid: INDIA (Left) & INTERNATIONAL + SHARED STAGE (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* 1. INDIA FESTIVALS & MARQUEE SHOWS (Left 7 Cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-red-900/40 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-red-600/50 transition-all duration-500">
              {/* Subtle crimson gradient accent */}
              <div className="pointer-events-none absolute -top-24 -left-24 size-48 rounded-full bg-red-600/20 blur-3xl" />

              <div className="flex items-center justify-between gap-4 pb-6 border-b border-red-900/30 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <h3 className="font-display text-2xl font-black tracking-wider uppercase text-white">
                      INDIA
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold">Festivals, Arenas & Marquee Galas</p>
                  </div>
                </div>
                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-300">
                  {shows?.indiaShows?.length || defaultKrysoShowsData.indiaShows.length} Shows
                </span>
              </div>

              {/* India Shows Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(shows?.indiaShows || defaultKrysoShowsData.indiaShows).map((showName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:bg-red-950/30 hover:border-red-500/40 px-3.5 py-2.5 transition-all text-xs sm:text-sm font-semibold text-zinc-200 group/item"
                  >
                    <span className="size-1.5 rounded-full bg-red-500 shrink-0 group-hover/item:scale-150 group-hover/item:bg-red-400 transition-all shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="truncate">{showName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. INTERNATIONAL & SHARED STAGE (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* INTERNATIONAL VENUES */}
              <div className="rounded-3xl border border-red-900/40 bg-zinc-950/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-red-600/50 transition-all duration-500">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-red-900/30 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-red-500/15 text-red-400 grid place-items-center border border-red-500/30">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                        INTERNATIONAL
                      </h3>
                      <p className="text-xs text-zinc-400 font-semibold">Global Clubs & Concert Venues</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(shows?.internationalShows || defaultKrysoShowsData.internationalShows).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:bg-red-950/30 hover:border-red-500/40 px-3.5 py-2.5 transition-all group/intl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base">{item.flag || "🌐"}</span>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate group-hover/intl:text-white">
                          {item.venue}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                        {item.country}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHARED THE STAGE WITH */}
              <div className="rounded-3xl border border-red-900/40 bg-zinc-950/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-red-600/50 transition-all duration-500">
                <div className="flex items-center gap-2.5 pb-4 border-b border-red-900/30 mb-5">
                  <div className="size-9 rounded-xl bg-red-500/15 text-red-400 grid place-items-center border border-red-500/30">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                      SHARED THE STAGE WITH
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold">World-Renowned Headliners & DJs</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(shows?.sharedStageWith || defaultKrysoShowsData.sharedStageWith).map((artist, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-800/50 bg-red-950/30 hover:bg-red-900/40 hover:border-red-500/60 px-3.5 py-1.5 text-xs font-bold text-zinc-100 transition-all hover:scale-105 shadow-xs"
                    >
                      <span className="size-1.5 rounded-full bg-red-400 animate-ping" />
                      <span>{artist}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. KRYSO MEDIA & PRESS DOWNLOADS SECTION (GOOGLE DRIVE REDIRECT)  */}
      {/* ------------------------------------------------------------------ */}
      <section id="downloads" className="relative isolate bg-background py-16 sm:py-24 border-b border-border/80 overflow-hidden">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute top-10 right-1/4 size-[450px] rounded-full bg-primary/10 blur-[150px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 left-10 size-[400px] rounded-full bg-amber-500/10 blur-[140px] -z-10" />

        <div className="page-shell">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/70">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary">
                <FolderDown size={13} />
                <span>OFFICIAL MEDIA & PRESS ASSETS</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                Kryso <span className="text-primary">Downloads</span>
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Access official 4K press portraits, live concert footage, tour artwork, and promo reels. Tap any item to view or download directly from Google Drive.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-secondary/80 border border-border overflow-x-auto max-w-full shrink-0">
              <button
                type="button"
                onClick={() => setDownloadFilter("all")}
                className={`rounded-xl px-3.5 sm:px-4 py-2 text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  downloadFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                All ({(downloads || defaultKrysoDownloads).length})
              </button>
              <button
                type="button"
                onClick={() => setDownloadFilter("image")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  downloadFilter === "image"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <ImageIcon size={13} />
                <span>Photos & Posters</span>
              </button>
              <button
                type="button"
                onClick={() => setDownloadFilter("video")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  downloadFilter === "video"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <FileVideo size={13} />
                <span>Videos & Sets</span>
              </button>
            </div>
          </div>

          {/* Downloads Cards Grid */}
          {(() => {
            const list = (downloads && downloads.length > 0 ? downloads : defaultKrysoDownloads).filter((item) => {
              if (downloadFilter === "all") return true;
              return item.type === downloadFilter;
            });

            if (list.length === 0) {
              return (
                <div className="mt-8 sm:mt-12 text-center py-16 rounded-3xl border border-dashed border-border bg-card/40">
                  <FolderDown size={40} className="mx-auto text-muted-foreground mb-3 opacity-60" />
                  <h3 className="font-display text-lg font-bold text-foreground">No downloads in this category</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Check back soon or choose another filter above.</p>
                </div>
              );
            }

            return (
              <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {list.map((item) => {
                  const resolvedThumbnail = formatImageUrl(item.thumbnailUrl || "/kryso-hero.jpg");
                  const isVideo = item.type === "video";

                  return (
                    <a
                      key={item.id}
                      href={item.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col rounded-3xl border border-border bg-card/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/60 transition-all duration-300 hover:-translate-y-1.5 focus:outline-hidden focus:ring-2 focus:ring-primary"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolvedThumbnail}
                          alt={item.title}
                          className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/kryso-hero.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${
                              isVideo
                                ? "bg-red-500/80 text-white border-red-400/50"
                                : "bg-primary/80 text-primary-foreground border-primary/50"
                            }`}
                          >
                            {isVideo ? <FileVideo size={11} /> : <ImageIcon size={11} />}
                            <span>{isVideo ? "VIDEO" : "IMAGE"}</span>
                          </span>
                        </div>

                        {/* Hover Overlay Button */}
                        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Download size={14} />
                            <span>Open in Drive</span>
                            <ExternalLink size={12} />
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                        <div className="space-y-1.5">
                          {item.category && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {item.category}
                            </span>
                          )}
                          <h3 className="font-display text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Google Drive Action Bar */}
                        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                          <span className="flex items-center gap-1.5">
                            <Download size={13} />
                            <span>Download via Drive</span>
                          </span>
                          <ExternalLink size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>
    </SiteShell>
  );
}
