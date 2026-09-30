"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Edit2,
  ExternalLink,
  Eye,
  ImageIcon,
  List,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStored } from "@/lib/kryso-storage";
import { formatImageUrl } from "@/lib/media-utils";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "image" | "select";
  placeholder?: string;
  options?: string[];
  dynamicCollection?: string;
  storageKeyFallback?: string;
  dynamicLabelKey?: string;
};

export type Row = Record<string, string | number> & { id: string };

export function CollectionManager({
  title,
  description,
  storageKey,
  seed = [],
  fields,
  filterKey,
  apiCollection,
  folder = "kryso/uploads",
  previewUrlPrefix,
  publicPageUrl,
}: {
  title: string;
  description: string;
  storageKey: string;
  seed?: Row[];
  fields: FieldDef[];
  filterKey?: string;
  apiCollection?: string;
  folder?: string;
  previewUrlPrefix?: string;
  publicPageUrl?: string;
}) {
  const [rows, setRows] = useStored<Row[]>(storageKey, seed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Row | null>(null);
  const [previewItem, setPreviewItem] = useState<Row | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [dynamicOptionsMap, setDynamicOptionsMap] = useState<Record<string, string[]>>({});
  const [customModeFields, setCustomModeFields] = useState<Record<string, boolean>>({});

  // Fetch dynamic options (e.g. teachers for course instructor dropdown)
  useEffect(() => {
    fields.forEach((field) => {
      if (field.dynamicCollection) {
        fetch(`/api/collections?name=${field.dynamicCollection}`)
          .then((res) => res.json())
          .then((data) => {
            let names: string[] = [];
            if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
              names = data.items
                .map((it: Record<string, unknown>) => String(it[field.dynamicLabelKey || "name"] || "").trim())
                .filter(Boolean);
            }
            if (names.length === 0 && field.storageKeyFallback) {
              try {
                const stored = localStorage.getItem(field.storageKeyFallback);
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) {
                    names = parsed
                      .map((it: Record<string, unknown>) => String(it[field.dynamicLabelKey || "name"] || "").trim())
                      .filter(Boolean);
                  }
                }
              } catch {}
            }
            if (names.length > 0) {
              setDynamicOptionsMap((prev) => ({
                ...prev,
                [field.key]: Array.from(new Set(names)),
              }));
            }
          })
          .catch(() => {});
      }
    });
  }, [fields]);

  // Sync from MongoDB on mount if apiCollection is provided
  useEffect(() => {
    if (!apiCollection) return;

    let isMounted = true;
    setSyncing(true);

    fetch(`/api/collections?name=${apiCollection}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.source === "mongodb") {
          setMongoConnected(true);
          if (Array.isArray(data.items)) {
            setRows(data.items as Row[]);
          }
        } else {
          setMongoConnected(false);
        }
      })
      .catch((err) => {
        console.warn(`Could not sync ${apiCollection} from MongoDB:`, err);
        if (isMounted) setMongoConnected(false);
      })
      .finally(() => {
        if (isMounted) setSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiCollection, setRows]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filterValues = useMemo(() => {
    if (!filterKey) return [];
    return ["All", ...Array.from(new Set(rows.map((row) => String(row[filterKey] || "")).filter(Boolean)))];
  }, [rows, filterKey]);

  // Reset pagination on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filter]);

  const visible = useMemo(() => {
    const filtered = rows.filter((row) => {
      const matchesQuery = !query.trim() || Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesFilter = !filterKey || filter === "All" || String(row[filterKey]) === filter;
      return matchesQuery && matchesFilter;
    });

    const hasOrder = fields.some((f) => f.key === "order" || f.key === "sequence");
    if (hasOrder) {
      return [...filtered].sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== "" ? Number(a.order) : a.sequence !== undefined && a.sequence !== "" ? Number(a.sequence) : 9999;
        const orderB = b.order !== undefined && b.order !== "" ? Number(b.order) : b.sequence !== undefined && b.sequence !== "" ? Number(b.sequence) : 9999;
        return orderA - orderB;
      });
    }

    return filtered;
  }, [rows, query, filter, filterKey, fields]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return visible.slice(start, start + pageSize);
  }, [visible, validPage, pageSize]);

  const blank = () =>
    ({
      id: `new-${Date.now()}`,
      ...Object.fromEntries(fields.map((f) => [f.key, f.type === "number" ? 0 : ""])),
    }) as Row;

  // Save row: update local state & sync to MongoDB
  const save = async (row: Row) => {
    // Normalize any image fields that might be Google Drive links or empty strings
    const cleanRow = { ...row };
    fields.forEach((field) => {
      if (field.type === "image") {
        const val = cleanRow[field.key];
        if (typeof val === "string" && val.trim()) {
          cleanRow[field.key] = formatImageUrl(val.trim());
        } else {
          cleanRow[field.key] = "";
        }
      }
    });

    const rawUpdated = rows.some((item) => item.id === cleanRow.id)
      ? rows.map((item) => (item.id === cleanRow.id ? cleanRow : item))
      : [cleanRow, ...rows];

    const hasOrder = fields.some((f) => f.key === "order" || f.key === "sequence");
    const updated = hasOrder
      ? [...rawUpdated].sort((a, b) => {
          const orderA = a.order !== undefined && a.order !== "" ? Number(a.order) : a.sequence !== undefined && a.sequence !== "" ? Number(a.sequence) : 9999;
          const orderB = b.order !== undefined && b.order !== "" ? Number(b.order) : b.sequence !== undefined && b.sequence !== "" ? Number(b.sequence) : 9999;
          return orderA - orderB;
        })
      : rawUpdated;

    setRows(updated);
    setEditing(null);
    setSaveStatus("Saving...");

    if (apiCollection) {
      try {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: apiCollection, item: cleanRow }),
        });
        const data = await res.json();
        if (data.savedTo === "mongodb") {
          setMongoConnected(true);
          setSaveStatus("Saved to database & live site!");
        } else {
          setSaveStatus("Saved locally in cache");
        }
      } catch (err) {
        console.warn("Failed to persist to MongoDB:", err);
        setSaveStatus("Saved locally (offline)");
      }
    } else {
      setSaveStatus("Saved locally");
    }

    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Delete row: update local state & sync delete to MongoDB
  const removeRow = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this item?")) {
      return;
    }

    // Optimistic local state update
    setRows((current) => current.filter((item) => item.id !== id));
    setSaveStatus("Deleting entry...");

    if (apiCollection) {
      try {
        const res = await fetch(`/api/collections?name=${apiCollection}&id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data?.success) {
          setSaveStatus("Deleted from database & live site!");
        } else {
          setSaveStatus("Deleted locally.");
        }
      } catch (err) {
        console.warn("Failed to delete from MongoDB:", err);
        setSaveStatus("Deleted locally.");
      }
    } else {
      setSaveStatus("Deleted locally.");
    }

    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Clear all items from both local state and MongoDB
  const clearAll = async () => {
    if (!confirm(`Are you sure you want to completely clear ALL items from ${title}? This cannot be undone.`)) {
      return;
    }

    setRows([]);
    setSaveStatus("Clearing all items...");

    if (apiCollection) {
      try {
        await fetch(`/api/collections?name=${apiCollection}&id=ALL`, {
          method: "DELETE",
        });
        setSaveStatus("All entries cleared from database!");
      } catch (err) {
        console.warn("Failed to clear MongoDB:", err);
        setSaveStatus("Cleared locally.");
      }
    }

    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploadingField(fieldKey);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setEditing((prev) =>
          prev
            ? {
                ...prev,
                [fieldKey]: data.url,
              }
            : null
        );
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image.");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="w-full">
      {/* Header and status indicators */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">{title}</h2>
            {mongoConnected === true && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <Database size={11} /> Database Active
              </span>
            )}
            {mongoConnected === false && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                <Database size={11} /> Local Storage
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-400">
              <Cloud size={11} /> Cloud Storage Ready
            </span>
            {syncing && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(publicPageUrl || previewUrlPrefix) && (
            <Link
              href={publicPageUrl || previewUrlPrefix || "/academy"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors shrink-0 shadow-xs"
              title="Open live website page in new tab"
            >
              <Eye size={14} />
              <span>Live Page</span>
              <ExternalLink size={12} />
            </Link>
          )}

          {rows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold"
            >
              <Trash2 size={13} className="mr-1" /> Clear all
            </Button>
          )}

          <Button
            className="rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary/90 text-xs sm:text-sm"
            onClick={() => setEditing(blank())}
          >
            <Plus size={15} /> Add new
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-fade-in bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
          <Check size={14} /> {saveStatus}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search {title}</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${title}...`}
            className="h-10 rounded-full pl-9 bg-card border-border text-foreground text-xs sm:text-sm focus-visible:ring-primary w-full"
          />
        </label>
        {filterValues.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {filterValues.map((value) => (
              <Button
                key={value}
                variant={filter === value ? "default" : "outline"}
                size="sm"
                className={`h-8 sm:h-9 rounded-full px-3 sm:px-4 text-xs font-semibold transition-all shrink-0 ${
                  filter === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
                onClick={() => setFilter(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table view */}
      {visible.length ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card shadow-sm -mx-1 sm:mx-0">
          <table className="w-full min-w-[580px] text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-secondary/80 text-[11px] uppercase text-muted-foreground">
              <tr>
                {fields.map((field) => (
                  <th key={field.key} className="px-3 sm:px-4 py-3 font-semibold text-foreground">
                    {field.label}
                  </th>
                ))}
                <th className="px-3 sm:px-4 py-3 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/70 last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  {fields.map((field) => {
                    const val = row[field.key];
                    if (field.type === "image") {
                      const imgStr = typeof val === "string" ? val.trim() : "";
                      return (
                        <td key={field.key} className="px-3 sm:px-4 py-3">
                          {imgStr ? (
                            <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-secondary shrink-0">
                              <Image
                                src={formatImageUrl(imgStr)}
                                alt={String(row.name || "Preview")}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="flex size-12 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-muted-foreground shrink-0 text-[10px]">
                              No img
                            </span>
                          )}
                        </td>
                      );
                    }
                    return (
                      <td key={field.key} className="max-w-48 sm:max-w-64 truncate px-3 sm:px-4 py-3 text-foreground">
                        {String(val ?? "")}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap px-3 sm:px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 text-muted-foreground hover:text-primary size-8 sm:size-9"
                        aria-label="Preview details"
                        title="View & Preview"
                        onClick={() => setPreviewItem(row)}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-secondary text-muted-foreground hover:text-primary size-8 sm:size-9"
                        aria-label="Edit entry"
                        title="Edit entry"
                        onClick={() => setEditing(row)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20 text-muted-foreground hover:text-destructive size-8 sm:size-9"
                        aria-label="Delete entry"
                        title="Delete entry"
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 bg-secondary/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-foreground">{(validPage - 1) * pageSize + 1}</strong> to{" "}
                <strong className="text-foreground">{Math.min(validPage * pageSize, visible.length)}</strong> of{" "}
                <strong className="text-foreground">{visible.length}</strong> {visible.length === 1 ? "entry" : "entries"}
                {query && ` (filtered from ${rows.length})`}
              </span>

              {visible.length > 6 && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-7 rounded border border-border bg-card px-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 gap-1 px-2.5 text-xs font-semibold rounded-lg"
                >
                  <ChevronLeft size={14} /> Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    // Only show first, last, and window around validPage if lots of pages
                    if (
                      totalPages > 7 &&
                      p !== 1 &&
                      p !== totalPages &&
                      Math.abs(p - validPage) > 1
                    ) {
                      if (p === 2 || p === totalPages - 1) {
                        return (
                          <span key={p} className="px-1 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`size-8 rounded-lg text-xs font-bold transition-all ${
                          p === validPage
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 gap-1 px-2.5 text-xs font-semibold rounded-lg"
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border py-12 px-4 text-center bg-card/40">
          <p className="font-display text-base sm:text-lg font-bold text-foreground">No entries found in {title}</p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {query ? "No items matched your search query." : "Add your first item using the button above. Changes sync directly to the database."}
          </p>
          <Button
            className="mt-4 rounded-full font-bold shadow-md shadow-primary/20 text-xs sm:text-sm"
            onClick={() => setEditing(blank())}
          >
            <Plus size={15} className="mr-1" /> Add entry
          </Button>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <form
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-2xl text-card-foreground"
            onSubmit={(event) => {
              event.preventDefault();
              save(editing);
            }}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                {editing.id.startsWith("new-") ? `Add to ${title}` : "Edit entry"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close"
                className="size-8"
                onClick={() => setEditing(null)}
              >
                <X size={17} />
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              {fields.map((field) => {
                if (field.type === "image") {
                  const currentImg = String(editing[field.key] || "").trim();
                  const isUploading = uploadingField === field.key;

                  return (
                    <div key={field.key} className="grid gap-2">
                      <div className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>{field.label}</span>
                        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                          <Cloud size={12} /> Cloud Storage
                        </span>
                      </div>

                      {currentImg ? (
                        <div className="space-y-2">
                          <div className="relative h-36 sm:h-44 w-full overflow-hidden rounded-xl border border-border bg-secondary">
                            <Image
                              src={formatImageUrl(currentImg)}
                              alt="Preview"
                              fill
                              sizes="(max-width: 768px) 100vw, 450px"
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditing((prev) => (prev ? { ...prev, [field.key]: "" } : null));
                              }}
                              className="absolute top-2.5 right-2.5 rounded-full bg-black/80 p-2 text-white hover:bg-destructive hover:text-white transition-all shadow-md cursor-pointer z-10"
                              title="Remove image"
                              aria-label="Remove image"
                            >
                              <X size={15} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                              {currentImg}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing((prev) => (prev ? { ...prev, [field.key]: "" } : null));
                              }}
                              className="text-xs font-bold text-destructive hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <Trash2 size={12} /> Remove image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border/80 bg-secondary/30 p-3 text-center">
                          <p className="text-xs text-muted-foreground">No image attached (default placeholder will be used)</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <label className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            className="sr-only"
                            onChange={(e) => handleImageUpload(e, field.key)}
                          />
                          <div
                            className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 text-xs font-semibold transition-colors hover:border-primary hover:text-primary ${
                              isUploading ? "pointer-events-none opacity-60" : ""
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 size={14} className="animate-spin text-primary" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                <span>{currentImg ? "Replace image" : "Upload image"}</span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>

                      <Input
                        type="text"
                        placeholder="Or paste direct image URL or Google Drive link"
                        value={currentImg}
                        className="bg-background border-border text-foreground text-xs focus-visible:ring-primary"
                        onChange={(e) => setEditing((prev) => (prev ? { ...prev, [field.key]: e.target.value } : null))}
                      />
                    </div>
                  );
                }

                if (field.type === "select" || field.options || field.dynamicCollection) {
                  const combinedOptions = [
                    ...(field.options || []),
                    ...(dynamicOptionsMap[field.key] || []),
                  ];
                  const uniqueOptions = Array.from(new Set(combinedOptions.filter(Boolean)));
                  const currentValue = String(editing[field.key] ?? "");
                  const isCustom = customModeFields[field.key];

                  return (
                    <div key={field.key} className="grid gap-1.5 text-xs sm:text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-between">
                        <span>{field.label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomModeFields((prev) => ({
                              ...prev,
                              [field.key]: !prev[field.key],
                            }))
                          }
                          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          {isCustom ? (
                            <>
                              <List size={12} /> Choose from dropdown
                            </>
                          ) : (
                            <>
                              <Edit2 size={12} /> Type custom
                            </>
                          )}
                        </button>
                      </div>

                      {isCustom ? (
                        <Input
                          type="text"
                          value={currentValue}
                          placeholder={field.placeholder || `Enter custom ${field.label.toLowerCase()}`}
                          className="bg-background border-border text-foreground text-xs sm:text-sm focus-visible:ring-primary"
                          onChange={(e) => setEditing((prev) => (prev ? { ...prev, [field.key]: e.target.value } : null))}
                        />
                      ) : (
                        <div className="relative">
                          <select
                            value={currentValue}
                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none cursor-pointer pr-9"
                            onChange={(e) => setEditing((prev) => (prev ? { ...prev, [field.key]: e.target.value } : null))}
                          >
                            <option value="" disabled className="bg-card text-muted-foreground">
                              {field.placeholder || `-- Select ${field.label} --`}
                            </option>
                            {uniqueOptions.map((opt) => (
                              <option key={opt} value={opt} className="bg-card text-foreground">
                                {opt}
                              </option>
                            ))}
                            {currentValue && !uniqueOptions.includes(currentValue) && (
                              <option value={currentValue} className="bg-card text-foreground">
                                {currentValue} (Current / Custom)
                              </option>
                            )}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            <ChevronDown size={15} />
                          </div>
                        </div>
                      )}

                      {uniqueOptions.length === 0 && !isCustom && (
                        <p className="text-[11px] text-muted-foreground">
                          No items loaded yet. Click &quot;Type custom&quot; above to type manually.
                        </p>
                      )}
                    </div>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <label key={field.key} className="grid gap-1.5 text-xs sm:text-sm font-semibold text-foreground">
                      {field.label}
                      <Textarea
                        rows={3}
                        value={String(editing[field.key] ?? "")}
                        placeholder={field.placeholder}
                        className="bg-background border-border text-foreground text-xs sm:text-sm focus-visible:ring-primary"
                        onChange={(e) => setEditing((prev) => (prev ? { ...prev, [field.key]: e.target.value } : null))}
                      />
                    </label>
                  );
                }

                return (
                  <label key={field.key} className="grid gap-1.5 text-xs sm:text-sm font-semibold text-foreground">
                    {field.label}
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={String(editing[field.key] ?? "")}
                      placeholder={field.placeholder}
                      className="bg-background border-border text-foreground text-xs sm:text-sm focus-visible:ring-primary"
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev
                            ? {
                                ...prev,
                                [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                              }
                            : null
                        )
                      }
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-border hover:bg-secondary text-xs sm:text-sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary/90 text-xs sm:text-sm"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Item Preview Modal (Eye button click) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Eye size={15} />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {title.replace(/s$/, "")} Details & Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image Preview Banner if available */}
            {(() => {
              const imgField = fields.find((f) => f.type === "image");
              const imgVal = imgField ? String(previewItem[imgField.key] || "") : "";
              if (imgVal) {
                return (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formatImageUrl(imgVal)}
                      alt={String(previewItem.name || previewItem.title || "Preview")}
                      className="size-full object-cover"
                    />
                  </div>
                );
              }
              return null;
            })()}

            {/* Content Details */}
            <div className="space-y-3">
              <div>
                <h4 className="font-display text-xl font-extrabold text-foreground">
                  {String(previewItem.name || previewItem.title || previewItem.question || "Untitled Entry")}
                </h4>
                {previewItem.category && (
                  <span className="inline-block mt-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {String(previewItem.category)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl border border-border/70 bg-background/50 p-3.5 text-xs">
                {fields
                  .filter((f) => f.type !== "image" && f.type !== "textarea")
                  .map((f) => {
                    const val = previewItem[f.key];
                    if (val === undefined || val === null || val === "") return null;
                    return (
                      <div key={f.key} className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          {f.label}
                        </span>
                        <p className="font-semibold text-foreground text-sm">
                          {f.key.toLowerCase().includes("price") || f.key.toLowerCase().includes("fees")
                            ? `₹${val}`
                            : String(val)}
                        </p>
                      </div>
                    );
                  })}
              </div>

              {/* Textarea fields (e.g. description, syllabus, answer) */}
              {fields
                .filter((f) => f.type === "textarea")
                .map((f) => {
                  const val = previewItem[f.key];
                  if (!val) return null;
                  return (
                    <div key={f.key} className="space-y-1 rounded-xl border border-border/70 bg-background/50 p-3.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {f.label}
                      </span>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                        {String(val)}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              {previewUrlPrefix ? (
                <Link
                  href={`${previewUrlPrefix}/${encodeURIComponent(previewItem.id || String(previewItem.name || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors"
                >
                  <ExternalLink size={13} /> View Live Course Page
                </Link>
              ) : publicPageUrl ? (
                <Link
                  href={publicPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors"
                >
                  <ExternalLink size={13} /> View on Website
                </Link>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border hover:bg-secondary text-xs"
                  onClick={() => {
                    const toEdit = previewItem;
                    setPreviewItem(null);
                    setEditing(toEdit);
                  }}
                >
                  <Pencil size={13} className="mr-1" /> Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full text-xs font-semibold"
                  onClick={() => setPreviewItem(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
