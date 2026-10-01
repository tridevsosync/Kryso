"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Facebook,
  Globe,
  GraduationCap,
  Image as ImageIcon,
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
  Search,
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
  deleteEnquiryRemote,
  markEnquiryReadRemote,
  type Enquiry,
  readStored,
  useStored,
  writeStored,
} from "@/lib/kryso-storage";
import { siteSettings, teachers, defaultSyllabusModules, defaultStudioGearItems } from "@/data/catalog";
import { SpotlightManager } from "@/components/admin-spotlight";
import { MusicTrackManager } from "@/components/admin-music-tracks";
import { SpotifyIcon } from "@/components/spotify-icon";
import { WhatsAppIcon } from "@/components/kryso-site";

export const sections = [
  "Dashboard",
  "Hero spotlight",
  "Music",
  "Academy",
  "Teacher",
  "Contact",
  "Setting",
] as const;

export type Section = (typeof sections)[number];

export function AdminDashboardClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState<Section>("Dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [settings, setSettings] = useStored("admin-settings", siteSettings);

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
    { id: "Hero spotlight" as const, label: "KRYSO Presskit & Spotlight", icon: ImageIcon },
    { id: "Music" as const, label: "Music", icon: Music },
    { id: "Academy" as const, label: "Academy", icon: GraduationCap },
    { id: "Teacher" as const, label: "Teacher", icon: Users },
    { id: "Contact" as const, label: "Contact", icon: PhoneCall },
    { id: "Setting" as const, label: "Setting", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Top Navbar (visible below lg) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-secondary/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="KRYSO home">
          <Image
            src="/kryso-logo.png"
            alt="KRYSO"
            width={100}
            height={35}
            priority
            className="h-6 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground"
          >
            <span>{section}</span>
            <span className="text-primary font-bold">▼</span>
          </button>
          <button
            onClick={() => {
              writeStored(ADMIN_SESSION_KEY, null);
              router.push("/admin");
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-destructive"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in-50">
          <div className="absolute top-0 right-0 left-0 bg-card border-b border-border p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-display font-bold text-foreground">Admin Console Menu</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-xl p-3 text-left text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={16} />
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                writeStored(ADMIN_SESSION_KEY, null);
                router.push("/admin");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut size={15} /> Logout Admin Session
            </button>
          </div>
        </div>
      )}

      {/* Quick Mobile Horizontal Scroll Tab Bar */}
      <div className="sticky top-[53px] z-30 flex items-center gap-1.5 overflow-x-auto border-b border-border bg-background/95 px-3 py-2 lg:hidden scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden border-r border-border bg-secondary p-5 text-secondary-foreground lg:block lg:min-h-screen lg:w-64 shrink-0">
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

          <nav className="mt-6 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                      : "text-muted-foreground hover:bg-secondary-foreground/10 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={17} />
                    {item.label}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => {
                writeStored(ADMIN_SESSION_KEY, null);
                router.push("/admin");
              }}
              className="mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary-foreground/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8">
          <div className="relative isolate overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl">
            <Image
              src={heroImage}
              alt="Concert stage control room"
              fill
              priority
              sizes="100vw"
              className="absolute inset-0 -z-20 object-cover object-[center_35%] opacity-25 brightness-75 contrast-125"
            />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-secondary/90 to-background/70" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Control Room · Live Console</p>
                <h1 className="mt-1 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground">
                  Kryso Stage & Content Management
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">Admin dashboard · active management console</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {settings.isMaintenanceMode ? (
                  <button
                    onClick={() => setSection("Setting")}
                    className="flex items-center gap-2 rounded-full border border-amber-500/60 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors animate-pulse cursor-pointer"
                    title="Click to manage Maintenance Mode"
                  >
                    <Wrench size={14} className="text-amber-400" /> Maintenance Mode LIVE
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary">
                    <span className="size-2 rounded-full bg-primary animate-pulse" /> Live Session Active
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full min-w-0">
            {section === "Dashboard" && <Overview onOpen={setSection} />}
            {section === "Hero spotlight" && <SpotlightManager />}
            {section === "Music" && <MusicSection />}
            {section === "Academy" && <AcademySection />}
            {section === "Teacher" && <TeacherSection />}
            {section === "Contact" && <ContactSection />}
            {section === "Setting" && <SettingSection />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. Dashboard Overview
// ----------------------------------------------------
function Overview({ onOpen }: { onOpen: (section: Section) => void }) {
  const [storedTracks] = useStored<unknown[]>("admin-music-tracks-v1", []);
  const [storedCourses] = useStored<unknown[]>("admin-courses-v3", []);
  const [enquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);

  const unreadCount = enquiries.filter((e) => !e.read).length;

  const cards: Array<{ label: string; value: number | string; section: Section; desc: string }> = [
    { label: "Hero spotlight", value: "6 Modules", section: "Hero spotlight", desc: "Spotlight, DJ Producer, Techrider & Downloads" },
    { label: "Music", value: storedTracks.length, section: "Music", desc: "Tracks & releases" },
    { label: "Academy", value: storedCourses.length, section: "Academy", desc: "Published courses" },
    { label: "Teacher", value: teachers.length, section: "Teacher", desc: "Mentors & instructors" },
    {
      label: "Contact",
      value: enquiries.length > 0 ? `${enquiries.length} Messages` : "0 Messages",
      section: "Contact",
      desc: unreadCount > 0 ? `${unreadCount} new unread submissions` : "Contact inquiries & studio info",
    },
    { label: "Setting", value: "Active", section: "Setting", desc: "Branding & copy config" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">A quick look at your academy, concert tracks, and settings.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onOpen(card.section)}
            className="rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          >
            <p className="font-display text-3xl font-extrabold text-primary">{card.value}</p>
            <p className="mt-2 text-base font-bold text-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. Music Section (Music Tracks & Releases)
// ----------------------------------------------------
function MusicSection() {
  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-border pb-4 mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">Music Management</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage music tracks, audio streaming links, social lock gating, and official audio releases.
        </p>
      </div>

      <MusicTrackManager />
    </div>
  );
}

// ----------------------------------------------------
// 3. Academy Section (Courses, Students)
// ----------------------------------------------------
function AcademySection() {
  const [tab, setTab] = useState<"courses" | "curriculum" | "studiogear" | "students">("courses");
  const [storedCourses] = useStored<unknown[]>("admin-courses-v3", []);
  const [storedStudents] = useStored<unknown[]>("admin-students-v3", []);
  const [storedCurriculum] = useStored<unknown[]>("admin-curriculum-v3", defaultSyllabusModules);
  const [storedStudioGear] = useStored<unknown[]>("admin-studio-gear-v3", defaultStudioGearItems);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">Academy Management</h1>
            <Link
              href="/academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs shrink-0"
              title="Open live Academy website page in new tab"
            >
              <Eye size={13} />
              <span>View Academy Page</span>
              <ExternalLink size={11} />
            </Link>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Manage courses, curriculum/syllabus, studio gear, and student enrollments.
          </p>
        </div>
        <div className="flex rounded-lg bg-secondary p-1 border border-border gap-1 overflow-x-auto max-w-full shrink-0">
          <button
            onClick={() => setTab("courses")}
            className={`rounded-md px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              tab === "courses"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Courses ({storedCourses.length})
          </button>
          <button
            onClick={() => setTab("curriculum")}
            className={`rounded-md px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              tab === "curriculum"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Curriculum & Syllabus ({storedCurriculum.length})
          </button>
          <button
            onClick={() => setTab("studiogear")}
            className={`rounded-md px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              tab === "studiogear"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Studio Gear & Campus ({storedStudioGear.length})
          </button>
          <button
            onClick={() => setTab("students")}
            className={`rounded-md px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
          description="Classes and curriculums offered at the academy."
          storageKey="admin-courses-v3"
          apiCollection="academy_courses"
          folder="kryso/academy"
          previewUrlPrefix="/academy"
          publicPageUrl="/academy"
          seed={[]}
          fields={[
            {
              key: "order",
              label: "Display Order / Sequence (e.g. 1, 2, 3)",
              type: "number",
              placeholder: "e.g. 1 (Lowest number appears on top, e.g. 1, 2, 3...)",
            },
            { key: "imageUrl", label: "Course Image", type: "image", placeholder: "Upload or paste course image URL" },
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
            {
              key: "syllabusOverview",
              label: "Course Syllabus Overview Note (Optional)",
              type: "textarea",
              placeholder: "Custom highlights or specific methodology for this course...",
            },
          ]}
        />
      )}

      {tab === "curriculum" && (
        <CollectionManager
          title="Course Curriculum & Syllabus Modules"
          description="Manage learning steps, milestone topics, and syllabus modules displayed on the Course 'Know More' page."
          storageKey="admin-curriculum-v3"
          apiCollection="academy_curriculum"
          folder="kryso/curriculum"
          publicPageUrl="/academy"
          seed={defaultSyllabusModules}
          filterKey="courseName"
          fields={[
            {
              key: "step",
              label: "Step / Week / Module Number",
              placeholder: "e.g. 01, 02, Week 1, or Module A",
            },
            {
              key: "title",
              label: "Module Title",
              placeholder: "e.g. Posture & Instrument Geometry",
            },
            {
              key: "courseName",
              label: "Assign to Course (Optional)",
              type: "select",
              dynamicCollection: "academy_courses",
              storageKeyFallback: "admin-courses-v3",
              dynamicLabelKey: "name",
              placeholder: "All Courses (or select specific course)",
            },
            {
              key: "desc",
              label: "Module Description",
              type: "textarea",
              placeholder: "Overview of technique and learning milestones covered in this module...",
            },
            {
              key: "topics",
              label: "Key Topics (Comma Separated)",
              type: "textarea",
              placeholder: "e.g. Hand placement & tuning, Finger gymnastics & agility, Basic tone articulation",
            },
          ]}
        />
      )}

      {tab === "studiogear" && (
        <CollectionManager
          title="Studio Gear & Campus Infrastructure"
          description="Manage rehearsal rooms, pro audio gear, recital stage, and amenities shown in the 'Studio Gear & Campus' tab on course pages."
          storageKey="admin-studio-gear-v3"
          apiCollection="academy_studio_gear"
          folder="kryso/studio"
          publicPageUrl="/academy"
          seed={defaultStudioGearItems}
          fields={[
            {
              key: "title",
              label: "Feature / Equipment Name",
              placeholder: "e.g. Sound-Treated Isolation Rooms",
            },
            {
              key: "category",
              label: "Category / Badge",
              type: "select",
              options: [
                "Acoustics",
                "Pro Audio",
                "Concert Stage",
                "Instruments",
                "Rehearsal",
                "Campus",
                "Studio Recording",
                "Certification",
              ],
              placeholder: "Select category...",
            },
            {
              key: "icon",
              label: "Icon Style",
              type: "select",
              options: [
                "Mic2",
                "Volume2",
                "Tv",
                "Music2",
                "Calendar",
                "ShieldCheck",
                "Radio",
                "Headphones",
                "Sparkles",
                "Layers",
                "Award",
                "UsersRound",
              ],
              placeholder: "Select icon...",
            },
            {
              key: "desc",
              label: "Description",
              type: "textarea",
              placeholder: "Details about acoustic specs, brands, room isolation, or student access benefits...",
            },
          ]}
        />
      )}

      {tab === "students" && (
        <CollectionManager
          title="Student Roster & Enrollments"
          description="Enrolled students across academy courses with payment records & contact info."
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-foreground">Teacher & Faculty Management</h1>
            <Link
              href="/academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs shrink-0"
              title="Open live Academy website page in new tab"
            >
              <Eye size={13} />
              <span>View Academy Page</span>
              <ExternalLink size={11} />
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage music instructors, masterclass leaders, and concert mentors.
          </p>
        </div>
      </div>

      <CollectionManager
        title="Instructors & Mentors"
        description="The artists and educators who teach at Kryso Music Academy."
        storageKey="admin-teachers-v3"
        apiCollection="academy_teachers"
        folder="kryso/teachers"
        publicPageUrl="/academy"
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
// 5. Contact Section (Contact Form Submissions & Studio Details)
// ----------------------------------------------------
function ContactSection() {
  const [tab, setTab] = useState<"messages" | "studio">("messages");
  const [enquiries, setEnquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "contact" | "course" | "unread">("all");
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useStored("admin-settings", siteSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [syncedMongo, setSyncedMongo] = useState(false);

  // Sync enquiries from MongoDB on mount or when refreshed
  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (data?.enquiries && Array.isArray(data.enquiries)) {
        setEnquiries(data.enquiries);
      }
    } catch {
      // Keep local state
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleToggleRead = async (enquiry: Enquiry) => {
    const nextRead = !enquiry.read;
    const updated = enquiries.map((e) => (e.id === enquiry.id ? { ...e, read: nextRead } : e));
    setEnquiries(updated);
    await markEnquiryReadRemote(enquiry.id, nextRead);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    const updated = enquiries.filter((e) => e.id !== id);
    setEnquiries(updated);
    await deleteEnquiryRemote(id);
  };

  const contactFields = [
    { key: "phone" as const, label: "Primary Phone Number", placeholder: "+91 87678 28945" },
    { key: "altPhone" as const, label: "Alternate / WhatsApp Phone", placeholder: "+91 97673 78750" },
    { key: "email" as const, label: "Official Contact Email", placeholder: "krysomusicacademy@gmail.com" },
    { key: "address" as const, label: "Academy Studio Address", placeholder: "Pune, Maharashtra, India" },
    { key: "tagline" as const, label: "Academy Tagline", placeholder: "Learn Music and Enjoy Music" },
    { key: "footerText" as const, label: "Footer Copyright / Text", placeholder: "© 2026 Kryso Music Academy. All music, all heart." },
  ];

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    setSettings(settings);

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

  const unreadCount = enquiries.filter((e) => !e.read).length;

  const filteredEnquiries = enquiries.filter((item) => {
    if (filterKind === "unread" && item.read) return false;
    if (filterKind === "contact" && item.kind !== "contact") return false;
    if (filterKind === "course" && item.kind !== "course") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchPhone = item.phone?.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      const matchMsg = item.message?.toLowerCase().includes(q);
      const matchCourse = item.course?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchMsg || matchCourse;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-foreground">Contact & Messages</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-xs font-bold text-orange-400 animate-pulse">
                <span className="size-1.5 rounded-full bg-orange-400" />
                {unreadCount} New Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View submissions from the Contact Us form, direct inquiries, and manage studio details.
          </p>
        </div>

        <div className="flex rounded-lg bg-secondary p-1 border border-border gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setTab("messages")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === "messages"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare size={14} />
            <span>Messages Inbox ({enquiries.length})</span>
          </button>
          <button
            onClick={() => setTab("studio")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === "studio"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PhoneCall size={14} />
            <span>Studio Info & Settings</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. MESSAGES INBOX TAB                                */}
      {/* ---------------------------------------------------- */}
      {tab === "messages" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, email, or message..."
                className="pl-9 h-10 bg-card border-border text-foreground text-xs focus-visible:ring-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills & Refresh */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterKind("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterKind === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({enquiries.length})
              </button>
              <button
                onClick={() => setFilterKind("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterKind === "unread"
                    ? "bg-orange-500 text-black shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterKind("contact")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterKind === "contact"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Contact Form
              </button>
              <button
                onClick={() => setFilterKind("course")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterKind === "course"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Course Enquiries
              </button>
              <button
                onClick={fetchEnquiries}
                disabled={loading}
                className="size-8 rounded-lg bg-secondary hover:bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 ml-1"
                title="Refresh from Database"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-primary" : ""} />
              </button>
            </div>
          </div>

          {/* Submissions Feed */}
          {filteredEnquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <MessageSquare size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-display text-base font-bold text-foreground">No Messages Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search
                  ? "No messages match your search query. Try clearing the search filter."
                  : "When users fill out the 'Send us a Message' form on the Contact page, their submissions will appear here live."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEnquiries.map((item) => {
                const dateFormatted = item.createdAt
                  ? new Date(item.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recent";

                const phoneClean = item.phone ? item.phone.replace(/[^0-9]/g, "") : "";
                const whatsappHref = phoneClean
                  ? `https://wa.me/${phoneClean.startsWith("91") ? phoneClean : `91${phoneClean}`}?text=${encodeURIComponent(
                      `Hello ${item.name || ""}, thank you for reaching out to Kryso Music Academy regarding your inquiry!`
                    )}`
                  : null;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all p-5 sm:p-6 relative overflow-hidden shadow-md ${
                      !item.read
                        ? "border-orange-500/50 bg-[#0B152B]/90 shadow-orange-500/5"
                        : "border-border bg-card/90"
                    }`}
                  >
                    {/* Unread Accent Bar */}
                    {!item.read && (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-orange-500" />
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: User Details & Message */}
                      <div className="space-y-3 flex-1 min-w-0">
                        {/* Header: Name, Badges & Date */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-display text-base sm:text-lg font-extrabold text-foreground">
                            {item.name || "Anonymous User"}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.kind === "contact"
                                ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                                : "bg-purple-500/15 border border-purple-500/30 text-purple-300"
                            }`}
                          >
                            {item.kind === "contact" ? "Contact Form" : "Course Enquiry"}
                          </span>

                          {item.course && (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-extrabold text-primary">
                              Course: {item.course}
                            </span>
                          )}

                          {!item.read && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest">
                              NEW UNREAD
                            </span>
                          )}

                          <span className="text-xs text-muted-foreground ml-auto">
                            {dateFormatted}
                          </span>
                        </div>

                        {/* Contact Chips */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-foreground hover:text-primary transition-colors"
                            >
                              <Phone size={12} className="text-primary" />
                              <span className="font-mono font-bold">{item.phone}</span>
                            </a>
                          )}

                          {item.email && (
                            <a
                              href={`mailto:${item.email}?subject=Kryso Music Academy Inquiry Reply`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-foreground hover:text-primary transition-colors"
                            >
                              <Mail size={12} className="text-primary" />
                              <span>{item.email}</span>
                            </a>
                          )}
                        </div>

                        {/* Message Content Box */}
                        <div className="rounded-xl border border-blue-900/40 bg-[#070F1E]/80 p-3.5 sm:p-4 text-xs sm:text-sm text-blue-100/90 leading-relaxed whitespace-pre-wrap">
                          {item.message || "No message provided."}
                        </div>
                      </div>

                      {/* Right: Quick Action Controls */}
                      <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50">
                        {/* WhatsApp Direct Reply */}
                        {whatsappHref && (
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs transition-transform hover:scale-105 shadow-xs"
                            title="Reply on WhatsApp"
                          >
                            <WhatsAppIcon size={14} />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Email Reply */}
                        {item.email && (
                          <a
                            href={`mailto:${item.email}?subject=Regarding your Kryso Music inquiry`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-card border border-border text-xs font-bold text-foreground transition-colors"
                            title="Reply via Email"
                          >
                            <Mail size={13} className="text-primary" />
                            <span>Email</span>
                          </a>
                        )}

                        {/* Mark Read/Unread */}
                        <button
                          type="button"
                          onClick={() => handleToggleRead(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            item.read
                              ? "bg-secondary/60 hover:bg-secondary border-border text-muted-foreground hover:text-foreground"
                              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                          }`}
                        >
                          <CheckCircle2 size={13} className={item.read ? "text-muted-foreground" : "text-emerald-400"} />
                          <span>{item.read ? "Mark Unread" : "Mark Read"}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="size-8 rounded-lg bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground border border-destructive/25 text-destructive grid place-items-center transition-colors cursor-pointer"
                          title="Delete message"
                          aria-label="Delete message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. STUDIO SETTINGS TAB                               */}
      {/* ---------------------------------------------------- */}
      {tab === "studio" && (
        <form className="grid gap-5 max-w-3xl" onSubmit={handleSaveSettings}>
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
                ✓ Saved successfully to database & live website!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 6. Setting Section
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
                <span className="size-1.5 rounded-full bg-emerald-400" /> Database Synced
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <SpotifyIcon size={14} /> Spotify Artist URL
                  </span>
                  <Input
                    value={settings.spotifyUrl || ""}
                    placeholder="https://open.spotify.com/artist/..."
                    className="bg-secondary/40 border-border text-foreground focus-visible:ring-primary text-xs"
                    onChange={(e) => {
                      setSaved(false);
                      setSettings({ ...settings, spotifyUrl: e.target.value });
                    }}
                  />
                </label>

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
                    placeholder="https://www.instagram.com/_krysomusic"
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
                {saving ? "Saving..." : "Save Footer Settings"}
              </Button>
              {saved && (
                <span className="text-sm font-semibold text-emerald-400">
                  ✓ Footer settings saved to database & live website!
                </span>
              )}
            </div>
          </form>

          {/* Live Footer Preview Component */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Eye size={15} className="text-primary" /> Live Footer Preview
            </h3>
            <div className="rounded-xl border border-blue-900/60 bg-[#030712] p-6 text-white text-xs space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2 space-y-2">
                  <Image src="/kryso-logo.png" alt="KRYSO" width={110} height={38} className="h-6 w-auto object-contain" />
                  <p className="text-blue-200/80 leading-relaxed text-xs max-w-sm">
                    {settings.footerDescription || `${settings.tagline || "Learn Music and Enjoy Music"}. Concert-grade sound, original releases, and world-class studio training in Pune.`}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-blue-200">
                    {settings.spotifyUrl && <span className="rounded-full border border-blue-900/60 bg-[#0B152B] p-1.5"><SpotifyIcon size={13} className="text-emerald-400" /></span>}
                    {settings.youtubeUrl && <span className="rounded-full border border-blue-900/60 bg-[#0B152B] p-1.5"><Youtube size={13} className="text-red-400" /></span>}
                    {settings.instagramUrl && <span className="rounded-full border border-blue-900/60 bg-[#0B152B] p-1.5"><Instagram size={13} className="text-pink-400" /></span>}
                    {settings.facebookUrl && <span className="rounded-full border border-blue-900/60 bg-[#0B152B] p-1.5"><Facebook size={13} className="text-blue-400" /></span>}
                  </div>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-orange-400 mb-2">Explore</p>
                  <ul className="space-y-1.5 text-blue-200/80">
                    <li>KRYSO Spotlight & Press</li>
                    <li>Music tracks & releases</li>
                    <li>Music classes & academy</li>
                    <li>Stage Techrider & Contacts</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-orange-400 mb-2">Say hello</p>
                  <ul className="space-y-1.5 text-blue-200/80">
                    {settings.phone && <li className="text-white font-bold">{settings.phone}</li>}
                    {settings.altPhone && <li className="text-white font-bold">{settings.altPhone}</li>}
                    {settings.email && <li>{settings.email}</li>}
                    <li>{settings.address || "Pune, Maharashtra, India"}</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-blue-900/40 pt-3 flex items-center justify-between text-[11px] text-blue-200/70">
                <span>{settings.footerText || "© 2026 Kryso Music Academy. All music, all heart."}</span>
                <span className="text-orange-400 font-semibold">Admin Console →</span>
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
                {saving ? "Saving..." : "Save Maintenance Configuration"}
              </Button>
              {saved && (
                <span className="text-sm font-semibold text-emerald-400">
                  ✓ Maintenance settings saved to database!
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
              {saving ? "Saving..." : "Save Branding"}
            </Button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-400">
                ✓ Saved to database & live website!
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
              {saving ? "Saving..." : "Save Homepage Content"}
            </Button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-400">
                ✓ Saved to database & live website!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
