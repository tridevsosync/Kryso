import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

// Safely load environment variables from .env.local and .env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = resolve(process.cwd(), file);
    if (!existsSync(filePath)) continue;

    if (typeof process.loadEnvFile === "function") {
      try {
        process.loadEnvFile(filePath);
        continue;
      } catch {
        // Fall back to manual parsing if process.loadEnvFile encounters an issue
      }
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) {
          process.env[key] = val;
        }
      }
    } catch {
      // Ignore read errors
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "kryso_db";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

const rawCourses = [
  {
    id: "course-djing",
    name: "DJING",
    sourceImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=1200&auto=format&fit=crop",
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
    sourceImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
    instructor: "Kryso",
    fees: 2000,
    actualPrice: 3199,
    duration: "1 Month",
    level: "All levels",
    description: "Craft punchlines, flow variations, and dynamic lyrical cadence. Learn multi-syllabic rhyming, breath control, mic technique, freestyle improvisation, and studio recording.",
    syllabusOverview: "Bars structure & syllable counting, rhyme schemes (internal, multi, end), flow tempo shifts, vocal delivery, stage swagger, and recording in pro studio vocal booth.",
  },
];

async function seed() {
  console.log("1. Uploading course images to Cloudinary (folder: kryso/academy)...");
  if (!isCloudinaryConfigured) {
    console.warn("⚠️ Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) not set. Using source image URLs.");
  }
  const finalCourses = [];

  for (const course of rawCourses) {
    if (!isCloudinaryConfigured) {
      finalCourses.push({
        id: course.id,
        name: course.name,
        imageUrl: course.sourceImageUrl,
        instructor: course.instructor,
        fees: course.fees,
        actualPrice: course.actualPrice,
        duration: course.duration,
        level: course.level,
        description: course.description,
        syllabusOverview: course.syllabusOverview,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      continue;
    }

    try {
      console.log(`Uploading image for ${course.name}...`);
      const publicId = `course_${course.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const uploadResult = await cloudinary.uploader.upload(course.sourceImageUrl, {
        folder: "kryso/academy",
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      console.log(`✓ ${course.name} uploaded to Cloudinary: ${uploadResult.secure_url}`);
      finalCourses.push({
        id: course.id,
        name: course.name,
        imageUrl: uploadResult.secure_url,
        instructor: course.instructor,
        fees: course.fees,
        actualPrice: course.actualPrice,
        duration: course.duration,
        level: course.level,
        description: course.description,
        syllabusOverview: course.syllabusOverview,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Error uploading image for ${course.name}:`, err?.message || err);
      finalCourses.push({
        id: course.id,
        name: course.name,
        imageUrl: course.sourceImageUrl,
        instructor: course.instructor,
        fees: course.fees,
        actualPrice: course.actualPrice,
        duration: course.duration,
        level: course.level,
        description: course.description,
        syllabusOverview: course.syllabusOverview,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  if (!MONGODB_URI) {
    console.warn("\n⚠️ MONGODB_URI is not set in environment variables (.env.local or .env). Skipping MongoDB persistence.");
    console.log("\n--- JSON OUTPUT FOR CATALOG FALLBACK ---");
    console.log(JSON.stringify(finalCourses, null, 2));
    return;
  }

  console.log(`\n2. Connecting to MongoDB (${DB_NAME} -> academy_courses)...`);
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    const db = client.db(DB_NAME);
    const col = db.collection("academy_courses");

    console.log("Saving the 8 courses to MongoDB...");
    await col.deleteMany({});
    const insertResult = await col.insertMany(
      finalCourses.map((c, i) => ({ ...c, order: i }))
    );
    console.log(`✓ Successfully inserted ${insertResult.insertedCount} courses into MongoDB!`);
  } catch (mongoErr) {
    console.error("MongoDB error:", mongoErr?.message || mongoErr);
  } finally {
    await client.close();
  }

  console.log("\n--- JSON OUTPUT FOR CATALOG FALLBACK ---");
  console.log(JSON.stringify(finalCourses, null, 2));
}

seed();
