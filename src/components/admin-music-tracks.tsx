"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  Cloud,
  Database,
  Download,
  ExternalLink,
  Facebook,
  Headphones,
  ImageIcon,
  Instagram,
  Loader2,
  Lock,
  Music,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStored } from "@/lib/kryso-storage";
import { siteSettings, type MusicTrack } from "@/data/catalog";
import { formatImageUrl, formatAudioUrl, formatDownloadUrl } from "@/lib/media-utils";
import { SpotifyIcon } from "@/components/spotify-icon";

const STORAGE_KEY = "admin-music-tracks-v1";
const COLLECTION_NAME = "music_tracks";

export function MusicTrackManager() {
  const [tracks, setTracks] = useStored<MusicTrack[]>(STORAGE_KEY, []);
  const [editing, setEditing] = useState<MusicTrack | null>(null);
  const [query, setQuery] = useState("");
  const [filterLock, setFilterLock] = useState<"all" | "locked" | "unlocked">("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingMultiAudio, setUploadingMultiAudio] = useState(false);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Sync tracks from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    setSyncing(true);

    fetch(`/api/collections?name=${COLLECTION_NAME}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.source === "mongodb") {
          setMongoConnected(true);
          if (Array.isArray(data.items)) {
            setTracks(data.items as MusicTrack[]);
          }
        } else {
          setMongoConnected(false);
        }
      })
      .catch((err) => {
        console.warn("Could not sync music_tracks from MongoDB:", err);
        if (isMounted) setMongoConnected(false);
      })
      .finally(() => {
        if (isMounted) setSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setTracks]);

  const blankTrack = (): MusicTrack => ({
    id: `track-${Date.now()}`,
    name: "",
    singer: "",
    imageUrl: "",
    audioUrl: "",
    audioFiles: [],
    isLocked: true,
    genre: "Electronic / EDM",
    spotifyUrl: siteSettings.spotifyUrl,
    youtubeUrl: siteSettings.youtubeUrl,
    instagramUrl: siteSettings.instagramUrl,
    facebookUrl: siteSettings.facebookUrl,
    downloadCount: 0,
    createdAt: new Date().toISOString(),
  });

  // Save track to local storage & MongoDB
  const saveTrack = async (track: MusicTrack) => {
    if (!track.name.trim()) {
      alert("Please enter a Music Name.");
      return;
    }
    if (!track.singer.trim()) {
      alert("Please enter the Singer / Artist Name.");
      return;
    }

    const cleanAudioFiles = (track.audioFiles || [])
      .filter((item) => item.url && item.url.trim())
      .map((item, idx) => ({
        id: item.id || `file-${idx}-${Date.now()}`,
        title: item.title?.trim() || `Audio Track ${idx + 1}`,
        url: formatAudioUrl(item.url),
      }));

    const cleanTrack: MusicTrack = {
      ...track,
      imageUrl: formatImageUrl(track.imageUrl),
      audioUrl: formatAudioUrl(track.audioUrl) || (cleanAudioFiles[0]?.url ? formatAudioUrl(cleanAudioFiles[0].url) : ""),
      audioFiles: cleanAudioFiles,
    };

    const updated = tracks.some((item) => item.id === cleanTrack.id)
      ? tracks.map((item) => (item.id === cleanTrack.id ? cleanTrack : item))
      : [cleanTrack, ...tracks];

    setTracks(updated);
    setEditing(null);
    setStatusMsg("Saving track to MongoDB...");

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: COLLECTION_NAME, item: cleanTrack }),
      });
      const data = await res.json();
      if (data.savedTo === "mongodb") {
        setMongoConnected(true);
        setStatusMsg("Track saved to MongoDB & Cloudinary!");
      } else {
        setStatusMsg("Track saved in local storage.");
      }
    } catch {
      setStatusMsg("Track saved in local storage (offline).");
    }

    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Toggle lock state directly from table
  const toggleLock = async (track: MusicTrack) => {
    const updatedTrack = { ...track, isLocked: !track.isLocked };
    const updatedList = tracks.map((t) => (t.id === track.id ? updatedTrack : t));
    setTracks(updatedList);

    try {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: COLLECTION_NAME, item: updatedTrack }),
      });
      setStatusMsg(`Track ${updatedTrack.isLocked ? "Locked 🔒" : "Unlocked 🔓"}`);
    } catch {
      // local state already updated
    }
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // Delete track
  const removeTrack = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;

    setTracks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/collections?name=${COLLECTION_NAME}&id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to delete track from MongoDB:", err);
    }
  };

  // Clear all tracks
  const clearAllTracks = async () => {
    if (!confirm("Are you sure you want to delete ALL music tracks from MongoDB and local storage?")) {
      return;
    }
    setTracks([]);
    try {
      await fetch(`/api/collections?name=${COLLECTION_NAME}&id=ALL`, {
        method: "DELETE",
      });
      setStatusMsg("All tracks deleted.");
    } catch (err) {
      console.warn("Failed to clear MongoDB tracks:", err);
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Cloudinary image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kryso/music/artworks");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditing({ ...editing, imageUrl: data.url });
      } else {
        alert(data.error || "Image upload failed.");
      }
    } catch (err) {
      console.error("Cover image upload failed:", err);
      alert("Error uploading cover image to Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Cloudinary audio / MP4 upload handler
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kryso/music/audio");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditing({ ...editing, audioUrl: data.url });
      } else {
        alert(data.error || "Audio upload failed.");
      }
    } catch (err) {
      console.error("Audio upload failed:", err);
      alert("Error uploading audio file to Cloudinary.");
    } finally {
      setUploadingAudio(false);
    }
  };

  // Cloudinary batch multi-audio upload handler
  const handleMultiAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editing) return;

    setUploadingMultiAudio(true);
    const uploadedItems: { id: string; title: string; url: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "kryso/music/audio");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          const rawName = file.name.replace(/\.[^/.]+$/, "");
          uploadedItems.push({
            id: `file-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            title: rawName,
            url: data.url,
          });
        }
      }

      if (uploadedItems.length > 0) {
        const currentFiles = editing.audioFiles || [];
        const combined = [...currentFiles, ...uploadedItems];
        setEditing({
          ...editing,
          audioUrl: editing.audioUrl || uploadedItems[0].url,
          audioFiles: combined,
        });
        setStatusMsg(`Uploaded ${uploadedItems.length} audio file(s) to Cloudinary!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error("Multi-audio upload failed:", err);
      alert("Error uploading some audio files to Cloudinary.");
    } finally {
      setUploadingMultiAudio(false);
      e.target.value = "";
    }
  };

  const handleSingleItemAudioUpload = async (fileId: string, file: File) => {
    if (!editing) return;
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kryso/music/audio");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        updateAudioFileItem(fileId, "url", data.url);
      } else {
        alert(data.error || "Audio upload failed.");
      }
    } catch (err) {
      console.error("Audio item upload error:", err);
      alert("Error uploading file.");
    } finally {
      setUploadingAudio(false);
    }
  };

  const addAudioFileItem = () => {
    if (!editing) return;
    const currentFiles = editing.audioFiles || [];
    setEditing({
      ...editing,
      audioFiles: [
        ...currentFiles,
        {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: `Audio Track ${currentFiles.length + 1}`,
          url: "",
        },
      ],
    });
  };

  const updateAudioFileItem = (id: string, field: "title" | "url", value: string) => {
    if (!editing) return;
    const currentFiles = editing.audioFiles || [];
    setEditing({
      ...editing,
      audioFiles: currentFiles.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    });
  };

  const removeAudioFileItem = (id: string) => {
    if (!editing) return;
    const currentFiles = editing.audioFiles || [];
    setEditing({
      ...editing,
      audioFiles: currentFiles.filter((f) => f.id !== id),
    });
  };

  const filteredTracks = tracks.filter((t) => {
    const matchesQuery = `${t.name} ${t.singer} ${t.genre || ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesLock =
      filterLock === "all" ||
      (filterLock === "locked" && t.isLocked) ||
      (filterLock === "unlocked" && !t.isLocked);
    return matchesQuery && matchesLock;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-extrabold text-foreground">Music Tracks & Downloads</h2>
            {mongoConnected === true && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <Database size={11} /> MongoDB Active
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-400">
              <Cloud size={11} /> Cloudinary Ready
            </span>
            {syncing && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add tracks with artwork, singer name, MP4/audio files, and lock buttons for social follow-to-download gating.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tracks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllTracks}
              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold"
            >
              <Trash2 size={13} className="mr-1" /> Clear all
            </Button>
          )}
          <Button
            className="rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary/90"
            onClick={() => setEditing(blankTrack())}
          >
            <Plus size={16} className="mr-1" /> Add Music Track
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-fade-in bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg">
          <Check size={14} /> {statusMsg}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Search tracks</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by track, singer, genre..."
            className="h-10 rounded-full pl-9 bg-card border-border text-foreground focus-visible:ring-primary"
          />
        </label>

        <div className="flex rounded-lg bg-secondary p-1 border border-border">
          <button
            onClick={() => setFilterLock("all")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              filterLock === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tracks ({tracks.length})
          </button>
          <button
            onClick={() => setFilterLock("locked")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              filterLock === "locked"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔒 Locked ({tracks.filter((t) => t.isLocked).length})
          </button>
          <button
            onClick={() => setFilterLock("unlocked")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              filterLock === "unlocked"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔓 Direct ({tracks.filter((t) => !t.isLocked).length})
          </button>
        </div>
      </div>

      {/* Tracks Table */}
      {filteredTracks.length ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-border bg-secondary/80 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">Artwork</th>
                <th className="px-4 py-3 font-semibold text-foreground">Music & Singer</th>
                <th className="px-4 py-3 font-semibold text-foreground">Genre</th>
                <th className="px-4 py-3 font-semibold text-foreground">Audio / Player</th>
                <th className="px-4 py-3 font-semibold text-foreground">Lock Status</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((track) => (
                <tr
                  key={track.id}
                  className="border-b border-border/70 last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  {/* Artwork */}
                  <td className="px-4 py-3">
                    {track.imageUrl ? (
                      <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-secondary">
                        <Image
                          src={formatImageUrl(track.imageUrl)}
                          alt={track.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="flex size-12 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-muted-foreground">
                        <Music size={16} />
                      </span>
                    )}
                  </td>

                  {/* Name and Singer */}
                  <td className="px-4 py-3">
                    <p className="font-display font-bold text-foreground">{track.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">by {track.singer}</span>
                      {track.audioFiles && track.audioFiles.length > 1 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold border border-primary/30">
                          📦 {track.audioFiles.length} Tracks Bundle
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Genre */}
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground border border-border">
                      {track.genre || "Music"}
                    </span>
                  </td>

                  {/* Audio player preview */}
                  <td className="px-4 py-3">
                    {track.audioUrl ? (
                      <div className="flex items-center gap-2">
                        <audio
                          controls
                          controlsList="nodownload noplaybackrate"
                          onContextMenu={(e) => e.preventDefault()}
                          src={formatAudioUrl(track.audioUrl)}
                          className="h-8 w-44"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No audio link</span>
                    )}
                  </td>

                  {/* Lock button toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleLock(track)}
                      title="Click to toggle lock state"
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-sm ${
                        track.isLocked
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                      }`}
                    >
                      {track.isLocked ? (
                        <>
                          <Lock size={12} />
                          <span>Locked (Social Gate)</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          <span>Unlocked (Free)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {track.audioUrl && (
                      <a
                        href={formatDownloadUrl(track.audioUrl, `${track.name || "Track"} - ${track.singer || "Kryso"}.mp3`)}
                        download={`${track.name || "Track"} - ${track.singer || "Kryso"}.mp3`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                        title="Download audio file directly"
                      >
                        <Download size={15} />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary text-muted-foreground hover:text-primary"
                      aria-label="Edit track"
                      onClick={() => setEditing(track)}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary text-muted-foreground hover:text-destructive"
                      aria-label="Delete track"
                      onClick={() => removeTrack(track.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center bg-card/40">
          <p className="font-display text-lg font-bold text-foreground">No music tracks added yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &quot;Add Music Track&quot; above to upload cover art, song name, singer, MP4/audio, and configure the social lock button.
          </p>
          <Button
            className="mt-4 rounded-full font-bold shadow-md shadow-primary/20"
            onClick={() => setEditing(blankTrack())}
          >
            <Plus size={16} className="mr-1" /> Add Music Track
          </Button>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-xs p-4">
          <form
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-card border border-border p-6 shadow-2xl text-card-foreground"
            onSubmit={(e) => {
              e.preventDefault();
              saveTrack(editing);
            }}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Music size={20} className="text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editing.id.startsWith("track-") ? "Add New Music Track" : "Edit Music Track"}
                </h3>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => setEditing(null)}>
                <X size={17} />
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              {/* Music Name */}
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Music Name *
                <Input
                  required
                  placeholder="e.g. Kryso Anthem 2026 / Monsoon Beat"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="bg-background border-border text-foreground focus-visible:ring-primary"
                />
              </label>

              {/* Singer Name */}
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Singer / Artist Name *
                <Input
                  required
                  placeholder="e.g. DJ Kryso ft. MC / Aarav Kulkarni"
                  value={editing.singer}
                  onChange={(e) => setEditing({ ...editing, singer: e.target.value })}
                  className="bg-background border-border text-foreground focus-visible:ring-primary"
                />
              </label>

              {/* Genre / Tag */}
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Genre / Tag
                <Input
                  placeholder="e.g. EDM, Progressive House, Acoustic, Bollywood Club Remix"
                  value={editing.genre || ""}
                  onChange={(e) => setEditing({ ...editing, genre: e.target.value })}
                  className="bg-background border-border text-foreground focus-visible:ring-primary"
                />
              </label>

              {/* Cover Artwork Image Upload */}
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Cover Artwork Image</span>
                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                    <Cloud size={12} /> Stored in Cloudinary
                  </span>
                </label>

                {editing.imageUrl && (
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-border bg-secondary">
                    <Image
                      src={formatImageUrl(editing.imageUrl)}
                      alt="Artwork Preview"
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, imageUrl: "" })}
                      className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-destructive"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                    <div
                      className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 text-xs font-semibold transition-colors hover:border-primary hover:text-primary ${
                        uploadingImage ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-primary" />
                          <span>Uploading cover to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>{editing.imageUrl ? "Replace Cover Image (Cloudinary)" : "Upload Cover Image (Cloudinary)"}</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                <Input
                  type="text"
                  placeholder="Or paste direct image URL, Cloudinary, or Google Drive link"
                  value={editing.imageUrl}
                  className="bg-background border-border text-foreground text-xs focus-visible:ring-primary"
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                />
              </div>

              {/* Audio / MP4 File Upload or Direct Link */}
              <div className="grid gap-2 rounded-xl border border-border bg-secondary/30 p-4">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Headphones size={15} className="text-primary" />
                    Upload MP4 Audio / Music File or Add Link
                  </span>
                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                    <Cloud size={12} /> Cloudinary Audio/Video
                  </span>
                </label>

                {editing.audioUrl && (
                  <div className="rounded-lg bg-background p-3 border border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Audio Player Preview:</p>
                    <audio
                      controls
                      controlsList="nodownload noplaybackrate"
                      onContextMenu={(e) => e.preventDefault()}
                      src={formatAudioUrl(editing.audioUrl)}
                      className="w-full h-9"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="relative flex-1">
                    <input
                      type="file"
                      accept="audio/*, video/mp4, .mp3, .wav, .m4a, .mp4"
                      disabled={uploadingAudio}
                      className="sr-only"
                      onChange={handleAudioUpload}
                    />
                    <div
                      className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/10 px-4 text-xs font-bold text-primary transition-colors hover:bg-primary/20 ${
                        uploadingAudio ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      {uploadingAudio ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-primary" />
                          <span>Uploading MP4 / Audio to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Upload MP4 / MP3 Audio File</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <label className="grid gap-1 text-xs text-muted-foreground">
                  Direct Music Link (Cloudinary URL, MP3, MP4, Google Drive share link, Dropbox):
                  <Input
                    type="text"
                    placeholder="https://drive.google.com/file/d/... or Cloudinary URL or direct link"
                    value={editing.audioUrl}
                    className="bg-background border-border text-foreground text-xs focus-visible:ring-primary"
                    onChange={(e) => setEditing({ ...editing, audioUrl: e.target.value })}
                  />
                </label>
              </div>

              {/* Multi-Audio Tracks Package & Download Links (One-Click Multi Download) */}
              <div className="grid gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Music size={16} className="text-primary" />
                      Multi-Audio Files & Download Links (One-Click Multi-Download)
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Attach multiple audio versions, stems, or mix links. When users click Download, ALL files download together at once!
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Batch Upload Multiple Files */}
                    <label className="relative">
                      <input
                        type="file"
                        multiple
                        accept="audio/*, video/mp4, .mp3, .wav, .m4a, .mp4"
                        disabled={uploadingMultiAudio}
                        className="sr-only"
                        onChange={handleMultiAudioUpload}
                      />
                      <div
                        className={`inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-primary/50 bg-primary/20 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/30 ${
                          uploadingMultiAudio ? "pointer-events-none opacity-60" : ""
                        }`}
                      >
                        {uploadingMultiAudio ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-primary" />
                            <span>Uploading Batch...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={13} />
                            <span>Upload Multiple Files</span>
                          </>
                        )}
                      </div>
                    </label>

                    {/* Add Custom Link / Item */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={addAudioFileItem}
                      className="h-8 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-1 shadow-sm"
                    >
                      <Plus size={13} /> Add Track Link
                    </Button>
                  </div>
                </div>

                {/* List of Audio Items */}
                {editing.audioFiles && editing.audioFiles.length > 0 ? (
                  <div className="space-y-2.5 mt-1">
                    {editing.audioFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <Headphones size={13} /> Audio File #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAudioFileItem(item.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 rounded transition-colors"
                            title="Remove this track"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-2">
                          <Input
                            type="text"
                            placeholder="Version / Title (e.g. Extended Mix, Instrumental, Vocal Stem)"
                            value={item.title}
                            className="bg-background border-border text-foreground text-xs focus-visible:ring-primary sm:col-span-1"
                            onChange={(e) => updateAudioFileItem(item.id, "title", e.target.value)}
                          />

                          <div className="sm:col-span-2 flex items-center gap-1.5">
                            <Input
                              type="text"
                              placeholder="Direct Audio URL, Cloudinary, Drive link, Dropbox"
                              value={item.url}
                              className="bg-background border-border text-foreground text-xs focus-visible:ring-primary flex-1"
                              onChange={(e) => updateAudioFileItem(item.id, "url", e.target.value)}
                            />

                            <label className="relative shrink-0">
                              <input
                                type="file"
                                accept="audio/*, video/mp4, .mp3, .wav, .m4a, .mp4"
                                disabled={uploadingAudio}
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleSingleItemAudioUpload(item.id, file);
                                }}
                              />
                              <div className="h-9 px-2.5 inline-flex items-center justify-center rounded-md border border-border bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer text-xs font-semibold gap-1">
                                <Upload size={13} /> Upload
                              </div>
                            </label>
                          </div>
                        </div>

                        {item.url && (
                          <div className="pt-1 flex items-center gap-2">
                            <audio
                              controls
                              controlsList="nodownload noplaybackrate"
                              onContextMenu={(e) => e.preventDefault()}
                              src={formatAudioUrl(item.url)}
                              className="w-full h-7"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No extra audio files added yet. Click &quot;Upload Multiple Files&quot; to batch upload audio stems/mixes or click &quot;Add Track Link&quot; to paste links.
                    </p>
                  </div>
                )}
              </div>

              {/* Lock Button / Gate Configuration */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      {editing.isLocked ? (
                        <Lock size={16} className="text-amber-400" />
                      ) : (
                        <Unlock size={16} className="text-emerald-400" />
                      )}
                      Download Lock Button
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {editing.isLocked
                        ? "Users must follow on Spotify, YouTube, Instagram, and Facebook to unlock download."
                        : "Unlocked: Anyone can download the track directly."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, isLocked: !editing.isLocked })}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      editing.isLocked ? "bg-amber-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        editing.isLocked ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Social Unlock Links preview/config when locked */}
                {editing.isLocked && (
                  <div className="mt-3 grid gap-2.5 border-t border-border pt-3">
                    <p className="text-xs font-bold text-amber-400">
                      Channels required to unlock:
                    </p>
                    <label className="grid gap-1 text-xs text-foreground">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <SpotifyIcon size={14} /> Spotify Artist Profile URL:
                      </span>
                      <Input
                        value={editing.spotifyUrl || siteSettings.spotifyUrl}
                        onChange={(e) => setEditing({ ...editing, spotifyUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs"
                      />
                    </label>

                    <label className="grid gap-1 text-xs text-foreground">
                      <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                        <Youtube size={13} /> YouTube Channel URL:
                      </span>
                      <Input
                        value={editing.youtubeUrl || siteSettings.youtubeUrl}
                        onChange={(e) => setEditing({ ...editing, youtubeUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs"
                      />
                    </label>

                    <label className="grid gap-1 text-xs text-foreground">
                      <span className="flex items-center gap-1.5 text-pink-400 font-semibold">
                        <Instagram size={13} /> Instagram Profile URL:
                      </span>
                      <Input
                        value={editing.instagramUrl || siteSettings.instagramUrl}
                        onChange={(e) => setEditing({ ...editing, instagramUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs"
                      />
                    </label>

                    <label className="grid gap-1 text-xs text-foreground">
                      <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                        <Facebook size={13} /> Facebook Page URL:
                      </span>
                      <Input
                        value={editing.facebookUrl || siteSettings.facebookUrl}
                        onChange={(e) => setEditing({ ...editing, facebookUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-border hover:bg-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary/90"
              >
                Save Track to MongoDB
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
