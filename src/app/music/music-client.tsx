"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Search, ShoppingBag, SlidersHorizontal, Star } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { categories, products } from "@/data/catalog";

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

export function MusicShopClient() {
  const [category, setCategory] = useState("All instruments");
  const [query, setQuery] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [added, setAdded] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "All instruments" || p.category === category) &&
          `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border">
        <Image
          src={heroImage}
          alt="Concert instruments collection"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_65%] opacity-35 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/55" />
        <div className="page-shell py-16 sm:py-20">
          <p className="eyebrow">Instruments, chosen with care</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold sm:text-5xl text-foreground">
            Find the sound that&apos;s <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">yours.</span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Thoughtful picks for first notes, concert stages, and everything that comes next.
          </p>
          <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2 text-foreground font-semibold">
              <ShoppingBag size={15} className="text-primary" /> Curated instruments
            </span>
            <span>·</span>
            <span>Advice from concert artists</span>
            <span>·</span>
            <span>Visit our Pune studio</span>
          </div>
        </div>
      </section>

      <section className="page-shell py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            label="The music shop"
            title="Pick up something inspiring."
            text={`${filtered.length} stage-ready instruments and essentials to explore.`}
          />
          <label className="relative w-full max-w-xs">
            <span className="sr-only">Search instruments</span>
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search instruments"
              className="h-11 rounded-full pl-10 bg-card border-border text-foreground focus-visible:ring-primary"
            />
          </label>
        </div>

        <div className="mt-9 flex items-start gap-3">
          <SlidersHorizontal size={16} className="mt-3 shrink-0 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                onClick={() => setCategory(c)}
                variant={category === c ? "default" : "outline"}
                className={`h-9 rounded-full px-4 text-xs font-semibold transition-all ${
                  category === c
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product, index) => (
              <article
                key={product.id}
                className="group border border-border bg-card rounded-xl overflow-hidden hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <Link href={`/music/${product.id}`} className="block">
                  <div
                    className={`relative grid aspect-[4/3] place-items-center ${
                      index % 2 ? "bg-muted/70" : "bg-secondary/70"
                    }`}
                  >
                    <div className="grid size-28 place-items-center rounded-full bg-card border border-border/80 shadow-md transition-transform group-hover:scale-105">
                      <span className="text-5xl">{categoryIcons[product.category] ?? "♫"}</span>
                    </div>
                    <span className="absolute left-3 top-3 rounded-full bg-secondary/95 text-primary border border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {product.tag}
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                    <Button
                      aria-label={`${wishlist.includes(product.id) ? "Remove" : "Add"} ${product.name} ${
                        wishlist.includes(product.id) ? "from" : "to"
                      } wishlist`}
                      variant="ghost"
                      size="icon"
                      className="-mr-2 -mt-2 size-8 hover:bg-secondary text-muted-foreground hover:text-primary"
                      onClick={() =>
                        setWishlist((items) =>
                          items.includes(product.id)
                            ? items.filter((id) => id !== product.id)
                            : [...items, product.id],
                        )
                      }
                    >
                      <Heart
                        size={17}
                        className={wishlist.includes(product.id) ? "fill-primary text-primary" : ""}
                      />
                    </Button>
                  </div>
                  <Link href={`/music/${product.id}`}>
                    <h2 className="mt-1 font-display font-bold text-foreground hover:text-primary transition-colors">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star size={13} className="fill-primary text-primary" />
                      {product.rating}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("kryso:add-to-cart"));
                      setAdded((items) => [...items, product.id]);
                    }}
                    className="mt-4 h-10 w-full rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary/90"
                  >
                    {added.includes(product.id) ? "Added to bag ✓" : "Add to bag"} <ShoppingBag size={15} />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-border rounded-2xl bg-card/50 py-16 text-center">
            <p className="font-display text-xl font-bold text-foreground">No instruments found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
            <Button
              variant="outline"
              className="mt-5 rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
              onClick={() => {
                setQuery("");
                setCategory("All instruments");
              }}
            >
              Clear filters <ArrowRight size={15} />
            </Button>
          </div>
        )}
        <p className="mt-9 text-center text-xs text-muted-foreground">
          A sample catalogue · Prices shown in Indian rupees
        </p>
      </section>
    </SiteShell>
  );
}
