import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveId } from "@/lib/media-utils";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");
    const driveId = searchParams.get("id") || (rawUrl ? extractGoogleDriveId(rawUrl) : null);

    if (!rawUrl && !driveId) {
      return NextResponse.json({ error: "Missing url or id parameter" }, { status: 400 });
    }

    // 1. Handle local files (e.g. /uploads/...)
    if (rawUrl && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/") || rawUrl.startsWith("/"))) {
      const cleanPath = rawUrl.replace(/^\/?uploads\//, "").replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", cleanPath);

      try {
        const fileBuffer = await fs.readFile(fullPath);
        const ext = path.extname(cleanPath).toLowerCase();
        const contentType = ext === ".webm" ? "video/webm" : ext === ".mov" ? "video/quicktime" : "video/mp4";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Accept-Ranges": "bytes",
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        // Fall through
      }
    }

    // 2. Resolve Google Drive Direct Stream URL
    let targetUrl = rawUrl || "";
    if (driveId) {
      targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0&confirm=t`;
    }

    if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
      return NextResponse.redirect(targetUrl, {
        status: 302,
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
  } catch (err) {
    console.error("Video streaming error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to stream video" },
      { status: 500 }
    );
  }
}
