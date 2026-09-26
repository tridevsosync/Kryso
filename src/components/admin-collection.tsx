"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  Cloud,
  Database,
  ImageIcon,
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

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "image";
  placeholder?: string;
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
}: {
  title: string;
  description: string;
  storageKey: string;
  seed?: Row[];
  fields: FieldDef[];
  filterKey?: string;
  apiCollection?: string;
  folder?: string;
}) {
  const [rows, setRows] = useStored<Row[]>(storageKey, seed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Row | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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

  const filterValues = useMemo(() => {
    if (!filterKey) return [];
    return ["All", ...Array.from(new Set(rows.map((row) => String(row[filterKey]))))];
  }, [rows, filterKey]);

  const visible = rows.filter((row) => {
    const matchesQuery = Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = !filterKey || filter === "All" || String(row[filterKey]) === filter;
    return matchesQuery && matchesFilter;
  });

  const blank = () =>
    ({
      id: `new-${Date.now()}`,
      ...Object.fromEntries(fields.map((f) => [f.key, f.type === "number" ? 0 : ""])),
    }) as Row;

  // Save row: update local state & sync to MongoDB
  const save = async (row: Row) => {
    const updated = rows.some((item) => item.id === row.id)
      ? rows.map((item) => (item.id === row.id ? row : item))
      : [row, ...rows];

    setRows(updated);
    setEditing(null);
    setSaveStatus("Saving...");

    if (apiCollection) {
      try {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: apiCollection, item: row }),
        });
        const data = await res.json();
        if (data.savedTo === "mongodb") {
          setMongoConnected(true);
          setSaveStatus("Saved to MongoDB!");
        } else {
          setSaveStatus("Saved locally");
        }
      } catch (err) {
        console.warn("Failed to persist to MongoDB:", err);
        setSaveStatus("Saved locally (offline)");
      }
    } else {
      setSaveStatus("Saved locally");
    }

    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Delete row: update local state & sync delete to MongoDB
  const removeRow = async (id: string) => {
    setRows((current) => current.filter((item) => item.id !== id));

    if (apiCollection) {
      try {
        await fetch(`/api/collections?name=${apiCollection}&id=${id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Failed to delete from MongoDB:", err);
      }
    }
  };

  // Clear all items from both local state and MongoDB
  const clearAll = async () => {
    if (!confirm(`Are you sure you want to completely clear everything from ${title}? This cannot be undone.`)) {
      return;
    }

    setRows([]);

    if (apiCollection) {
      try {
        await fetch(`/api/collections?name=${apiCollection}&id=ALL`, {
          method: "DELETE",
        });
        setSaveStatus("All cleared from MongoDB!");
      } catch (err) {
        console.warn("Failed to clear MongoDB:", err);
      }
    }

    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Handle Cloudinary image upload
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
        setEditing({
          ...editing,
          [fieldKey]: data.url,
        });
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      alert("Error uploading image to Cloudinary.");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div>
      {/* Header and status indicators */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-extrabold text-foreground">{title}</h2>
            {mongoConnected === true && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <Database size={11} /> MongoDB Active
              </span>
            )}
            {mongoConnected === false && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                <Database size={11} /> Local Storage
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-400">
              <Cloud size={11} /> Cloudinary Ready
            </span>
            {syncing && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center gap-2">
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
            className="rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary/90"
            onClick={() => setEditing(blank())}
          >
            <Plus size={16} /> Add new
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-fade-in">
          <Check size={14} /> {saveStatus}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Search {title}</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${title}...`}
            className="h-10 rounded-full pl-9 bg-card border-border text-foreground focus-visible:ring-primary"
          />
        </label>
        {filterValues.map((value) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "outline"}
            className={`h-9 rounded-full px-4 text-xs font-semibold transition-all ${
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

      {/* Table view */}
      {visible.length ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="border-b border-border bg-secondary/80 text-xs uppercase text-muted-foreground">
              <tr>
                {fields.map((field) => (
                  <th key={field.key} className="px-4 py-3 font-semibold text-foreground">
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/70 last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  {fields.map((field) => {
                    const val = row[field.key];
                    if (field.type === "image") {
                      return (
                        <td key={field.key} className="px-4 py-3">
                          {val ? (
                            <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-secondary">
                              <Image
                                src={String(val)}
                                alt={String(row.name || "Preview")}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="flex size-12 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-muted-foreground">
                              <ImageIcon size={16} />
                            </span>
                          )}
                        </td>
                      );
                    }
                    return (
                      <td key={field.key} className="max-w-64 truncate px-4 py-3 text-foreground">
                        {String(val ?? "")}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary text-muted-foreground hover:text-primary"
                      aria-label="Edit entry"
                      onClick={() => setEditing(row)}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary text-muted-foreground hover:text-destructive"
                      aria-label="Delete entry"
                      onClick={() => removeRow(row.id)}
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
        <div className="mt-6 rounded-xl border border-dashed border-border py-16 text-center bg-card/40">
          <p className="font-display text-lg font-bold text-foreground">No entries yet in {title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "No items matched your search." : "Add your first item using the button above. Everything stores in MongoDB and Cloudinary."}
          </p>
          <Button
            className="mt-4 rounded-full font-bold shadow-md shadow-primary/20"
            onClick={() => setEditing(blank())}
          >
            <Plus size={16} className="mr-1" /> Add entry
          </Button>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-xs p-4">
          <form
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card border border-border p-6 shadow-2xl text-card-foreground"
            onSubmit={(event) => {
              event.preventDefault();
              save(editing);
            }}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-xl font-bold text-foreground">
                {editing.id.startsWith("new-") ? `Add to ${title}` : "Edit entry"}
              </h3>
              <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => setEditing(null)}>
                <X size={17} />
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              {fields.map((field) => {
                if (field.type === "image") {
                  const currentImg = String(editing[field.key] || "");
                  const isUploading = uploadingField === field.key;

                  return (
                    <div key={field.key} className="grid gap-2">
                      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>{field.label}</span>
                        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                          <Cloud size={12} /> Stored in Cloudinary
                        </span>
                      </label>

                      {currentImg && (
                        <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-secondary">
                          <Image
                            src={currentImg}
                            alt="Preview"
                            fill
                            sizes="(max-width: 768px) 100vw, 450px"
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setEditing({ ...editing, [field.key]: "" })}
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
                                <span>Uploading to Cloudinary...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                <span>{currentImg ? "Change image via Cloudinary" : "Upload image to Cloudinary"}</span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>

                      <Input
                        type="url"
                        placeholder="Or paste direct image URL"
                        value={currentImg}
                        className="bg-background border-border text-foreground text-xs focus-visible:ring-primary"
                        onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                      />
                    </div>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <label key={field.key} className="grid gap-1.5 text-sm font-semibold text-foreground">
                      {field.label}
                      <Textarea
                        rows={3}
                        value={String(editing[field.key] ?? "")}
                        placeholder={field.placeholder}
                        className="bg-background border-border text-foreground focus-visible:ring-primary"
                        onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                      />
                    </label>
                  );
                }

                return (
                  <label key={field.key} className="grid gap-1.5 text-sm font-semibold text-foreground">
                    {field.label}
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={String(editing[field.key] ?? "")}
                      placeholder={field.placeholder}
                      className="bg-background border-border text-foreground focus-visible:ring-primary"
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                    />
                  </label>
                );
              })}
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
                Save to MongoDB
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
