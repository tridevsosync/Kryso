import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { defaultSpotlightSlides, SpotlightSlide } from "@/data/catalog";

const COLLECTION = "spotlight_slides";

export async function GET() {
  try {
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
        return NextResponse.json({
          source: "mongodb",
          slides: cleanSlides,
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
