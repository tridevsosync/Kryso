export type Product = { id: string; name: string; category: string; price: number; rating: number; description: string; tag: string };
export type Course = { id: string; name: string; duration: string; fees: number; level: string; instructor: string; description: string; icon: string };

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

export const courses: Course[] = [
  { id: "guitar", name: "Guitar", duration: "3 months", fees: 2500, level: "All levels", instructor: "Aarav Kulkarni", description: "Find your rhythm, build confident technique and play the songs you love.", icon: "♬" },
  { id: "piano", name: "Piano", duration: "3 months", fees: 2800, level: "Beginner to advanced", instructor: "Meera Deshpande", description: "From first notes to expressive playing, learn music with a strong foundation.", icon: "▥" },
  { id: "vocals", name: "Vocal singing", duration: "2 months", fees: 2200, level: "All levels", instructor: "Sana Merchant", description: "Discover your voice through breath, pitch and songs from every tradition.", icon: "♫" },
  { id: "keyboard", name: "Keyboard", duration: "3 months", fees: 2400, level: "Beginner to intermediate", instructor: "Rohan Patil", description: "Learn chords, melodies and the building blocks of modern keyboard playing.", icon: "▤" },
  { id: "drums", name: "Drums", duration: "3 months", fees: 2600, level: "All levels", instructor: "Kabir Shah", description: "Build timing, coordination and a rock-solid groove behind the kit.", icon: "◉" },
  { id: "violin", name: "Violin", duration: "4 months", fees: 2800, level: "Beginner to advanced", instructor: "Anaya Joshi", description: "A patient, practical introduction to this wonderfully expressive instrument.", icon: "𝄞" },
  { id: "tabla", name: "Tabla", duration: "3 months", fees: 2200, level: "All levels", instructor: "Nikhil Rao", description: "Explore taal, hand technique and the rich rhythmic language of tabla.", icon: "◌" },
  { id: "flute", name: "Flute", duration: "3 months", fees: 2200, level: "Beginner", instructor: "Nikhil Rao", description: "Learn breath, tone and beautiful melodies one note at a time.", icon: "♩" },
  { id: "harmonium", name: "Harmonium", duration: "3 months", fees: 2200, level: "All levels", instructor: "Sana Merchant", description: "Build an ear for melody and accompany devotional and classical music.", icon: "♪" },
];

export const testimonials = [
  { name: "Aditi S.", course: "Vocal singing", text: "I came in too shy to sing in front of anyone. Now I look forward to every class—and my first stage performance was unforgettable." },
  { name: "Rohan M.", course: "Guitar", text: "The lessons are relaxed but focused. In a few months I was playing full songs with my friends." },
  { name: "Isha P.", course: "Piano", text: "Such a warm space to learn. My daughter loves her piano classes and the teachers make every lesson feel special." },
];
export type Teacher = { id: string; name: string; experience: string; specialization: string; bio: string };
export const teachers: Teacher[] = [
  { id: "aarav", name: "Aarav Kulkarni", experience: "9 years", specialization: "Guitar", bio: "Session guitarist who loves teaching first chords as much as advanced solos." },
  { id: "meera", name: "Meera Deshpande", experience: "12 years", specialization: "Piano", bio: "Classically trained pianist with a warm, patient teaching style." },
  { id: "sana", name: "Sana Merchant", experience: "7 years", specialization: "Vocals & harmonium", bio: "Vocal coach helping students find a confident, natural voice." },
  { id: "kabir", name: "Kabir Shah", experience: "8 years", specialization: "Drums", bio: "Groove-first drummer with a knack for building rock-solid timing." },
  { id: "nikhil", name: "Nikhil Rao", experience: "10 years", specialization: "Tabla & flute", bio: "Grounded in Hindustani tradition, and happiest teaching rhythm." },
];

export type Student = { id: string; name: string; course: string; level: string; joined: string };
export const students: Student[] = [
  { id: "s1", name: "Aditi Sharma", course: "Vocal singing", level: "Intermediate", joined: "Jan 2026" },
  { id: "s2", name: "Rohan Mehta", course: "Guitar", level: "Beginner", joined: "Mar 2026" },
  { id: "s3", name: "Isha Pawar", course: "Piano", level: "Beginner", joined: "Apr 2026" },
  { id: "s4", name: "Dev Naik", course: "Drums", level: "Advanced", joined: "Aug 2025" },
];

export type GalleryItem = { id: string; caption: string; category: string };
export const gallery: GalleryItem[] = [
  { id: "g1", caption: "In the practice room", category: "Music classes" },
  { id: "g2", caption: "Learning together", category: "Students" },
  { id: "g3", caption: "Sharing a first song", category: "Performances" },
  { id: "g4", caption: "Music in the making", category: "Workshops" },
  { id: "g5", caption: "Annual showcase", category: "Events" },
  { id: "g6", caption: "Rhythm workshop", category: "Workshops" },
];

export const siteSettings = {
  businessName: "Kryso Music Academy",
  tagline: "Learn Music and Enjoy Music",
  phone: "+91 87678 28945",
  altPhone: "+91 97673 78750",
  email: "krysomusicacademy@gmail.com",
  address: "Pune, Maharashtra, India",
  footerText: "© 2026 Kryso Music Academy. All music, all heart.",
  heroTitle: "Learn music. Enjoy music.",
  heroSubtitle: "Find your rhythm at Kryso Music Academy.",
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
    imageUrl: "/dj-producer-hero.png",
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
    imageUrl: "/dj-producer-hero.png",
    tag: "STAGE & PERFORMANCE",
  },
];

