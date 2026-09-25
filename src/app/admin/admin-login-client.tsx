"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Music2 } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY, ADMIN_USER, writeStored } from "@/lib/kryso-storage";

export function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={15} /> Back to the website
        </Link>
        <div className="mt-5 rounded-2xl bg-card border border-border p-8 text-card-foreground shadow-2xl">
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Music2 size={20} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">Admin login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the live demo content of Kryso Music Academy.</p>
          <form
            className="mt-7 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (username.trim() === ADMIN_USER && password === ADMIN_PASSWORD) {
                writeStored(ADMIN_SESSION_KEY, { user: ADMIN_USER, at: Date.now() });
                router.push("/admin/dashboard");
              } else {
                setError("Those details don't match. Try admin / admin123.");
              }
            }}
          >
            <label className="grid gap-1.5 text-sm font-semibold text-foreground">
              Username
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
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
                placeholder="admin123"
                autoComplete="current-password"
                className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                required
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
              <Lock size={16} /> Sign in
            </Button>
          </form>
          <p className="mt-5 rounded-lg bg-secondary/80 border border-border px-4 py-3 text-xs text-muted-foreground">
            Demo credentials · username <strong>admin</strong> · password <strong>admin123</strong>. Everything is
            stored in your browser only.
          </p>
        </div>
      </div>
    </div>
  );
}
