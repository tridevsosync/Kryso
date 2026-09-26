import { useCallback, useEffect, useState } from "react";

const prefix = "kryso:";

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(prefix + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch {
    /* storage unavailable in this browser */
  }
}

/** Hydration-safe local storage state: renders the seed value, then loads. */
export function useStored<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(readStored(key, seed));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? (next as (c: T) => T)(current) : next;
        writeStored(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, loaded] as const;
}

export type Enquiry = {
  id: string;
  kind: "contact" | "course";
  name: string;
  phone: string;
  email: string;
  course?: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export const ENQUIRIES_KEY = "enquiries";

export function saveEnquiry(entry: Omit<Enquiry, "id" | "createdAt" | "read">) {
  const list = readStored<Enquiry[]>(ENQUIRIES_KEY, []);
  const record: Enquiry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  writeStored(ENQUIRIES_KEY, [record, ...list]);

  if (typeof window !== "undefined") {
    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch(() => {
      // Local storage already persisted safely
    });
  }

  return record;
}

export async function deleteEnquiryRemote(id: string) {
  if (typeof window === "undefined") return;
  try {
    await fetch(`/api/enquiries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    // Local state already updated
  }
}

export async function markEnquiryReadRemote(id: string, read = true) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
  } catch {
    // Local state already updated
  }
}

export const ADMIN_SESSION_KEY = "admin-session";
export const ADMIN_USER = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim();
export const ADMIN_PASSWORD = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "").trim();
export const NEXT_PUBLIC_ADMIN_EMAIL = ADMIN_USER;
export const NEXT_PUBLIC_ADMIN_PASSWORD = ADMIN_PASSWORD;
