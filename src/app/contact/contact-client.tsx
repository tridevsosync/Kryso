"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import { saveEnquiry } from "@/lib/kryso-storage";

export function ContactClient() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border">
        <Image
          src={heroImage}
          alt="Concert studio atmosphere"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[center_25%] opacity-35 brightness-75 contrast-125"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/60" />
        <div className="page-shell py-16 sm:py-20">
          <p className="eyebrow">We&apos;d love to hear from you</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl text-foreground">
            Let&apos;s talk <span className="text-primary drop-shadow-[0_0_20px_rgba(255,122,0,0.35)]">music.</span>
          </h1>
          <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
            Questions about concert coaching, classes or stage instruments? Drop us a note or give us a call.
          </p>
        </div>
      </section>

      <section className="page-shell section-space grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <SectionHeading label="Find us in Pune" title="Say hello, or come visit the studio." />
          <div className="mt-8 grid gap-6">
            {[
              { Icon: MapPin, name: "Visit", info: "Pune, Maharashtra, India" },
              { Icon: Phone, name: "Call us", info: "+91 87678 28945", href: "tel:+918767828945" },
              { Icon: Phone, name: "Or reach", info: "+91 97673 78750", href: "tel:+919767378750" },
              { Icon: Mail, name: "Email", info: "krysomusicacademy@gmail.com", href: "mailto:krysomusicacademy@gmail.com" },
            ].map(({ Icon, name, info, href }) => (
              <div className="flex gap-4" key={name}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-secondary text-primary">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">{name}</p>
                  {href ? (
                    <a href={href} className="mt-1 block font-semibold text-foreground hover:text-primary transition-colors">
                      {info}
                    </a>
                  ) : (
                    <p className="mt-1 font-semibold text-foreground">{info}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex min-h-44 flex-col justify-between bg-secondary/70 border border-border rounded-xl p-5">
            <span className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <MapPin size={15} /> Pune, Maharashtra
            </span>
            <div>
              <p className="font-display text-xl font-bold text-foreground">A place for live music, near you.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Get in touch for sound studio visits, rehearsals and academy walkthroughs.
              </p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Clock3 size={16} className="text-primary" /> Please call ahead to arrange a visit.
          </p>
        </div>

        <div className="border border-border bg-card p-6 sm:p-9 rounded-2xl shadow-xl">
          <p className="eyebrow">Send a message</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">What’s on your mind?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Share a little, and our artists will take it from there.</p>
          {sent ? (
            <div role="status" className="mt-8 grid justify-items-center bg-secondary/80 border border-primary/30 rounded-xl p-10 text-center">
              <CheckCircle2 size={35} className="text-primary" />
              <p className="mt-3 font-display text-xl font-bold text-foreground">Thanks for reaching out.</p>
              <p className="mt-2 text-sm text-muted-foreground">Your message has been received in this demo.</p>
              <Button
                variant="outline"
                className="mt-5 rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                onClick={() => setSent(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form
              className="mt-7 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                saveEnquiry({
                  kind: "contact",
                  name: String(data.get("name") ?? ""),
                  phone: String(data.get("phone") ?? ""),
                  email: String(data.get("email") ?? ""),
                  message: String(data.get("message") ?? ""),
                });
                setSent(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Name
                  <Input
                    name="name"
                    required
                    placeholder="Your name"
                    className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Phone
                  <Input
                    name="phone"
                    required
                    type="tel"
                    placeholder="+91"
                    className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Email
                <Input
                  name="email"
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Message
                <Textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us how we can help"
                  className="bg-background/80 border-border text-foreground focus-visible:ring-primary"
                />
              </label>
              <Button type="submit" className="h-11 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
                Send message <Send size={16} />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo form · saved in your browser for the admin demo.
              </p>
            </form>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
