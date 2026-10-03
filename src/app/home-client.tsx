"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mic2,
  Sparkles,
  ArrowRight,
  Sliders,
  Flame,
  Youtube,
  Instagram,
  Disc3,
  Play,
  Pause,
  Globe,
  Users,
  Download,
  ExternalLink,
  FileVideo,
  Image as ImageIcon,
  FolderDown,
  X,
  Tv,
  Phone,
  Mail,
  CheckCircle2,
  Volume2,
  VolumeX,
  Calendar,
  Ticket,
  MapPin,
  Clock,
  MessageCircle,
  Lock,
  Unlock,
  Music,
  Facebook,
  Loader2,
  Headphones,
  Check,
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
  defaultKrysoProducerData,
  defaultKrysoTechriderData,
  defaultMusicTracks,
  siteSettings,
  type KrysoPageImage,
  type KrysoPageConfig,
  type KrysoBiography,
  type KrysoShowsData,
  type KrysoDownloadItem,
  type KrysoProducerData,
  type KrysoTechriderData,
  type MusicTrack,
} from "@/data/catalog";
import { formatImageUrl, formatVideoUrl, getVideoSourceInfo } from "@/lib/media-utils";
import { SpotifyIcon } from "@/components/spotify-icon";

export function HomeClient() {
  const [images, setImages] = useStored<KrysoPageImage[]>("admin-kryso-images", defaultKrysoPageImages);
  const [config, setConfig] = useStored<KrysoPageConfig>("admin-kryso-config", defaultKrysoPageConfig);
  const [biography, setBiography] = useStored<KrysoBiography>("admin-kryso-biography", defaultKrysoBiography);
  const [shows, setShows] = useStored<KrysoShowsData>("admin-kryso-shows", defaultKrysoShowsData);
  const [downloads, setDownloads] = useStored<KrysoDownloadItem[]>("admin-kryso-downloads", defaultKrysoDownloads);
  const [producer, setProducer] = useStored<KrysoProducerData>("admin-kryso-producer", defaultKrysoProducerData);
  const [techrider, setTechrider] = useStored<KrysoTechriderData>("admin-kryso-techrider", defaultKrysoTechriderData);
  const [musicTracks, setMusicTracks] = useStored<MusicTrack[]>("admin-music-tracks-v1", defaultMusicTracks);
  const [downloadFilter, setDownloadFilter] = useState<"all" | "image" | "video">("all");
  const [activeVideoModal, setActiveVideoModal] = useState<KrysoDownloadItem | null>(null);

  const totalTimerSeconds = config?.timerSeconds !== undefined && config.timerSeconds >= 0 ? config.timerSeconds : 10;
  const shouldStartWithVideo = totalTimerSeconds === 0 || (config?.autoPlayVideo && totalTimerSeconds === 0);
  const [showVideo, setShowVideo] = useState(shouldStartWithVideo);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Take the 3 images (or configured images)
  const displayImages = images && images.length > 0 ? images.slice(0, 3) : defaultKrysoPageImages.slice(0, 3);

  // Sync latest images, config, biography, shows, downloads, producer & techrider from MongoDB
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
          if (remoteConfig) {
            setConfig((prev) => ({ ...prev, ...remoteConfig }));
            if (remoteConfig.timerSeconds === 0) {
              setShowVideo(true);
            }
          }
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

    fetch("/api/collections?name=kryso_producer")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteProducer = data.items[0];
          if (remoteProducer) setProducer((prev) => ({ ...prev, ...remoteProducer }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_techrider")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteTechrider = data.items[0];
          if (remoteTechrider) setTechrider((prev) => ({ ...prev, ...remoteTechrider }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=music_tracks")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setMusicTracks(data.items);
        }
      })
      .catch(() => {});
  }, [setImages, setConfig, setBiography, setShows, setDownloads, setProducer, setTechrider, setMusicTracks]);

  // Audio preview playback & download states for music in downloads section
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);
  const [lockModalTrack, setLockModalTrack] = useState<MusicTrack | null>(null);
  const [unlockedTrackIds, setUnlockedTrackIds] = useState<string[]>([]);
  const [steps, setSteps] = useState({ sp: false, yt: false, ig: false, fb: false });

  // Cleanup audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // Compute 4 Top Music Tracks (prefer tracks where isTop === true, fallback to fill 4 tracks)
  const topMusicTracks = (() => {
    const list = musicTracks && musicTracks.length > 0 ? musicTracks : defaultMusicTracks;
    const topOnly = list.filter((t) => t.isTop);
    if (topOnly.length >= 4) {
      return topOnly.slice(0, 4);
    }
    const nonTop = list.filter((t) => !t.isTop);
    return [...topOnly, ...nonTop].slice(0, 4);
  })();

  const togglePlayTrack = (track: MusicTrack) => {
    if (!track.audioUrl) return;

    if (playingTrackId === track.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(track.audioUrl);
      audioPlayerRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(track.id);
    }
  };

  const handleMusicDownloadClick = (track: MusicTrack) => {
    const isUnlocked = !track.isLocked || unlockedTrackIds.includes(track.id);
    if (isUnlocked) {
      triggerMusicDownload(track);
    } else {
      setLockModalTrack(track);
      setSteps({ sp: false, yt: false, ig: false, fb: false });
    }
  };

  const triggerMusicDownload = async (track: MusicTrack) => {
    const downloadTarget = (track.downloadUrl && track.downloadUrl.trim()) || (track.audioUrl && track.audioUrl.trim());
    if (!downloadTarget) {
      alert("No audio/ZIP download link configured for this release yet.");
      return;
    }

    setDownloadingTrackId(track.id);
    const cleanTrackName = (track.name || "Track").trim().replace(/[/\\?%*:|"<>]/g, "_");
    const cleanSingerName = (track.singer || "Kryso").trim().replace(/[/\\?%*:|"<>]/g, "_");

    try {
      const lower = downloadTarget.toLowerCase();
      const isZip = lower.includes(".zip") || (track.downloadUrl && !track.downloadUrl.match(/\.(mp3|mp4|wav|m4a)$/i));
      const isMp4 = lower.includes(".mp4");
      const isWav = lower.includes(".wav");
      const isM4a = lower.includes(".m4a");
      const ext = isZip ? ".zip" : isMp4 ? ".mp4" : isWav ? ".wav" : isM4a ? ".m4a" : ".mp3";
      const filename = `${cleanTrackName} - ${cleanSingerName}${ext}`;

      const downloadEndpoint = `/api/download?url=${encodeURIComponent(downloadTarget)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement("a");
      link.href = downloadEndpoint;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        setDownloadingTrackId(null);
      }, 1500);
    } catch (err) {
      console.error("Track download error:", err);
      window.open(downloadTarget, "_blank");
      setDownloadingTrackId(null);
    }
  };

  const markStepDone = (key: "sp" | "yt" | "ig" | "fb", url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setSteps((prev) => ({ ...prev, [key]: true }));
  };

  const completeUnlock = () => {
    if (!lockModalTrack) return;
    const currentTrack = lockModalTrack;
    setUnlockedTrackIds((prev) => [...prev, currentTrack.id]);
    setLockModalTrack(null);
    triggerMusicDownload(currentTrack);
  };

  const allStepsDone = steps.sp && steps.yt && steps.ig && steps.fb;

  const activeVideoUrl =
    config?.videoUrl || "https://drive.google.com/file/d/1mrKNVwkgZOpQ7plrQ56z2C7u-gog3TPf/view?usp=sharing";
  const videoSource = getVideoSourceInfo(activeVideoUrl);
  const bio = biography || defaultKrysoBiography;
  const bioImageUrl = formatImageUrl(bio.imageUrl || "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing");

  // Rotate images evenly during the image showcase period (e.g. every ~3.33s for 3 images in 10s)
  useEffect(() => {
    if (showVideo || displayImages.length === 0 || totalTimerSeconds === 0) return;

    const rotationIntervalMs = Math.max(1500, Math.floor((totalTimerSeconds / displayImages.length) * 1000));
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [showVideo, displayImages.length, totalTimerSeconds]);

  // Switch to video exactly after photos timer (if totalTimerSeconds > 0)
  useEffect(() => {
    if (showVideo) return;
    if (totalTimerSeconds <= 0) {
      setShowVideo(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowVideo(true);
    }, totalTimerSeconds * 1000);

    return () => clearTimeout(timer);
  }, [showVideo, totalTimerSeconds]);

  // Fallback timer for embedded YouTube / external iframe to return to photos if loop is disabled
  useEffect(() => {
    if (!showVideo) return;
    if (config?.loopVideo !== false) return;
    if (videoSource.type === "youtube" || videoSource.type === "drive") {
      const timer = setTimeout(() => {
        setShowVideo(false);
        setCurrentImageIndex(0);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [showVideo, videoSource.type, config?.loopVideo]);

  // Auto-play native video seamlessly on mount & when showVideo is triggered
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.defaultMuted = isMuted;
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If browser policy requires initial muted playback without prior gesture,
          // play with mute and auto-unmute on first user interaction
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});

            const handleFirstGesture = () => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
              }
              window.removeEventListener("click", handleFirstGesture);
              window.removeEventListener("touchstart", handleFirstGesture);
              window.removeEventListener("keydown", handleFirstGesture);
              window.removeEventListener("scroll", handleFirstGesture);
            };

            window.addEventListener("click", handleFirstGesture, { once: true });
            window.addEventListener("touchstart", handleFirstGesture, { once: true });
            window.addEventListener("keydown", handleFirstGesture, { once: true });
            window.addEventListener("scroll", handleFirstGesture, { once: true });
          }
        });
      }
    }
  }, [showVideo, isMuted]);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const [useDrivePreview, setUseDrivePreview] = useState(false);

  // Reset drive preview fallback when video URL changes
  useEffect(() => {
    setUseDrivePreview(false);
  }, [activeVideoUrl]);

  return (
    <SiteShell>
      {/* ------------------------------------------------------------------ */}
      {/* 0. FIXED PAGE BACKGROUND IMAGE (NON-MOVING ON SCROLL, ADMIN MANAGED)*/}
      {/* ------------------------------------------------------------------ */}
      {config?.backgroundImageUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formatImageUrl(config.backgroundImageUrl)}
            alt="Kryso Page Background"
            className="size-full object-cover object-center"
            style={{
              filter: config.backgroundBlur ? `blur(${config.backgroundBlur}px)` : undefined,
              transform: config.backgroundBlur ? "scale(1.05)" : undefined,
            }}
          />
          {/* Dark Overlay for Readability */}
          <div
            className="absolute inset-0 bg-[#030712]"
            style={{
              opacity:
                config.backgroundOverlayOpacity !== undefined
                  ? config.backgroundOverlayOpacity / 100
                  : 0.82,
            }}
          />
          {/* Ambient Top & Bottom Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SHOWCASE: FULLSCREEN 3 IMAGES ROTATING & VIDEO AUTO-REPEAT */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 w-full h-[65vh] sm:h-[80vh] md:h-[calc(100vh-4.75rem)] min-h-[400px] sm:min-h-[520px] bg-black overflow-hidden select-none border-b border-blue-900/40">
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

            {/* Top Controls: Play Video quick button */}
            <button
              onClick={() => {
                setShowVideo(true);
              }}
              aria-label="Play Live Video"
              className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-orange-500/50 hover:border-orange-500 transition-all shadow-lg cursor-pointer hover:scale-105 group"
            >
              <Play size={13} className="fill-orange-400 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Watch Live Video</span>
            </button>

            {/* Bottom Subtle Indicator Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? "w-6 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative size-full bg-black">
            {/* Top Controls: Back to Photos button */}
            <button
              onClick={() => {
                setShowVideo(false);
                setCurrentImageIndex(0);
              }}
              aria-label="Back to Photos"
              className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white/90 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-lg cursor-pointer hover:scale-105"
            >
              <ImageIcon size={14} className="text-orange-400" /> Back to Photos
            </button>

            {/* Native Fullscreen Video Player without any control bar */}
            <video
              ref={(el) => {
                videoRef.current = el;
              }}
              src={videoSource.src}
              className="size-full object-cover pointer-events-none"
              autoPlay
              playsInline
              muted={isMuted}
              loop={config?.loopVideo !== false}
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              onLoadedMetadata={(e) => {
                e.currentTarget.defaultMuted = isMuted;
                e.currentTarget.muted = isMuted;
                e.currentTarget.play().catch(() => {});
              }}
              onCanPlay={(e) => {
                e.currentTarget.defaultMuted = isMuted;
                e.currentTarget.muted = isMuted;
                e.currentTarget.play().catch(() => {});
              }}
              onEnded={() => {
                if (config?.loopVideo === false) {
                  setShowVideo(false);
                  setCurrentImageIndex(0);
                }
              }}
            />

            {/* ONLY MUTE / UNMUTE BUTTON IN BOTTOM RIGHT */}
            <button
              onClick={toggleSound}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              className="absolute bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-2xl transition-all hover:scale-105 cursor-pointer select-none"
            >
              {isMuted ? (
                <>
                  <VolumeX size={16} className="text-orange-400 animate-pulse" />
                  <span>Unmute Sound</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} className="text-emerald-400" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. KRYSO ARTIST BIOGRAPHY SECTION                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 bg-gradient-to-b from-[#030712]/90 via-[#0B152B]/60 to-[#030712]/90 py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden backdrop-blur-xs">
        {/* Ambient Stage & Navy Lighting */}
        <div className="pointer-events-none absolute top-1/3 left-10 size-[500px] rounded-full bg-orange-500/10 blur-[150px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 right-10 size-[450px] rounded-full bg-blue-600/15 blur-[140px] -z-10" />

        <div className="page-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* SIDE IMAGE (Left 5 Cols) */}
            <div className="lg:col-span-5 relative max-w-md mx-auto lg:max-w-none w-full">
              <div className="relative isolate rounded-3xl overflow-hidden border-2 border-blue-900/60 bg-[#0B152B]/90 shadow-2xl group hover:border-orange-500/60 transition-all duration-500">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#070F1E]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bioImageUrl}
                    alt={bio.name || "Kryso"}
                    className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-hero.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85" />

                  {/* Badge Overlays on Image */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B152B]/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-orange-400 border border-orange-500/40 shadow-lg">
                      <Mic2 size={13} className="text-orange-400 animate-pulse" />
                      <span>{bio.role || "Rapper & Singer"}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-display text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                      {bio.name || "Kryso"}
                    </p>
                    <p className="text-xs text-blue-200/90 font-semibold mt-0.5 drop-shadow">
                      Pune, Maharashtra · Founder of Kryso Music Academy
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Navy & Orange Glow Ring */}
              <div className="pointer-events-none absolute -inset-2 rounded-[32px] bg-gradient-to-r from-orange-500/20 via-blue-600/20 to-orange-500/20 blur-xl -z-10" />
            </div>

            {/* BIOGRAPHY CONTENT (Right 7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-orange-400 mb-3 shadow-xs">
                  <Sparkles size={13} />
                  <span>ARTIST BIOGRAPHY</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">{bio.name || "Kryso"}</span>
                </h2>

                <p className="mt-2 font-display text-base sm:text-lg font-bold text-orange-400/95">
                  {bio.tagline || "Rapper, Singer, Songwriter & Music Producer"}
                </p>
              </div>

              {/* Biography Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm md:text-base leading-relaxed text-blue-100/80">
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
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-blue-900/40">
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
                    className="inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-[#0B152B]/90 hover:bg-[#0E1A34] text-white px-4 h-11 text-xs sm:text-sm font-bold transition-all hover:border-orange-500/40"
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
                    className="inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-[#0B152B]/90 hover:bg-[#0E1A34] text-white px-4 h-11 text-xs sm:text-sm font-bold transition-all hover:border-orange-500/40"
                  >
                    <Instagram size={16} className="text-pink-500" />
                    <span>Instagram</span>
                  </a>
                )}

                <Link href="/academy">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full px-5 border-orange-500/50 text-orange-400 bg-orange-500/10 hover:bg-orange-500 hover:text-black font-extrabold text-xs sm:text-sm cursor-pointer transition-all shadow-xs"
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
      {/* 3. KRYSO DJ/MUSIC PRODUCER SECTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 isolate py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden bg-black/85 backdrop-blur-xs text-white">
        {/* Background Presskit Image with dark gradient overlays for pristine readability */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={formatImageUrl(producer?.bgImageUrl || defaultKrysoProducerData.bgImageUrl)}
            alt={producer?.title || "Kryso DJ / Music Producer"}
            fill
            priority
            unoptimized
            className="object-cover object-center sm:object-right-top brightness-60 contrast-110 opacity-30 sm:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-[#0B152B]/85 to-black/75 sm:to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/90" />
        </div>

        {/* Atmospheric Navy & Orange Glow */}
        <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 size-[500px] rounded-full bg-blue-600/15 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute left-10 top-1/3 size-[400px] rounded-full bg-orange-500/15 blur-[150px] -z-10" />

        <div className="page-shell relative z-10">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-blue-900/40">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-orange-400 shadow-xs">
                <Sliders size={13} />
                <span>{producer?.badge || defaultKrysoProducerData.badge}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {producer?.title?.includes("DJ") ? (
                  <>
                    {producer.title.split("DJ")[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">DJ{producer.title.split("DJ")[1]}</span>
                  </>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">{producer?.title || defaultKrysoProducerData.title}</span>
                )}
              </h2>

              <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed">
                {producer?.description || defaultKrysoProducerData.description}
              </p>
            </div>

            {/* Explore KRYSO Music Action Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/music">
                <Button className="w-full sm:w-auto h-12 rounded-full px-8 font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-90 text-black shadow-xl shadow-orange-500/25 text-sm cursor-pointer transition-all hover:scale-105 border border-orange-300/60 animate-border-glow-orange">
                  <Disc3 size={17} className="mr-2 animate-spin" style={{ animationDuration: "8s" }} />
                  <span>Explore KRYSO Music</span>
                  <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* INDUSTRY CREDENTIALS SHOWCASE CARD (Labels, TV Features, Supported By, Streaming) */}
          <div className="mt-10 rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-orange-500/15 blur-3xl -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left: Presskit Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border-2 border-blue-900/70 shadow-2xl bg-[#070F1E] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(producer?.bgImageUrl || "/kryso-music-producer-presskit.png")}
                    alt={producer?.title || "Kryso DJ / Music Producer"}
                    className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B152B]/90 backdrop-blur-md border border-orange-500/40 text-[11px] font-black uppercase tracking-wider text-orange-400">
                      <Disc3 size={12} className="text-orange-400" />
                      <span>OFFICIAL PRESSKIT</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest">
                      VERIFIED ARTIST
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Detailed Credentials Grid */}
              <div className="lg:col-span-7 space-y-7">
                {/* Header Tag */}
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-orange-400">
                    [ {producer?.title?.toUpperCase() || "KRYSO AS A MUSIC PRODUCER"} ]
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    {producer?.subtitle || defaultKrysoProducerData.subtitle}
                  </h3>
                </div>

                {/* 1. [MUSIC] / RECORD LABELS */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200/80 flex items-center gap-2">
                    <Disc3 size={14} className="text-orange-400" /> [ MUSIC & RECORD LABELS ]
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(producer?.recordLabels && producer.recordLabels.length > 0
                      ? producer.recordLabels
                      : defaultKrysoProducerData.recordLabels
                    ).map((label) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-xl border border-blue-900/50 bg-[#070F1E]/80 px-3.5 py-2.5 text-xs font-extrabold text-white hover:border-orange-500/50 hover:bg-orange-500/10 transition-all"
                      >
                        <span className="size-2 rounded-full bg-orange-400 shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. [FEATURED ON TV CHANNELS] */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200/80 flex items-center gap-2">
                    <Tv size={14} className="text-amber-400" /> [ FEATURED ON TV CHANNELS ]
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {(producer?.tvFeatures && producer.tvFeatures.length > 0
                      ? producer.tvFeatures
                      : defaultKrysoProducerData.tvFeatures
                    ).map((tv) => {
                      const lower = tv.toLowerCase();
                      if (lower.includes("mtv")) {
                        return (
                          <div key={tv} className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/90 px-4 py-2 font-black text-sm tracking-wider text-yellow-400 shadow-md">
                            <span className="font-mono text-base font-black text-white bg-red-600 px-1.5 py-0.5 rounded-xs leading-none">M</span>
                            <span>{tv}</span>
                          </div>
                        );
                      }
                      if (lower.includes("vh1")) {
                        return (
                          <div key={tv} className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/60 px-4 py-2 font-black text-sm tracking-wider text-purple-300 shadow-md">
                            <span className="font-sans font-black text-base text-white">Vh1</span>
                          </div>
                        );
                      }
                      if (lower.includes("9xm")) {
                        return (
                          <div key={tv} className="flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-950/60 px-4 py-2 font-black text-sm tracking-wider text-pink-300 shadow-md">
                            <span className="font-black text-base text-white">9XM</span>
                          </div>
                        );
                      }
                      if (lower.includes("zoom")) {
                        return (
                          <div key={tv} className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/60 px-4 py-2 font-black text-sm tracking-wider text-red-300 shadow-md">
                            <span className="size-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span>{tv}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={tv} className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-[#070F1E] px-4 py-2 font-black text-sm tracking-wider text-blue-300 shadow-md">
                          <span className="size-2.5 rounded-full bg-blue-400" />
                          <span>{tv}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. [MUSIC SUPPORTED BY] */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200/80 flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" /> [ MUSIC SUPPORTED BY ]
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {(producer?.artistSupporters && producer.artistSupporters.length > 0
                      ? producer.artistSupporters
                      : defaultKrysoProducerData.artistSupporters
                    ).map((artist) => (
                      <span
                        key={artist}
                        className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-orange-300 shadow-xs hover:border-orange-500 hover:bg-orange-500/20 transition-all"
                      >
                        <Sparkles size={11} className="text-orange-400" />
                        <span>{artist}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. STREAMING EVERYWHERE */}
                <div className="pt-2 border-t border-blue-900/40 flex flex-wrap items-center gap-2 text-blue-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200/70 mr-1">
                    STREAMING ON:
                  </span>
                  {(producer?.streamingPlatforms && producer.streamingPlatforms.length > 0
                    ? producer.streamingPlatforms
                    : defaultKrysoProducerData.streamingPlatforms
                  ).map((platform) => (
                    <span
                      key={platform.name}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#070F1E]/90 border border-blue-900/60 text-[11px] font-bold text-white"
                    >
                      <span className={`size-1.5 rounded-full ${platform.color ? platform.color.replace("text-", "bg-") : "bg-orange-500"}`} />
                      <span className={platform.color || "text-white"}>{platform.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. KRYSO MEDIA, PRESS & MUSIC DOWNLOADS SECTION                   */}
      {/* ------------------------------------------------------------------ */}
      <section id="downloads" className="relative z-10 isolate bg-[#030712]/85 backdrop-blur-xs py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute top-10 right-1/4 size-[450px] rounded-full bg-orange-500/10 blur-[150px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 left-10 size-[400px] rounded-full bg-blue-600/15 blur-[140px] -z-10" />

        <div className="page-shell space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-blue-900/40">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-orange-400">
                <FolderDown size={13} />
                <span>OFFICIAL MEDIA & PRESS ASSETS</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Kryso <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Downloads</span>
              </h2>

              <p className="text-sm sm:text-base text-blue-200/80 leading-relaxed">
                Access official 4K press portraits, live concert footage, tour artwork, and promo reels. Tap images to download, or play videos directly on the website.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[#0B152B]/90 border border-blue-900/60 overflow-x-auto max-w-full shrink-0">
              <button
                type="button"
                onClick={() => setDownloadFilter("all")}
                className={`rounded-xl px-3.5 sm:px-4 py-2 text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  downloadFilter === "all"
                    ? "bg-orange-500 text-black shadow-md shadow-orange-500/25"
                    : "text-blue-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                All ({(downloads || defaultKrysoDownloads).length})
              </button>
              <button
                type="button"
                onClick={() => setDownloadFilter("image")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  downloadFilter === "image"
                    ? "bg-orange-500 text-black shadow-md shadow-orange-500/25"
                    : "text-blue-200/70 hover:text-white hover:bg-white/5"
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
                    ? "bg-orange-500 text-black shadow-md shadow-orange-500/25"
                    : "text-blue-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileVideo size={13} />
                <span>Videos & Sets</span>
              </button>
            </div>
          </div>

          {/* 1. Image & Video Downloads Grid */}
          {(() => {
            const list = (downloads && downloads.length > 0 ? downloads : defaultKrysoDownloads).filter((item) => {
              if (downloadFilter === "all") return true;
              return item.type === downloadFilter;
            });

            if (list.length === 0) {
              return (
                <div className="mt-4 text-center py-16 rounded-3xl border border-dashed border-blue-900/60 bg-[#0B152B]/40">
                  <FolderDown size={40} className="mx-auto text-blue-300/50 mb-3 opacity-60" />
                  <h3 className="font-display text-lg font-bold text-white">No downloads in this category</h3>
                  <p className="text-xs sm:text-sm text-blue-200/70 mt-1">Check back soon or choose another filter above.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {list.map((item) => {
                  const resolvedThumbnail = formatImageUrl(item.thumbnailUrl || "/kryso-hero.jpg");
                  const isVideo = item.type === "video";

                  if (isVideo) {
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1.5"
                      >
                        {/* Video Thumbnail Container - Clicking opens video modal on website */}
                        <div
                          onClick={() => setActiveVideoModal(item)}
                          className="relative aspect-[16/10] w-full overflow-hidden bg-[#070F1E] cursor-pointer"
                        >
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
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md bg-orange-500/90 text-black border-orange-400/50">
                              <FileVideo size={11} />
                              <span>VIDEO</span>
                            </span>
                          </div>

                          {/* Center Play Button Overlay - Appears only on hover */}
                          <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-400 text-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-all">
                              <Play size={14} className="fill-current" />
                              <span>Play Video</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                          <div className="space-y-1.5">
                            {item.category && (
                              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                                {item.category}
                              </span>
                            )}
                            <h3
                              onClick={() => setActiveVideoModal(item)}
                              className="font-display text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors cursor-pointer"
                            >
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-blue-200/70 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-bold text-orange-400 group-hover:underline">
                            <a
                              href={item.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between w-full text-orange-400 hover:text-orange-300 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Download size={13} />
                                <span>Download</span>
                              </span>
                              <ExternalLink size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Image Item - Clicking anywhere redirects to Google Drive link
                  return (
                    <a
                      key={item.id}
                      href={item.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1.5 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#070F1E]">
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
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md bg-orange-500 text-black border-orange-400/50">
                            <ImageIcon size={11} />
                            <span>IMAGE</span>
                          </span>
                        </div>

                        {/* Hover Overlay Button */}
                        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 text-black font-extrabold px-4 py-2 text-xs uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Download size={14} />
                            <span>Download</span>
                            <ExternalLink size={12} />
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                        <div className="space-y-1.5">
                          {item.category && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                              {item.category}
                            </span>
                          )}
                          <h3 className="font-display text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-blue-200/70 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-bold text-orange-400 group-hover:underline">
                          <span className="flex items-center gap-1.5">
                            <Download size={13} />
                            <span>Download</span>
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

          {/* 2. 4 Music Cards Placed Under Image and Video Cards */}
          <div className="pt-6 border-t border-blue-900/40 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {topMusicTracks.map((track) => {
                const isUnlocked = !track.isLocked || unlockedTrackIds.includes(track.id);
                const isPlaying = playingTrackId === track.id;
                const isDownloading = downloadingTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-blue-900/60 bg-[#0B152B]/95 p-4 overflow-hidden shadow-xl hover:shadow-2xl hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1.5"
                  >
                    {/* Artwork Container */}
                    <div>
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#070F1E] border border-blue-900/50 shadow-inner">
                        {track.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formatImageUrl(track.imageUrl)}
                            alt={track.name}
                            className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = "/kryso-hero.jpg";
                            }}
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-blue-300/40">
                            <Music size={40} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
                            ⭐ TOP RELEASE
                          </span>
                          {track.genre && (
                            <span className="inline-flex items-center rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-300 border border-orange-500/30">
                              {track.genre}
                            </span>
                          )}
                        </div>

                        {/* Free / VIP Badge */}
                        <span
                          className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md z-10 ${
                            isUnlocked
                              ? "bg-emerald-500/90 text-white border border-emerald-400/40"
                              : "bg-amber-500/90 text-black border border-amber-400/40 animate-pulse"
                          }`}
                        >
                          {isUnlocked ? <Unlock size={10} /> : <Lock size={10} />}
                          <span>{isUnlocked ? "FREE" : "VIP"}</span>
                        </span>

                        {/* Audio Preview Play/Pause button */}
                        {track.audioUrl && (
                          <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => togglePlayTrack(track)}
                              className="size-12 rounded-full bg-orange-500 hover:bg-orange-400 text-black grid place-items-center shadow-2xl transition-all transform scale-90 group-hover:scale-100 hover:scale-110 cursor-pointer"
                              title={isPlaying ? "Pause Preview" : "Play Audio Preview"}
                            >
                              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="mt-3.5 space-y-1">
                        <h4 className="font-display text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate" title={track.name}>
                          {track.name}
                        </h4>
                        <p className="text-xs text-blue-200/70 truncate">
                          Singer / Artist: <span className="font-medium text-blue-100">{track.singer}</span>
                        </p>
                        {track.bpm && (
                          <p className="text-[11px] text-orange-400/80 font-mono">
                            {track.bpm} BPM {track.key ? `• Key: ${track.key}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Download Action Button */}
                    <div className="mt-4 pt-3 border-t border-blue-900/50">
                      <button
                        type="button"
                        onClick={() => handleMusicDownloadClick(track)}
                        disabled={isDownloading}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer ${
                          isUnlocked
                            ? "bg-orange-500 hover:bg-orange-400 text-black shadow-orange-500/20 hover:scale-[1.02]"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black shadow-amber-500/20 hover:scale-[1.02]"
                        }`}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : isUnlocked ? (
                          <>
                            <Download size={13} />
                            <span>Download Track</span>
                          </>
                        ) : (
                          <>
                            <Lock size={13} />
                            <span>Unlock & Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. View More Music Button Underneath */}
            <div className="flex items-center justify-center pt-2">
              <Link
                href="/music"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-orange-400/80 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black px-8 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-all hover:scale-105 animate-border-glow-orange cursor-pointer"
              >
                <Disc3 size={17} className="animate-spin-slow" />
                <span>View More Music</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {activeVideoModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={() => setActiveVideoModal(null)}
          >
            <div
              className="relative w-full max-w-4xl rounded-3xl border border-blue-900/80 bg-[#0B152B] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-blue-900/60 bg-[#070F1E]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0">
                    <FileVideo size={11} /> VIDEO
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white truncate">
                    {activeVideoModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="size-8 rounded-full bg-blue-950/80 hover:bg-blue-900 text-blue-200 hover:text-white grid place-items-center transition-colors cursor-pointer shrink-0 ml-2"
                  aria-label="Close video player"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Video Stream Player */}
              <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                <video
                  ref={(el) => {
                    if (el) {
                      el.playsInline = true;
                      el.defaultMuted = false;
                      const p = el.play();
                      if (p !== undefined) {
                        p.catch(() => {
                          el.muted = true;
                          el.play().catch(() => {});
                        });
                      }
                    }
                  }}
                  src={formatVideoUrl(activeVideoModal.driveUrl)}
                  controls
                  autoPlay
                  playsInline
                  className="size-full object-contain"
                />
              </div>

              {/* Modal Footer Info & Download Action */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B152B]">
                <div className="space-y-1 max-w-xl">
                  {activeVideoModal.category && (
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      {activeVideoModal.category} {activeVideoModal.fileSize ? `• ${activeVideoModal.fileSize}` : ""}
                    </p>
                  )}
                  {activeVideoModal.description && (
                    <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed">
                      {activeVideoModal.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={activeVideoModal.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold px-6 py-2.5 text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download</span>
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(null)}
                    className="rounded-full border border-blue-900/60 bg-[#070F1E] hover:bg-blue-950 px-5 py-2.5 text-xs sm:text-sm font-semibold text-blue-200 hover:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Follow-to-Unlock Modal for Locked Top Music Tracks */}
        {lockModalTrack && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={() => setLockModalTrack(null)}
          >
            <div
              className="relative w-full max-w-md rounded-3xl border border-orange-500/50 bg-[#0B152B] p-6 shadow-2xl text-white overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient Glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full bg-orange-500/20 blur-3xl" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLockModalTrack(null)}
                className="absolute top-4 right-4 size-8 rounded-full bg-blue-950/80 hover:bg-blue-900 text-blue-300 hover:text-white grid place-items-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="text-center space-y-2 pt-2">
                <div className="mx-auto size-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 grid place-items-center shadow-lg">
                  <Lock size={26} />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  Unlock Free Track
                </h3>
                <p className="text-xs text-blue-200/80 max-w-xs mx-auto">
                  Follow <span className="font-bold text-orange-400">KRYSO</span> on the official channels below to instantly unlock & download:
                </p>
                <div className="p-2.5 rounded-xl bg-[#070F1E] border border-blue-900/60 text-xs font-bold text-orange-300 truncate">
                  🎵 {lockModalTrack.name} – {lockModalTrack.singer}
                </div>
              </div>

              {/* Social Channels List */}
              <div className="mt-5 space-y-2.5">
                {/* Spotify */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] border border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#1DB954]/20 text-[#1DB954] grid place-items-center">
                      <SpotifyIcon size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Follow on Spotify</span>
                  </div>
                  {steps.sp ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-full">
                      <Check size={12} /> Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markStepDone("sp", siteSettings.spotifyUrl)}
                      className="px-3.5 py-1 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-black transition-all cursor-pointer hover:scale-105"
                    >
                      Follow
                    </button>
                  )}
                </div>

                {/* YouTube */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] border border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-red-600/20 text-red-500 grid place-items-center">
                      <Youtube size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Subscribe YouTube</span>
                  </div>
                  {steps.yt ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                      <Check size={12} /> Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markStepDone("yt", siteSettings.youtubeUrl)}
                      className="px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all cursor-pointer hover:scale-105"
                    >
                      Subscribe
                    </button>
                  )}
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] border border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-pink-500/20 text-pink-400 grid place-items-center">
                      <Instagram size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Follow Instagram</span>
                  </div>
                  {steps.ig ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full">
                      <Check size={12} /> Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markStepDone("ig", siteSettings.instagramUrl)}
                      className="px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 text-white text-xs font-black transition-all cursor-pointer hover:scale-105"
                    >
                      Follow
                    </button>
                  )}
                </div>

                {/* Facebook */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] border border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-600/20 text-blue-400 grid place-items-center">
                      <Facebook size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Follow Facebook</span>
                  </div>
                  {steps.fb ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                      <Check size={12} /> Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markStepDone("fb", siteSettings.facebookUrl)}
                      className="px-3.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all cursor-pointer hover:scale-105"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>

              {/* Complete Unlock Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={completeUnlock}
                  disabled={!allStepsDone}
                  className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    allStepsDone
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/30 hover:scale-[1.02] animate-bounce"
                      : "bg-blue-950/60 border border-blue-900 text-blue-400/50 cursor-not-allowed"
                  }`}
                >
                  <Download size={16} />
                  <span>{allStepsDone ? "Unlock & Download Now" : "Complete All 4 Steps to Unlock"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. KRYSO SHOWS & FESTIVALS SECTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 isolate bg-[#030712]/90 backdrop-blur-xs text-white py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden">
        {/* Shows Section Dynamic Background Image from Admin Panel */}
        {shows?.bgImageUrl && (
          <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formatImageUrl(shows.bgImageUrl)}
              alt="Kryso Shows Live Stage Background"
              style={{
                objectPosition: `${shows?.bgPositionX ?? 50}% ${shows?.bgPositionY ?? 50}%`,
                transform: `scale(${(shows?.bgZoom ?? 100) / 100})`,
                transformOrigin: `${shows?.bgPositionX ?? 50}% ${shows?.bgPositionY ?? 50}%`,
                filter: `brightness(${shows?.bgBrightness ?? 95}%) contrast(${shows?.bgContrast ?? 110}%) blur(${shows?.bgBlur ?? 0}px)`,
                opacity: (shows?.bgOpacity ?? 30) / 100,
              }}
              className="size-full object-cover transition-all duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/95 via-[#030712]/80 to-[#030712]/95 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Stage Concert Atmosphere & Orange/Navy Glow Lights */}
        <div className="pointer-events-none absolute top-0 left-1/4 size-[600px] rounded-full bg-blue-600/10 blur-[180px] -z-10" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 size-[500px] rounded-full bg-orange-500/10 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-black -z-10" />

        <div className="page-shell space-y-12 sm:space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-orange-400">
              <Flame size={14} className="animate-pulse text-orange-500" />
              <span>{shows?.badge || defaultKrysoShowsData.badge || "LIVE CONCERTS & TOURS"}</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              {shows?.title || defaultKrysoShowsData.title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                {shows?.titleHighlight || defaultKrysoShowsData.titleHighlight || "SHOWS"}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-blue-200/80 leading-relaxed font-medium">
              {shows?.subtitle || defaultKrysoShowsData.subtitle}
            </p>

            {/* Optional Admin-Configurable Shows Action Link / Drive Link */}
            {shows?.bgLinkUrl && (
              <div className="pt-2 flex items-center justify-center">
                <a
                  href={shows.bgLinkUrl}
                  target={shows.bgLinkUrl.startsWith("http") ? "_blank" : undefined}
                  rel={shows.bgLinkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-90 text-black font-extrabold px-6 py-2.5 text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 cursor-pointer animate-border-glow-orange border border-orange-300/60"
                >
                  <span>{shows.bgLinkText || "View Tour Highlights / Gallery"}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* UPCOMING EVENTS SLOT (ENABLE / DISABLE ANYTIME VIA ADMIN PANEL)   */}
          {/* ================================================================ */}
          {shows?.upcomingEventsEnabled !== false && (() => {
            const rawEvents = shows?.upcomingEvents || defaultKrysoShowsData.upcomingEvents || [];
            const activeEvents = rawEvents.filter((ev) => ev.isEnabled !== false);

            if (activeEvents.length === 0) return null;

            return (
              <div className="rounded-3xl border border-orange-500/40 bg-gradient-to-b from-[#0B152B]/95 via-[#070F1E]/90 to-[#030712] p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Ambient glow accent */}
                <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-orange-500/15 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-blue-600/15 blur-[120px]" />

                {/* Upcoming Events Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-blue-900/60 mb-8">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-orange-400">
                      <Calendar size={13} className="text-orange-400" />
                      <span>{shows?.upcomingEventsBadge || defaultKrysoShowsData.upcomingEventsBadge || "TOUR & GIG CALENDAR 2026"}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                      {shows?.upcomingEventsHeading || defaultKrysoShowsData.upcomingEventsHeading || "UPCOMING SHOWS & FESTIVAL DATES"}
                    </h3>

                    <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl leading-relaxed">
                      {shows?.upcomingEventsSubtext || defaultKrysoShowsData.upcomingEventsSubtext}
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 px-3.5 py-1.5 text-xs font-black text-orange-400">
                      <span className="size-2 rounded-full bg-orange-400 animate-ping" />
                      <span>{activeEvents.length} Active Gigs</span>
                    </span>

                    <a
                      href="https://wa.me/918767828945?text=Hi%20KRYSO%20Team%2C%20I%20am%20inquiring%20about%20upcoming%20tour%20events%20and%20gig%20bookings."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold px-3.5 py-1.5 text-xs tracking-wider transition-all duration-300 animate-border-glow-whatsapp"
                    >
                      <MessageCircle size={13} className="fill-current text-black" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href="tel:+918767828945"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold px-3.5 py-1.5 text-xs tracking-wider transition-all duration-300 animate-border-glow-call"
                    >
                      <Phone size={13} />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>

                {/* Upcoming Events Cards List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {activeEvents.map((event) => {
                    const isSoldOut = event.status === "sold_out";
                    const isSellingFast = event.status === "selling_fast";
                    const isComingSoon = event.status === "announcing_soon";
                    const isFreeEntry = event.status === "free_entry";

                    return (
                      <div
                        key={event.id}
                        className="group flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-2xl border border-blue-900/60 bg-[#070F1E]/90 hover:bg-[#0B152B] hover:border-orange-500/60 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                      >
                        {/* Left: Date Block & Poster Artwork */}
                        <div className="relative overflow-hidden flex sm:flex-col items-center justify-between sm:justify-center rounded-xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 p-3 sm:p-4 text-center sm:min-w-[110px] shrink-0 group/poster">
                          {event.posterUrl && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={formatImageUrl(event.posterUrl)}
                                alt={event.title}
                                className="absolute inset-0 size-full object-cover object-center opacity-30 group-hover/poster:scale-110 transition-transform duration-500 pointer-events-none"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-[#070F1E]/60 backdrop-blur-[0.5px] pointer-events-none" />
                            </>
                          )}
                          <span className="relative z-10 text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-400">
                            {event.day || "LIVE"}
                          </span>
                          <span className="relative z-10 font-display text-lg sm:text-2xl font-black text-white tracking-tight leading-tight my-0.5">
                            {event.date}
                          </span>
                          {event.time && (
                            <span className="relative z-10 inline-flex items-center gap-1 text-[10px] font-bold text-blue-200/70 sm:mt-1">
                              <Clock size={10} className="text-orange-400" />
                              <span>{event.time}</span>
                            </span>
                          )}
                        </div>

                        {/* Middle: Event Details */}
                        <div className="flex flex-1 flex-col justify-between min-w-0 space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {event.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-800/80 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                  {event.category}
                                </span>
                              )}

                              {/* Status Badges */}
                              {isSellingFast && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/50 text-[10px] font-black uppercase tracking-wider text-orange-400 animate-pulse">
                                  <Flame size={10} className="fill-current text-orange-500" />
                                  <span>Selling Fast</span>
                                </span>
                              )}
                              {isSoldOut && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider text-rose-300">
                                  <span>Sold Out</span>
                                </span>
                              )}
                              {isComingSoon && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider text-purple-300">
                                  <Sparkles size={10} />
                                  <span>Coming Soon</span>
                                </span>
                              )}
                              {isFreeEntry && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                  <span>Free Entry</span>
                                </span>
                              )}
                            </div>

                            <h4 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                              {event.title}
                            </h4>

                            <div className="flex items-center gap-1.5 text-xs text-blue-200/80">
                              <MapPin size={13} className="text-orange-400 shrink-0" />
                              <span className="font-medium truncate">
                                {event.venue}{event.city ? ` • ${event.city}` : ""}
                              </span>
                            </div>
                          </div>

                          {/* Right / Bottom Action */}
                          <div className="pt-2 sm:pt-0 flex items-center justify-between gap-3">
                            {isSoldOut ? (
                              <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-900/60 text-blue-400/60 px-4 py-2 text-xs font-bold cursor-not-allowed opacity-75"
                              >
                                <span>Sold Out</span>
                              </button>
                            ) : event.ticketUrl ? (
                              <a
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold px-5 py-2 text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all hover:scale-105 cursor-pointer"
                              >
                                <Ticket size={13} />
                                <span>{event.ticketLabel || "Get Tickets"}</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <Link
                                href="/contact"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-blue-800/80 bg-[#0B152B]/80 hover:bg-blue-900/60 text-white px-4 py-2 text-xs font-bold transition-colors"
                              >
                                <span>Inquire / RSVP</span>
                                <ArrowRight size={12} className="text-orange-400" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ================================================================ */}
          {/* PAST FESTIVALS & GLOBAL RESIDENCIES GRID                         */}
          {/* ================================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* 1. INDIA FESTIVALS & MARQUEE SHOWS (Left 7 Cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all duration-500">
              {/* Subtle orange gradient accent */}
              <div className="pointer-events-none absolute -top-24 -left-24 size-48 rounded-full bg-orange-500/15 blur-3xl" />

              <div className="flex items-center justify-between gap-4 pb-6 border-b border-blue-900/50 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <h3 className="font-display text-2xl font-black tracking-wider uppercase text-white">
                      {shows?.indiaSectionTitle || defaultKrysoShowsData.indiaSectionTitle || "INDIA FESTIVALS & SHOWS"}
                    </h3>
                    <p className="text-xs text-blue-200/70 font-semibold">Festivals, Arenas & Marquee Galas</p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-300">
                  {shows?.indiaShows?.length || defaultKrysoShowsData.indiaShows.length} Shows
                </span>
              </div>

              {/* India Shows Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(shows?.indiaShows || defaultKrysoShowsData.indiaShows).map((showName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-blue-900/40 bg-[#070F1E]/80 hover:bg-orange-500/10 hover:border-orange-500/40 px-3.5 py-2.5 transition-all text-xs sm:text-sm font-semibold text-blue-100 group/item"
                  >
                    <span className="size-1.5 rounded-full bg-orange-500 shrink-0 group-hover/item:scale-150 group-hover/item:bg-orange-400 transition-all shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="truncate">{showName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. INTERNATIONAL & SHARED STAGE (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* INTERNATIONAL VENUES */}
              <div className="rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all duration-500">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-blue-900/50 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-orange-500/15 text-orange-400 grid place-items-center border border-orange-500/30">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                        {shows?.internationalSectionTitle || defaultKrysoShowsData.internationalSectionTitle || "INTERNATIONAL"}
                      </h3>
                      <p className="text-xs text-blue-200/70 font-semibold">Global Clubs & Concert Venues</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(shows?.internationalShows || defaultKrysoShowsData.internationalShows).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-blue-900/40 bg-[#070F1E]/80 hover:bg-orange-500/10 hover:border-orange-500/40 px-3.5 py-2.5 transition-all group/intl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base">{item.flag || "🌐"}</span>
                        <span className="text-xs sm:text-sm font-semibold text-blue-100 truncate group-hover/intl:text-white">
                          {item.venue}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-md bg-[#070F1E] border border-blue-800/60 px-2 py-0.5 text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                        {item.country}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHARED THE STAGE WITH */}
              <div className="rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all duration-500">
                <div className="flex items-center gap-2.5 pb-4 border-b border-blue-900/50 mb-5">
                  <div className="size-9 rounded-xl bg-orange-500/15 text-orange-400 grid place-items-center border border-orange-500/30">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                      {shows?.sharedStageTitle || defaultKrysoShowsData.sharedStageTitle || "SHARED THE STAGE WITH"}
                    </h3>
                    <p className="text-xs text-blue-200/70 font-semibold">World-Renowned Headliners & DJs</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(shows?.sharedStageWith || defaultKrysoShowsData.sharedStageWith).map((artist, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-800/60 bg-[#070F1E]/80 hover:bg-orange-500/20 hover:border-orange-500/60 px-3.5 py-1.5 text-xs font-bold text-blue-100 transition-all hover:scale-105 shadow-xs"
                    >
                      <span className="size-1.5 rounded-full bg-orange-400 animate-ping" />
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
      {/* 6. KRYSO TECHRIDER & BOOKINGS CONTACT SECTION                     */}
      {/* ------------------------------------------------------------------ */}
      <section id="techrider" className="relative z-10 isolate bg-[#030712]/85 backdrop-blur-xs py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden">
        {/* Ambient background glow matching navy and warm orange lights */}
        <div className="pointer-events-none absolute top-12 left-10 size-[500px] rounded-full bg-blue-600/10 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 right-10 size-[450px] rounded-full bg-orange-500/10 blur-[150px] -z-10" />

        <div className="page-shell space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-blue-900/40">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-orange-400">
                <Sliders size={13} />
                <span>{techrider?.badge || defaultKrysoTechriderData.badge}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {techrider?.sectionTitle?.includes("&") ? (
                  <>
                    {techrider.sectionTitle.split("&")[0]}& <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">{techrider.sectionTitle.split("&")[1]?.trim()}</span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">{techrider?.sectionTitle || defaultKrysoTechriderData.sectionTitle}</span>
                )}
              </h2>
              <p className="text-sm sm:text-base text-blue-200/80 leading-relaxed">
                {techrider?.sectionSubtitle || defaultKrysoTechriderData.sectionSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={techrider?.bookingPhone ? `tel:${techrider.bookingPhone.replace(/\s+/g, "")}` : "tel:+919767378750"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm transition-transform hover:scale-105 shadow-lg shadow-orange-500/25"
              >
                <Phone size={16} />
                <span>Book Kryso Now</span>
              </a>
            </div>
          </div>

          {/* Main Grid: Left image poster card + Right specs & contacts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Presskit Visual Card */}
            <div className="lg:col-span-5 relative group">
              <div className="relative overflow-hidden rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={formatImageUrl(techrider?.posterImageUrl || defaultKrysoTechriderData.posterImageUrl)}
                    alt={techrider?.posterTitle || "Kryso Techrider & Contact Press Card"}
                    fill
                    unoptimized
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-[#0B152B]/90 backdrop-blur-md px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-orange-400 shadow-md">
                    <Sparkles size={12} className="text-orange-400" />
                    <span>Official Press Spec</span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#0B152B]/90 backdrop-blur-md border border-blue-900/60 space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-orange-400">{techrider?.posterSubtitle || defaultKrysoTechriderData.posterSubtitle}</p>
                    <p className="text-lg font-black text-white leading-snug">{techrider?.posterTitle || defaultKrysoTechriderData.posterTitle}</p>
                    <div className="flex items-center justify-between text-xs text-blue-200/80 pt-1">
                      <span>Pro Audio & Visual Rider</span>
                      <span className="text-orange-400 font-bold">Standard Stage Setup</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Techrider & Contact Cards */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: [TECHRIDER] Stage Technical Requirements */}
              <div className="rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
                      <Sliders size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">[TECHRIDER]</span>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{techrider?.techriderTitle || defaultKrysoTechriderData.techriderTitle}</h3>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300">
                    <CheckCircle2 size={13} className="text-orange-400" />
                    Mandatory
                  </span>
                </div>

                {/* Tech Specs Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(techrider?.techriderItems && techrider.techriderItems.length > 0
                    ? techrider.techriderItems
                    : defaultKrysoTechriderData.techriderItems
                  ).map((item, idx) => {
                    const isWide = idx >= 2 || item.spec.length > 30;
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-4 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-orange-500/40 transition-all flex items-start gap-3.5 group ${
                          isWide ? "sm:col-span-2" : ""
                        }`}
                      >
                        <div className="size-8 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shrink-0 font-mono font-black text-xs group-hover:scale-110 transition-transform">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">{item.category}</p>
                          <p className="text-sm font-black text-white tracking-wide">{item.spec}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: [CONTACT] Bookings & Direct Channels */}
              <div className="rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">[CONTACT]</span>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{techrider?.contactTitle || defaultKrysoTechriderData.contactTitle}</h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
                    Available Worldwide
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Phone / Bookings */}
                  <a
                    href={techrider?.bookingPhone ? `tel:${techrider.bookingPhone.replace(/\s+/g, "")}` : "tel:+919767378750"}
                    className="p-4 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-orange-500/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">FOR BOOKINGS</p>
                      <p className="text-base font-extrabold text-white group-hover:text-orange-400 transition-colors">
                        {techrider?.bookingPhone || defaultKrysoTechriderData.bookingPhone}
                      </p>
                    </div>
                    <div className="size-8 rounded-full bg-orange-500/10 group-hover:bg-orange-500 text-orange-400 group-hover:text-black flex items-center justify-center transition-all">
                      <Phone size={14} />
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={techrider?.bookingEmail ? `mailto:${techrider.bookingEmail}` : "mailto:krysomusic@gmail.com"}
                    className="p-4 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-orange-500/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1 truncate pr-2">
                      <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">EMAIL INQUIRIES</p>
                      <p className="text-sm sm:text-base font-extrabold text-white group-hover:text-orange-400 transition-colors truncate">
                        {techrider?.bookingEmail || defaultKrysoTechriderData.bookingEmail}
                      </p>
                    </div>
                    <div className="size-8 rounded-full bg-orange-500/10 group-hover:bg-orange-500 text-orange-400 group-hover:text-black flex items-center justify-center transition-all shrink-0">
                      <Mail size={14} />
                    </div>
                  </a>

                  {/* Official Website */}
                  <a
                    href={techrider?.websiteUrl || defaultKrysoTechriderData.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-amber-400/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1 truncate pr-2">
                      <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">OFFICIAL WEBSITE</p>
                      <p className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-400 transition-colors truncate">
                        {techrider?.websiteUrl?.replace(/^https?:\/\//i, "").toUpperCase() || "WWW.KRYSOMUSIC.COM"}
                      </p>
                    </div>
                    <div className="size-8 rounded-full bg-amber-500/10 group-hover:bg-amber-400 text-amber-400 group-hover:text-black flex items-center justify-center transition-all shrink-0">
                      <Globe size={14} />
                    </div>
                  </a>

                  {/* Social Handles (Facebook / Soundcloud) */}
                  <div className="p-4 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">SOCIAL PROFILES</p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <a
                          href={techrider?.facebookUrl || defaultKrysoTechriderData.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-100 hover:text-orange-400 transition-colors inline-flex items-center gap-1"
                        >
                          <span>FACEBOOK/KRYSO</span>
                          <ExternalLink size={10} />
                        </a>
                        <span className="text-blue-500/50">•</span>
                        <a
                          href={techrider?.soundcloudUrl || defaultKrysoTechriderData.soundcloudUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-100 hover:text-orange-400 transition-colors inline-flex items-center gap-1"
                        >
                          <span>SOUNDCLOUD</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

