import Image from "next/image";
import Link from "next/link";
import { Music2 } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";

export default function NotFound() {
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
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/20 text-primary border border-primary/30 mb-4">
          <Music2 size={24} />
        </span>
        <h1 className="text-7xl font-extrabold font-display text-primary drop-shadow-[0_0_25px_rgba(255,122,0,0.35)]">
          404
        </h1>
        <h2 className="mt-4 text-xl font-bold text-foreground">Track not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page or stage you&apos;re looking for doesn&apos;t exist or has moved backstage.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Back to main stage
          </Link>
        </div>
      </div>
    </div>
  );
}
