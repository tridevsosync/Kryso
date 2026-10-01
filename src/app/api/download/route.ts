import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveId } from "@/lib/media-utils";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawFileUrl = searchParams.get("url");
    const rawFilename = searchParams.get("filename") || "audio-track.mp3";

    if (!rawFileUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Clean and normalize filename
    const safeFilename = rawFilename
      .replace(/[/\\?%*:|"<>]/g, "_")
      .trim() || "audio-track.mp3";
    const asciiFilename = safeFilename.replace(/[^\x20-\x7E]/g, "_");

    // 1. Handle local files (e.g. /uploads/...)
    if (rawFileUrl.startsWith("/uploads/") || rawFileUrl.startsWith("uploads/")) {
      const cleanPath = rawFileUrl.replace(/^\/?uploads\//, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", cleanPath);

      try {
        const fileBuffer = await fs.readFile(fullPath);
        const ext = path.extname(cleanPath).toLowerCase();
        const contentType =
          ext === ".mp4"
            ? "video/mp4"
            : ext === ".wav"
            ? "audio/wav"
            : ext === ".m4a"
            ? "audio/m4a"
            : ext === ".ogg"
            ? "audio/ogg"
            : "audio/mpeg";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        return NextResponse.json({ error: "Local file not found" }, { status: 404 });
      }
    }

    // 2. Handle Google Drive & remote URLs
    const driveId = extractGoogleDriveId(rawFileUrl);
    let targetUrl = rawFileUrl;
    if (driveId) {
      targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0&confirm=t`;
    }

    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
      return NextResponse.redirect(targetUrl, {
        status: 302,
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
