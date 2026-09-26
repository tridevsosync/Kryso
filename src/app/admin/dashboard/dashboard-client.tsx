"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  Eye,
  Facebook,
  Globe,
  GraduationCap,
  Inbox,
  Instagram,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Music,
  PanelBottom,
  Phone,
  PhoneCall,
  Power,
  RefreshCw,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  Youtube,
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
import { siteSettings, teachers } from "@/data/catalog";
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
  const [settings, setSettings] = useStored("admin-settings", siteSettings);

  const unreadCount = enquiries.filter((e) => !e.read).length;

  useEffect(() => {
    if (!readStored<{ user?: string } | null>(ADMIN_SESSION_KEY, null)) {
      router.push("/admin");
      return;
    }
    setReady(true);
  }, [router]);

  // Sync settings from MongoDB
  useEffect(() => {
    fetch("/api/collections?name=site_settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remote =
            data.items.find((it: { id?: string }) => it.id === "site_config" || it.id === "contact_info") ||
            data.items[0];
          if (remote) {
            setSettings((prev) => ({ ...prev, ...remote }));
          }
        }
      })
      .catch(() => {});
  }, [setSettings]);

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
              <div className="flex items-center gap-3">
                {settings.isMaintenanceMode ? (
                  <button
                    onClick={() => setSection("Setting")}
                    className="flex items-center gap-2 rounded-full border border-amber-500/60 bg-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors animate-pulse"
                    title="Click to manage Maintenance Mode"
                  >
                    <Wrench size={14} className="text-amber-400" /> Maintenance Mode LIVE
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                    <span className="size-2 rounded-full bg-primary animate-pulse" /> Live Session Active
                  </div>
                )}
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
// 3. Academy Section (Courses, Students)
// ----------------------------------------------------
function AcademySection() {
  const [tab, setTab] = useState<"courses" | "students">("courses");
  const [storedCourses] = useStored<unknown[]>("admin-courses-v3", []);
  const [storedStudents] = useStored<unknown[]>("admin-students-v3", []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Academy Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clean state active. All courses and students are stored directly in MongoDB & Cloudinary.
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
            { key: "imageUrl", label: "Course Image", type: "image", placeholder: "Upload course image to Cloudinary" },
            { key: "name", label: "Course Name", placeholder: "e.g. Electric Guitar Mastery" },
            {
              key: "instructor",
              label: "Teacher Name",
              type: "select",
              placeholder: "Select assigned teacher...",
              dynamicCollection: "academy_teachers",
              storageKeyFallback: "admin-teachers-v3",
              dynamicLabelKey: "name",
            },
            {
              key: "fees",
              label: "Selling Price (₹)",
              type: "number",
              placeholder: "e.g. 2000 (Final offer / discounted price)",
            },
            {
              key: "actualPrice",
              label: "Actual / MRP Price (₹)",
              type: "number",
              placeholder: "e.g. 3500 (Original price to show discount %)",
            },
            { key: "description", label: "Description", type: "textarea", placeholder: "Detailed course overview, curriculum, and skills taught..." },
            {
              key: "duration",
              label: "Duration",
              type: "select",
              options: ["1 Month", "2 Months", "3 Months", "6 Months", "1 Year", "Weekend Masterclass"],
              placeholder: "Select duration...",
            },
            {
              key: "level",
              label: "Level",
              type: "select",
              options: ["All levels", "Beginner", "Intermediate", "Advanced", "Concert Masterclass"],
              placeholder: "Select level...",
            },
          ]}
        />
      )}

      {tab === "students" && (
        <CollectionManager
          title="Student Roster & Enrollments"
          description="Enrolled students across academy courses with payment records & contact info. Saved in MongoDB."
          storageKey="admin-students-v3"
          apiCollection="academy_students"
          folder="kryso/students"
          seed={[]}
          filterKey="course"
          fields={[
            { key: "name", label: "Student Name", placeholder: "e.g. Rahul Sharma" },
            {
              key: "course",
              label: "Enrolled Course",
              type: "select",
              dynamicCollection: "academy_courses",
              storageKeyFallback: "admin-courses-v3",
              dynamicLabelKey: "name",
              placeholder: "Select enrolled course...",
            },
            { key: "mobile", label: "Mobile / WhatsApp", placeholder: "+91 98765 43210" },
            { key: "email", label: "Email Address", placeholder: "student@example.com" },
            { key: "fees", label: "Fee Paid (₹)", type: "number", placeholder: "2000" },
            { key: "paymentStatus", label: "Payment Status", placeholder: "PAID via Razorpay" },
            { key: "invoiceNumber", label: "Invoice Number", placeholder: "KRYSO-INV-XXXXXX" },
            { key: "paymentId", label: "Payment / Txn ID", placeholder: "pay_..." },
            { key: "age", label: "Age", placeholder: "e.g. 19" },
            { key: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD" },
            { key: "address", label: "Address", type: "textarea", placeholder: "Residential address..." },
            {
              key: "level",
              label: "Level",
              type: "select",
              options: ["Enrolled Student", "Beginner", "Intermediate", "Advanced", "Mastery"],
              placeholder: "Select level...",
            },
            { key: "joined", label: "Date Joined" },
            { key: "avatarUrl", label: "Student Photo", type: "image" },
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
  const [tab, setTab] = useState<"footer" | "maintenance" | "branding" | "homepage">("footer");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [syncedMongo, setSyncedMongo] = useState(false);

  // Sync settings from MongoDB collection on load
  useEffect(() => {
    fetch("/api/collections?name=site_settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remote =
            data.items.find((it: { id?: string }) => it.id === "site_config" || it.id === "contact_info") ||
            data.items[0];
          if (remote) {
            setSettings((prev) => ({ ...prev, ...remote }));
            setSyncedMongo(true);
          }
        }
      })
      .catch(() => {});
  }, [setSettings]);

  const handleSave = async (customSettings?: typeof settings) => {
    const dataToSave = customSettings || settings;
    setSaving(true);
    setSaved(false);

    setSettings(dataToSave);

    try {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "site_settings",
          item: {
            id: "site_config",
            ...dataToSave,
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      // Also persist to contact_info for backward compatibility
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "site_settings",
          item: {
            id: "contact_info",
            ...dataToSave,
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

  const toggleMaintenanceMode = async () => {
    const nextState = !settings.isMaintenanceMode;
    const updated = { ...settings, isMaintenanceMode: nextState };
    setSettings(updated);
    await handleSave(updated);
  };

  return (
    <div className="max-w-4xl">
      {/* Header and navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-foreground">Website Settings</h1>
            {syncedMongo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" /> MongoDB Synced
              </span>
            )}
            {settings.isMaintenanceMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-400 animate-pulse">
                <Wrench size={12} /> Maintenance Active
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage footer settings, maintenance mode switch, branding, and homepage hero texts.
          </p>
        </div>

        <div className="flex flex-wrap rounded-lg bg-secondary p-1 border border-border gap-1">
          <button
            onClick={() => setTab("footer")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "footer"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PanelBottom size={14} /> Footer Settings
          </button>
          <button
            onClick={() => setTab("maintenance")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "maintenance"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench size={14} /> Maintenance Button
            {settings.isMaintenanceMode && <span className="size-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => setTab("branding")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "branding"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={14} /> Branding
          </button>
          <button
            onClick={() => setTab("homepage")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "homepage"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={14} /> Homepage Content
          </button>
        </div>
      </div>

      {/* 1. FOOTER SETTINGS TAB */}
      {tab === "footer" && (
        <div className="grid gap-6">
          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <PanelBottom size={16} className="text-primary" /> Footer Branding & Copyright
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground sm:col-span-2">
                  Footer Description / About Paragraph
                  <span className="text-xs font-normal text-muted-foreground">
                    Short introduction displayed below the Kryso logo in the footer.
                  </span>
                  <Textarea
                    rows={2}
                    value={settings.footerDescription || ""}
                    placeholder="A concert-grade music academy in Pune where passion meets world-class mentorship."
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, footerDescription: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Footer Copyright Notice
                  <Input
                    value={settings.footerText || ""}
                    placeholder="© 2026 Kryso Music Academy. All music, all heart."
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, footerText: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Brand Tagline
                  <Input
                    value={settings.tagline || ""}
                    placeholder="Learn Music and Enjoy Music"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, tagline: e.target.value });
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Globe size={16} className="text-primary" /> Footer Social Media Links
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <Youtube size={14} /> YouTube Channel URL
                  </span>
                  <Input
                    value={settings.youtubeUrl || ""}
                    placeholder="https://www.youtube.com/@krysomusic"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary text-xs"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, youtubeUrl: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <Instagram size={14} /> Instagram Profile URL
                  </span>
                  <Input
                    value={settings.instagramUrl || ""}
                    placeholder="https://www.instagram.com/krysomusic"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary text-xs"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, instagramUrl: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Facebook size={14} /> Facebook Page URL
                  </span>
                  <Input
                    value={settings.facebookUrl || ""}
                    placeholder="https://www.facebook.com/krysomusic"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary text-xs"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, facebookUrl: e.target.value });
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <PhoneCall size={16} className="text-primary" /> Footer Contact & Studio Info
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Primary Phone
                  <Input
                    value={settings.phone || ""}
                    placeholder="+91 87678 28945"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, phone: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Alternate / WhatsApp Phone
                  <Input
                    value={settings.altPhone || ""}
                    placeholder="+91 97673 78750"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, altPhone: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Official Email
                  <Input
                    value={settings.email || ""}
                    placeholder="krysomusicacademy@gmail.com"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, email: e.target.value });
                    }}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  Studio Physical Address
                  <Input
                    value={settings.address || ""}
                    placeholder="Pune, Maharashtra, India"
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, address: e.target.value });
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                {saving ? "Saving to MongoDB..." : "Save Footer Settings"}
              </Button>
              {saved && (
                <span className="text-sm font-semibold text-emerald-400">
                  ✓ Footer settings saved to MongoDB & live website!
                </span>
              )}
            </div>
          </form>

          {/* Live Footer Preview Component */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Eye size={15} className="text-primary" /> Live Footer Preview
            </h3>
            <div className="rounded-xl border border-border/80 bg-background/90 p-6 text-foreground text-xs space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2 space-y-2">
                  <Image src="/kryso-logo.png" alt="KRYSO" width={110} height={38} className="h-6 w-auto object-contain" />
                  <p className="text-muted-foreground leading-relaxed text-xs max-w-sm">
                    {settings.footerDescription || `${settings.tagline || "Learn Music and Enjoy Music"}. A concert-grade music academy in Pune where passion meets world-class mentorship.`}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                    {settings.youtubeUrl && <span className="rounded-full border border-border p-1.5"><Youtube size={13} className="text-red-400" /></span>}
                    {settings.instagramUrl && <span className="rounded-full border border-border p-1.5"><Instagram size={13} className="text-pink-400" /></span>}
                    {settings.facebookUrl && <span className="rounded-full border border-border p-1.5"><Facebook size={13} className="text-blue-400" /></span>}
                  </div>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground mb-2">Explore</p>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>Music tracks & releases</li>
                    <li>Music classes & academy</li>
                    <li>Contact & studio visits</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground mb-2">Say hello</p>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {settings.phone && <li className="text-foreground">{settings.phone}</li>}
                    {settings.altPhone && <li className="text-foreground">{settings.altPhone}</li>}
                    {settings.email && <li>{settings.email}</li>}
                    <li>{settings.address || "Pune, Maharashtra, India"}</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-border/50 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{settings.footerText || "© 2026 Kryso Music Academy. All music, all heart."}</span>
                <span>Admin login</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAINTENANCE MODE TAB */}
      {tab === "maintenance" && (
        <div className="grid gap-6">
          {/* Master Maintenance Mode Switch Card */}
          <div
            className={`rounded-2xl border p-6 transition-all shadow-xl ${
              settings.isMaintenanceMode
                ? "border-amber-500/50 bg-amber-500/10 shadow-amber-500/10"
                : "border-border bg-card"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-3 rounded-full ${
                      settings.isMaintenanceMode ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                    }`}
                  />
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {settings.isMaintenanceMode
                      ? "Maintenance Mode is ACTIVE"
                      : "Website is LIVE & Accessible"}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                  {settings.isMaintenanceMode
                    ? "Visitors to any public page are currently redirected to the Under Maintenance screen. The admin panel remains accessible to manage settings."
                    : "Your website is online and serving music, academy courses, and enquiry forms to visitors normally."}
                </p>
              </div>

              {/* Maintenance Toggle Button */}
              <button
                type="button"
                onClick={toggleMaintenanceMode}
                disabled={saving}
                className={`shrink-0 flex items-center gap-2.5 rounded-full px-6 py-3.5 text-xs font-extrabold shadow-lg transition-all ${
                  settings.isMaintenanceMode
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:brightness-110 shadow-amber-500/25"
                }`}
              >
                <Power size={16} />
                {settings.isMaintenanceMode
                  ? "Turn Off Maintenance (Go Live)"
                  : "Activate Maintenance Mode"}
              </button>
            </div>
          </div>

          {/* Maintenance Screen Customization */}
          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Wrench size={16} className="text-primary" /> Maintenance Screen Notice & Message
              </h2>

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Maintenance Headline
                <Input
                  value={settings.maintenanceTitle || ""}
                  placeholder="Under Scheduled Maintenance"
                  className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary font-bold"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, maintenanceTitle: e.target.value });
                  }}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Maintenance Explanation / Description
                <Textarea
                  rows={3}
                  value={settings.maintenanceMessage || ""}
                  placeholder="We are currently tuning our audio servers and studio gear to bring you a better musical experience. We will be back online shortly!"
                  className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, maintenanceMessage: e.target.value });
                  }}
                />
              </label>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                {saving ? "Saving to MongoDB..." : "Save Maintenance Configuration"}
              </Button>
              {saved && (
                <span className="text-sm font-semibold text-emerald-400">
                  ✓ Maintenance settings saved to MongoDB!
                </span>
              )}
            </div>
          </form>

          {/* Live Maintenance Screen Preview */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Eye size={15} className="text-primary" /> Visitor Maintenance View Preview
            </h3>
            <div className="rounded-xl border border-amber-500/30 bg-background p-8 text-center relative overflow-hidden">
              <div className="size-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-primary mx-auto mb-4">
                <Wrench size={26} className="animate-spin text-primary" style={{ animationDuration: "6s" }} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-400 mb-2">
                <span className="size-1.5 rounded-full bg-amber-400 animate-ping" /> System Tune-up
              </span>
              <h4 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                {settings.maintenanceTitle || "Under Scheduled Maintenance"}
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {settings.maintenanceMessage ||
                  "We are currently tuning our audio servers and studio gear to bring you a better musical experience. We will be back online shortly!"}
              </p>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs">
                {settings.phone && (
                  <span className="rounded-full border border-border bg-card px-3.5 py-1.5 font-bold text-foreground">
                    Call: {settings.phone}
                  </span>
                )}
                {settings.email && (
                  <span className="rounded-full border border-border bg-card px-3.5 py-1.5 font-bold text-foreground">
                    Email: {settings.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BRANDING TAB */}
      {tab === "branding" && (
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Settings size={16} className="text-primary" /> Business & Academy Identity
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Business / Academy Name
                <Input
                  value={settings.businessName || ""}
                  placeholder="Kryso Music Academy"
                  className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, businessName: e.target.value });
                  }}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Brand Tagline
                <Input
                  value={settings.tagline || ""}
                  placeholder="Learn Music and Enjoy Music"
                  className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, tagline: e.target.value });
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              {saving ? "Saving to MongoDB..." : "Save Branding"}
            </Button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-400">
                ✓ Saved to MongoDB & live website!
              </span>
            )}
          </div>
        </form>
      )}

      {/* 4. HOMEPAGE CONTENT TAB */}
      {tab === "homepage" && (
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Homepage Hero Headlines
            </h2>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Hero Title Headline
                <Input
                  value={settings.heroTitle || ""}
                  placeholder="Learn music. Enjoy music."
                  className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary font-bold"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, heroTitle: e.target.value });
                  }}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                Hero Subtitle Description
                <Textarea
                  rows={3}
                  value={settings.heroSubtitle || ""}
                  placeholder="Find your rhythm at Kryso Music Academy."
                  className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary"
                  onChange={(e) => {
                    setSaved(false);
                    setSettings({ ...settings, heroSubtitle: e.target.value });
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-full px-7 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              {saving ? "Saving to MongoDB..." : "Save Homepage Content"}
            </Button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-400">
                ✓ Saved to MongoDB & live website!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
