"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_SESSION_KEY, writeStored } from "@/lib/kryso-storage";

export function AdminLoginClient() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const cleanInput = identifier.trim();
    const cleanPass = password.trim();

    try {
      // Server-side authentication API reads credentials securely from .env
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanInput, password: cleanPass }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        writeStored(ADMIN_SESSION_KEY, {
          user: data.user || cleanInput,
          at: Date.now(),
        });
        router.push("/admin/dashboard");
        return;
      }

      // Offline fallback using NEXT_PUBLIC env variables if present without any hardcoded credentials
      const envEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim().toLowerCase();
      const envPass = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "").trim();

      if (envEmail && envPass) {
        const isMatch =
          (cleanInput.toLowerCase() === envEmail ||
            cleanInput.toLowerCase() === "admin" ||
            (envEmail.includes("@") && cleanInput.toLowerCase() === envEmail.split("@")[0])) &&
          cleanPass === envPass;

        if (isMatch) {
          writeStored(ADMIN_SESSION_KEY, { user: envEmail, at: Date.now() });
          router.push("/admin/dashboard");
          return;
        }
      }

      setError(data.error || "Invalid credentials. Please verify credentials set in .env.");
    } catch {
      // Offline fallback
      const envEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim().toLowerCase();
      const envPass = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "").trim();

      if (
        envEmail &&
        envPass &&
        (cleanInput.toLowerCase() === envEmail || cleanInput.toLowerCase() === "admin") &&
        cleanPass === envPass
      ) {
        writeStored(ADMIN_SESSION_KEY, { user: envEmail, at: Date.now() });
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password. Please check .env configuration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden grid place-items-center bg-background px-4 text-foreground">
      <Image
        src={heroImage}
        alt="Concert stage backdrop"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-[center_center] opacity-30 brightness-60 contrast-125"
      />
      <div className="absolute inset-0 -z-10 bg-radial from-background/70 via-background/90 to-background" />
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} /> Back to the website
        </Link>
        <div className="mt-5 rounded-2xl bg-card border border-border p-8 text-card-foreground shadow-2xl backdrop-blur-md">
          <div className="mb-4">
            <Image
              src="/kryso-logo.png"
              alt="KRYSO"
              width={140}
              height={50}
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-foreground">Admin login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage the concert catalog, courses, and hero banner.
          </p>

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm font-semibold text-foreground">
              Email or Username
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter admin email or username"
                autoComplete="username"
                className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-foreground">
              Password
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                required
              />
            </label>
            {error && (
              <p
                role="alert"
                className="text-xs font-semibold text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1.5" /> Authenticating...
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-1.5" /> Sign in
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
