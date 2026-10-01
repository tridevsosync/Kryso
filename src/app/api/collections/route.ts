import { NextRequest, NextResponse } from "next/server";
import { ObjectId, type Filter, type Document } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCache, setCache, invalidateCollectionsCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || searchParams.get("collectionName");

    if (!name) {
      return NextResponse.json(
        { error: "Collection name parameter 'name' is required." },
        { status: 400 }
      );
    }

    // 1. Try Redis cache first for lightning-fast sub-millisecond response
    const cacheKey = `col:${name}`;
    const cachedData = await getCache<{
      success: boolean;
      source: string;
      collection: string;
      items: Array<Record<string, unknown>>;
    }>(cacheKey);

    if (cachedData && Array.isArray(cachedData.items)) {
      return NextResponse.json(
        {
          ...cachedData,
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

    // 2. Fetch from MongoDB if cache miss
    const db = await getDb();
    if (db) {
      const items = await db.collection(name).find({}).toArray();

      const sanitized: Array<Record<string, unknown>> = items.map((doc) => {
        const { _id, ...rest } = doc;
        return {
          id: rest.id || _id.toString(),
          ...rest,
        };
      });

      if (name === "academy_students") {
        try {
          const enrollments = await db.collection("academy_enrollments").find({}).toArray();
          const existingKeys = new Set(
            sanitized.flatMap((it) => [
              it.id ? String(it.id) : "",
              it.invoiceNumber ? String(it.invoiceNumber) : "",
              it.paymentId ? String(it.paymentId) : "",
            ]).filter(Boolean)
          );
          for (const enr of enrollments) {
            const enrId = enr.id ? String(enr.id) : enr._id ? enr._id.toString() : "";
            const inv = enr.invoiceNumber ? String(enr.invoiceNumber) : "";
            const pay = enr.paymentId ? String(enr.paymentId) : "";

            if (!existingKeys.has(enrId) && (!inv || !existingKeys.has(inv)) && (!pay || !existingKeys.has(pay))) {
              sanitized.push({
                id: enrId || `STU-${inv || Date.now()}`,
                name: enr.studentName || enr.name || "Student",
                email: enr.email || "",
                mobile: enr.mobile || enr.phone || "",
                age: enr.age || "",
                dob: enr.dob || "",
                address: enr.address || "",
                course: enr.courseName || enr.course || "",
                teacher: enr.teacherName || "Kryso",
                fees: enr.fees || 0,
                level: "Enrolled Student",
                paymentStatus: enr.paymentStatus || "PAID via Razorpay",
                invoiceNumber: inv,
                paymentId: pay,
                joined: enr.createdAt
                  ? new Date(enr.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent",
                createdAt: enr.createdAt || new Date().toISOString(),
              });
            }
          }
        } catch (syncErr) {
          console.warn("Could not merge academy_enrollments into students:", syncErr);
        }
      }

      const responsePayload = {
        success: true,
        source: "mongodb",
        collection: name,
        items: sanitized,
      };

      // 3. Cache in Redis (TTL: 1 hour)
      await setCache(cacheKey, responsePayload, 3600);

      return NextResponse.json(responsePayload, {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    return NextResponse.json({
      success: true,
      source: "fallback",
      collection: name,
      items: [],
      message: "MongoDB not connected. Operating in local storage mode.",
    });
  } catch (err) {
    console.error("GET collection API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch collection." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || body.collectionName;
    const { item, items } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Collection name 'name' is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (db) {
      const col = db.collection(name);

      // If full array replace
      if (Array.isArray(items)) {
        await col.deleteMany({});
        if (items.length > 0) {
          const docs = items.map((it, idx) => ({
            ...it,
            order: idx,
            updatedAt: new Date(),
          }));
          await col.insertMany(docs);
        }

        // Invalidate Redis cache for this collection
        await invalidateCollectionsCache(name);

        return NextResponse.json({
          success: true,
          savedTo: "mongodb",
          count: items.length,
        });
      }

      // If single item upsert
      if (item && item.id) {
        const itemId = String(item.id);
        const query: Filter<Document> =
          ObjectId.isValid(itemId) && itemId.length === 24
            ? { $or: [{ id: itemId }, { _id: new ObjectId(itemId) }] }
            : { id: itemId };

        await col.updateOne(
          query,
          { $set: { ...item, id: itemId, updatedAt: new Date() } },
          { upsert: true }
        );

        // Invalidate Redis cache for this collection
        await invalidateCollectionsCache(name);

        return NextResponse.json({
          success: true,
          savedTo: "mongodb",
          item,
        });
      }
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state",
      message: "MongoDB unavailable, cached in browser local storage.",
    });
  } catch (err) {
    console.error("POST collection API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to save collection." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || searchParams.get("collectionName");
    const id = searchParams.get("id");

    if (!name) {
      return NextResponse.json(
        { error: "Collection name 'name' is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (db) {
      const col = db.collection(name);
      if (id === "ALL") {
        await col.deleteMany({});
        if (name === "academy_students") {
          try {
            await db.collection("academy_enrollments").deleteMany({});
          } catch {}
        }

        // Invalidate Redis cache
        await invalidateCollectionsCache(name, "academy_enrollments");

        return NextResponse.json({
          success: true,
          cleared: true,
          collection: name,
        });
      } else if (id) {
        const itemId = String(id);
        const query: Filter<Document> =
          ObjectId.isValid(itemId) && itemId.length === 24
            ? { $or: [{ id: itemId }, { _id: new ObjectId(itemId) }] }
            : { $or: [{ id: itemId }, { invoiceNumber: itemId }, { paymentId: itemId }] };

        const result = await col.deleteMany(query);

        // If deleting a student, also remove corresponding record from academy_enrollments collection
        if (name === "academy_students") {
          try {
            const enrollmentQuery: Filter<Document> =
              ObjectId.isValid(itemId) && itemId.length === 24
                ? { $or: [{ id: itemId }, { _id: new ObjectId(itemId) }, { invoiceNumber: itemId }, { paymentId: itemId }] }
                : { $or: [{ id: itemId }, { invoiceNumber: itemId }, { paymentId: itemId }] };
            await db.collection("academy_enrollments").deleteMany(enrollmentQuery);
          } catch (enrErr) {
            console.warn("Failed to delete from academy_enrollments:", enrErr);
          }
        }

        // Invalidate Redis cache
        await invalidateCollectionsCache(name, "academy_enrollments");

        return NextResponse.json({
          success: true,
          deletedCount: result.deletedCount,
          deletedId: id,
          collection: name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state",
    });
  } catch (err) {
    console.error("DELETE collection API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete from collection." },
      { status: 500 }
    );
  }
}
