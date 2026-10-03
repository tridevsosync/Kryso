"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Facebook,
  Headphones,
  Instagram,
  Loader2,
  Lock,
  Music,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Unlock,
  X,
  Youtube,
} from "lucide-react";
import musicHeroImage from "@/assets/music-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { siteSettings, defaultMusicHeaderData, type MusicTrack, type MusicHeaderData } from "@/data/catalog";
import { formatImageUrl } from "@/lib/media-utils";
import { SpotifyIcon } from "@/components/spotify-icon";
import { useStored } from "@/lib/kryso-storage";

const ITEMS_PER_PAGE = 12;

export function MusicShopClient() {
  const [headerConfig, setHeaderConfig] = useStored<MusicHeaderData>(
    "admin-kryso-music-header",
    defaultMusicHeaderData
  );
  const [trackList, setTrackList] = useState<MusicTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLockFilter, setSelectedLockFilter] = useState<"all" | "locked" | "unlocked">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Download state
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  // Social follow-to-unlock modal state
  const [lockModalTrack, setLockModalTrack] = useState<MusicTrack | null>(null);
  const [unlockedTrackIds, setUnlockedTrackIds] = useState<string[]>([]);
  const [steps, setSteps] = useState({ sp: false, yt: false, ig: false, fb: false });

  // Clear any previously persisted unlocks so all locked tracks require unlocking on every page refresh
  useEffect(() => {
    try {
      localStorage.removeItem("kryso_unlocked_tracks");
    } catch {}
  }, []);

  // Fetch dynamic music header from MongoDB (and fallback to localStorage)
  useEffect(() => {
    fetch("/api/collections?name=music_header")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setHeaderConfig(data.items[0]);
        }
      })
      .catch(() => {});
  }, [setHeaderConfig]);

  // Fetch dynamic music tracks from MongoDB (and fallback to localStorage)
  useEffect(() => {
    fetch("/api/collections?name=music_tracks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setTrackList(data.items);
        } else {
          try {
            const stored = localStorage.getItem("admin-music-tracks-v1");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) setTrackList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Extract unique genres from available tracks
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    trackList.forEach((t) => {
      if (t.genre && t.genre.trim()) {
        set.add(t.genre.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [trackList]);

  // Handle Search execution
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveQuery(searchQuery.trim());
    setCurrentPage(1);
  };

  // Reset all filters and search
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveQuery("");
    setSelectedGenre("All");
    setSelectedLockFilter("all");
    setCurrentPage(1);
  };

  // Filtered tracks based on search and filters
  const filteredTracks = useMemo(() => {
    return trackList.filter((track) => {
      const queryLower = activeQuery.toLowerCase();
      const matchesSearch =
        !activeQuery ||
        track.name.toLowerCase().includes(queryLower) ||
        track.singer.toLowerCase().includes(queryLower) ||
        (track.genre && track.genre.toLowerCase().includes(queryLower));

      const matchesGenre = selectedGenre === "All" || track.genre?.trim() === selectedGenre;

      const isLocked = track.isLocked && !unlockedTrackIds.includes(track.id);
      const matchesLock =
        selectedLockFilter === "all" ||
        (selectedLockFilter === "locked" && isLocked) ||
        (selectedLockFilter === "unlocked" && !isLocked);

      return matchesSearch && matchesGenre && matchesLock;
    });
  }, [trackList, activeQuery, selectedGenre, selectedLockFilter, unlockedTrackIds]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTracks.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedTracks = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredTracks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTracks, validPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const section = document.getElementById("tracks-catalog-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Download and Social Unlock handlers
  const handleDownloadClick = (track: MusicTrack) => {
    const isUnlocked = !track.isLocked || unlockedTrackIds.includes(track.id);

    if (isUnlocked) {
      triggerDownload(track);
    } else {
      setLockModalTrack(track);
      setSteps({ sp: false, yt: false, ig: false, fb: false });
    }
  };

  const triggerDownload = async (track: MusicTrack) => {
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
    // Unlock in temporary component state only for this view session
    const nextList = [...unlockedTrackIds, currentTrack.id];
    setUnlockedTrackIds(nextList);

    setLockModalTrack(null);
    triggerDownload(currentTrack);
  };

  const allStepsDone = steps.sp && steps.yt && steps.ig && steps.fb;

  return (
    <SiteShell>
      {/* Hero Banner with Fixed Aspect/Height & Dynamic Cropped Artwork */}
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border min-h-[300px] sm:min-h-[340px] flex items-center">
        {/* Dynamic Cropped & Positioned Background Artwork */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formatImageUrl(headerConfig?.bgImageUrl || "/music-hero.jpg")}
            alt="KRYSO Music Studio & Live Stage"
            style={{
              objectPosition: `${headerConfig?.positionX ?? 75}% ${headerConfig?.positionY ?? 50}%`,
              transform: `scale(${(headerConfig?.zoom ?? 100) / 100})`,
              transformOrigin: `${headerConfig?.positionX ?? 75}% ${headerConfig?.positionY ?? 50}%`,
              filter: `brightness(${headerConfig?.brightness ?? 100}%) contrast(${headerConfig?.contrast ?? 110}%)`,
              opacity: (headerConfig?.opacity ?? 65) / 100,
            }}
            className="size-full object-cover transition-all duration-300"
            onError={(e) => {
              e.currentTarget.src = "/music-hero.jpg";
            }}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/85 to-background/25 sm:via-background/70 sm:to-transparent" />
        <div className="page-shell py-10 sm:py-14 w-full">
          <p className="eyebrow flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> {headerConfig?.badge || defaultMusicHeaderData.badge}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold sm:text-5xl text-foreground">
            {headerConfig?.title || defaultMusicHeaderData.title}{" "}
            <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">
              {headerConfig?.titleHighlight || defaultMusicHeaderData.titleHighlight}
            </span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            {headerConfig?.description || defaultMusicHeaderData.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2 text-foreground font-semibold">
              <Headphones size={15} className="text-primary" /> {headerConfig?.badge1 || defaultMusicHeaderData.badge1}
            </span>
            <span>·</span>
            <span>{headerConfig?.badge2 || defaultMusicHeaderData.badge2}</span>
            <span>·</span>
            <span>{headerConfig?.badge3 || defaultMusicHeaderData.badge3}</span>
          </div>
        </div>
      </section>

      {/* Main Music Tracks Catalog Section */}
      <section id="tracks-catalog-section" className="page-shell py-8 sm:py-12 scroll-mt-24">
        {/* Section Heading & Search Form */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-border">
          <SectionHeading
            label="Original Sound Catalog"
            title="Music Tracks"
            text="Explore the full discography and download high-definition studio master packages."
          />

          {/* Search Input with Dedicated Search Button */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <span className="sr-only">Search music tracks</span>
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by track, singer, genre..."
                className="h-11 rounded-full pl-10 pr-9 bg-card border-border text-foreground focus-visible:ring-primary text-sm shadow-sm w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full px-6 font-bold shadow-md shadow-primary/20 hover:bg-primary/90 shrink-0 text-xs sm:text-sm"
            >
              <Search size={15} className="mr-1.5" /> Search
            </Button>
          </form>
        </div>

        {/* Filters Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {/* Genre & Access Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-1">
              <SlidersHorizontal size={14} /> Filter:
            </span>

            {/* Access Status Filter */}
            <div className="flex rounded-lg bg-secondary p-1 border border-border">
              <button
                type="button"
                onClick={() => {
                  setSelectedLockFilter("all");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  selectedLockFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLockFilter("unlocked");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  selectedLockFilter === "unlocked"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🔓 Free
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLockFilter("locked");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  selectedLockFilter === "locked"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🔒 Premium
              </button>
            </div>

            {/* Genre Filter Pills */}
            {availableGenres.length > 2 && (
              <div className="flex flex-wrap gap-1.5 ml-2">
                {availableGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => {
                      setSelectedGenre(genre);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all border ${
                      selectedGenre === genre
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Filter Indicators & Reset Button */}
          {(activeQuery || selectedGenre !== "All" || selectedLockFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-primary gap-1.5"
            >
              <RotateCcw size={13} /> Reset filters
            </Button>
          )}
        </div>

        {/* Tracks Grid */}
        {paginatedTracks.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {paginatedTracks.map((track) => {
              const isUnlocked = !track.isLocked || unlockedTrackIds.includes(track.id);

              return (
                <article
                  key={track.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-3 sm:p-3.5 transition-all hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div>
                    {/* Cover Artwork */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/80 bg-secondary shadow-inner">
                      {track.imageUrl ? (
                        <Image
                          src={formatImageUrl(track.imageUrl)}
                          alt={track.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Music size={36} />
                        </div>
                      )}

                      {/* Genre & ZIP Tag Pills */}
                      <div className="absolute left-2 top-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
                        {track.genre && (
                          <span className="rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                            {track.genre}
                          </span>
                        )}
                        {track.downloadUrl && (
                          <span className="rounded-full bg-primary/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground shadow-sm">
                            📦 ZIP Package
                          </span>
                        )}
                      </div>

                      {/* Lock / Free Status Pill */}
                      <span
                        className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold backdrop-blur-md shadow-sm ${
                          isUnlocked
                            ? "bg-emerald-500/95 text-white"
                            : "bg-amber-500/95 text-black animate-pulse"
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Unlock size={10} /> Free
                          </>
                        ) : (
                          <>
                            <Lock size={10} /> Premium
                          </>
                        )}
                      </span>
                    </div>

                    {/* Track Info */}
                    <div className="mt-2.5">
                      <h3
                        className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate"
                        title={track.name}
                      >
                        {track.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        Singer / Artist: <span className="font-medium text-foreground">{track.singer}</span>
                      </p>
                    </div>
                  </div>

                  {/* Download / Unlock CTA Button */}
                  <div className="mt-3 border-t border-border/70 pt-2.5">
                    <Button
                      onClick={() => handleDownloadClick(track)}
                      disabled={downloadingTrackId === track.id}
                      className={`w-full h-9 rounded-lg font-bold shadow-sm transition-all text-xs ${
                        isUnlocked
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                          : "bg-gradient-to-r from-amber-500 to-primary text-primary-foreground hover:brightness-110"
                      }`}
                    >
                      {downloadingTrackId === track.id ? (
                        <>
                          <Loader2 size={14} className="mr-1.5 animate-spin" /> Downloading...
                        </>
                      ) : isUnlocked ? (
                        <>
                          <Download size={14} className="mr-1.5" /> Free Download
                        </>
                      ) : (
                        <>
                          <Lock size={13} className="mr-1.5" /> Premium Download
                        </>
                      )}
                    </Button>
                    {!isUnlocked && (
                      <p className="mt-1 text-center text-[10px] text-muted-foreground line-clamp-1">
                        Follow on socials to get free download
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty Search / Filter Results State */
          <div className="mt-10 rounded-2xl border border-dashed border-border py-20 text-center bg-card/30">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary border border-border mb-3">
              <Music size={22} />
            </span>
            <p className="font-display text-xl font-bold text-foreground">
              {activeQuery || selectedGenre !== "All" || selectedLockFilter !== "all"
                ? "No music tracks matched your filters"
                : "No music tracks published yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {activeQuery || selectedGenre !== "All" || selectedLockFilter !== "all"
                ? "Try adjusting your search terms or clearing your selected filters."
                : "New releases will appear here as soon as they are added in the Admin panel."}
            </p>
            {(activeQuery || selectedGenre !== "All" || selectedLockFilter !== "all") && (
              <Button
                onClick={handleResetFilters}
                className="mt-5 rounded-full font-bold shadow-md shadow-primary/20"
              >
                <RotateCcw size={15} className="mr-1.5" /> Reset all filters
              </Button>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Pagination Controls                                  */}
        {/* ---------------------------------------------------- */}
        {filteredTracks.length > ITEMS_PER_PAGE && (
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <strong className="text-foreground">
                {(validPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(validPage * ITEMS_PER_PAGE, filteredTracks.length)}
              </strong>{" "}
              of <strong className="text-foreground">{filteredTracks.length}</strong> tracks
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {/* Previous Page Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={validPage <= 1}
                onClick={() => handlePageChange(validPage - 1)}
                className="h-9 rounded-full px-3 text-xs font-semibold border-border hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft size={15} className="mr-1" /> Prev
              </Button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`size-8 sm:size-9 rounded-full text-xs font-bold transition-all ${
                    validPage === pageNum
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Page Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={validPage >= totalPages}
                onClick={() => handlePageChange(validPage + 1)}
                className="h-9 rounded-full px-3 text-xs font-semibold border-border hover:bg-secondary disabled:opacity-40"
              >
                Next <ChevronRight size={15} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* Social Follow-to-Unlock Modal                        */}
      {/* ---------------------------------------------------- */}
      {lockModalTrack && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl text-card-foreground">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Lock size={17} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Unlock Free Download</h3>
                  <p className="text-xs text-muted-foreground">Follow on Spotify, YouTube, Instagram & FB to unlock</p>
                </div>
              </div>
              <button
                onClick={() => setLockModalTrack(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Track Info Preview Box */}
            <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border bg-secondary/50 p-3">
              {lockModalTrack.imageUrl ? (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={formatImageUrl(lockModalTrack.imageUrl)}
                    alt={lockModalTrack.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Music size={22} />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-display font-bold text-foreground">{lockModalTrack.name}</p>
                <p className="text-xs text-muted-foreground truncate">by {lockModalTrack.singer}</p>
                <span className="inline-block text-[10px] font-bold text-primary mt-0.5">Studio Master MP4 / MP3</span>
              </div>
            </div>

            {/* Social Steps List */}
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required steps ({Object.values(steps).filter(Boolean).length}/4):
              </p>

              {/* Step 1: Spotify */}
              <button
                type="button"
                onClick={() => markStepDone("sp", lockModalTrack.spotifyUrl || siteSettings.spotifyUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.sp
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-500/40 bg-emerald-500/5 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-[#1DB954] text-black shadow-sm">
                    <SpotifyIcon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Follow on Spotify</p>
                    <p className="text-[11px] text-muted-foreground">Stream & follow KRYSO on Spotify</p>
                  </div>
                </div>
                {steps.sp ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    Follow <ExternalLink size={12} />
                  </span>
                )}
              </button>

              {/* Step 2: YouTube */}
              <button
                type="button"
                onClick={() => markStepDone("yt", lockModalTrack.youtubeUrl || siteSettings.youtubeUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.yt
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/40 bg-red-500/5 text-foreground hover:bg-red-500/10 hover:border-red-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-red-600 text-white shadow-sm">
                    <Youtube size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Subscribe on YouTube</p>
                    <p className="text-[11px] text-muted-foreground">Join our official channel</p>
                  </div>
                </div>
                {steps.yt ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                    Subscribe <ExternalLink size={12} />
                  </span>
                )}
              </button>

              {/* Step 3: Instagram */}
              <button
                type="button"
                onClick={() => markStepDone("ig", lockModalTrack.instagramUrl || siteSettings.instagramUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.ig
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-pink-500/40 bg-pink-500/5 text-foreground hover:bg-pink-500/10 hover:border-pink-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white shadow-sm">
                    <Instagram size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Follow on Instagram</p>
                    <p className="text-[11px] text-muted-foreground">@_krysomusic</p>
                  </div>
                </div>
                {steps.ig ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-pink-400">
                    Follow <ExternalLink size={12} />
                  </span>
                )}
              </button>

              {/* Step 4: Facebook */}
              <button
                type="button"
                onClick={() => markStepDone("fb", lockModalTrack.facebookUrl || siteSettings.facebookUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.fb
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-blue-500/40 bg-blue-500/5 text-foreground hover:bg-blue-500/10 hover:border-blue-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-blue-600 text-white shadow-sm">
                    <Facebook size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Follow on Facebook</p>
                    <p className="text-[11px] text-muted-foreground">Kryso Official Page</p>
                  </div>
                </div>
                {steps.fb ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-400">
                    Follow <ExternalLink size={12} />
                  </span>
                )}
              </button>
            </div>

            {/* Unlock & Download Action */}
            <div className="mt-6 border-t border-border pt-4">
              {allStepsDone ? (
                <Button
                  onClick={completeUnlock}
                  disabled={downloadingTrackId === lockModalTrack.id}
                  className="w-full h-12 rounded-full font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 animate-pulse text-sm"
                >
                  {downloadingTrackId === lockModalTrack.id ? (
                    <>
                      <Loader2 size={17} className="mr-2 animate-spin" /> Starting Download...
                    </>
                  ) : (
                    <>
                      <Download size={17} className="mr-2" /> Download Unlocked Track Now!
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={completeUnlock}
                  disabled={downloadingTrackId === lockModalTrack.id}
                  variant="outline"
                  className="w-full h-11 rounded-full text-xs font-semibold border-border hover:bg-secondary text-muted-foreground"
                >
                  {downloadingTrackId === lockModalTrack.id ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" /> Starting Download...
                    </>
                  ) : (
                    "I have subscribed — Unlock and download"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
