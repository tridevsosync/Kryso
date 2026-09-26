import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "enquiries";

export async function GET() {
  try {
    const db = await getDb();
    if (db) {
      const list = await db
        .collection(COLLECTION)
        .find({})
        .sort({ createdAt: -1, created_at: -1 })
        .toArray();

      const sanitized = list.map((doc) => {
        const { _id, ...rest } = doc;
        return {
          id: rest.id || _id.toString(),
          ...rest,
        };
      });

      return NextResponse.json({
        success: true,
        source: "mongodb",
        enquiries: sanitized,
      });
    }
  } catch (err) {
    console.warn("MongoDB get enquiries warning:", (err as Error).message);
  }

  return NextResponse.json({
    success: true,
    source: "fallback",
    enquiries: [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDb();

    const doc = {
      id: body.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: body.kind || "contact",
      name: body.name || "Anonymous",
      phone: body.phone || "",
      email: body.email || "",
      course: body.course || "",
      message: body.message || "",
      read: Boolean(body.read),
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (db) {
      await db.collection(COLLECTION).insertOne(doc);
      return NextResponse.json({
        success: true,
        savedTo: "mongodb",
        enquiry: doc,
      });
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state-only",
      enquiry: doc,
      message: "MongoDB unavailable, stored locally.",
    });
  } catch (err) {
    console.error("Save enquiry API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to save enquiry." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "Enquiry 'id' is required" }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      await db.collection(COLLECTION).updateOne(
        { id },
        { $set: { read: Boolean(read), updatedAt: new Date() } }
      );
      return NextResponse.json({
        success: true,
        savedTo: "mongodb",
        id,
        read,
      });
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state",
    });
  } catch (err) {
    console.error("PATCH enquiry error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update enquiry." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Parameter 'id' is required." }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      if (id === "ALL") {
        await db.collection(COLLECTION).deleteMany({});
        return NextResponse.json({ success: true, cleared: true });
      } else {
        await db.collection(COLLECTION).deleteOne({ id });
        return NextResponse.json({ success: true, deletedId: id });
      }
    }

    return NextResponse.json({ success: true, savedTo: "local-state" });
  } catch (err) {
    console.error("DELETE enquiry error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete enquiry." },
      { status: 500 }
    );
  }
}
