export type Product = { id: string; name: string; category: string; price: number; rating: number; description: string; tag: string; imageUrl?: string };
export type Course = {
  id: string;
  name: string;
  duration: string;
  fees: number;
  actualPrice?: number;
  originalPrice?: number;
  level: string;
  instructor: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  syllabusOverview?: string;
};

export type SyllabusModule = {
  id: string;
  step: string;
  title: string;
  desc: string;
  topics: string;
  courseName?: string;
};

export const defaultSyllabusModules: SyllabusModule[] = [
  {
    id: "mod-1",
    step: "01",
    title: "Posture & Instrument Geometry",
    desc: "Fretboard/key/drum geography, ergonomic posture, finger muscle memory, and pure tone production.",
    topics: "Hand placement & tuning, Finger gymnastics & agility, Basic tone articulation",
  },
  {
    id: "mod-2",
    step: "02",
    title: "Applied Theory & Harmony",
    desc: "Scales, chords, rhythm counting, chord transitions, and intuitive ear training.",
    topics: "Major & Minor scales, Chord inversions & rhythm strum, Time signatures & groove",
  },
  {
    id: "mod-3",
    step: "03",
    title: "Song Repertoire & Phrasing",
    desc: "Learn to play iconic songs across Pop, Rock, Classical, Jazz, and Bollywood genres.",
    topics: "Playing by ear, Dynamic expression & bends, Multi-genre song catalog",
  },
  {
    id: "mod-4",
    step: "04",
    title: "Concert Recital & Studio Prep",
    desc: "Perform over live backing tracks, learn amp & mic dynamics, and record your showcase.",
    topics: "Live stage jamming, Audio recording techniques, Recital certification showcase",
  },
];

export type StudioGearItem = {
  id: string;
  title: string;
  desc: string;
  category?: string;
  icon?: string;
};

export const defaultStudioGearItems: StudioGearItem[] = [
  {
    id: "gear-1",
    title: "Sound-Treated Isolation Rooms",
    desc: "Acoustically tuned practice spaces designed for natural resonance and zero external noise distraction.",
    category: "Acoustics",
    icon: "Mic2",
  },
  {
    id: "gear-2",
    title: "High-End Pro Audio Gear",
    desc: "Studio monitors, Shure and Sennheiser microphones, Fender and Cort amplifiers, and Focusrite recording interfaces.",
    category: "Pro Audio",
    icon: "Volume2",
  },
  {
    id: "gear-3",
    title: "Live Recital Stage",
    desc: "Dedicated stage arena with concert mood lighting for student showcases, open mics, and live ensemble jams.",
    category: "Concert Stage",
    icon: "Tv",
  },
  {
    id: "gear-4",
    title: "Complimentary Instrument Access",
    desc: "No need to carry heavy gear—students can use our in-house premium guitars, keyboards, violins, and drum kits.",
    category: "Instruments",
    icon: "Music2",
  },
  {
    id: "gear-5",
    title: "Flexible Practice Hours",
    desc: "Book complimentary studio rehearsal hours before or after your scheduled classes to practice your songs.",
    category: "Rehearsal",
    icon: "Calendar",
  },
  {
    id: "gear-6",
    title: "Central Pune Location",
    desc: "Conveniently accessible campus with dedicated parking, high-speed WiFi, and a warm music lounge.",
    category: "Campus",
    icon: "ShieldCheck",
  },
];

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
  {
    id: "course-djing",
    name: "DJING",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597850/kryso/academy/course_djing.jpg",
    instructor: "Kryso",
    fees: 2500,
    actualPrice: 3999,
    duration: "1 Month",
    level: "All levels",
    description: "Master professional club and festival DJing. Learn beatmatching, harmonic mixing, cueing, EQ blending, FX performance, and crowd control on industry-standard Pioneer CDJs and mixers.",
    syllabusOverview: "Hands-on deck training covering track curation, hot cues, beat grids, loop builds, dynamic drops, and live stage jam sessions.",
  },
  {
    id: "course-music-production",
    name: "Music Production",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597851/kryso/academy/course_music_production.jpg",
    instructor: "Kryso",
    fees: 3000,
    actualPrice: 4999,
    duration: "2 Months",
    level: "All levels",
    description: "From initial melody ideas to final radio-ready master. Master DAWs (Ableton, FL Studio, Logic Pro), sound design, synthesis, mixing, sidechaining, and song arrangement.",
    syllabusOverview: "Full electronic and acoustic sound engineering, vocal tuning, drum programming, arrangement structures, and loudness mastering for Spotify & Apple Music.",
  },
  {
    id: "course-piano",
    name: "Piano",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597883/kryso/academy/course_piano.jpg",
    instructor: "Kryso Faculty",
    fees: 2200,
    actualPrice: 3499,
    duration: "3 Months",
    level: "All levels",
    description: "Master classical and contemporary piano technique. Learn sheet music reading, two-handed coordination, scale fingerings, chord inversions, and expressive dynamic control.",
    syllabusOverview: "Keyboard geography, finger agility, classical etudes, modern pop chord voicings, arpeggios, and recital stage performance.",
  },
  {
    id: "course-guitar",
    name: "Guitar",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597853/kryso/academy/course_guitar.jpg",
    instructor: "Kryso Faculty",
    fees: 2000,
    actualPrice: 2999,
    duration: "3 Months",
    level: "All levels",
    description: "Learn acoustic & electric guitar mastery. Build finger strength, open and barre chords, rhythm strumming patterns, scale solos, and stage performance confidence.",
    syllabusOverview: "Fretboard navigation, picking and fingerstyle technique, chord progressions, pentatonic scale lead solos, and band accompaniment.",
  },
  {
    id: "course-tabla",
    name: "Tabla",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597854/kryso/academy/course_tabla.jpg",
    instructor: "Kryso Faculty",
    fees: 1800,
    actualPrice: 2799,
    duration: "3 Months",
    level: "All levels",
    description: "Explore the soulful rhythm of Indian Classical percussion. Learn bols, taals (Teental, Keherwa, Dadra), finger dexterity, layas, and accompaniment skills on Dayan and Bayan.",
    syllabusOverview: "Dayan-Bayan hand stroke geometry, bols articulation, kaydas, relas, tukdas, tihai compositions, and vocal/instrumental accompaniment.",
  },
  {
    id: "course-singing",
    name: "Singing",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597855/kryso/academy/course_singing.jpg",
    instructor: "Kryso Faculty",
    fees: 2200,
    actualPrice: 3299,
    duration: "2 Months",
    level: "All levels",
    description: "Find your true voice and vocal power. Master breath support, vocal pitch accuracy, chest/head voice blending, vibrato, scale warmups, and stage presence.",
    syllabusOverview: "Diaphragmatic breathing, pitch & ear training, vocal register transition (mix voice), resonance placement, microphone dynamics, and live stage vocals.",
  },
  {
    id: "course-drums",
    name: "Drums",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597856/kryso/academy/course_drums.jpg",
    instructor: "Kryso Faculty",
    fees: 2500,
    actualPrice: 3999,
    duration: "3 Months",
    level: "All levels",
    description: "Unleash solid groove and live concert power. Master stick grip, limb independence, 4/4 and funk beats, fills, double bass techniques, and metronome timing.",
    syllabusOverview: "Drum kit ergonomics, matched grip, snare rudiments, 4-way limb coordination, rock and pop grooves, fill transitions, and live jam backing track sessions.",
  },
  {
    id: "course-rapping",
    name: "Rapping",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597857/kryso/academy/course_rapping.jpg",
    instructor: "Kryso",
    fees: 2000,
    actualPrice: 3199,
    duration: "1 Month",
    level: "All levels",
    description: "Craft punchlines, flow variations, and dynamic lyrical cadence. Learn multi-syllabic rhyming, breath control, mic technique, freestyle improvisation, and studio recording.",
    syllabusOverview: "Bars structure & syllable counting, rhyme schemes (internal, multi, end), flow tempo shifts, vocal delivery, stage swagger, and recording in pro studio vocal booth.",
  },
];
export const testimonials: { name: string; course: string; text: string }[] = [];
export type Teacher = { id: string; name: string; experience: string; specialization: string; bio: string; avatarUrl?: string };
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
    secondaryBtnText: "enquiry",
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

