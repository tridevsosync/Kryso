import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Headphones, Instagram, Menu, Music2, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveEnquiry } from "@/lib/kryso-storage";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
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
  const links = [{ label: "Music", to: "/music" as const }, { label: "Academy", to: "/academy" as const }, { label: "Contact", to: "/contact" as const }];
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="page-shell grid h-[76px] grid-cols-[1fr_auto] items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="flex items-center gap-2.5 justify-self-start" aria-label="Kryso Music Academy home"><span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"><Music2 size={20}/></span><span className="font-display text-xl font-extrabold">kryso<span className="text-primary">.</span></span></Link>
        <nav className="hidden items-center gap-8 md:flex">{links.map((link) => <Link key={link.to} to={link.to} className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname.startsWith(link.to) ? "text-primary" : "text-muted-foreground"}`}>{link.label}</Link>)}</nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Link to="/music" className="relative hidden size-10 items-center justify-center rounded-full hover:bg-muted sm:flex" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag size={18}/>{cartCount > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold">{cartCount}</span>}</Link>
          <Button onClick={() => setEnquiryOpen(true)} className="hidden h-10 rounded-full px-5 font-bold sm:inline-flex">Enquiry now <ArrowUpRight size={16}/></Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileOpen((v) => !v)}>{mobileOpen ? <X/> : <Menu/>}</Button>
        </div>
      </div>
      {mobileOpen && <nav className="page-shell grid gap-1 border-t border-border py-3 md:hidden">{links.map((link) => <Link onClick={() => setMobileOpen(false)} key={link.to} to={link.to} className="rounded-md px-3 py-3 font-semibold hover:bg-muted">{link.label}</Link>)}<Button onClick={() => { setEnquiryOpen(true); setMobileOpen(false); }} className="mt-2 rounded-full">Enquiry now</Button></nav>}
    </header>
    <main>{children}</main>
    <footer className="bg-secondary text-secondary-foreground">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div><Link to="/" className="flex items-center gap-2 font-display text-2xl font-extrabold"> <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"><Music2 size={19}/></span>kryso<span className="text-primary">.</span></Link><p className="mt-4 max-w-sm text-sm leading-6 text-secondary-foreground/70">Learn music and enjoy music. A welcoming place to make a little more room for music in your life.</p><p className="mt-5 flex items-center gap-2 text-xs text-secondary-foreground/60"><Headphones size={14}/> Pune, Maharashtra</p></div>
        <div><p className="eyebrow">Explore</p><div className="mt-4 grid gap-3 text-sm text-secondary-foreground/75"><Link to="/music" className="hover:text-primary">Shop instruments</Link><Link to="/academy" className="hover:text-primary">Music classes</Link><Link to="/contact" className="hover:text-primary">Visit the academy</Link></div></div>
        <div><p className="eyebrow">Say hello</p><div className="mt-4 grid gap-3 text-sm text-secondary-foreground/75"><a href="tel:+918767828945">+91 87678 28945</a><a href="tel:+919767378750">+91 97673 78750</a><a href="mailto:krysomusicacademy@gmail.com">krysomusicacademy@gmail.com</a><p>Pune, Maharashtra, India</p><a className="flex items-center gap-2 hover:text-primary" href="https://instagram.com" aria-label="Instagram"><Instagram size={16}/> Instagram</a></div></div>
      </div>
      <div className="border-t border-secondary-foreground/10"><div className="page-shell flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-secondary-foreground/55"><span>© 2026 Kryso Music Academy. All music, all heart.</span><Link to="/admin" className="hover:text-primary">Admin login</Link></div></div>
    </footer>
    <Dialog open={enquiryOpen} onOpenChange={(open) => { setEnquiryOpen(open); if (!open) setSubmitted(false); }}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle className="font-display text-2xl">Let’s get you started</DialogTitle><DialogDescription>Tell us what you’d love to learn. We’ll help you find your rhythm.</DialogDescription></DialogHeader>{submitted ? <div className="rounded-xl bg-accent p-6 text-center"><span className="text-3xl">♫</span><p className="mt-3 font-semibold">Thank you! Your enquiry is ready.</p><p className="mt-1 text-sm text-muted-foreground">Our team will be in touch soon.</p></div> : <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); saveEnquiry({ kind: "course", name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? ""), email: String(data.get("email") ?? ""), course: String(data.get("course") ?? ""), message: String(data.get("message") ?? "") }); setSubmitted(true); }}><label className="grid gap-1.5 text-sm font-semibold">Your name<Input name="name" required placeholder="Name"/></label><label className="grid gap-1.5 text-sm font-semibold">Phone number<Input name="phone" required type="tel" placeholder="+91"/></label><label className="grid gap-1.5 text-sm font-semibold">Email<Input name="email" type="email" placeholder="you@example.com"/></label><label className="grid gap-1.5 text-sm font-semibold">What would you like to learn?<select name="course" className="h-10 rounded-md border border-input bg-background px-3 font-normal" defaultValue=""><option value="" disabled>Select a course</option>{["Guitar", "Piano", "Keyboard", "Drums", "Violin", "Flute", "Harmonium", "Tabla", "Vocal singing"].map((name) => <option key={name}>{name}</option>)}</select></label><label className="grid gap-1.5 text-sm font-semibold">A little more about it<Textarea name="message" placeholder="Your message" rows={3}/></label><Button type="submit" className="h-11 rounded-full font-bold">Send enquiry <ArrowUpRight size={16}/></Button><p className="text-center text-xs text-muted-foreground">Demo form · saved in your browser for the admin demo.</p></form>}</DialogContent></Dialog>
    {cartCount >= 0 && <div className="sr-only" aria-live="polite">{cartCount} items in bag</div>}
  </div>;
}

export function SectionHeading({ label, title, text }: { label: string; title: string; text?: string }) { return <div className="max-w-2xl"><p className="eyebrow">{label}</p><h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>{text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}</div>; }