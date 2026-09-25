import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStored } from "@/lib/kryso-storage";

export type FieldDef = { key: string; label: string; type?: "text" | "number" | "textarea" };

type Row = Record<string, string | number> & { id: string };

export function CollectionManager({
  title,
  description,
  storageKey,
  seed,
  fields,
  filterKey,
}: {
  title: string;
  description: string;
  storageKey: string;
  seed: Row[];
  fields: FieldDef[];
  filterKey?: string;
}) {
  const [rows, setRows] = useStored<Row[]>(storageKey, seed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Row | null>(null);

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
    ({ id: `new-${Date.now()}`, ...Object.fromEntries(fields.map((f) => [f.key, f.type === "number" ? 0 : ""])) }) as Row;

  const save = (row: Row) => {
    setRows((current) =>
      current.some((item) => item.id === row.id)
        ? current.map((item) => (item.id === row.id ? row : item))
        : [row, ...current],
    );
    setEditing(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="rounded-full font-semibold" onClick={() => setEditing(blank())}>
          <Plus size={16} /> Add new
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Search {title}</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-10 rounded-full pl-9" />
        </label>
        {filterValues.map((value) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "outline"}
            className="h-9 rounded-full px-4 text-xs"
            onClick={() => setFilter(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      {visible.length ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {fields.map((field) => (
                  <th key={field.key} className="px-4 py-3 font-semibold">
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0">
                  {fields.map((field) => (
                    <td key={field.key} className="max-w-64 truncate px-4 py-3">
                      {String(row[field.key] ?? "")}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${row[fields[0]!.key]}`} onClick={() => setEditing(row)}>
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${row[fields[0]!.key]}`}
                      onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                    >
                      <Trash2 size={15} className="text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-display text-lg font-bold">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add an entry or clear your search.</p>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <form
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-lg"
            onSubmit={(event) => {
              event.preventDefault();
              save(editing);
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Edit entry</h3>
              <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => setEditing(null)}>
                <X size={17} />
              </Button>
            </div>
            <div className="mt-5 grid gap-4">
              {fields.map((field) => (
                <label key={field.key} className="grid gap-1.5 text-sm font-semibold">
                  {field.label}
                  {field.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      value={String(editing[field.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                    />
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={String(editing[field.key] ?? "")}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full font-semibold">
                Save changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
