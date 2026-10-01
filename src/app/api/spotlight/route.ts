import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { defaultSpotlightSlides, SpotlightSlide } from "@/data/catalog";
import { getCache, setCache, deleteCache } from "@/lib/redis";

const COLLECTION = "spotlight_slides";
const REDIS_KEY = "spotlight:slides";

export async function GET() {
  try {
    // 1. Try Redis cache first
    const cached = await getCache<{ source: string; slides: SpotlightSlide[] }>(REDIS_KEY);
    if (cached && Array.isArray(cached.slides) && cached.slides.length > 0) {
      return NextResponse.json(
        {
          ...cached,
          source: "redis-cache",
        },
        {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const db = await getDb();
    if (db) {
      const slides = await db
        .collection<SpotlightSlide>(COLLECTION)
        .find({})
        .sort({ order: 1, createdAt: 1 })
        .toArray();

      if (slides.length > 0) {
        // Strip _id before returning to client
        const cleanSlides = slides.map(({ ...rest }) => rest);
        const payload = {
          source: "mongodb",
          slides: cleanSlides,
        };

        // Cache in Redis for 1 hour
        await setCache(REDIS_KEY, payload, 3600);

        return NextResponse.json(payload, {
          headers: {
            "X-Cache": "MISS",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        });
      }
    }
  } catch (err) {
    console.warn("MongoDB get spotlight slides error:", (err as Error).message);
  }

  return NextResponse.json({
    source: "default",
    slides: defaultSpotlightSlides,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slides: SpotlightSlide[] = body.slides;

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Expected 'slides' array in request body." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (db) {
      const collection = db.collection(COLLECTION);
      await collection.deleteMany({});
      if (slides.length > 0) {
        const docs = slides.map((slide, index) => ({
          ...slide,
          order: index,
          updatedAt: new Date(),
        }));
        await collection.insertMany(docs);
      }

      // Invalidate Redis cache
      await deleteCache(REDIS_KEY);

      return NextResponse.json({
        success: true,
        savedTo: "mongodb",
        count: slides.length,
      });
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state-only",
      count: slides.length,
      message: "MongoDB unavailable, slides saved in client localStorage.",
    });
  } catch (err) {
    console.error("Save spotlight API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to save spotlight slides." },
      { status: 500 }
    );
  }
}
