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

    // Pass along Range header from browser for smooth video seeking & streaming
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
      const fallbackUrl = `https://docs.google.com/uc?export=download&id=${driveId}&confirm=t`;
      remoteRes = await fetch(fallbackUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      });
    }

    if (remoteRes.ok && remoteRes.body) {
      const headers = new Headers();
      headers.set("Content-Type", "video/mp4");
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

    // Fallback: Return redirect
    return NextResponse.redirect(targetUrl, { status: 302 });
  } catch (err) {
    console.error("Video streaming error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to stream video" },
      { status: 500 }
    );
  }
}
