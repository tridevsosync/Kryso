"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, Star } from "lucide-react";
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
      <section className="page-shell py-10">
        <Link
          href="/music"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to instruments
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="grid aspect-square max-h-[560px] place-items-center bg-accent/35">
            <div className="grid size-52 place-items-center rounded-full bg-background shadow-sm sm:size-64">
              <span className="text-8xl sm:text-9xl">{icon}</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">
              {product.category} · {product.tag}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Star size={15} className="fill-primary text-primary" />
              {product.rating} <span className="text-muted-foreground">· Loved by our music community</span>
            </p>
            <p className="mt-6 font-display text-3xl font-bold">₹{product.price.toLocaleString("en-IN")}</p>
            <p className="mt-6 max-w-lg leading-7 text-muted-foreground">{product.description}</p>
            <div className="mt-8 grid gap-3 text-sm">
              <p>
                <span className="font-semibold">Made for:</span> Learners and music lovers
              </p>
              <p>
                <span className="font-semibold">Try it:</span> Visit our Pune academy to learn more
              </p>
              <p>
                <span className="font-semibold">Good to know:</span> Ask our team for a personal recommendation
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("kryso:add-to-cart"));
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="h-12 rounded-full px-7 font-bold"
              >
                {added ? "Added to bag ✓" : "Add to bag"} <ShoppingBag size={17} />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full px-5"
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
