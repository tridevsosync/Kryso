import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const rawFilename = searchParams.get("filename") || "audio-track.mp3";

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Clean and normalize filename
    const safeFilename = rawFilename
      .replace(/[/\\?%*:|"<>]/g, "_")
      .trim() || "audio-track.mp3";
    const asciiFilename = safeFilename.replace(/[^\x20-\x7E]/g, "_");

    // 1. Handle local files (e.g. /uploads/...)
    if (fileUrl.startsWith("/uploads/") || fileUrl.startsWith("uploads/")) {
      const cleanPath = fileUrl.replace(/^\/?uploads\//, "");
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

    // 2. Handle remote URLs (Cloudinary, external audio CDNs, S3, etc.)
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      try {
        const remoteRes = await fetch(fileUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        });

        if (remoteRes.ok && remoteRes.body) {
          const contentType =
            remoteRes.headers.get("content-type") || "application/octet-stream";
          const contentLength = remoteRes.headers.get("content-length");

          const headers = new Headers();
          headers.set("Content-Type", contentType);
          headers.set(
            "Content-Disposition",
            `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
          );
          headers.set("Cache-Control", "public, max-age=86400");
          if (contentLength) {
            headers.set("Content-Length", contentLength);
          }

          // Stream the remote body directly to user for instant downloads of any file size
          return new Response(remoteRes.body, {
            status: 200,
            headers,
          });
        }

        // Fallback redirect if fetch failed
        return NextResponse.redirect(fileUrl, { status: 302 });
      } catch (fetchErr) {
        console.warn("Proxy fetch error, redirecting directly to URL:", fetchErr);
        return NextResponse.redirect(fileUrl, { status: 302 });
      }
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
