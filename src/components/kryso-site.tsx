"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Headphones, Instagram, Menu, Music2, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveEnquiry } from "@/lib/kryso-storage";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const addItem = () => setCartCount((count) => count + 1);
    const openEnquiry = () => setEnquiryOpen(true);
    window.addEventListener("kryso:add-to-cart", addItem);
    window.addEventListener("kryso:open-enquiry", openEnquiry);
    return () => {
      window.removeEventListener("kryso:add-to-cart", addItem);
      window.removeEventListener("kryso:open-enquiry", openEnquiry);
    };
  }, []);

  const links = [
    { label: "Kryso", to: "/" },
    { label: "Music", to: "/music" },
    { label: "Academy", to: "/academy" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="page-shell flex h-[76px] items-center justify-between gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Kryso Music Academy home">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Music2 size={20} />
            </span>
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-foreground whitespace-nowrap">
              Kryso Music Academy<span className="text-primary">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
            {links.map((link) => {
              const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`text-sm font-semibold transition-colors hover:text-primary ${
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/music"
              className="relative hidden size-10 items-center justify-center rounded-full hover:bg-secondary text-foreground hover:text-primary transition-colors sm:flex"
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <Button
              onClick={() => setEnquiryOpen(true)}
              className="hidden h-10 rounded-full px-5 font-bold shadow-md shadow-primary/20 hover:bg-primary/90 sm:inline-flex"
            >
              Enquiry now <ArrowUpRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:bg-secondary"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="page-shell grid gap-1 border-t border-border bg-background py-3 md:hidden">
            {links.map((link) => {
              const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
              return (
                <Link
                  onClick={() => setMobileOpen(false)}
                  key={link.to}
                  href={link.to}
                  className={`rounded-md px-3 py-3 font-semibold transition-colors ${
                    isActive ? "bg-secondary text-primary font-bold" : "text-foreground hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button
              onClick={() => {
                setEnquiryOpen(true);
                setMobileOpen(false);
              }}
              className="mt-2 rounded-full font-bold shadow-md shadow-primary/20"
            >
              Enquiry now
            </Button>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="bg-secondary text-secondary-foreground border-t border-border">
        <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-extrabold text-foreground">
              <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Music2 size={19} />
              </span>
              Kryso Music Academy<span className="text-primary">.</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Learn music and enjoy music. A concert-grade studio to bring real performance and joy to your sound.
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Headphones size={14} className="text-primary" /> Pune, Maharashtra
            </p>
          </div>
          <div>
            <p className="eyebrow">Explore</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <Link href="/music" className="hover:text-primary transition-colors">
                Shop instruments
              </Link>
              <Link href="/academy" className="hover:text-primary transition-colors">
                Music classes
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Visit the academy
              </Link>
            </div>
          </div>
          <div>
            <p className="eyebrow">Say hello</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <a href="tel:+918767828945" className="hover:text-primary transition-colors">+91 87678 28945</a>
              <a href="tel:+919767378750" className="hover:text-primary transition-colors">+91 97673 78750</a>
              <a href="mailto:krysomusicacademy@gmail.com" className="hover:text-primary transition-colors">krysomusicacademy@gmail.com</a>
              <p>Pune, Maharashtra, India</p>
              <a className="flex items-center gap-2 hover:text-primary transition-colors" href="https://instagram.com" aria-label="Instagram">
                <Instagram size={16} className="text-primary" /> Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50">
          <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-muted-foreground">
            <span>© 2026 Kryso Music Academy. Concerts, Academy & Shop.</span>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin login
            </Link>
          </div>
        </div>
      </footer>
      <Dialog
        open={enquiryOpen}
        onOpenChange={(open) => {
          setEnquiryOpen(open);
          if (!open) setSubmitted(false);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border text-card-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground">Let’s get you started</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tell us what you’d love to learn or perform. We’ll help you find your rhythm.
            </DialogDescription>
          </DialogHeader>
          {submitted ? (
            <div className="rounded-xl bg-secondary/80 border border-primary/30 p-6 text-center">
              <span className="text-3xl text-primary">♫</span>
              <p className="mt-3 font-semibold text-foreground">Thank you! Your enquiry is ready.</p>
              <p className="mt-1 text-sm text-muted-foreground">Our concert team will be in touch soon.</p>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                saveEnquiry({
                  kind: "course",
                  name: String(data.get("name") ?? ""),
                  phone: String(data.get("phone") ?? ""),
                  email: String(data.get("email") ?? ""),
                  course: String(data.get("course") ?? ""),
                  message: String(data.get("message") ?? ""),
                });
                setSubmitted(true);
              }}
            >
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Your name
                <Input name="name" required placeholder="Name" className="bg-background border-border text-foreground focus-visible:ring-primary" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Phone number
                <Input name="phone" required type="tel" placeholder="+91" className="bg-background border-border text-foreground focus-visible:ring-primary" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Email
                <Input name="email" type="email" placeholder="you@example.com" className="bg-background border-border text-foreground focus-visible:ring-primary" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                What would you like to learn?
                <select
                  name="course"
                  className="h-10 rounded-md border border-border bg-background px-3 font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue=""
                >
                  <option value="" disabled className="bg-background text-muted-foreground">
                    Select a course
                  </option>
                  {[
                    "Guitar",
                    "Piano",
                    "Keyboard",
                    "Drums",
                    "Violin",
                    "Flute",
                    "Harmonium",
                    "Tabla",
                    "Vocal singing",
                  ].map((name) => (
                    <option key={name} value={name} className="bg-background text-foreground">
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                A little more about it
                <Textarea name="message" placeholder="Your message" rows={3} className="bg-background border-border text-foreground focus-visible:ring-primary" />
              </label>
              <Button type="submit" className="h-11 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
                Send enquiry <ArrowUpRight size={16} />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo form · saved in your browser for the admin demo.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {cartCount >= 0 && <div className="sr-only" aria-live="polite">{cartCount} items in bag</div>}
    </div>
  );
}

export function SectionHeading({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{label}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}