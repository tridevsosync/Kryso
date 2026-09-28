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
    if (rawUrl && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/"))) {
      const cleanPath = rawUrl.replace(/^\/?uploads\//, "");
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
            "Accept-Ranges": "bytes",
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        return NextResponse.json({ error: "Local audio file not found" }, { status: 404 });
      }
    }

    // 2. Resolve Google Drive Direct Stream URL
    let targetUrl = rawUrl || "";
    if (driveId) {
      // Direct high-reliability Google User Content download endpoint
      targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0`;
    }

    // Pass along Range header from browser if present
    const rangeHeader = req.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    let remoteRes = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: "follow",
    });

    // If drive.usercontent fails or returns non-200, fallback to docs.google.com export
    if (!remoteRes.ok && driveId) {
      const fallbackUrl = `https://docs.google.com/uc?export=download&id=${driveId}`;
      remoteRes = await fetch(fallbackUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      });
    }

    if (remoteRes.ok && remoteRes.body) {
      const contentType =
        remoteRes.headers.get("content-type")?.includes("audio") ||
        remoteRes.headers.get("content-type")?.includes("video")
          ? remoteRes.headers.get("content-type")!
          : "audio/mpeg";

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", "inline");
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=86400");

      const contentLength = remoteRes.headers.get("content-length");
      if (contentLength) {
        headers.set("Content-Length", contentLength);
      }

      const contentRange = remoteRes.headers.get("content-range");
      if (contentRange) {
        headers.set("Content-Range", contentRange);
      }

      return new Response(remoteRes.body, {
        status: remoteRes.status,
        headers,
      });
    }

    // Fallback: If fetch failed, return redirect
    return NextResponse.redirect(targetUrl, { status: 302 });
  } catch (err) {
    console.error("Audio streaming error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to stream audio" },
      { status: 500 }
    );
  }
}
