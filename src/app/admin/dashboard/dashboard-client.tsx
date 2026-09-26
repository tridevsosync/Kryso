"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCheck,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Music,
  Phone,
  PhoneCall,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CollectionManager } from "@/components/admin-collection";
import {
  ADMIN_SESSION_KEY,
  ENQUIRIES_KEY,
  readStored,
  useStored,
  writeStored,
  deleteEnquiryRemote,
  markEnquiryReadRemote,
  type Enquiry,
} from "@/lib/kryso-storage";
import { siteSettings, teachers, testimonials } from "@/data/catalog";
import { SpotlightManager } from "@/components/admin-spotlight";
import { MusicTrackManager } from "@/components/admin-music-tracks";

export const sections = [
  "Dashboard",
  "Hero spotlight",
  "Music",
  "Academy",
  "Teacher",
  "Contact",
  "Enquiry",
  "Setting",
] as const;

export type Section = (typeof sections)[number];

const seedTestimonials = testimonials.map((item, index) => ({ id: `t${index + 1}`, ...item }));
const seedCategories = [
  "Guitar",
  "Piano",
  "Keyboard",
  "Drum",
  "Violin",
  "Flute",
  "Harmonium",
  "Tabla",
  "Ukulele",
  "Accessories",
].map((name, index) => ({ id: `c${index + 1}`, name, type: "Product category" }));

export function AdminDashboardClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState<Section>("Dashboard");
  const [enquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);

  const unreadCount = enquiries.filter((e) => !e.read).length;

  useEffect(() => {
    if (!readStored<{ user?: string } | null>(ADMIN_SESSION_KEY, null)) {
      router.push("/admin");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground bg-background">
        Checking your session…
      </div>
    );
  }

  const navItems = [
    { id: "Dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "Hero spotlight" as const, label: "Hero spotlight", icon: Sparkles },
    { id: "Music" as const, label: "Music", icon: Music },
    { id: "Academy" as const, label: "Academy", icon: GraduationCap },
    { id: "Teacher" as const, label: "Teacher", icon: Users },
    { id: "Contact" as const, label: "Contact", icon: PhoneCall },
    { id: "Enquiry" as const, label: "Enquiry", icon: Inbox, badge: unreadCount },
    { id: "Setting" as const, label: "Setting", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="border-b border-border bg-secondary p-5 text-secondary-foreground lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <Link href="/" className="inline-block py-1 group" aria-label="KRYSO home">
            <Image
              src="/kryso-logo.png"
              alt="KRYSO"
              width={120}
              height={42}
              priority
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="mt-6 flex flex-wrap gap-1 lg:grid">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                      : "text-muted-foreground hover:bg-secondary-foreground/10 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={17} />
                    {item.label}
                  </span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        isActive
                          ? "bg-primary-foreground text-primary"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => {
                writeStored(ADMIN_SESSION_KEY, null);
                router.push("/admin");
              }}
              className="mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary-foreground/10 hover:text-destructive transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-5 sm:p-8">
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-background p-6 sm:p-8 mb-8 shadow-xl">
            <Image
              src={heroImage}
              alt="Concert stage control room"
              fill
              priority
              sizes="100vw"
              className="absolute inset-0 -z-20 object-cover object-[center_35%] opacity-25 brightness-75 contrast-125"
            />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/70" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Control Room · Live Console</p>
                <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  Kryso Stage & Content Management
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">Admin dashboard · active management console</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                <span className="size-2 rounded-full bg-primary animate-pulse" /> Live Session Active
              </div>
            </div>
          </div>

          {section === "Dashboard" && <Overview onOpen={setSection} />}
          {section === "Hero spotlight" && <SpotlightManager />}
          {section === "Music" && <MusicSection />}
          {section === "Academy" && <AcademySection />}
          {section === "Teacher" && <TeacherSection />}
          {section === "Contact" && <ContactSection />}
          {section === "Enquiry" && <EnquirySection />}
          {section === "Setting" && <SettingSection />}
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. Dashboard Overview
// ----------------------------------------------------
function Overview({ onOpen }: { onOpen: (section: Section) => void }) {
  const [enquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);
  const [storedTracks] = useStored<unknown[]>("admin-music-tracks-v1", []);
  const [storedCourses] = useStored<unknown[]>("admin-courses-v3", []);
  const pendingCount = enquiries.filter((item) => !item.read).length;

  const cards: Array<{ label: string; value: number | string; section: Section; desc: string }> = [
    { label: "Hero spotlight", value: 2, section: "Hero spotlight", desc: "Active hero slides" },
    { label: "Music", value: storedTracks.length, section: "Music", desc: "Tracks & MP4 downloads" },
    { label: "Academy", value: storedCourses.length, section: "Academy", desc: "Stored in MongoDB" },
    { label: "Teacher", value: teachers.length, section: "Teacher", desc: "Mentors & instructors" },
    { label: "Contact", value: "Pune", section: "Contact", desc: "Studio hours & location" },
    { label: "Enquiry", value: pendingCount, section: "Enquiry", desc: "Unread student queries" },
    { label: "Setting", value: "Active", section: "Setting", desc: "Branding & copy config" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">A quick look at your academy, concert shop, and active leads.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onOpen(card.section)}
            className="rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
          >
            <p className="font-display text-3xl font-extrabold text-primary">{card.value}</p>
            <p className="mt-2 text-base font-bold text-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground">{card.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Recent enquiries</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpen("Enquiry")}
            className="text-xs text-primary hover:bg-secondary"
          >
            View all enquiries →
          </Button>
        </div>
        {enquiries.length ? (
          <ul className="mt-4 grid gap-3 text-sm">
            {enquiries.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3 last:border-0"
              >
                <span>
                  <strong className="text-foreground">{item.name}</strong>{" "}
                  <span className="text-muted-foreground">sent a {item.kind} enquiry</span>
                  {item.course ? <span className="text-primary font-medium"> about {item.course}</span> : ""}
                  {!item.read && (
                    <span className="ml-2 rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-bold">
                      NEW
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No enquiries yet. Inquiries submitted through the website will appear here and in the Enquiry section.
          </p>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. Music Section (Products & Categories)
// ----------------------------------------------------
function MusicSection() {
  const [tab, setTab] = useState<"tracks" | "products" | "categories">("tracks");
  const [storedTracks] = useStored<unknown[]>("admin-music-tracks-v1", []);
  const [storedProducts] = useStored<unknown[]>("admin-products-v3", []);
  const [storedCategories] = useStored<unknown[]>("admin-categories-v3", []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Music Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage music tracks, MP4/audio uploads, social lock gating, and instruments in MongoDB & Cloudinary.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg bg-secondary p-1 border border-border gap-1">
          <button
            onClick={() => setTab("tracks")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "tracks"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Music Tracks ({storedTracks.length})
          </button>
          <button
            onClick={() => setTab("products")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "products"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Instruments ({storedProducts.length})
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "categories"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Categories ({storedCategories.length})
          </button>
        </div>
      </div>

      {tab === "tracks" && <MusicTrackManager />}

      {tab === "products" && (
        <CollectionManager
          title="Instruments & Gear"
          description="Instruments and accessories in the music shop. Saved in MongoDB; images uploaded to Cloudinary."
          storageKey="admin-products-v3"
          apiCollection="music_products"
          folder="kryso/music"
          seed={[]}
          filterKey="category"
          fields={[
            { key: "name", label: "Product Name" },
            { key: "imageUrl", label: "Product Image", type: "image" },
            { key: "category", label: "Category" },
            { key: "price", label: "Price (₹)", type: "number" },
            { key: "rating", label: "Rating (1 to 5)", type: "number" },
            { key: "tag", label: "Tag / Badge (e.g. Best seller, Stage)" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      )}

      {tab === "categories" && (
        <CollectionManager
          title="Instrument Categories"
          description="Product categories used across the music catalog. Saved in MongoDB."
          storageKey="admin-categories-v3"
          apiCollection="music_categories"
          seed={[]}
          filterKey="type"
          fields={[
            { key: "name", label: "Category Name" },
            { key: "type", label: "Type" },
          ]}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// 3. Academy Section (Courses, Students, Testimonials, Gallery)
// ----------------------------------------------------
function AcademySection() {
  const [tab, setTab] = useState<"courses" | "students" | "testimonials" | "gallery">("courses");
  const [storedCourses] = useStored<unknown[]>("admin-courses-v3", []);
  const [storedStudents] = useStored<unknown[]>("admin-students-v3", []);
  const [storedTestimonials] = useStored<unknown[]>("admin-testimonials-v3", []);
  const [storedGallery] = useStored<unknown[]>("admin-gallery-v3", []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Academy Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clean state active. All courses, students, testimonials, and gallery are stored directly in MongoDB & Cloudinary.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg bg-secondary p-1 border border-border gap-1">
          <button
            onClick={() => setTab("courses")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "courses"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Courses ({storedCourses.length})
          </button>
          <button
            onClick={() => setTab("students")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "students"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Students ({storedStudents.length})
          </button>
          <button
            onClick={() => setTab("testimonials")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "testimonials"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Testimonials ({storedTestimonials.length})
          </button>
          <button
            onClick={() => setTab("gallery")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "gallery"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Gallery ({storedGallery.length})
          </button>
        </div>
      </div>

      {tab === "courses" && (
        <CollectionManager
          title="Academy Courses"
          description="Classes and curriculums offered at the academy. Saved in MongoDB; images on Cloudinary."
          storageKey="admin-courses-v3"
          apiCollection="academy_courses"
          folder="kryso/academy"
          seed={[]}
          fields={[
            { key: "imageUrl", label: "Image", type: "image", placeholder: "Upload course image to Cloudinary" },
            { key: "name", label: "Course Name", placeholder: "e.g. Electric Guitar Mastery" },
            { key: "instructor", label: "Teacher Name", placeholder: "e.g. Aarav Kulkarni" },
            { key: "fees", label: "Price (₹)", type: "number", placeholder: "e.g. 2500" },
            { key: "description", label: "Description", type: "textarea", placeholder: "Detailed course overview, curriculum, and skills taught..." },
            { key: "duration", label: "Duration", placeholder: "e.g. 3 Months" },
            { key: "level", label: "Level", placeholder: "e.g. All levels, Beginner, Advanced" },
          ]}
        />
      )}

      {tab === "students" && (
        <CollectionManager
          title="Student Roster"
          description="Enrolled academy students and their progression levels. Saved in MongoDB."
          storageKey="admin-students-v3"
          apiCollection="academy_students"
          folder="kryso/students"
          seed={[]}
          filterKey="level"
          fields={[
            { key: "name", label: "Student Name" },
            { key: "avatarUrl", label: "Student Photo", type: "image" },
            { key: "course", label: "Enrolled Course" },
            { key: "level", label: "Current Level" },
            { key: "joined", label: "Date Joined" },
          ]}
        />
      )}

      {tab === "testimonials" && (
        <CollectionManager
          title="Student Reviews"
          description="Parent and student testimonials displayed on the academy page. Saved in MongoDB."
          storageKey="admin-testimonials-v3"
          apiCollection="academy_testimonials"
          folder="kryso/testimonials"
          seed={[]}
          fields={[
            { key: "name", label: "Reviewer Name" },
            { key: "avatarUrl", label: "Reviewer Avatar", type: "image" },
            { key: "course", label: "Course / Instrument" },
            { key: "text", label: "Review Content", type: "textarea" },
          ]}
        />
      )}

      {tab === "gallery" && (
        <CollectionManager
          title="Academy Gallery"
          description="Photos and memorable moments from concerts and rehearsals. Saved in MongoDB; photos in Cloudinary."
          storageKey="admin-gallery-v3"
          apiCollection="academy_gallery"
          folder="kryso/gallery"
          seed={[]}
          filterKey="category"
          fields={[
            { key: "imageUrl", label: "Gallery Photo", type: "image" },
            { key: "caption", label: "Image Caption" },
            { key: "category", label: "Category (Workshops, Events, Studio)" },
          ]}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// 4. Teacher Section
// ----------------------------------------------------
function TeacherSection() {
  return (
    <div>
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="font-display text-2xl font-extrabold text-foreground">Teacher & Faculty Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage music instructors, masterclass leaders, and concert mentors.
        </p>
      </div>

      <CollectionManager
        title="Instructors & Mentors"
        description="The artists and educators who teach at Kryso Music Academy. Saved in MongoDB; photos in Cloudinary."
        storageKey="admin-teachers-v3"
        apiCollection="academy_teachers"
        folder="kryso/teachers"
        seed={[]}
        fields={[
          { key: "name", label: "Teacher Name" },
          { key: "avatarUrl", label: "Teacher Photo", type: "image" },
          { key: "experience", label: "Experience (e.g. 10+ yrs)" },
          { key: "specialization", label: "Specialization (e.g. Electric Guitar & Blues)" },
          { key: "bio", label: "Biography & Background", type: "textarea" },
        ]}
      />
    </div>
  );
}

// ----------------------------------------------------
// 5. Contact Section
// ----------------------------------------------------
function ContactSection() {
  const [settings, setSettings] = useStored("admin-settings", siteSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [syncedMongo, setSyncedMongo] = useState(false);

  // Sync settings from MongoDB collection on load
  useEffect(() => {
    fetch("/api/collections?name=site_settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remote = data.items.find((it: { id?: string }) => it.id === "contact_info") || data.items[0];
          if (remote) {
            setSettings((prev) => ({ ...prev, ...remote }));
            setSyncedMongo(true);
          }
        }
      })
      .catch(() => {});
  }, [setSettings]);

  const contactFields = [
    { key: "phone" as const, label: "Primary Phone Number", placeholder: "+91 87678 28945" },
    { key: "altPhone" as const, label: "Alternate / WhatsApp Phone", placeholder: "+91 97673 78750" },
    { key: "email" as const, label: "Official Contact Email", placeholder: "krysomusicacademy@gmail.com" },
    { key: "address" as const, label: "Academy Studio Address", placeholder: "Pune, Maharashtra, India" },
    { key: "tagline" as const, label: "Academy Tagline", placeholder: "Learn Music and Enjoy Music" },
    { key: "footerText" as const, label: "Footer Copyright / Text", placeholder: "© 2026 Kryso Music Academy. All music, all heart." },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    // Save to local storage
    setSettings(settings);

    // Save to MongoDB collection 'site_settings'
    try {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "site_settings",
          item: {
            id: "contact_info",
            ...settings,
            updatedAt: new Date().toISOString(),
          },
        }),
      });
      setSyncedMongo(true);
    } catch {
      // Local storage saved safely
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Contact & Studio Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the public contact details shown on the website footer, Contact page, and Enquiry forms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncedMongo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Synced with MongoDB
            </span>
          )}
        </div>
      </div>

      <form className="grid gap-5" onSubmit={handleSave}>
        <div className="grid gap-4 sm:grid-cols-2">
          {contactFields.map((f) => (
            <label key={f.key} className="grid gap-1.5 text-sm font-semibold text-foreground">
              {f.label}
              <Input
                value={settings[f.key] || ""}
                placeholder={f.placeholder}
                className="bg-card border-border text-foreground focus-visible:ring-primary"
                onChange={(e) => {
                  setSaved(false);
                  setSettings({ ...settings, [f.key]: e.target.value });
                }}
              />
            </label>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-bold text-foreground">Studio Visit & Timings</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Information displayed for prospective students visiting the Pune studio.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-secondary p-3 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold">Studio Hours</p>
              <p className="mt-1 font-bold text-foreground">Mon – Sat: 10:00 AM – 8:30 PM</p>
              <p className="text-xs text-muted-foreground">Sunday: Live Masterclasses & Concerts</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold">Location Zone</p>
              <p className="mt-1 font-bold text-foreground">{settings.address || "Pune, Maharashtra, India"}</p>
              <p className="text-xs text-muted-foreground">Concert Hall & Sound Rehearsal Space</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            {saving ? "Saving..." : "Save Contact Details"}
          </Button>
          {saved && (
            <span className="text-sm font-semibold text-emerald-400">
              ✓ Saved successfully to MongoDB & live website!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ----------------------------------------------------
// 6. Enquiry Section
// ----------------------------------------------------
function EnquirySection() {
  const [enquiries, setEnquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);
  const [filter, setFilter] = useState<"all" | "course" | "contact" | "unread">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync enquiries from MongoDB on mount
  const syncEnquiriesFromMongo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (data?.enquiries && Array.isArray(data.enquiries)) {
        // Merge remote and local enquiries, avoiding duplicates
        const remoteList: Enquiry[] = data.enquiries;
        const localList = readStored<Enquiry[]>(ENQUIRIES_KEY, []);
        const map = new Map<string, Enquiry>();
        // Add remote first
        for (const item of remoteList) {
          if (item?.id) map.set(item.id, item);
        }
        // Add any local that might not have reached server yet
        for (const item of localList) {
          if (item?.id && !map.has(item.id)) {
            map.set(item.id, item);
          }
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setEnquiries(merged);
        writeStored(ENQUIRIES_KEY, merged);
      }
    } catch {
      // Local enquiries remain active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncEnquiriesFromMongo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id: string, read: boolean) => {
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, read } : e)));
    await markEnquiryReadRemote(id, read);
  };

  const handleDelete = async (id: string) => {
    setEnquiries((list) => list.filter((e) => e.id !== id));
    await deleteEnquiryRemote(id);
  };

  const handleMarkAllRead = async () => {
    const unread = enquiries.filter((e) => !e.read);
    setEnquiries((list) => list.map((e) => ({ ...e, read: true })));
    for (const item of unread) {
      markEnquiryReadRemote(item.id, true);
    }
  };

  const filtered = enquiries.filter((item) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "unread"
        ? !item.read
        : item.kind === filter;

    const matchesQuery = `${item.name} ${item.phone} ${item.email} ${item.course || ""} ${item.message}`
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  const contactCount = enquiries.filter((e) => e.kind === "contact").length;
  const courseCount = enquiries.filter((e) => e.kind === "course").length;
  const unreadCount = enquiries.filter((e) => !e.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-foreground">Course Enquiries & Contacts</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={syncEnquiriesFromMongo}
              disabled={loading}
              className="h-8 gap-1.5 rounded-full text-xs font-semibold"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              {loading ? "Syncing..." : "Sync MongoDB"}
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads and applications submitted by students selecting courses or sending messages.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-lg bg-secondary p-1 border border-border flex-wrap gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({enquiries.length})
          </button>
          <button
            onClick={() => setFilter("course")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "course"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🎓 Courses ({courseCount})
          </button>
          <button
            onClick={() => setFilter("contact")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              filter === "contact"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ✉️ Contact ({contactCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              filter === "unread"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            New ({unreadCount})
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, course, phone, or email..."
          className="h-10 max-w-sm rounded-full bg-card border-border text-foreground focus-visible:ring-primary"
        />
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:bg-secondary font-semibold"
          >
            <CheckCheck size={14} className="mr-1" /> Mark all ({unreadCount}) as read
          </Button>
        )}
      </div>

      {filtered.length ? (
        <div className="grid gap-3.5">
          {filtered.map((item) => {
            const cleanPhone = item.phone.replace(/[^0-9]/g, "");
            const whatsappText = item.course
              ? `Hello ${item.name}, thank you for inquiring about the ${item.course} course at Kryso Music Academy! How can we assist you with admissions?`
              : `Hello ${item.name}, thank you for contacting Kryso Music Academy!`;

            return (
              <article
                key={item.id}
                className={`rounded-xl border p-5 shadow-sm transition-all ${
                  item.read
                    ? "border-border bg-card/70"
                    : "border-primary/40 bg-card shadow-md shadow-primary/5"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-bold text-foreground">{item.name}</p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                          item.kind === "course"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        {item.kind === "course" ? "Course Enquiry" : "Contact Message"}
                      </span>
                      {!item.read && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground shadow-sm animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Course Highlight Badge */}
                    {item.course && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                          <span>🎵 Selected Course:</span>
                          <span className="font-extrabold underline">{item.course}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.phone}</span>
                      {item.email && <span>· {item.email}</span>}
                      <span>· {new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(whatsappText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </a>
                    )}
                    {item.phone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Call applicant"
                      >
                        <Phone size={15} />
                      </a>
                    )}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(item.course ? `Kryso Music Academy - ${item.course} Enquiry` : "Kryso Music Academy")}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Send Email"
                      >
                        <Mail size={15} />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title={item.read ? "Mark as unread" : "Mark as read"}
                      aria-label="Toggle read status"
                      className="hover:bg-secondary text-muted-foreground hover:text-primary"
                      onClick={() => handleMarkRead(item.id, !item.read)}
                    >
                      <CheckCheck size={16} className={item.read ? "text-primary" : ""} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete enquiry"
                      aria-label="Delete enquiry"
                      className="hover:bg-secondary text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="mt-3.5 rounded-lg bg-secondary/50 p-3.5 border border-border/50 text-sm text-foreground">
                  <p className="whitespace-pre-wrap">{item.message || "No notes or message provided."}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center bg-card/40">
          <p className="font-display text-lg font-bold text-foreground">No enquiries found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Try adjusting your search query." : "Incoming enquiries submitted through the website will appear here in real time."}
          </p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 7. Setting Section
// ----------------------------------------------------
function SettingSection() {
  const [settings, setSettings] = useStored("admin-settings", siteSettings);
  const [tab, setTab] = useState<"branding" | "homepage">("branding");
  const [saved, setSaved] = useState(false);

  const brandingFields = [
    { key: "businessName" as const, label: "Business / Academy Name" },
    { key: "tagline" as const, label: "Brand Tagline" },
    { key: "footerText" as const, label: "Footer Copyright Text" },
  ];

  const homepageFields = [
    { key: "heroTitle" as const, label: "Hero Title Headline" },
    { key: "heroSubtitle" as const, label: "Hero Subtitle Description" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Website Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage business identity, brand tagline, and homepage hero texts.
          </p>
        </div>
        <div className="flex rounded-lg bg-secondary p-1 border border-border">
          <button
            onClick={() => setTab("branding")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "branding"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Branding
          </button>
          <button
            onClick={() => setTab("homepage")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "homepage"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Homepage Content
          </button>
        </div>
      </div>

      <form
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSettings(settings);
          setSaved(true);
        }}
      >
        {tab === "branding" ? (
          <div className="grid gap-4">
            {brandingFields.map((f) => (
              <label key={f.key} className="grid gap-1.5 text-sm font-semibold text-foreground">
                {f.label}
                <Input
                  value={settings[f.key] || ""}
                  className="bg-card border-border text-foreground focus-visible:ring-primary"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, [f.key]: e.target.value });
                  }}
                />
              </label>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {homepageFields.map((f) => (
              <label key={f.key} className="grid gap-1.5 text-sm font-semibold text-foreground">
                {f.label}
                <Textarea
                  value={settings[f.key] || ""}
                  rows={3}
                  className="bg-card border-border text-foreground focus-visible:ring-primary"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, [f.key]: e.target.value });
                  }}
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            className="h-11 rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            Save Settings
          </Button>
          {saved && <span className="text-sm font-semibold text-primary">Saved to this browser!</span>}
        </div>
      </form>
    </div>
  );
}
