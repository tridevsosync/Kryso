"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import heroImage from "@/assets/kryso-hero.jpg";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportLovableError(error, { boundary: "next_app_error_boundary" });
  }, [error]);

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <Image
        src={heroImage}
        alt="Kryso concert stage background"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover opacity-30 brightness-75 contrast-125"
      />
      <div className="absolute inset-0 -z-10 bg-radial-[at_center] from-background/70 via-background/92 to-background" />

      <div className="max-w-md text-center bg-card/90 backdrop-blur-md border border-border p-8 rounded-2xl shadow-2xl">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/20 text-destructive border border-destructive/30 mb-4">
          <AlertCircle size={24} />
        </span>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Sound check interrupted
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong with this track. Try refreshing or head back to the main stage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/80 px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
