export type Product = { id: string; name: string; category: string; price: number; rating: number; description: string; tag: string; imageUrl?: string };
export type Course = {
  id: string;
  name: string;
  order?: number;
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
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
    order: 7,
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
    order: 8,
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
  spotifyUrl: "https://open.spotify.com/artist/25uQC0WgX9Kmk64XiiF7UH?si=UYIN8MgpRB27qtHnLqlKqw&utm_source=copy-link&nd=1&dlsi=271aaa25a7344871",
  youtubeUrl: "https://www.youtube.com/@krysomusic",
  instagramUrl: "https://www.instagram.com/_krysomusic",
  facebookUrl: "https://www.facebook.com/krysomusic",
  isMaintenanceMode: false,
  maintenanceTitle: "Under Scheduled Maintenance",
  maintenanceMessage: "We are currently tuning our audio servers and studio gear to bring you a better musical experience. We will be back online shortly!",
};

export type TrackAudioItem = {
  id: string;
  title: string; // e.g. "Original Mix", "Extended Mix", "Instrumental", "Stem 1"
  url: string; // Direct audio/mp4 file or download link
};

export type MusicTrack = {
  id: string;
  name: string; // Music Name
  singer: string; // Singer / Artist Name
  imageUrl: string; // Artwork Image
  audioUrl: string; // Primary MP4 / MP3 audio preview file or stream link
  downloadUrl?: string; // Direct ZIP file / download package link (Google Drive, Dropbox, etc.)
  audioFiles?: TrackAudioItem[]; // Legacy multi audio tracks bundle
  isLocked: boolean; // Lock button / status
  isTop?: boolean; // When selected as Top, shown in Download section
  genre?: string;
  bpm?: string;
  key?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  downloadCount?: number;
  createdAt?: string;
};

export const defaultMusicTracks: MusicTrack[] = [
  {
    id: "track-1",
    name: "Aaja Mahi (Festival Mix)",
    singer: "Kryso & Deep Jandu",
    imageUrl: "/kryso-hero.jpg",
    audioUrl: "https://res.cloudinary.com/tridevsosync/video/upload/v1790597850/kryso/sample-audio.mp3",
    downloadUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    genre: "Festival Bass / EDM",
    isLocked: false,
    isTop: true,
    downloadCount: 1420,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "track-2",
    name: "Bombay Nightlife",
    singer: "Kryso",
    imageUrl: "/kryso-dj-music-producer-bg.png",
    audioUrl: "https://res.cloudinary.com/tridevsosync/video/upload/v1790597850/kryso/sample-audio.mp3",
    downloadUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    genre: "Tech House / Club",
    isLocked: true,
    isTop: true,
    downloadCount: 980,
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "track-3",
    name: "Desert Mirage (Live Arena Edit)",
    singer: "Kryso ft. Sound of Indus",
    imageUrl: "/kryso-shows.jpg",
    audioUrl: "https://res.cloudinary.com/tridevsosync/video/upload/v1790597850/kryso/sample-audio.mp3",
    downloadUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    genre: "Afro House / Melodic",
    isLocked: false,
    isTop: true,
    downloadCount: 840,
    createdAt: "2026-02-18T00:00:00.000Z",
  },
  {
    id: "track-4",
    name: "Neon Horizon 2026",
    singer: "Kryso",
    imageUrl: "/music-hero.jpg",
    audioUrl: "https://res.cloudinary.com/tridevsosync/video/upload/v1790597850/kryso/sample-audio.mp3",
    downloadUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    genre: "Mainstage Anthem",
    isLocked: true,
    isTop: true,
    downloadCount: 1250,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];

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
    title: "Get Identified as a PRO. DJ & Music Producer",
    description:
      "Tomorrowland Academy is where music creators grow, at every stage of their journey. From first mixes to polished productions, from online courses to in-person experiences, each step is designed to build skills, confidence and artistic identity.",
    primaryBtnText: "View all courses",
    primaryBtnLink: "/academy",
    secondaryBtnText: "Enquiry",
    secondaryBtnLink: "enquiry",
    imageUrl: "https://res.cloudinary.com/tridevsosync/image/upload/v1790597850/kryso/academy/course_djing.jpg",
    tag: "PRO. DJ & MUSIC PRODUCTION",
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
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    tag: "STAGE & PERFORMANCE",
  },
];

export type KrysoPageImage = {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  link?: string;
};

export type KrysoPageConfig = {
  videoUrl: string;
  timerSeconds: number;
  autoPlayVideo: boolean;
  loopVideo?: boolean;
  videoTitle?: string;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number; // 0 - 100
  backgroundBlur?: number; // 0 - 20 (px)
};

export const defaultKrysoPageImages: KrysoPageImage[] = [
  {
    id: "kryso-img-1",
    url: "/kryso-dj-music-producer-bg.png",
    title: "Live Stage & Concert Experience",
    caption: "Master live performance, DJing, and concert stage energy with seasoned mentors.",
    link: "/academy",
  },
  {
    id: "kryso-img-2",
    url: "/kryso-music-producer-presskit.png",
    title: "Acoustic & Studio Production",
    caption: "State-of-the-art recording equipment, soundproofing, and hands-on guidance.",
    link: "/music",
  },
  {
    id: "kryso-img-3",
    url: "/kryso-hero.jpg",
    title: "1-on-1 Artist Mentorship",
    caption: "Learn Guitar, Piano, Drums, Vocals, DJing, and sound engineering in Pune.",
    link: "/contact",
  },
];

export const defaultKrysoPageConfig: KrysoPageConfig = {
  videoUrl: "https://drive.google.com/file/d/1mrKNVwkgZOpQ7plrQ56z2C7u-gog3TPf/view?usp=sharing",
  timerSeconds: 10,
  autoPlayVideo: true,
  loopVideo: true,
  videoTitle: "KRYSO Live Concert & Studio Showcase",
  backgroundImageUrl: "/kryso-dj-music-producer-bg.png",
  backgroundOverlayOpacity: 82,
  backgroundBlur: 0,
};

export type KrysoBiography = {
  name: string;
  role: string;
  tagline: string;
  imageUrl: string;
  bioParagraph1: string;
  bioParagraph2: string;
  bioParagraph3?: string;
  genres: string[];
  stats?: Array<{ label: string; value: string }>;
  spotifyUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
};

export const defaultKrysoBiography: KrysoBiography = {
  name: "Kryso",
  role: "Rapper, Singer & Music Producer",
  tagline: "Bridging Hard-Hitting Flow, Soulful Vocals & High-Octane Stage Energy",
  imageUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
  bioParagraph1:
    "Kryso is an Indian rapper, singer, songwriter, and visionary music producer known for blending lyrical storytelling, explosive rap cadence, and melodic vocal hooks. Driven by a deep passion for musical experimentation, Kryso transforms raw street emotion and contemporary rhythms into chart-ready anthems.",
  bioParagraph2:
    "From rocking electrifying live concert stages to crafting immersive studio soundscapes, Kryso has built a distinct sonic identity across Hip-Hop, Pop, and Electronic genres. As the creative force behind Kryso Music Academy in Pune, he mentors the next generation of vocalists, rappers, and music creators with hands-on studio training and live stage discipline.",
  bioParagraph3:
    "Whether dropping high-energy rap bars or singing heartfelt acoustic melodies, Kryso continues to push sonic boundaries with original releases and concert performances.",
  genres: ["Hip-Hop & Rap", "Melodic Vocals", "Music Production", "Live Stage Performance", "DJing & Sound Design"],
  stats: [
    { label: "Original Releases", value: "15+" },
    { label: "Live Stage Shows", value: "50+" },
    { label: "Students Coached", value: "200+" },
    { label: "Years Experience", value: "7+" },
  ],
  spotifyUrl: "https://open.spotify.com/artist/25uQC0WgX9Kmk64XiiF7UH?si=UYIN8MgpRB27qtHnLqlKqw&utm_source=copy-link&nd=1&dlsi=271aaa25a7344871",
  youtubeUrl: "https://www.youtube.com/@krysomusic",
  instagramUrl: "https://www.instagram.com/_krysomusic",
};

export type KrysoUpcomingEvent = {
  id: string;
  title: string;
  date: string; // e.g., "NOV 14, 2026"
  day?: string; // e.g., "SAT"
  time?: string; // e.g., "08:30 PM"
  venue: string; // e.g., "Odeon Amphitheatre"
  city: string; // e.g., "Mumbai, India"
  category?: string; // e.g., "Arena Concert", "Festival Mainstage", "Club Night"
  ticketUrl?: string; // booking / ticketing link
  ticketLabel?: string; // e.g., "Get Tickets", "Book Passes", "RSVP"
  status?: "tickets_available" | "selling_fast" | "sold_out" | "free_entry" | "announcing_soon";
  posterUrl?: string; // optional event artwork
  isEnabled?: boolean; // individual event toggle
};

export type KrysoInternationalShow = {
  venue: string;
  country: string;
  flag?: string;
  city?: string;
  year?: string;
};

export type KrysoShowsData = {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  bgImageUrl?: string;
  bgLinkUrl?: string;
  bgLinkText?: string;
  bgPositionX?: number; // 0 to 100% horizontal alignment (default: 50)
  bgPositionY?: number; // 0 to 100% vertical alignment (default: 50)
  bgZoom?: number; // 100 to 250% scale (default: 100)
  bgOpacity?: number; // 10 to 100% opacity (default: 30)
  bgBrightness?: number; // 50 to 150% brightness (default: 95)
  bgContrast?: number; // 50 to 150% contrast (default: 110)
  bgBlur?: number; // 0 to 20px blur (default: 0)
  
  // Upcoming Events Slot
  upcomingEventsEnabled?: boolean;
  upcomingEventsBadge?: string;
  upcomingEventsHeading?: string;
  upcomingEventsSubtext?: string;
  upcomingEvents: KrysoUpcomingEvent[];

  // India Shows & Festivals
  indiaSectionTitle?: string;
  indiaShows: string[];

  // International Tour Residencies
  internationalSectionTitle?: string;
  internationalShows: KrysoInternationalShow[];

  // Shared Stage With
  sharedStageTitle?: string;
  sharedStageWith: string[];
};

export const defaultKrysoUpcomingEvents: KrysoUpcomingEvent[] = [
  {
    id: "event-1",
    title: "Kryso Live — Neon Horizon Arena Tour",
    date: "NOV 14, 2026",
    day: "SAT",
    time: "08:30 PM",
    venue: "Odeon Amphitheatre",
    city: "Mumbai, India",
    category: "Arena Concert",
    ticketUrl: "https://insider.in",
    ticketLabel: "Get Tickets",
    status: "selling_fast",
    posterUrl: "/kryso-shows.jpg",
    isEnabled: true,
  },
  {
    id: "event-2",
    title: "Bass & Beats Festival Mainstage",
    date: "DEC 05, 2026",
    day: "FRI",
    time: "10:00 PM",
    venue: "Sky High Arena",
    city: "Pune, India",
    category: "Music Festival",
    ticketUrl: "https://in.bookmyshow.com",
    ticketLabel: "Buy Passes",
    status: "tickets_available",
    posterUrl: "/kryso-dj-music-producer-bg.png",
    isEnabled: true,
  },
  {
    id: "event-3",
    title: "Midnight Frequencies Club Showcase",
    date: "DEC 24, 2026",
    day: "WED",
    time: "09:30 PM",
    venue: "Chelsea Music Hall",
    city: "New York, USA",
    category: "International Club Tour",
    ticketUrl: "https://dice.fm",
    ticketLabel: "Reserve Tickets",
    status: "tickets_available",
    posterUrl: "/kryso-hero.jpg",
    isEnabled: true,
  },
  {
    id: "event-4",
    title: "NYE 2027 Mega Countdown Concert",
    date: "DEC 31, 2026",
    day: "THU",
    time: "08:00 PM",
    venue: "Grand Palm Beach Arena",
    city: "Goa, India",
    category: "New Year Festival",
    ticketUrl: "https://insider.in",
    ticketLabel: "VIP & Passes",
    status: "announcing_soon",
    posterUrl: "/kryso-shows.jpg",
    isEnabled: true,
  },
];

export const defaultKrysoShowsData: KrysoShowsData = {
  badge: "LIVE CONCERTS & TOURS",
  title: "KRYSO",
  titleHighlight: "SHOWS",
  subtitle: "Electrifying marquee festival stages across India and iconic international venues worldwide.",
  bgImageUrl: "/kryso-shows.jpg",
  bgPositionX: 50,
  bgPositionY: 50,
  bgZoom: 100,
  bgOpacity: 30,
  bgBrightness: 95,
  bgContrast: 110,
  bgBlur: 0,
  upcomingEventsEnabled: true,
  upcomingEventsBadge: "TOUR & GIG CALENDAR 2026",
  upcomingEventsHeading: "UPCOMING SHOWS & FESTIVAL DATES",
  upcomingEventsSubtext: "Catch Kryso live on stage across clubs, arenas, and festival mainstages. Book your passes before venues sell out.",
  upcomingEvents: defaultKrysoUpcomingEvents,
  indiaSectionTitle: "INDIA FESTIVALS & SHOWS",
  indiaShows: [
    "Zomaland Festival",
    "ICW Festival",
    "Mandala Festival",
    "Doon Festival",
    "Press Play by Armani Exchange Festival",
    "Gin Festival",
    "DGTL Festival",
    "Swiggy Steppin Out Festival",
    "The Holi Moo Festival",
    "Casa Bacardi",
    "The International Cricket Council",
    "IBTIDA Ek Mehfil",
    "Joy town by BMW",
    "Mijwan show by Manish Malhotra",
    "Anita Dongre Mumbai",
    "The Cartier Showcase at the French Embassy, India",
    "India Design ID",
    "India Art Fair",
    "Pravaas Journey",
    "Cymbal Rotations",
    "Mahindra Roots",
    "Svasa Homes",
    "Royal Enfield",
    "EO Jaisalmer",
  ],
  internationalSectionTitle: "INTERNATIONAL VENUES & RESIDENCIES",
  internationalShows: [
    { venue: "Chelsea Music Hall, New York", country: "USA", flag: "🇺🇸", city: "New York" },
    { venue: "ICY Club, Dubai", country: "UAE", flag: "🇦🇪", city: "Dubai" },
    { venue: "Techno & Chill x Boatriders, Dubai", country: "UAE", flag: "🇦🇪", city: "Dubai" },
    { venue: "Prince Bandroom, Melbourne", country: "Australia", flag: "🇦🇺", city: "Melbourne" },
    { venue: "The Underground, Sydney", country: "Australia", flag: "🇦🇺", city: "Sydney" },
    { venue: "IWA Fest, Melilla", country: "Spain", flag: "🇪🇸", city: "Melilla" },
    { venue: "Hï Ibiza", country: "Spain", flag: "🇪🇸", city: "Ibiza" },
    { venue: "Fridas Pier, Stuttgart", country: "Germany", flag: "🇩🇪", city: "Stuttgart" },
  ],
  sharedStageTitle: "SHARED THE STAGE WITH",
  sharedStageWith: [
    "Solomun",
    "Black Coffee",
    "Artbat",
    "Dixon",
    "Claptone",
    "Innellea",
    "Indo Warehouse",
    "Space Motion",
    "Kilimanjaro",
  ],
};

export type KrysoDownloadItem = {
  id: string;
  title: string;
  type: "image" | "video";
  category?: string;
  thumbnailUrl: string;
  driveUrl: string;
  description?: string;
  fileSize?: string;
  dateAdded?: string;
};

export const defaultKrysoDownloads: KrysoDownloadItem[] = [
  {
    id: "dl-1",
    title: "Official Press Kit & 4K Portraits",
    type: "image",
    category: "Press Photos",
    thumbnailUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    driveUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    description: "High-resolution studio portraits and artist photographs for media, promoters, and event features.",
    fileSize: "45 MB",
  },
  {
    id: "dl-2",
    title: "KRYSO Live Festival Visuals & Cut Reel",
    type: "video",
    category: "Live Sets & Video",
    thumbnailUrl: "/kryso-hero.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP?usp=sharing",
    description: "High-energy festival performance cut, 4K stage visuals, and concert recap footage.",
    fileSize: "280 MB",
  },
  {
    id: "dl-3",
    title: "Official Shows & Tour Artwork Poster",
    type: "image",
    category: "Tour Posters",
    thumbnailUrl: "/kryso-shows.jpg",
    driveUrl: "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing",
    description: "Print-ready high-resolution tour posters, banner artworks, and social media flyers.",
    fileSize: "18 MB",
  },
  {
    id: "dl-4",
    title: "KRYSO KJSC Festival Aftermovie 4K",
    type: "video",
    category: "Recap Videos",
    thumbnailUrl: "/kryso-hero.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP?usp=sharing",
    description: "Official 4K master cut of the KJSC festival performance with live crowd reactions.",
    fileSize: "1.2 GB",
  },
];

export type KrysoProducerData = {
  title: string;
  subtitle: string;
  badge: string;
  bgImageUrl: string;
  description: string;
  subDescription: string;
  recordLabels: string[];
  tvFeatures: string[];
  artistSupporters: string[];
  streamingPlatforms: Array<{ name: string; url?: string; color?: string }>;
};

export const defaultKrysoProducerData: KrysoProducerData = {
  title: "Kryso DJ / Music Producer",
  subtitle: "Releases, TV Features & Global Artist Support",
  badge: "INDUSTRY DISCOGRAPHY & BROADCASTS",
  bgImageUrl: "/kryso-dj-music-producer-bg.png",
  description:
    "Signed to prestigious record labels across the globe, broadcasting dynamic electronic productions through mainstream television networks, and receiving consistent live support from premier global DJs and chart-topping artists.",
  subDescription:
    "Explore Kryso's industry footprint spanning international record label catalogues, televised music shows, and collaborative festival anthems.",
  recordLabels: [
    "Harmour Records",
    "LLF Records",
    "Zee Music",
    "Play Life Records",
  ],
  tvFeatures: [
    "MTV",
    "Vh1",
    "9XM",
    "ZOOM",
    "ZEE",
  ],
  artistSupporters: [
    "NICKY ROMERO",
    "TIMMY TRUMPET",
    "BLASTERJAXX",
    "F-TAMPA",
    "QUINTINO",
    "DIVINE",
  ],
  streamingPlatforms: [
    { name: "Spotify", url: "https://open.spotify.com/artist/25uQC0WgX9Kmk64XiiF7UH", color: "text-[#1DB954]" },
    { name: "SoundCloud", url: "https://soundcloud.com/kyrso_music", color: "text-[#FF5500]" },
    { name: "Beatport", url: "https://beatport.com", color: "text-[#01FF95]" },
    { name: "Apple Music", url: "https://music.apple.com", color: "text-white" },
    { name: "Gaana", url: "https://gaana.com", color: "text-[#E72C33]" },
    { name: "JioSaavn", url: "https://jiosaavn.com", color: "text-[#2BC5B4]" },
  ],
};

export type KrysoTechriderItem = {
  id: string;
  category: string;
  spec: string;
};

export type KrysoTechriderData = {
  sectionTitle: string;
  sectionSubtitle: string;
  badge: string;
  posterImageUrl: string;
  posterTitle: string;
  posterSubtitle: string;
  techriderTitle: string;
  techriderItems: KrysoTechriderItem[];
  contactTitle: string;
  bookingPhone: string;
  bookingEmail: string;
  websiteUrl: string;
  facebookUrl: string;
  soundcloudUrl: string;
  instagramUrl?: string;
};

export const defaultKrysoTechriderData: KrysoTechriderData = {
  sectionTitle: "Techrider & Contact",
  sectionSubtitle:
    "Official stage technical requirements, DJ gear checklist, and direct artist representation for festivals, clubs, and international tour bookings.",
  badge: "STAGE SPECIFICATIONS & BOOKING INQUIRIES",
  posterImageUrl: "/kryso-techrider-contact.png",
  posterTitle: "KRYSO • LIVE ON STAGE",
  posterSubtitle: "Headliner Rider 2026",
  techriderTitle: "Stage Technical Requirements",
  techriderItems: [
    { id: "tr-1", category: "DJ Mixer", spec: "1 X PIONEER DJM 900 NEXUS NX2" },
    { id: "tr-2", category: "Media Decks", spec: "PIONEER CDJ 2000 NX2" },
    {
      id: "tr-3",
      category: "Stage Microphone",
      spec: "1 X SHURE SM 58 MICROPHONE WITH SWITCH OR SENNHEISER CONNECTED INTO THE DJ MIXER",
    },
    { id: "tr-4", category: "Stage Audio Monitoring", spec: "2 IN EAR STEREO MONITORS" },
  ],
  contactTitle: "Bookings & Direct Channels",
  bookingPhone: "+91 9767378750",
  bookingEmail: "krysomusic@gmail.com",
  websiteUrl: "https://www.krysomusic.com",
  facebookUrl: "https://facebook.com/krysomusic",
  soundcloudUrl: "https://soundcloud.com/kyrso_music",
  instagramUrl: "https://instagram.com/_krysomusic",
};

export type MusicHeaderData = {
  badge?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  bgImageUrl?: string;
  cropPosition?: "left" | "center" | "right" | "top" | "bottom" | "custom";
  positionX?: number; // 0% to 100%
  positionY?: number; // 0% to 100%
  zoom?: number; // 100% to 250%
  brightness?: number; // 50% to 150%
  contrast?: number; // 50% to 150%
  opacity?: number; // 20% to 100%
  badge1?: string;
  badge2?: string;
  badge3?: string;
};

export const defaultMusicHeaderData: MusicHeaderData = {
  badge: "Kryso Official Music Releases",
  title: "Music Releases &",
  titleHighlight: "Exclusive Download.",
  description: "Explore studio master releases, exclusive audio packages, and download high-definition MP4/MP3 files directly to your device.",
  bgImageUrl: "/music-hero.jpg",
  cropPosition: "custom",
  positionX: 75,
  positionY: 50,
  zoom: 100,
  brightness: 100,
  contrast: 110,
  opacity: 65,
  badge1: "Studio Master Audio",
  badge2: "Follow to Unlock Exclusive Downloads",
  badge3: "Direct Audio & ZIP Downloads",
};


