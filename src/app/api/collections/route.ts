import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Collection name parameter 'name' is required." },
        { status: 400 }
      );
    }

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
          const existingIds = new Set(
            sanitized.map((it) => (it.id || it.invoiceNumber || it.name || "").toString())
          );
          for (const enr of enrollments) {
            const enrKey = (enr.id || enr.invoiceNumber || enr.studentName || "").toString();
            if (!existingIds.has(enrKey)) {
              sanitized.push({
                id: enr.id || `STU-${Date.now()}`,
                name: enr.studentName || enr.name,
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
                invoiceNumber: enr.invoiceNumber || "",
                paymentId: enr.paymentId || "",
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

      return NextResponse.json({
        success: true,
        source: "mongodb",
        collection: name,
        items: sanitized,
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
    const { name, item, items } = body;

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
        return NextResponse.json({
          success: true,
          savedTo: "mongodb",
          count: items.length,
        });
      }

      // If single item upsert
      if (item && item.id) {
        await col.updateOne(
          { id: item.id },
          { $set: { ...item, updatedAt: new Date() } },
          { upsert: true }
        );
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
    const name = searchParams.get("name");
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
        return NextResponse.json({
          success: true,
          cleared: true,
          collection: name,
        });
      } else if (id) {
        await col.deleteOne({ id });
        return NextResponse.json({
          success: true,
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
