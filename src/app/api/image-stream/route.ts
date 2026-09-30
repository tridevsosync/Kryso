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

    // 1. Handle local files in /uploads/
    if (rawUrl && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/"))) {
      const cleanPath = rawUrl.replace(/^\/?uploads\//, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", cleanPath);

      try {
        const fileBuffer = await fs.readFile(fullPath);
        const ext = path.extname(cleanPath).toLowerCase();
        const contentType =
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".svg"
            ? "image/svg+xml"
            : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        return NextResponse.json({ error: "Local file not found" }, { status: 404 });
      }
    }

    // 2. Fetch Google Drive image using high-res thumbnail / export
    if (driveId) {
      const candidateUrls = [
        `https://drive.google.com/thumbnail?id=${driveId}&sz=w1920`,
        `https://lh3.googleusercontent.com/d/${driveId}`,
        `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0`,
        `https://docs.google.com/uc?export=download&id=${driveId}`,
      ];

      for (const targetUrl of candidateUrls) {
        try {
          const remoteRes = await fetch(targetUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            redirect: "follow",
          });

          if (remoteRes.ok) {
            const arrayBuffer = await remoteRes.arrayBuffer();
            if (arrayBuffer.byteLength > 200) {
              const contentType = remoteRes.headers.get("content-type") || "image/jpeg";
              return new NextResponse(arrayBuffer, {
                status: 200,
                headers: {
                  "Content-Type": contentType,
                  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                },
              });
            }
          }
        } catch {
          // try next candidate
        }
      }
    }

    // 3. Fallback for other external URLs
    if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
      try {
        const remoteRes = await fetch(rawUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          redirect: "follow",
        });

        if (remoteRes.ok) {
          const arrayBuffer = await remoteRes.arrayBuffer();
          const contentType = remoteRes.headers.get("content-type") || "image/jpeg";
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch {}
    }

    return NextResponse.json({ error: "Could not stream image" }, { status: 502 });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
