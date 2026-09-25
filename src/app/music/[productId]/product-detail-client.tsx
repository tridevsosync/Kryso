"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, ShoppingBag, Star } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/kryso-site";
import type { Product } from "@/data/catalog";

const categoryIcons: Record<string, string> = {
  Guitar: "🎸",
  Piano: "🎹",
  Keyboard: "🎹",
  Drum: "🥁",
  Violin: "🎻",
  Flute: "🪈",
  Tabla: "🥁",
  Ukulele: "🎸",
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const icon = categoryIcons[product.category] ?? "♫";

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border">
        <Image
          src={heroImage}
          alt={`${product.name} concert backdrop`}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_40%] opacity-30 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/60" />
        <div className="page-shell py-12 sm:py-16">
          <Link
            href="/music"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={15} /> All instruments & gear
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                {product.category} · {product.tag}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-5xl text-foreground">
                {product.name}
              </h1>
            </div>
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="grid aspect-square max-h-[560px] place-items-center bg-secondary/60 border border-border rounded-2xl shadow-2xl">
            <div className="grid size-52 place-items-center rounded-full bg-card border border-border/80 shadow-inner sm:size-64">
              <span className="text-8xl sm:text-9xl drop-shadow-md">{icon}</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">
              {product.category} · {product.tag}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl text-foreground">{product.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
              <Star size={15} className="fill-primary text-primary" />
              {product.rating} <span className="text-muted-foreground">· Loved by our concert community</span>
            </p>
            <p className="mt-6 font-display text-4xl font-extrabold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
            <p className="mt-6 max-w-lg leading-7 text-muted-foreground">{product.description}</p>
            <div className="mt-8 grid gap-3 text-sm rounded-xl border border-border bg-card p-5">
              <p>
                <span className="font-semibold text-foreground">Made for:</span>{" "}
                <span className="text-muted-foreground">Performers, learners, and live concerts</span>
              </p>
              <p>
                <span className="font-semibold text-foreground">Try it:</span>{" "}
                <span className="text-muted-foreground">Visit our Pune sound studio to experience it live</span>
              </p>
              <p>
                <span className="font-semibold text-foreground">Good to know:</span>{" "}
                <span className="text-muted-foreground">Ask our team for a personalized artist recommendation</span>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("kryso:add-to-cart"));
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="h-12 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                {added ? "Added to bag ✓" : "Add to bag"} <ShoppingBag size={17} />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full px-5 border-border bg-card hover:border-primary text-muted-foreground hover:text-primary"
                aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => setWishlist((prev) => !prev)}
              >
                <Heart size={17} className={wishlist ? "fill-primary text-primary" : ""} />
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sample catalogue · Product information is for demonstration.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
