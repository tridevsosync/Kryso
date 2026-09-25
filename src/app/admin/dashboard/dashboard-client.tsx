"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCheck, LogOut, Music2, Trash2 } from "lucide-react";
import heroImage from "@/assets/kryso-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionManager } from "@/components/admin-collection";
import { SpotlightManager } from "@/components/admin-spotlight";
import {
  ADMIN_SESSION_KEY,
  ENQUIRIES_KEY,
  readStored,
  useStored,
  writeStored,
  type Enquiry,
} from "@/lib/kryso-storage";
import { courses, gallery, products, siteSettings, students, teachers, testimonials } from "@/data/catalog";

const sections = [
  "Dashboard",
  "Products",
  "Categories",
  "Courses",
  "Teachers",
  "Students",
  "Testimonials",
  "Gallery",
  "Contact enquiries",
  "Course enquiries",
  "Homepage spotlight",
  "Homepage content",
  "Settings",
] as const;

type Section = (typeof sections)[number];

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-secondary p-5 text-secondary-foreground lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Music2 size={18} />
            </span>
            kryso<span className="text-primary">.</span>
          </Link>
          <nav className="mt-6 flex flex-wrap gap-1 lg:grid">
            {sections.map((item) => (
              <button
                key={item}
                onClick={() => setSection(item)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition-all ${
                  section === item
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-secondary-foreground/10 hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                writeStored(ADMIN_SESSION_KEY, null);
                router.push("/admin");
              }}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary-foreground/10 hover:text-destructive transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </nav>
        </aside>

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
                <p className="mt-1 text-xs text-muted-foreground">Demo admin dashboard · browser local storage active</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                <span className="size-2 rounded-full bg-primary animate-pulse" /> Live Session Active
              </div>
            </div>
          </div>
          {section === "Dashboard" && <Overview onOpen={setSection} />}
          {section === "Products" && (
            <CollectionManager
              title="Products"
              description="Instruments and accessories shown in the music shop."
              storageKey="admin-products"
              seed={products as unknown as never}
              filterKey="category"
              fields={[
                { key: "name", label: "Name" },
                { key: "category", label: "Category" },
                { key: "price", label: "Price", type: "number" },
                { key: "rating", label: "Rating", type: "number" },
                { key: "tag", label: "Tag" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          )}
          {section === "Categories" && (
            <CollectionManager
              title="Categories"
              description="Product and course categories."
              storageKey="admin-categories"
              seed={seedCategories as unknown as never}
              filterKey="type"
              fields={[
                { key: "name", label: "Name" },
                { key: "type", label: "Type" },
              ]}
            />
          )}
          {section === "Courses" && (
            <CollectionManager
              title="Academy courses"
              description="Classes offered at the academy."
              storageKey="admin-courses"
              seed={courses as unknown as never}
              fields={[
                { key: "name", label: "Course" },
                { key: "duration", label: "Duration" },
                { key: "fees", label: "Monthly fees", type: "number" },
                { key: "level", label: "Level" },
                { key: "instructor", label: "Instructor" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          )}
          {section === "Teachers" && (
            <CollectionManager
              title="Teachers"
              description="The people who teach at Kryso."
              storageKey="admin-teachers"
              seed={teachers as unknown as never}
              fields={[
                { key: "name", label: "Name" },
                { key: "experience", label: "Experience" },
                { key: "specialization", label: "Specialization" },
                { key: "bio", label: "Bio", type: "textarea" },
              ]}
            />
          )}
          {section === "Students" && (
            <CollectionManager
              title="Students"
              description="Enrolled students in this demo."
              storageKey="admin-students"
              seed={students as unknown as never}
              filterKey="level"
              fields={[
                { key: "name", label: "Name" },
                { key: "course", label: "Course" },
                { key: "level", label: "Level" },
                { key: "joined", label: "Joined" },
              ]}
            />
          )}
          {section === "Testimonials" && (
            <CollectionManager
              title="Testimonials"
              description="Student reviews shown on the academy page."
              storageKey="admin-testimonials"
              seed={seedTestimonials as unknown as never}
              fields={[
                { key: "name", label: "Name" },
                { key: "course", label: "Course" },
                { key: "text", label: "Review", type: "textarea" },
              ]}
            />
          )}
          {section === "Gallery" && (
            <CollectionManager
              title="Gallery"
              description="Photos and moments from the academy."
              storageKey="admin-gallery"
              seed={gallery as unknown as never}
              filterKey="category"
              fields={[
                { key: "caption", label: "Caption" },
                { key: "category", label: "Category" },
              ]}
            />
          )}
          {section === "Contact enquiries" && <Enquiries kind="contact" />}
          {section === "Course enquiries" && <Enquiries kind="course" />}
          {section === "Homepage spotlight" && <SpotlightManager />}
          {section === "Homepage content" && (
            <div className="space-y-12">
              <SpotlightManager />
              <div className="border-t border-border pt-10">
                <SettingsForm homepage />
              </div>
            </div>
          )}
          {section === "Settings" && <SettingsForm />}
        </main>
      </div>
    </div>
  );
}

function Overview({ onOpen }: { onOpen: (section: Section) => void }) {
  const [enquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);
  const cards: Array<{ label: string; value: number; section: Section }> = [
    { label: "Total products", value: products.length, section: "Products" },
    { label: "Total courses", value: courses.length, section: "Courses" },
    { label: "Total teachers", value: teachers.length, section: "Teachers" },
    { label: "Total students", value: students.length, section: "Students" },
    {
      label: "Pending enquiries",
      value: enquiries.filter((item) => !item.read).length,
      section: "Contact enquiries",
    },
    { label: "Testimonials", value: testimonials.length, section: "Testimonials" },
    { label: "Gallery images", value: gallery.length, section: "Gallery" },
    { label: "Spotlight slides", value: 2, section: "Homepage spotlight" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">A quick look at your academy and concert shop.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onOpen(card.section)}
            className="rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
          >
            <p className="font-display text-3xl font-extrabold text-primary">{card.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold text-foreground">Recent activity</h2>
        {enquiries.length ? (
          <ul className="mt-4 grid gap-3 text-sm">
            {enquiries.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap justify-between gap-2 border-b border-border/70 pb-3 last:border-0"
              >
                <span>
                  <strong className="text-foreground">{item.name}</strong>{" "}
                  <span className="text-muted-foreground">sent a {item.kind} enquiry</span>
                  {item.course ? <span className="text-primary"> about {item.course}</span> : ""}
                </span>
                <span className="text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No enquiries yet. Submit the contact or enquiry form to see them here.
          </p>
        )}
      </div>
    </div>
  );
}

function Enquiries({ kind }: { kind: "contact" | "course" }) {
  const [enquiries, setEnquiries] = useStored<Enquiry[]>(ENQUIRIES_KEY, []);
  const [query, setQuery] = useState("");
  const visible = enquiries.filter(
    (item) =>
      item.kind === kind &&
      `${item.name} ${item.phone} ${item.email} ${item.message}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-foreground">
        {kind === "contact" ? "Contact enquiries" : "Course enquiries"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Messages submitted through the website, saved in this browser.</p>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search enquiries"
        className="mt-5 h-10 max-w-xs rounded-full bg-card border-border text-foreground focus-visible:ring-primary"
      />
      {visible.length ? (
        <div className="mt-6 grid gap-3">
          {visible.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-foreground">
                    {item.name}
                    {!item.read && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                        NEW
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.phone} · {item.email || "no email"} {item.course ? `· ${item.course}` : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Mark as read"
                    className="hover:bg-secondary text-muted-foreground hover:text-primary"
                    onClick={() =>
                      setEnquiries((list) =>
                        list.map((row) => (row.id === item.id ? { ...row, read: true } : row)),
                      )
                    }
                  >
                    <CheckCheck size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete enquiry"
                    className="hover:bg-secondary text-muted-foreground hover:text-destructive"
                    onClick={() => setEnquiries((list) => list.filter((row) => row.id !== item.id))}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">{item.message || "No message provided."}</p>
              <p className="mt-3 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border py-16 text-center bg-card/40">
          <p className="font-display text-lg font-bold text-foreground">No enquiries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">They&apos;ll appear here as soon as someone gets in touch.</p>
        </div>
      )}
    </div>
  );
}

function SettingsForm({ homepage = false }: { homepage?: boolean }) {
  const [settings, setSettings] = useStored("admin-settings", siteSettings);
  const [saved, setSaved] = useState(false);
  const businessFields = ["businessName", "tagline", "phone", "altPhone", "email", "address", "footerText"] as const;
  const homepageFields = ["heroTitle", "heroSubtitle", "tagline"] as const;
  const fields = homepage ? homepageFields : businessFields;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-extrabold text-foreground">{homepage ? "Homepage content" : "Settings"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {homepage ? "Edit the words shown on the home page hero." : "Business details used across the website."}
      </p>
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSettings(settings);
          setSaved(true);
        }}
      >
        {fields.map((key) => (
          <label key={key} className="grid gap-1.5 text-sm font-semibold capitalize text-foreground">
            {key.replace(/([A-Z])/g, " $1")}
            <Input
              value={settings[key]}
              className="bg-card border-border text-foreground focus-visible:ring-primary"
              onChange={(e) => {
                setSaved(false);
                setSettings({ ...settings, [key]: e.target.value });
              }}
            />
          </label>
        ))}
        <Button type="submit" className="h-11 w-fit rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
          Save changes
        </Button>
        {saved && <p className="text-sm font-semibold text-primary">Saved to this browser.</p>}
      </form>
    </div>
  );
}
