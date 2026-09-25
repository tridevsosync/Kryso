import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Guitar, Star } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { HomeSpotlight } from "@/components/home-spotlight";
import { courses, products } from "@/data/catalog";
import { EnquiryButton } from "./enquiry-button";

export const metadata: Metadata = {
  title: "Kryso Music Academy | Concert & Music Studio, Pune",
  description:
    "Find your rhythm at Kryso Music Academy in Pune. Explore electric music classes, live concerts, and thoughtfully chosen instruments.",
  openGraph: {
    title: "Kryso Music Academy — Learn Music, Enjoy Concerts",
    description: "Live stage energy, music lessons and instruments in Pune, Maharashtra.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function HomePage() {
  return (
    <SiteShell>
      <section className="relative isolate min-h-[640px] overflow-hidden bg-background text-foreground md:min-h-[690px]">
        <Image
          src={heroImage}
          alt="Concert stage with guitars, drums, pianos and moody stage lighting"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[62%_center] opacity-45 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/50" />
        <div className="page-shell grid min-h-[640px] items-center py-20 md:min-h-[690px]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary/80 px-4 py-2 text-xs font-semibold text-secondary-foreground backdrop-blur-sm">
              <span className="size-2 rounded-full bg-primary animate-pulse" /> LIVE MUSIC · CONCERTS & ACADEMY
            </div>
            <h1 className="mt-7 font-display text-5xl font-extrabold leading-[1.06] text-foreground sm:text-6xl lg:text-7xl">
              Learn music.
              <br />
              <span className="text-primary drop-shadow-[0_0_25px_rgba(255,122,0,0.35)]">Own the stage.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Find your rhythm at Kryso Music Academy. Learn from working concert artists, discover your sound, and bring
              home an instrument built to perform.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                <Link href="/academy">
                  Explore classes <ArrowRight size={17} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border bg-secondary/60 px-6 text-foreground hover:bg-secondary hover:border-primary/50"
              >
                <Link href="/music">
                  Shop instruments <ArrowUpRight size={17} />
                </Link>
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-5 border-t border-border/80 pt-6">
              <div className="flex -space-x-2">
                {["A", "R", "S"].map((person) => (
                  <span
                    key={person}
                    className="grid size-9 place-items-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground shadow-sm"
                  >
                    {person}
                  </span>
                ))}
              </div>
              <div>
                <p className="flex items-center gap-1 text-sm font-bold text-foreground">
                  <Star size={14} className="fill-primary text-primary" /> 4.9{" "}
                  <span className="font-normal text-muted-foreground">from our concert & music community</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Live music starts with passionate people.</p>
              </div>
            </div>
          </div>
        </div>
        <span className="absolute bottom-6 right-8 hidden text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground lg:block">
          Pune · Maharashtra
        </span>
      </section>

      <section className="page-shell section-space grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <SectionHeading
            label="A place to begin"
            title="Make music part of your everyday."
            text="Whether you're picking up an instrument for the first time or finding your way back to one, there's a seat—and a song—with your name on it."
          />
          <Link href="/academy" className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
            Meet the academy <ArrowRight size={17} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {[
            { number: "9", caption: "instruments to master" },
            { number: "All", caption: "ages welcome" },
            { number: "1:1", caption: "personal coaching" },
            { number: "100%", caption: "live music & concert heart" },
          ].map((fact) => (
            <div key={fact.caption} className="bg-card p-7 sm:p-9">
              <p className="font-display text-3xl font-extrabold text-primary">{fact.number}</p>
              <p className="mt-2 text-sm text-muted-foreground">{fact.caption}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pro DJ & Music Producer Spotlight Carousel */}
      <HomeSpotlight />

      <section className="border-y border-border bg-secondary/40">
        <div className="page-shell section-space">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              label="Find your sound"
              title="A class for every kind of curious."
              text="Small steps, great songs, and the rush of performing on stage."
            />
            <Link href="/academy" className="hidden items-center gap-2 pb-1 font-bold text-primary hover:text-primary/80 sm:flex">
              All classes <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course, index) => (
              <Link
                key={course.id}
                href="/academy"
                className="group border border-border bg-card p-6 rounded-xl transition-all hover:border-primary hover:bg-secondary/60 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`grid size-12 place-items-center rounded-full border ${
                    index === 1
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border bg-secondary text-primary"
                  }`}
                >
                  <span className="font-display text-xl">{course.icon}</span>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <ArrowUpRight size={18} className="text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.description}</p>
                <p className="mt-5 text-xs font-semibold text-muted-foreground">
                  {course.duration} <span className="px-1.5 text-primary">·</span> from ₹
                  {course.fees.toLocaleString("en-IN")}/month
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            label="The music shop"
            title="A good instrument changes everything."
            text="Concert-grade acoustics, studio electronics, and stage-ready essentials."
          />
          <Link href="/music" className="inline-flex items-center gap-2 pb-1 font-bold text-primary hover:text-primary/80">
            Visit the shop <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product, index) => (
            <Link
              href={`/music/${product.id}`}
              key={product.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className={`relative grid aspect-[4/3] place-items-center ${
                  index % 2 ? "bg-muted/60" : "bg-secondary/70"
                }`}
              >
                <div className="grid size-24 place-items-center rounded-full bg-card border border-border/80 shadow-md transition-transform group-hover:scale-105">
                  <Guitar size={40} strokeWidth={1.2} className="text-primary" />
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-secondary/95 text-primary border border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {product.tag}
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <h3 className="mt-1 font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="mt-3 flex justify-between">
                  <span className="font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={13} className="fill-primary text-primary" />
                    {product.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-linear-to-r from-secondary via-background to-secondary">
        <div className="page-shell grid gap-8 py-16 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Your first note is closer than you think</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground">
              Come as you are. Leave ready for the stage.
            </h2>
            <p className="mt-3 text-muted-foreground">Curious about a class or concert session? Tell us what you have in mind.</p>
          </div>
          <EnquiryButton className="h-12 rounded-full px-7 font-bold shadow-lg shadow-primary/20">
            Talk to our team <ArrowUpRight size={17} />
          </EnquiryButton>
        </div>
      </section>
    </SiteShell>
  );
}
