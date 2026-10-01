import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveId } from "@/lib/media-utils";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");
    const customSize = searchParams.get("sz") || searchParams.get("w") || "1920";
    const driveId = searchParams.get("id") || (rawUrl ? extractGoogleDriveId(rawUrl) : null);

    if (!rawUrl && !driveId) {
      return NextResponse.json({ error: "Missing url or id parameter" }, { status: 400 });
    }

    // 1. Handle local files in public/ (e.g. /uploads/... or /filename.jpg)
    if (rawUrl && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/") || rawUrl.startsWith("/"))) {
      const cleanPath = rawUrl.replace(/^\/?uploads\//, "").replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", cleanPath);

      if (existsSync(fullPath)) {
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
              "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
              "Cross-Origin-Resource-Policy": "cross-origin",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch {
          // Fall through
        }
      }
    }

    // 2. Fetch Google Drive image directly via server-side streaming
    // Prioritize high-res web thumbnail (1MB instead of 10MB raw) for 90% CDN pressure reduction
    if (driveId) {
      const driveUrls = [
        `https://drive.google.com/thumbnail?id=${driveId}&sz=w${customSize}`,
        `https://drive.usercontent.google.com/download?id=${driveId}&export=view&authuser=0`,
        `https://drive.google.com/uc?export=view&id=${driveId}`,
      ];

      for (const targetUrl of driveUrls) {
        try {
          const upstreamRes = await fetch(targetUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          if (upstreamRes.ok) {
            const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
            // Ignore text/html error responses (such as Google 429 HTML or warnings)
            if (!contentType.includes("text/html")) {
              const responseHeaders = new Headers();
              responseHeaders.set("Content-Type", contentType);
              responseHeaders.set(
                "Cache-Control",
                "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800"
              );
              responseHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
              responseHeaders.set("Access-Control-Allow-Origin", "*");

              const contentLength = upstreamRes.headers.get("content-length");
              if (contentLength) {
                responseHeaders.set("Content-Length", contentLength);
              }

              return new Response(upstreamRes.body, {
                status: 200,
                headers: responseHeaders,
              });
            }
          }
        } catch (fetchErr) {
          console.warn("Drive image fetch attempt failed for:", targetUrl, fetchErr);
        }
      }
    }

    // 3. Fallback for other external image URLs
    if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
      try {
        const upstreamRes = await fetch(rawUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (upstreamRes.ok) {
          const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
          const responseHeaders = new Headers();
          responseHeaders.set("Content-Type", contentType);
          responseHeaders.set(
            "Cache-Control",
            "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800"
          );
          responseHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
          responseHeaders.set("Access-Control-Allow-Origin", "*");

          return new Response(upstreamRes.body, {
            status: 200,
            headers: responseHeaders,
          });
        }
      } catch {
        return NextResponse.redirect(rawUrl, { status: 302 });
      }
    }

    return NextResponse.json({ error: "Could not stream image" }, { status: 502 });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
