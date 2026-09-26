export type Product = { id: string; name: string; category: string; price: number; rating: number; description: string; tag: string; imageUrl?: string };
export type Course = { id: string; name: string; duration: string; fees: number; actualPrice?: number; originalPrice?: number; level: string; instructor: string; description: string; icon?: string; imageUrl?: string };

export const categories = ["All instruments", "Guitar", "Piano", "Keyboard", "Drum", "Violin", "Flute", "Harmonium", "Tabla", "Ukulele", "Accessories"];
export const products: Product[] = [
  { id: "acoustic-guitar", name: "Cort Earth 60M", category: "Guitar", price: 12490, rating: 4.9, description: "A warm, balanced tone and a comfortable neck make this a lovely first guitar.", tag: "Bestseller" },
  { id: "digital-piano", name: "Casio CDP-S110", category: "Piano", price: 28990, rating: 4.8, description: "A beautifully expressive 88-key digital piano for the home or studio.", tag: "Studio pick" },
  { id: "stage-keyboard", name: "Yamaha PSR-E383", category: "Keyboard", price: 16990, rating: 4.8, description: "An inspiring portable keyboard filled with sounds for every kind of player.", tag: "Popular" },
  { id: "practice-drum", name: "Pearl Roadshow Junior", category: "Drum", price: 32490, rating: 4.7, description: "A complete compact kit with a full, punchy sound and reliable hardware.", tag: "Staff pick" },
  { id: "student-violin", name: "Kadence Violin 4/4", category: "Violin", price: 8990, rating: 4.7, description: "A ready-to-play violin set with a warm voice and all the essentials.", tag: "Ready to play" },
  { id: "concert-ukulele", name: "Kadence Concert Ukulele", category: "Ukulele", price: 3490, rating: 4.9, description: "Easy to pick up, lovely to hear, and ready for your next singalong.", tag: "Under ₹5,000" },
  { id: "bansuri", name: "Bamboo Bansuri", category: "Flute", price: 1290, rating: 4.6, description: "Hand-finished bamboo flute with a clear, resonant and soulful tone.", tag: "Hand finished" },
  { id: "tabla-set", name: "Concert Tabla Set", category: "Tabla", price: 7490, rating: 4.8, description: "A responsive dayan and bayan set for learning rhythm the traditional way.", tag: "New arrival" },
];

export const courses: Course[] = [];
export const testimonials: { name: string; course: string; text: string }[] = [];
export type Teacher = { id: string; name: string; experience: string; specialization: string; bio: string };
export const teachers: Teacher[] = [];
export type Student = { id: string; name: string; course: string; level: string; joined: string };
export const students: Student[] = [];
export type GalleryItem = { id: string; caption: string; category: string };
export const gallery: GalleryItem[] = [];

export const siteSettings = {
  businessName: "Kryso Music Academy",
  tagline: "Learn Music and Enjoy Music",
  phone: "+91 87678 28945",
  altPhone: "+91 97673 78750",
  email: "krysomusicacademy@gmail.com",
  address: "Pune, Maharashtra, India",
  footerText: "© 2026 Kryso Music Academy. All music, all heart.",
  footerDescription: "A concert-grade music academy in Pune where passion meets world-class mentorship.",
  heroTitle: "Learn music. Enjoy music.",
  heroSubtitle: "Find your rhythm at Kryso Music Academy.",
  youtubeUrl: "https://www.youtube.com/@krysomusic",
  instagramUrl: "https://www.instagram.com/krysomusic",
  facebookUrl: "https://www.facebook.com/krysomusic",
  isMaintenanceMode: false,
  maintenanceTitle: "Under Scheduled Maintenance",
  maintenanceMessage: "We are currently tuning our audio servers and studio gear to bring you a better musical experience. We will be back online shortly!",
};

export type SiteSettings = typeof siteSettings;

export type MusicTrack = {
  id: string;
  name: string; // Music Name
  singer: string; // Singer / Artist Name
  imageUrl: string; // Artwork Image
  audioUrl: string; // MP4 / MP3 audio file or link
  isLocked: boolean; // Lock button / status
  genre?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  downloadCount?: number;
  createdAt?: string;
};

export type SpotlightSlide = {
  id: string;
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  imageUrl: string;
  tag?: string;
};

export const defaultSpotlightSlides: SpotlightSlide[] = [
  {
    id: "dj-pro-producer",
    title: "Identify Yourself as pro DJ Music producer",
    description:
      "Tomorrowland Academy is where music creators grow, at every stage of their journey. From first mixes to polished productions, from online courses to in-person experiences, each step is designed to build skills, confidence and artistic identity.",
    primaryBtnText: "View all courses",
    primaryBtnLink: "/academy",
    secondaryBtnText: "Join the Community",
    secondaryBtnLink: "enquiry",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790413445/kryso/spotlight/dj_producer_hero_spotlight.png",
    tag: "PRO DJ & MUSIC PRODUCTION",
  },
  {
    id: "live-stage-mastery",
    title: "Master the Live Concert Stage & DJ Decks",
    description:
      "Step behind professional club & festival gear. Master track curation, harmonic mixing, crowd reading, and performance presence with seasoned concert DJs and sound designers.",
    primaryBtnText: "Explore music shop",
    primaryBtnLink: "/music",
    secondaryBtnText: "Book studio session",
    secondaryBtnLink: "enquiry",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790413445/kryso/spotlight/dj_producer_hero_spotlight.png",
    tag: "STAGE & PERFORMANCE",
  },
];

