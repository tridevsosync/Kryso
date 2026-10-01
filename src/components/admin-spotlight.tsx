"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCheck,
  CloudUpload,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
  GraduationCap,
  Film,
  Video,
  User,
  Mic2,
  FolderDown,
  FileVideo,
  Download,
  Play,
  Sliders,
  Disc3,
  Phone,
  Mail,
  Globe,
  Tv,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStored } from "@/lib/kryso-storage";
import {
  defaultKrysoPageImages,
  defaultKrysoPageConfig,
  defaultKrysoBiography,
  defaultKrysoDownloads,
  defaultKrysoProducerData,
  defaultKrysoTechriderData,
  type KrysoPageImage,
  type KrysoPageConfig,
  type KrysoBiography,
  type KrysoDownloadItem,
  type KrysoProducerData,
  type KrysoTechriderData,
  type KrysoTechriderItem,
} from "@/data/catalog";
import {
  defaultAcademySpotlightImages,
  type AcademySpotlightImage,
} from "@/components/academy-spotlight";
import { formatImageUrl, getVideoSourceInfo } from "@/lib/media-utils";

export function SpotlightManager() {
  const [managerTab, setManagerTab] = useState<
    "kryso" | "producer" | "techrider" | "biography" | "downloads" | "academy"
  >("kryso");

  // 1. KRYSO Page (3 Images & Video)
  const [krysoImages, setKrysoImages] = useStored<KrysoPageImage[]>(
    "admin-kryso-images",
    defaultKrysoPageImages
  );
  const [krysoConfig, setKrysoConfig] = useStored<KrysoPageConfig>(
    "admin-kryso-config",
    defaultKrysoPageConfig
  );
  const [activeKrysoImgIndex, setActiveKrysoImgIndex] = useState(0);

  // 2. KRYSO DJ / Producer
  const [producer, setProducer] = useStored<KrysoProducerData>(
    "admin-kryso-producer",
    defaultKrysoProducerData
  );

  // 3. KRYSO Techrider & Contact
  const [techrider, setTechrider] = useStored<KrysoTechriderData>(
    "admin-kryso-techrider",
    defaultKrysoTechriderData
  );

  // 4. KRYSO Biography
  const [biography, setBiography] = useStored<KrysoBiography>(
    "admin-kryso-biography",
    defaultKrysoBiography
  );

  // 5. KRYSO Downloads (Google Drive Links)
  const [downloads, setDownloads] = useStored<KrysoDownloadItem[]>(
    "admin-kryso-downloads",
    defaultKrysoDownloads
  );
  const [activeDownloadIndex, setActiveDownloadIndex] = useState(0);

  // 6. Academy Spotlight Images
  const [academyImages, setAcademyImages] = useStored<AcademySpotlightImage[]>(
    "admin-academy-spotlight-images",
    defaultAcademySpotlightImages
  );
  const [activeAcademyImgIndex, setActiveAcademyImgIndex] = useState(0);

  const [saved, setSaved] = useState(false);
  const [saveTarget, setSaveTarget] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const krysoFileInputRef = useRef<HTMLInputElement | null>(null);
  const producerFileInputRef = useRef<HTMLInputElement | null>(null);
  const techriderFileInputRef = useRef<HTMLInputElement | null>(null);
  const academyFileInputRef = useRef<HTMLInputElement | null>(null);
  const bioFileInputRef = useRef<HTMLInputElement | null>(null);
  const downloadFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Kryso page images, config, biography, downloads & Academy images from MongoDB
  useEffect(() => {
    fetch("/api/collections?name=kryso_page_images")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setKrysoImages(data.items);
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_page_config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteConfig = data.items[0];
          if (remoteConfig) setKrysoConfig((prev) => ({ ...prev, ...remoteConfig }));
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

    fetch("/api/collections?name=kryso_downloads")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setDownloads(data.items);
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=academy_spotlight_images")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setAcademyImages(data.items);
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
  }, [setKrysoImages, setKrysoConfig, setBiography, setDownloads, setAcademyImages, setProducer, setTechrider]);

  // Upload image handler
  const handleUpload = async (file: File, onSuccess: (url: string) => void) => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kryso/page-images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onSuccess(data.url);
      setSaveTarget("Image uploaded successfully!");
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (krysoFileInputRef.current) krysoFileInputRef.current.value = "";
      if (producerFileInputRef.current) producerFileInputRef.current.value = "";
      if (techriderFileInputRef.current) techriderFileInputRef.current.value = "";
      if (academyFileInputRef.current) academyFileInputRef.current.value = "";
      if (bioFileInputRef.current) bioFileInputRef.current.value = "";
      if (downloadFileInputRef.current) downloadFileInputRef.current.value = "";
    }
  };

  // -------------------------------------------------------------
  // KRYSO PRODUCER HANDLERS
  // -------------------------------------------------------------
  const prod = producer || defaultKrysoProducerData;

  const updateProducer = (fields: Partial<KrysoProducerData>) => {
    setSaved(false);
    setProducer((prev) => ({ ...prev, ...fields }));
  };

  const handleSaveProducer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "kryso_producer",
          items: [prod],
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveTarget("Producer details & background image saved and live on website!");
      } else {
        setSaveTarget("Saved locally to browser cache");
      }
    } catch {
      setSaveTarget("Saved locally to browser cache");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleResetProducerDefaults = async () => {
    if (confirm("Reset DJ / Music Producer section back to defaults?")) {
      setProducer(defaultKrysoProducerData);
      setSaved(true);
      setSaveTarget("Producer section defaults restored!");

      try {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_producer",
            items: [defaultKrysoProducerData],
          }),
        });
      } catch {}
    }
  };

  // -------------------------------------------------------------
  // KRYSO TECHRIDER & CONTACT HANDLERS
  // -------------------------------------------------------------
  const tr = techrider || defaultKrysoTechriderData;

  const updateTechrider = (fields: Partial<KrysoTechriderData>) => {
    setSaved(false);
    setTechrider((prev) => ({ ...prev, ...fields }));
  };

  const handleSaveTechrider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "kryso_techrider",
          items: [tr],
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveTarget("Techrider & Contact requirements saved and live on website!");
      } else {
        setSaveTarget("Saved locally to browser cache");
      }
    } catch {
      setSaveTarget("Saved locally to browser cache");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleResetTechriderDefaults = async () => {
    if (confirm("Reset Techrider & Contact back to defaults?")) {
      setTechrider(defaultKrysoTechriderData);
      setSaved(true);
      setSaveTarget("Techrider & Contact defaults restored!");

      try {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_techrider",
            items: [defaultKrysoTechriderData],
          }),
        });
      } catch {}
    }
  };

  const handleAddTechriderItem = () => {
    setSaved(false);
    const newItem: KrysoTechriderItem = {
      id: `tr-${Date.now()}`,
      category: "Gear Spec",
      spec: "1 X SPECIFICATION ITEM",
    };
    updateTechrider({
      techriderItems: [...(tr.techriderItems || defaultKrysoTechriderData.techriderItems), newItem],
    });
  };

  const handleDeleteTechriderItem = (idToDelete: string) => {
    setSaved(false);
    const current = tr.techriderItems || defaultKrysoTechriderData.techriderItems;
    if (current.length <= 1) {
      alert("At least one technical rider item must remain.");
      return;
    }
    updateTechrider({
      techriderItems: current.filter((item) => item.id !== idToDelete),
    });
  };

  const handleUpdateTechriderItem = (id: string, fields: Partial<KrysoTechriderItem>) => {
    setSaved(false);
    const current = tr.techriderItems || defaultKrysoTechriderData.techriderItems;
    updateTechrider({
      techriderItems: current.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    });
  };

  // -------------------------------------------------------------
  // KRYSO PAGE 3 IMAGES HANDLERS
  // -------------------------------------------------------------
  const safeKrysoImgIndex = Math.min(activeKrysoImgIndex, Math.max(0, krysoImages.length - 1));
  const activeKrysoImg = krysoImages[safeKrysoImgIndex] || defaultKrysoPageImages[0];

  const updateActiveKrysoImage = (fields: Partial<KrysoPageImage>) => {
    setSaved(false);
    setKrysoImages((prev) => {
      const next = [...prev];
      if (next[safeKrysoImgIndex]) {
        next[safeKrysoImgIndex] = { ...next[safeKrysoImgIndex], ...fields };
      }
      return next;
    });
  };

  const handleAddKrysoImage = () => {
    setSaved(false);
    const newImg: KrysoPageImage = {
      id: `kryso-img-${Date.now()}`,
      url: "https://res.cloudinary.com/tridevsosync/image/upload/v1790413445/kryso/spotlight/dj_producer_hero_spotlight.png",
    };
    const nextList = [...krysoImages, newImg];
    setKrysoImages(nextList);
    setActiveKrysoImgIndex(krysoImages.length);
  };

  const handleDeleteKrysoImage = (indexToDelete: number) => {
    if (krysoImages.length <= 1) {
      alert("At least one image must remain on the Kryso page.");
      return;
    }
    if (!confirm("Are you sure you want to remove this image?")) return;

    setSaved(false);
    const updated = krysoImages.filter((_, i) => i !== indexToDelete);
    setKrysoImages(updated);
    setActiveKrysoImgIndex((prev) => Math.max(0, prev - 1));
  };

  const handleResetKrysoDefaults = async () => {
    if (confirm("Reset KRYSO page images back to default?")) {
      setKrysoImages(defaultKrysoPageImages);
      setKrysoConfig(defaultKrysoPageConfig);
      setActiveKrysoImgIndex(0);
      setSaved(true);
      setSaveTarget("Defaults restored!");

      try {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_page_images",
            items: defaultKrysoPageImages,
          }),
        });
      } catch {}
    }
  };

  const handleSaveKrysoImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_page_images",
            items: krysoImages,
          }),
        }),
        fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_page_config",
            items: [krysoConfig],
          }),
        }),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      if (data1?.success || data2?.success) {
        setSaveTarget("Images & video settings saved and live!");
      } else {
        setSaveTarget("Saved locally to browser cache");
      }
    } catch {
      setSaveTarget("Saved locally to browser cache");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  // -------------------------------------------------------------
  // KRYSO BIOGRAPHY HANDLERS
  // -------------------------------------------------------------
  const bio = biography || defaultKrysoBiography;

  const updateBio = (fields: Partial<KrysoBiography>) => {
    setSaved(false);
    setBiography((prev) => ({ ...prev, ...fields }));
  };

  const handleSaveBiography = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "kryso_biography",
          items: [bio],
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveTarget("Biography & artist image saved and live on website!");
      } else {
        setSaveTarget("Saved locally to browser cache");
      }
    } catch {
      setSaveTarget("Saved locally to browser cache");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleResetBioDefaults = async () => {
    if (confirm("Reset artist biography back to defaults?")) {
      setBiography(defaultKrysoBiography);
      setSaved(true);
      setSaveTarget("Biography defaults restored!");

      try {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_biography",
            items: [defaultKrysoBiography],
          }),
        });
      } catch {}
    }
  };

  // -------------------------------------------------------------
  // KRYSO DOWNLOADS HANDLERS
  // -------------------------------------------------------------
  const safeDownloadIndex = Math.min(activeDownloadIndex, Math.max(0, (downloads?.length || 1) - 1));
  const activeDownload = (downloads && downloads.length > 0 ? downloads : defaultKrysoDownloads)[safeDownloadIndex] || defaultKrysoDownloads[0];

  const updateActiveDownload = (fields: Partial<KrysoDownloadItem>) => {
    setSaved(false);
    setDownloads((prev) => {
      const list = prev && prev.length > 0 ? [...prev] : [...defaultKrysoDownloads];
      if (list[safeDownloadIndex]) {
        list[safeDownloadIndex] = { ...list[safeDownloadIndex], ...fields };
      }
      return list;
    });
  };

  const handleAddDownload = () => {
    const newItem: KrysoDownloadItem = {
      id: `dl-${Date.now()}`,
      title: "New Media Asset",
      type: "image",
      category: "Press Photos",
      thumbnailUrl: "/kryso-hero.jpg",
      driveUrl: "https://drive.google.com/",
      description: "Direct Google Drive download link for media, promoters & fans.",
      fileSize: "25 MB",
    };
    setDownloads((prev) => [newItem, ...(prev || defaultKrysoDownloads)]);
    setActiveDownloadIndex(0);
    setSaveTarget("New download item added! Remember to save changes.");
  };

  const handleDeleteActiveDownload = () => {
    if (!downloads || downloads.length <= 1) {
      alert("You must keep at least 1 download item.");
      return;
    }
    if (confirm(`Delete download item "${activeDownload?.title}"?`)) {
      setDownloads((prev) => {
        const next = prev.filter((_, idx) => idx !== safeDownloadIndex);
        return next;
      });
      setActiveDownloadIndex((prev) => Math.max(0, prev - 1));
      setSaveTarget("Download item deleted. Remember to save changes!");
    }
  };

  const handleSaveDownloads = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "kryso_downloads",
          items: downloads,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveTarget("Downloads & Google Drive links saved and live!");
      } else {
        setSaveTarget("Saved locally to browser cache");
      }
    } catch {
      setSaveTarget("Saved locally to browser cache");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleResetDownloads = async () => {
    if (confirm("Reset all downloads to default assets & Google Drive links?")) {
      setDownloads(defaultKrysoDownloads);
      setActiveDownloadIndex(0);
      setSaved(true);
      setSaveTarget("Downloads restored to defaults!");

      try {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kryso_downloads",
            items: defaultKrysoDownloads,
          }),
        });
      } catch {}
    }
  };

  // -------------------------------------------------------------
  // ACADEMY IMAGES HANDLERS
  // -------------------------------------------------------------
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
    };
    const nextList = [...academyImages, newImg];
    setAcademyImages(nextList);
    setActiveAcademyImgIndex(academyImages.length);
  };

  const handleDeleteAcademyImage = (indexToDelete: number) => {
    if (academyImages.length <= 1) {
      alert("At least one image must remain.");
      return;
    }
    if (!confirm("Are you sure you want to remove this academy image?")) return;

    setSaved(false);
    const updated = academyImages.filter((_, i) => i !== indexToDelete);
    setAcademyImages(updated);
    setActiveAcademyImgIndex((prev) => Math.max(0, prev - 1));
  };

  const handleResetAcademyDefaults = async () => {
    if (confirm("Reset Academy section images to default?")) {
      setAcademyImages(defaultAcademySpotlightImages);
      setActiveAcademyImgIndex(0);
      setSaved(true);
      setSaveTarget("Academy defaults restored");

      try {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "academy_spotlight_images",
            items: defaultAcademySpotlightImages,
          }),
        });
      } catch {}
    }
  };

  const handleSaveAcademyImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "academy_spotlight_images",
          items: academyImages,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveTarget("Academy images saved and live!");
      } else {
        setSaveTarget("Saved to browser cache");
      }
    } catch {
      setSaveTarget("Saved to browser cache");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Main Tab Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-secondary/80 border border-border overflow-x-auto max-w-full w-full sm:w-fit shrink-0">
        <button
          type="button"
          onClick={() => {
            setManagerTab("kryso");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
            managerTab === "kryso"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Film size={15} /> KRYSO Page Images & Video
        </button>

        <button
          type="button"
          onClick={() => {
            setManagerTab("producer");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            managerTab === "producer"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Disc3 size={15} /> KRYSO DJ / Producer
        </button>

        <button
          type="button"
          onClick={() => {
            setManagerTab("techrider");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            managerTab === "techrider"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Sliders size={15} /> KRYSO Techrider & Contact
        </button>

        <button
          type="button"
          onClick={() => {
            setManagerTab("biography");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            managerTab === "biography"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <User size={15} /> KRYSO Biography & Side Image
        </button>

        <button
          type="button"
          onClick={() => {
            setManagerTab("downloads");
            setSaved(false);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            managerTab === "downloads"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <FolderDown size={15} /> KRYSO Downloads (Drive Links)
        </button>

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
          <GraduationCap size={15} /> Academy Spotlight Images
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. KRYSO PAGE (IMAGES ONLY & VIDEO)                  */}
      {/* ---------------------------------------------------- */}
      {managerTab === "kryso" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} /> KRYSO IMAGES MANAGER
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Change Fullscreen Images & Video
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload or change the 3 images displayed on the KRYSO page and configure the 10-second video playback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
                title="Open live page in new tab"
              >
                <Eye size={14} />
                <span>View Live KRYSO Page</span>
                <ExternalLink size={12} />
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetKrysoDefaults}
                className="rounded-full border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
              >
                <Undo2 size={14} className="mr-1" /> Reset defaults
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddKrysoImage}
                className="rounded-full font-bold shadow-md shadow-primary/20 text-xs"
              >
                <Plus size={14} className="mr-1" /> Add Image
              </Button>
            </div>
          </div>

          {/* Image Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {krysoImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => {
                  setActiveKrysoImgIndex(idx);
                  setSaved(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  idx === safeKrysoImgIndex
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <ImageIcon size={13} />
                <span>Image {idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Image Upload Form (7 cols) */}
            <form onSubmit={handleSaveKrysoImages} className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <ImageIcon size={16} className="text-primary" /> Change Image #{safeKrysoImgIndex + 1}
                  </h3>
                  {krysoImages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKrysoImage(safeKrysoImgIndex)}
                      className="text-destructive hover:bg-destructive/10 text-xs h-8 px-2.5 rounded-lg"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove Image
                    </Button>
                  )}
                </div>

                {/* Upload Image Section */}
                <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-primary" /> Image File & Upload
                    </span>
                    {uploading && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Loader2 size={13} className="animate-spin" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={krysoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, (url) => updateActiveKrysoImage({ url }));
                      }}
                      className="hidden"
                      id="kryso-img-upload-input"
                    />
                    <label
                      htmlFor="kryso-img-upload-input"
                      className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <CloudUpload size={14} /> Upload New Image
                    </label>
                    <span className="text-xs text-muted-foreground">or edit the URL directly below</span>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-destructive font-medium">{uploadError}</p>
                  )}

                  <Input
                    value={activeKrysoImg?.url || ""}
                    placeholder="https://... or /dj-producer-hero.png"
                    onChange={(e) => updateActiveKrysoImage({ url: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal font-mono"
                  />
                </div>
              </div>

              {/* Video Playback Settings Card */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="border-b border-border/70 pb-3">
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Video size={16} className="text-primary" /> Auto Video Playback & Repeat
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This video automatically plays in crystal clear 1080p HD (with no control icons) after the image slideshow, and automatically repeats the photo slideshow once the video ends.
                  </p>
                </div>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Video File Path / URL
                  <Input
                    value={krysoConfig?.videoUrl || ""}
                    placeholder="https://drive.google.com/file/d/1mrKNVwkgZOpQ7plrQ56z2C7u-gog3TPf/ or /Kryso KJSC FInal cut.mp4"
                    onChange={(e) =>
                      setKrysoConfig((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    className="bg-background border-border text-foreground text-sm font-normal font-mono"
                  />
                </label>
              </div>

              {/* Save Button */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-8 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Save Image Changes
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on KRYSO page."}
                  </span>
                )}
              </div>
            </form>

            {/* Live Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Realtime Image Preview</p>
                <span className="text-xs text-muted-foreground">Image #{safeKrysoImgIndex + 1}</span>
              </div>

              <div className="rounded-3xl border border-border/90 bg-card p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="relative isolate aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(activeKrysoImg?.url) || "/kryso-hero.jpg"}
                    alt="Kryso Image Preview"
                    className="size-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-hero.jpg";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full bg-background/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-foreground border border-border">
                      0{safeKrysoImgIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Miniature Grid of all images */}
                <div className="pt-2 border-t border-border/60">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    All Images:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {krysoImages.slice(0, 3).map((img, i) => (
                      <div
                        key={img.id || i}
                        onClick={() => setActiveKrysoImgIndex(i)}
                        className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer ${
                          i === safeKrysoImgIndex ? "border-primary ring-2 ring-primary/40" : "border-border"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formatImageUrl(img.url) || "/kryso-hero.jpg"}
                          alt="preview"
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/kryso-hero.jpg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1.5 KRYSO DJ / MUSIC PRODUCER MANAGER                */}
      {/* ---------------------------------------------------- */}
      {managerTab === "producer" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-400">
                <Disc3 size={14} /> KRYSO DJ / MUSIC PRODUCER MANAGER
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                DJ / Music Producer Section
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage background presskit image (from Google Drive link or upload), record labels, TV channels, artist support, and streaming links.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/#music-producer"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
              >
                <Eye size={14} /> View Live Section <ExternalLink size={12} />
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetProducerDefaults}
                className="rounded-full text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Undo2 size={14} className="mr-1.5" /> Reset Defaults
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveProducer} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="border-b border-border/70 pb-3">
                  <h3 className="font-display font-bold text-foreground text-base">
                    Producer Headers & Description
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Customize titles, badges, and the introduction text for Kryso as DJ & Music Producer.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Section Badge
                    <Input
                      value={prod.badge || ""}
                      placeholder="INDUSTRY DISCOGRAPHY & BROADCASTS"
                      onChange={(e) => updateProducer({ badge: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Section Title
                    <Input
                      value={prod.title || ""}
                      placeholder="Kryso DJ / Music Producer"
                      onChange={(e) => updateProducer({ title: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>
                </div>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Credentials Subtitle
                  <Input
                    value={prod.subtitle || ""}
                    placeholder="Releases, TV Features & Global Artist Support"
                    onChange={(e) => updateProducer({ subtitle: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>

                {/* Background Image / Presskit Upload */}
                <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-teal-400" /> Background & Presskit Image
                    </span>
                    {uploading && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                        <Loader2 size={13} className="animate-spin" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={producerFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, (url) => updateProducer({ bgImageUrl: url }));
                      }}
                      className="hidden"
                      id="producer-img-upload-input"
                    />
                    <label
                      htmlFor="producer-img-upload-input"
                      className={`inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-bold text-teal-400 hover:bg-teal-500/20 cursor-pointer transition-colors ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <CloudUpload size={14} /> Upload Image
                    </label>
                    <span className="text-xs text-muted-foreground">or paste Google Drive sharing link below</span>
                  </div>

                  <Input
                    value={prod.bgImageUrl || ""}
                    placeholder="https://drive.google.com/file/d/... or /kryso-dj-music-producer-bg.png"
                    onChange={(e) => updateProducer({ bgImageUrl: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tip: You can paste any Google Drive link directly here. It will be converted into high-performance CDN stream automatically.
                  </p>
                </div>

                {/* Description */}
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Main Section Description
                  <Textarea
                    rows={3}
                    value={prod.description || ""}
                    placeholder="From raw acoustic sessions to high-octane electronic drops..."
                    onChange={(e) => updateProducer({ description: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>
              </div>

              {/* Industry Credentials: Record Labels, TV Channels & Artists */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="border-b border-border/70 pb-3">
                  <h3 className="font-display font-bold text-foreground text-base">
                    Record Labels, TV Channels & Artist Supporters
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comma-separated lists of labels, broadcasting networks, and collaborating headliners.
                  </p>
                </div>

                {/* Record Labels */}
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Record Labels (Comma-separated)
                  <Input
                    value={(prod.recordLabels || defaultKrysoProducerData.recordLabels).join(", ")}
                    placeholder="Harmour Records, LLF Records, Zee Music, Play Life Records"
                    onChange={(e) =>
                      updateProducer({
                        recordLabels: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>

                {/* TV Channels */}
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  TV Channels (Comma-separated)
                  <Input
                    value={(prod.tvFeatures || defaultKrysoProducerData.tvFeatures).join(", ")}
                    placeholder="MTV, Vh1, 9XM, ZOOM, ZEE"
                    onChange={(e) =>
                      updateProducer({
                        tvFeatures: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>

                {/* Music Supported By */}
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Artists Supported By (Comma-separated)
                  <Input
                    value={(prod.artistSupporters || defaultKrysoProducerData.artistSupporters).join(", ")}
                    placeholder="NICKY ROMERO, TIMMY TRUMPET, BLASTERJAXX, F-TAMPA, QUINTINO, DIVINE"
                    onChange={(e) =>
                      updateProducer({
                        artistSupporters: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>
              </div>

              {/* Save Button */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-8 font-extrabold bg-teal-500 hover:bg-teal-400 text-black shadow-lg shadow-teal-500/25 cursor-pointer"
                >
                  Save DJ / Producer Section
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on website."}
                  </span>
                )}
              </div>
            </div>

            {/* Live Realtime Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-teal-400">Realtime Producer Card</p>
                <span className="text-xs text-muted-foreground">Live Visual Preview</span>
              </div>

              <div className="rounded-3xl border border-teal-500/30 bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="relative isolate aspect-[4/5] overflow-hidden rounded-2xl border border-teal-500/30 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(prod.bgImageUrl) || "/kryso-dj-music-producer-bg.png"}
                    alt={prod.title || "Kryso DJ / Producer"}
                    className="size-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-dj-music-producer-bg.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-[11px] font-black uppercase text-teal-300">
                      <Disc3 size={12} /> {prod.badge || "OFFICIAL PRESSKIT"}
                    </span>
                    <p className="text-lg font-black text-white">{prod.title || "Kryso DJ / Music Producer"}</p>
                    <p className="text-xs text-zinc-300 line-clamp-2">{prod.description || defaultKrysoProducerData.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Record Labels:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(prod.recordLabels || defaultKrysoProducerData.recordLabels).map((label, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-zinc-200">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">TV Channels:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(prod.tvFeatures || defaultKrysoProducerData.tvFeatures).map((tv, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/60 text-[11px] font-bold text-amber-300">
                        {tv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1.75 KRYSO TECHRIDER & CONTACT MANAGER               */}
      {/* ---------------------------------------------------- */}
      {managerTab === "techrider" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-400">
                <Sliders size={14} /> KRYSO TECHRIDER & CONTACT MANAGER
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Techrider & Contact Section
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage stage technical rider gear specs, booking phone, email, website, social channels, and poster image (Google Drive link or upload).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/#techrider"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
              >
                <Eye size={14} /> View Live Section <ExternalLink size={12} />
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetTechriderDefaults}
                className="rounded-full text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Undo2 size={14} className="mr-1.5" /> Reset Defaults
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveTechrider} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section Headers & Poster Image */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="border-b border-border/70 pb-3">
                  <h3 className="font-display font-bold text-foreground text-base">
                    Section Header & Press Artwork
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Customize titles and upload or link the official press visual from Google Drive.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Section Badge
                    <Input
                      value={tr.badge || ""}
                      placeholder="STAGE SPECIFICATIONS & BOOKING INQUIRIES"
                      onChange={(e) => updateTechrider({ badge: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Section Title
                    <Input
                      value={tr.sectionTitle || ""}
                      placeholder="Techrider & Contact"
                      onChange={(e) => updateTechrider({ sectionTitle: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>
                </div>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Section Subtitle
                  <Textarea
                    rows={2}
                    value={tr.sectionSubtitle || ""}
                    placeholder="Official stage technical requirements, DJ gear checklist..."
                    onChange={(e) => updateTechrider({ sectionSubtitle: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>

                {/* Poster Image Upload / Drive Link */}
                <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-teal-400" /> Stage Spec Poster Image
                    </span>
                    {uploading && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                        <Loader2 size={13} className="animate-spin" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={techriderFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, (url) => updateTechrider({ posterImageUrl: url }));
                      }}
                      className="hidden"
                      id="techrider-img-upload-input"
                    />
                    <label
                      htmlFor="techrider-img-upload-input"
                      className={`inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-bold text-teal-400 hover:bg-teal-500/20 cursor-pointer transition-colors ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <CloudUpload size={14} /> Upload Poster Image
                    </label>
                    <span className="text-xs text-muted-foreground">or paste Google Drive sharing link below</span>
                  </div>

                  <Input
                    value={tr.posterImageUrl || ""}
                    placeholder="https://drive.google.com/file/d/... or /kryso-techrider-contact.png"
                    onChange={(e) => updateTechrider({ posterImageUrl: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Any Google Drive photo link pasted here will automatically display on the live site.
                  </p>
                </div>
              </div>

              {/* Stage Technical Requirements [TECHRIDER] */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-base">
                      [TECHRIDER] Stage Technical Requirements
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Manage each gear spec, deck, mixer, microphone, and in-ear monitor requirement.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTechriderItem}
                    className="rounded-full text-xs font-bold border-teal-500/40 text-teal-400 hover:bg-teal-500/10 cursor-pointer"
                  >
                    <Plus size={13} className="mr-1" /> Add Spec Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {(tr.techriderItems || defaultKrysoTechriderData.techriderItems).map((item, idx) => (
                    <div key={item.id || idx} className="p-3.5 rounded-xl bg-background/60 border border-border/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-teal-400">Spec #{idx + 1}</span>
                        {(tr.techriderItems || defaultKrysoTechriderData.techriderItems).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTechriderItem(item.id)}
                            className="text-xs text-destructive hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <Input
                          value={item.category || ""}
                          placeholder="Category (e.g. DJ Mixer)"
                          onChange={(e) => handleUpdateTechriderItem(item.id, { category: e.target.value })}
                          className="bg-card border-border text-foreground text-xs font-semibold"
                        />
                        <Input
                          value={item.spec || ""}
                          placeholder="Gear Spec (e.g. 1 X PIONEER DJM 900 NEXUS NX2)"
                          onChange={(e) => handleUpdateTechriderItem(item.id, { spec: e.target.value })}
                          className="sm:col-span-2 bg-card border-border text-foreground text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bookings & Direct Channels [CONTACT] */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="border-b border-border/70 pb-3">
                  <h3 className="font-display font-bold text-foreground text-base">
                    [CONTACT] Bookings & Representation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Phone numbers, booking email, website, and social channel handles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking Phone / WhatsApp
                    <Input
                      value={tr.bookingPhone || ""}
                      placeholder="+91 9767378750"
                      onChange={(e) => updateTechrider({ bookingPhone: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking Email
                    <Input
                      value={tr.bookingEmail || ""}
                      placeholder="krysomusic@gmail.com"
                      onChange={(e) => updateTechrider({ bookingEmail: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Official Website URL
                    <Input
                      value={tr.websiteUrl || ""}
                      placeholder="https://www.krysomusic.com"
                      onChange={(e) => updateTechrider({ websiteUrl: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Facebook Profile URL
                    <Input
                      value={tr.facebookUrl || ""}
                      placeholder="https://facebook.com/krysomusic"
                      onChange={(e) => updateTechrider({ facebookUrl: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:col-span-2">
                    SoundCloud Profile URL
                    <Input
                      value={tr.soundcloudUrl || ""}
                      placeholder="https://soundcloud.com/kyrso_music"
                      onChange={(e) => updateTechrider({ soundcloudUrl: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-8 font-extrabold bg-teal-500 hover:bg-teal-400 text-black shadow-lg shadow-teal-500/25 cursor-pointer"
                >
                  Save Techrider & Contact
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on website."}
                  </span>
                )}
              </div>
            </div>

            {/* Live Realtime Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-teal-400">Realtime Techrider Poster</p>
                <span className="text-xs text-muted-foreground">Live Visual Preview</span>
              </div>

              <div className="rounded-3xl border border-teal-500/30 bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="relative isolate aspect-[4/5] overflow-hidden rounded-2xl border border-teal-500/30 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(tr.posterImageUrl) || "/kryso-techrider-contact.png"}
                    alt={tr.posterTitle || "Kryso Techrider & Contact"}
                    className="size-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-techrider-contact.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-[11px] font-black uppercase text-teal-300">
                      <Sparkles size={12} /> {tr.posterSubtitle || "Headliner Rider 2026"}
                    </span>
                    <p className="text-lg font-black text-white">{tr.posterTitle || "KRYSO • LIVE ON STAGE"}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Tech Specs List:</p>
                  <div className="space-y-1.5">
                    {(tr.techriderItems || defaultKrysoTechriderData.techriderItems).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                        <span className="font-semibold text-zinc-400">{it.category}</span>
                        <span className="font-mono text-zinc-100 font-bold truncate max-w-[200px]">{it.spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Bookings & Direct:</p>
                  <p className="text-zinc-300 font-bold">Phone: <span className="text-white">{tr.bookingPhone}</span></p>
                  <p className="text-zinc-300 font-bold">Email: <span className="text-teal-400">{tr.bookingEmail}</span></p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. KRYSO BIOGRAPHY & SIDE IMAGE MANAGER              */}
      {/* ---------------------------------------------------- */}
      {managerTab === "biography" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <User size={14} /> KRYSO BIOGRAPHY MANAGER
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Artist Biography & Side Portrait
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Update Kryso&apos;s story, rapper & singer bio paragraphs, side image, and social links.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
                title="Open live page in new tab"
              >
                <Eye size={14} />
                <span>View Live Bio on KRYSO Page</span>
                <ExternalLink size={12} />
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetBioDefaults}
                className="rounded-full border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
              >
                <Undo2 size={14} className="mr-1" /> Reset Bio
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bio Editor Form (7 cols) */}
            <form onSubmit={handleSaveBiography} className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2 border-b border-border/70 pb-3">
                  <Mic2 size={16} className="text-primary" /> Artist Profile & Headings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Artist Name
                    <Input
                      value={bio.name || ""}
                      placeholder="Kryso"
                      onChange={(e) => updateBio({ name: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role / Subtitle
                    <Input
                      value={bio.role || ""}
                      placeholder="Rapper, Singer & Music Producer"
                      onChange={(e) => updateBio({ role: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>
                </div>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tagline / Catchphrase
                  <Input
                    value={bio.tagline || ""}
                    placeholder="Bridging Hard-Hitting Flow, Soulful Vocals & High-Octane Stage Energy"
                    onChange={(e) => updateBio({ tagline: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal"
                  />
                </label>

                {/* Side Portrait Image Upload */}
                <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-primary" /> Side Portrait Image & Upload
                    </span>
                    {uploading && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Loader2 size={13} className="animate-spin" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={bioFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, (url) => updateBio({ imageUrl: url }));
                      }}
                      className="hidden"
                      id="bio-image-upload-input"
                    />
                    <label
                      htmlFor="bio-image-upload-input"
                      className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <CloudUpload size={14} /> Upload Portrait Image
                    </label>
                    <span className="text-xs text-muted-foreground">or edit Google Drive / image URL below</span>
                  </div>

                  <Input
                    value={bio.imageUrl || ""}
                    placeholder="https://drive.google.com/... or https://res.cloudinary.com/..."
                    onChange={(e) => updateBio({ imageUrl: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal font-mono"
                  />
                </div>

                {/* Bio Paragraphs */}
                <div className="space-y-4 pt-2">
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Biography Paragraph 1 (Introduction & Roots)
                    <Textarea
                      rows={3}
                      value={bio.bioParagraph1 || ""}
                      placeholder="Write about Kryso's rap flow, singing style, and musical background..."
                      onChange={(e) => updateBio({ bioParagraph1: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Biography Paragraph 2 (Stage Shows & Kryso Academy)
                    <Textarea
                      rows={3}
                      value={bio.bioParagraph2 || ""}
                      placeholder="Write about live concert energy and mentoring students at Kryso Academy..."
                      onChange={(e) => updateBio({ bioParagraph2: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Biography Paragraph 3 (Vision & Future Music Releases)
                    <Textarea
                      rows={2}
                      value={bio.bioParagraph3 || ""}
                      placeholder="Optional concluding message..."
                      onChange={(e) => updateBio({ bioParagraph3: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-normal"
                    />
                  </label>
                </div>

                {/* Social & Streaming URLs */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Streaming & Social Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="grid gap-1 text-[11px] font-semibold text-muted-foreground">
                      Spotify Artist URL
                      <Input
                        value={bio.spotifyUrl || ""}
                        placeholder="https://open.spotify.com/..."
                        onChange={(e) => updateBio({ spotifyUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs font-normal"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] font-semibold text-muted-foreground">
                      YouTube Channel
                      <Input
                        value={bio.youtubeUrl || ""}
                        placeholder="https://youtube.com/@krysomusic"
                        onChange={(e) => updateBio({ youtubeUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs font-normal"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] font-semibold text-muted-foreground">
                      Instagram Profile
                      <Input
                        value={bio.instagramUrl || ""}
                        placeholder="https://instagram.com/_krysomusic"
                        onChange={(e) => updateBio({ instagramUrl: e.target.value })}
                        className="bg-background border-border text-foreground text-xs font-normal"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-8 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Save Biography & Side Image
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on KRYSO page."}
                  </span>
                )}
              </div>
            </form>

            {/* Live Bio Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Realtime Bio Preview</p>
                <span className="text-xs text-muted-foreground">KRYSO Artist Card</span>
              </div>

              <div className="rounded-3xl border border-border/90 bg-card p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="relative isolate aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(bio.imageUrl) || "/kryso-hero.jpg"}
                    alt={bio.name || "Kryso"}
                    className="size-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-hero.jpg";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-[11px] font-black uppercase text-primary border border-primary/40">
                      {bio.role || "Rapper & Singer"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow">
                    <p className="font-display text-xl font-bold">{bio.name || "Kryso"}</p>
                    <p className="text-[11px] opacity-90">{bio.tagline || "Rapper & Producer"}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground">{bio.tagline}</p>
                  <p className="line-clamp-3">{bio.bioParagraph1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. KRYSO DOWNLOADS & GOOGLE DRIVE REDIRECTS          */}
      {/* ---------------------------------------------------- */}
      {managerTab === "downloads" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <FolderDown size={14} /> KRYSO DOWNLOADS & DRIVE REDIRECTS
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Downloads & Media Assets
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Add press photos, posters, and video sets. Visitors can tap photos to download, and watch videos directly on the website with a direct download option.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleAddDownload}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 cursor-pointer shadow-md shadow-primary/20"
              >
                <Plus size={14} className="mr-1" /> Add New Asset
              </Button>
              <Link
                href="/#downloads"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
                title="Open live downloads section"
              >
                <Eye size={14} />
                <span>View on Website</span>
                <ExternalLink size={12} />
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDownloads}
                className="rounded-full border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
              >
                <Undo2 size={14} className="mr-1" /> Reset Defaults
              </Button>
            </div>
          </div>

          {/* Item Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
              Select Item ({downloads?.length || 0}):
            </span>
            {(downloads && downloads.length > 0 ? downloads : defaultKrysoDownloads).map((item, idx) => {
              const isSelected = idx === safeDownloadIndex;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveDownloadIndex(idx);
                    setSaved(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-2 ring-primary/40"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-card border border-border"
                  }`}
                >
                  {item.type === "video" ? <FileVideo size={13} /> : <ImageIcon size={13} />}
                  <span className="max-w-[140px] truncate">{item.title || `Download #${idx + 1}`}</span>
                </button>
              );
            })}
          </div>

          {/* Form & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor (7 cols) */}
            <form onSubmit={handleSaveDownloads} className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center font-black text-xs">
                      #{safeDownloadIndex + 1}
                    </span>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Edit Download Details
                    </h3>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteActiveDownload}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs h-8 rounded-lg"
                  >
                    <Trash2 size={13} className="mr-1" /> Delete Item
                  </Button>
                </div>

                {/* Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Asset Title / Name
                    </label>
                    <Input
                      value={activeDownload.title || ""}
                      placeholder="e.g. Official Press Kit & 4K Portraits"
                      onChange={(e) => updateActiveDownload({ title: e.target.value })}
                      className="bg-background border-border text-foreground text-sm font-semibold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Asset Type
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-background border border-border">
                      <button
                        type="button"
                        onClick={() => updateActiveDownload({ type: "image" })}
                        className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                          activeDownload.type !== "video"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ImageIcon size={12} /> Image
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveDownload({ type: "video" })}
                        className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                          activeDownload.type === "video"
                            ? "bg-red-500 text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <FileVideo size={12} /> Video
                      </button>
                    </div>
                  </div>
                </div>

                {/* Google Drive URL (Crucial for Redirect) */}
                <div className="space-y-2 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <FolderDown size={15} /> Google Drive Redirect Link (Required)
                    </label>
                    {activeDownload.driveUrl && (
                      <a
                        href={activeDownload.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>Test Link</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <Input
                    value={activeDownload.driveUrl || ""}
                    placeholder="https://drive.google.com/file/d/... or https://drive.google.com/drive/folders/..."
                    onChange={(e) => updateActiveDownload({ driveUrl: e.target.value })}
                    className="bg-background border-primary/30 text-foreground text-sm font-mono"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    When visitors tap this card on the website, they will be redirected to this Google Drive link to view or download.
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category / Tag
                  </label>
                  <Input
                    value={activeDownload.category || ""}
                    placeholder="e.g. Press Photos, Tour Visuals, Live Sets"
                    onChange={(e) => updateActiveDownload({ category: e.target.value })}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>

                {/* Thumbnail Image Upload & URL */}
                <div className="space-y-3 rounded-2xl border border-border/80 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-primary" /> Thumbnail Image
                    </span>
                    {uploading && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Loader2 size={13} className="animate-spin" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={downloadFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, (url) => updateActiveDownload({ thumbnailUrl: url }));
                      }}
                      className="hidden"
                      id="download-thumbnail-upload-input"
                    />
                    <label
                      htmlFor="download-thumbnail-upload-input"
                      className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <CloudUpload size={14} /> Upload Thumbnail Image
                    </label>
                    <span className="text-xs text-muted-foreground">or paste image URL / Drive image URL below</span>
                  </div>

                  <Input
                    value={activeDownload.thumbnailUrl || ""}
                    placeholder="https://drive.google.com/... or /kryso-hero.jpg"
                    onChange={(e) => updateActiveDownload({ thumbnailUrl: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    rows={2}
                    value={activeDownload.description || ""}
                    placeholder="Brief details about this download item..."
                    onChange={(e) => updateActiveDownload({ description: e.target.value })}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-8 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Save Downloads & Drive Links
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Changes are live on KRYSO page."}
                  </span>
                )}
              </div>
            </form>

            {/* Live Card Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Realtime Card Preview</p>
                <span className="text-xs text-muted-foreground">Tap card to test redirect</span>
              </div>

              <a
                href={activeDownload.driveUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col rounded-3xl border-2 border-primary/50 bg-card overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] block"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(activeDownload.thumbnailUrl) || "/kryso-hero.jpg"}
                    alt={activeDownload.title || "Download"}
                    className="size-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-hero.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                        activeDownload.type === "video"
                          ? "bg-red-500/90 text-white border-red-400"
                          : "bg-primary/90 text-primary-foreground border-primary/50"
                      }`}
                    >
                      {activeDownload.type === "video" ? <FileVideo size={11} /> : <ImageIcon size={11} />}
                      <span>{activeDownload.type === "video" ? "VIDEO" : "IMAGE"}</span>
                    </span>
                  </div>

                  <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-all">
                      {activeDownload.type === "video" ? <Play size={14} className="fill-current" /> : <Download size={14} />}
                      <span>{activeDownload.type === "video" ? "Play Video" : "Download"}</span>
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    {activeDownload.category && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {activeDownload.category}
                      </span>
                    )}
                    <h3 className="font-display text-base font-bold text-foreground leading-snug">
                      {activeDownload.title || "Download Title"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {activeDownload.description || "Download description..."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-1.5">
                      <Download size={13} />
                      <span>Download</span>
                    </span>
                    <ExternalLink size={13} />
                  </div>
                </div>
              </a>

              <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 text-xs text-muted-foreground space-y-1.5">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <FolderDown size={14} className="text-primary" /> Google Drive Link Verification:
                </p>
                <p className="font-mono text-[11px] text-foreground/80 break-all">
                  {activeDownload.driveUrl || "No drive URL specified yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. ACADEMY SECTION SPOTLIGHT (IMAGES ONLY)           */}
      {/* ---------------------------------------------------- */}
      {managerTab === "academy" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} /> ACADEMY SPOTLIGHT IMAGES
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Academy Hero Images
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload or change the right-side rotating images on the Academy page.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/academy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
                title="Open live Academy page"
              >
                <Eye size={14} />
                <span>View Live Academy</span>
                <ExternalLink size={12} />
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetAcademyDefaults}
                className="rounded-full border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
              >
                <Undo2 size={14} className="mr-1" /> Reset defaults
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddAcademyImage}
                className="rounded-full font-bold shadow-md shadow-primary/20 text-xs"
              >
                <Plus size={14} className="mr-1" /> Add Image
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
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleSaveAcademyImages} className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <ImageIcon size={16} className="text-primary" /> Change Academy Image #{safeAcademyImgIndex + 1}
                  </h3>
                  {academyImages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAcademyImage(safeAcademyImgIndex)}
                      className="text-destructive hover:bg-destructive/10 text-xs h-8 px-2.5 rounded-lg"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove Image
                    </Button>
                  )}
                </div>

                {/* Upload to Cloudinary */}
                <div className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-primary" /> Image File & Upload
                    </span>
                    {uploading && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Loader2 size={13} className="animate-spin" /> Uploading image...
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
                      id="academy-image-upload-input"
                    />
                    <label
                      htmlFor="academy-image-upload-input"
                      className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <CloudUpload size={14} /> Upload Image
                    </label>
                    <span className="text-xs text-muted-foreground">or edit the URL below directly</span>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-destructive font-medium">{uploadError}</p>
                  )}

                  <Input
                    value={activeAcademyImg.url || ""}
                    placeholder="https://... or /dj-producer-hero.png"
                    onChange={(e) => updateActiveAcademyImage({ url: e.target.value })}
                    className="bg-background border-border text-foreground text-sm font-normal font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  type="submit"
                  className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer"
                >
                  Save Academy Images
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CheckCheck size={16} /> {saveTarget || "Saved! Live on Academy page."}
                  </span>
                )}
              </div>
            </form>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Academy Live Preview</p>
                <span className="text-xs text-muted-foreground">Image #{safeAcademyImgIndex + 1}</span>
              </div>

              <div className="rounded-3xl border border-border/90 bg-card p-6 shadow-2xl space-y-4">
                <div className="relative isolate aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(activeAcademyImg.url || "/dj-producer-hero.png")}
                    alt="Academy preview"
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
