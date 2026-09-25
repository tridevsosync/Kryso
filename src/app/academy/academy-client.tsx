"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Award, Clock3, GraduationCap, Heart, Music2, Star, UsersRound } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { courses, testimonials } from "@/data/catalog";
import { EnquiryButton } from "../enquiry-button";

const perks = [
  { icon: Award, title: "Experienced teachers", text: "Learn with working concert musicians who love to teach." },
  { icon: Heart, title: "A friendly room", text: "Start at your own pace, with no prior experience needed." },
  { icon: UsersRound, title: "Personal attention", text: "Small group and one-to-one learning, your way." },
  { icon: Music2, title: "Make music together", text: "Practice sessions and real chances to play on stage." },
  { icon: GraduationCap, title: "A real foundation", text: "Build practical skills as well as musical understanding." },
  { icon: Clock3, title: "Timings that fit", text: "Ask about lesson times that work with your week." },
];

export function AcademyClient() {
  const [review, setReview] = useState(0);

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border">
        <Image
          src={heroImage}
          alt="Academy concert rehearsal hall"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_35%] opacity-35 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/95 to-background/60" />
        <div className="page-shell grid gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-20">
          <div>
            <p className="eyebrow">Kryso Music Academy · Pune</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl text-foreground">
              A little music can change <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">a lot.</span>
            </h1>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              We make learning music welcoming, practical and full of those small moments that make you want to keep
              playing.
            </p>
            <EnquiryButton className="mt-8 h-12 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              Find your class <ArrowUpRight size={17} />
            </EnquiryButton>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { word: "Start", line: "with the basics" },
              { word: "Explore", line: "your own sound" },
              { word: "Practice", line: "with good people" },
              { word: "Perform", line: "on live stage" },
            ].map((item, i) => (
              <div
                key={item.word}
                className={`min-h-32 p-5 rounded-xl transition-all ${
                  i === 1 || i === 2
                    ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <span className="font-display text-2xl font-extrabold">{item.word}</span>
                <p className="mt-2 text-sm opacity-80">{item.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-space grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading label="Our approach" title="Good teaching. Great music. No pressure." />
          <p className="mt-5 leading-7 text-muted-foreground">
            Kryso is a place for curious people of all ages to slow down, listen, and learn. Our teachers meet you where
            you are—whether you have never touched an instrument or you&apos;re ready to take your playing further.
          </p>
          <p className="mt-4 leading-7 text-muted-foreground">
            We believe music belongs to everyone. Every lesson pairs a thoughtful foundation with time to play songs you
            actually love.
          </p>
        </div>
        <div className="grid content-start gap-6 border-l-2 border-primary pl-6">
          <div>
            <p className="eyebrow">Our mission</p>
            <p className="mt-2 font-display text-xl font-bold text-foreground">Make music education joyful, accessible and personal.</p>
          </div>
          <div>
            <p className="eyebrow">Our vision</p>
            <p className="mt-2 font-display text-xl font-bold text-foreground">A community where everyone feels at home with music.</p>
          </div>
          <div>
            <p className="eyebrow">In the studio</p>
            <p className="mt-2 leading-7 text-muted-foreground">
              A bright, welcoming practice space, instruments to explore, and friendly guidance whenever you need it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="page-shell section-space">
          <SectionHeading
            label="A good place to learn"
            title="The right kind of support."
            text="Music lessons built around people—not just pages in a book."
          />
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t border-border pt-5">
                <Icon size={20} className="text-primary" />
                <h2 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            label="Choose a course"
            title="What would you love to play?"
            text="One-to-one and small-group options available. All ages welcome."
          />
          <span className="pb-1 text-xs font-semibold text-muted-foreground">
            Beginner · Intermediate · Advanced
          </span>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="border border-border bg-card p-6 rounded-xl transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-full border border-primary/30 bg-secondary text-primary font-display text-xl">
                  {course.icon}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{course.level}</span>
              </div>
              <h2 className="mt-5 font-display text-xl font-bold text-foreground">{course.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{course.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                <div>
                  <span className="block text-muted-foreground">Duration</span>
                  <span className="mt-1 block font-bold text-foreground">{course.duration}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Monthly fees</span>
                  <span className="mt-1 block font-bold text-primary">₹{course.fees.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">With {course.instructor}</p>
              <EnquiryButton
                variant="outline"
                className="mt-5 h-10 w-full rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                Ask about this class <ArrowRight size={15} />
              </EnquiryButton>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-linear-to-r from-secondary via-background to-secondary">
        <div className="page-shell section-space grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <SectionHeading
              label="From our students"
              title="The best part is making music together."
              text="A few words from people who've started their own musical journeys with us."
            />
            <div className="mt-7 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border bg-card text-foreground hover:border-primary hover:text-primary"
                aria-label="Previous review"
                onClick={() => setReview((review + testimonials.length - 1) % testimonials.length)}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border bg-card text-foreground hover:border-primary hover:text-primary"
                aria-label="Next review"
                onClick={() => setReview((review + 1) % testimonials.length)}
              >
                →
              </Button>
            </div>
          </div>
          <div className="bg-card border border-border p-7 sm:p-10 rounded-2xl shadow-xl">
            <div className="flex gap-1 text-primary">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="mt-5 font-display text-xl font-semibold leading-8 text-foreground">“{testimonials[review]?.text}”</p>
            <div className="mt-7 flex items-center gap-3 border-t border-border pt-5">
              <span className="grid size-11 place-items-center rounded-full border border-primary/40 bg-primary/20 font-display font-bold text-primary">
                {testimonials[review]?.name.charAt(0)}
              </span>
              <div>
                <p className="font-bold text-foreground">{testimonials[review]?.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{testimonials[review]?.course} student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="grid gap-6 sm:grid-cols-4">
          {["In the practice room", "Learning together", "Sharing a first song", "Live music stage"].map(
            (caption, i) => (
              <div
                key={caption}
                className={`grid aspect-[4/3] place-items-end p-4 rounded-xl border ${
                  [
                    "bg-secondary/80 border-border text-foreground",
                    "bg-muted/80 border-border text-foreground",
                    "bg-card border-border text-foreground",
                    "bg-primary/15 border-primary/40 text-primary font-bold",
                  ][i]
                }`}
              >
                <span className="text-xs font-semibold">{caption}</span>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="border-t border-border bg-secondary text-secondary-foreground">
        <div className="page-shell flex flex-wrap items-center justify-between gap-6 py-12">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">Your next favourite thing could be a song.</h2>
          </div>
          <EnquiryButton className="h-12 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
            Enquire about classes <ArrowUpRight size={17} />
          </EnquiryButton>
        </div>
      </section>
    </SiteShell>
  );
}
