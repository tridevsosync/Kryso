import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveId } from "@/lib/media-utils";
import { createReadStream, statSync, existsSync } from "fs";
import path from "path";
import { Readable } from "stream";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}

export async function HEAD(req: NextRequest) {
  const getRes = await GET(req);
  return new Response(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");
    const driveId = searchParams.get("id") || (rawUrl ? extractGoogleDriveId(rawUrl) : null);

    if (!rawUrl && !driveId) {
      return NextResponse.json({ error: "Missing url or id parameter" }, { status: 400 });
    }

    // 1. Handle local files (e.g. /uploads/... or /filename.mp4 or public video)
    if (rawUrl && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/") || rawUrl.startsWith("/"))) {
      const cleanPath = rawUrl.replace(/^\/?uploads\//, "").replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", cleanPath);

      if (existsSync(fullPath)) {
        const stat = statSync(fullPath);
        const fileSize = stat.size;
        const range = req.headers.get("range");
        const ext = path.extname(cleanPath).toLowerCase();
        const contentType =
          ext === ".webm"
            ? "video/webm"
            : ext === ".mov"
            ? "video/quicktime"
            : ext === ".ogg"
            ? "video/ogg"
            : "video/mp4";

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = end - start + 1;
          const stream = createReadStream(fullPath, { start, end });
          const webStream = Readable.toWeb(stream) as ReadableStream;

          return new Response(webStream, {
            status: 206,
            headers: {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize.toString(),
              "Content-Type": contentType,
              "Content-Disposition": "inline",
              "Access-Control-Allow-Origin": "*",
              "Cross-Origin-Resource-Policy": "cross-origin",
            },
          });
        } else {
          const stream = createReadStream(fullPath);
          const webStream = Readable.toWeb(stream) as ReadableStream;

          return new Response(webStream, {
            status: 200,
            headers: {
              "Content-Length": fileSize.toString(),
              "Accept-Ranges": "bytes",
              "Content-Type": contentType,
              "Content-Disposition": "inline",
              "Access-Control-Allow-Origin": "*",
              "Cross-Origin-Resource-Policy": "cross-origin",
              "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
            },
          });
        }
      }
    }

    // 2. Multi-tier Google Drive Stream candidates
    const candidateUrls: string[] = [];
    if (driveId) {
      candidateUrls.push(
        `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0&confirm=t`,
        `https://drive.google.com/uc?export=download&id=${driveId}&confirm=t`,
        `https://docs.google.com/uc?export=download&id=${driveId}&confirm=t`
      );
    } else if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
      candidateUrls.push(rawUrl);
    }

    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Encoding": "identity",
    };

    const rangeHeader = req.headers.get("range");
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    let upstreamRes: Response | null = null;
    let successfulUrl = "";

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: fetchHeaders,
          redirect: "follow",
        });

        // Check if response returned valid media or partial stream
        const contentType = res.headers.get("content-type") || "";
        if (
          (res.ok || res.status === 206 || res.status === 304) &&
          !contentType.includes("text/html")
        ) {
          upstreamRes = res;
          successfulUrl = url;
          break;
        }

        // If it was ok but returned HTML (e.g. virus scan confirm page), check for confirmation link
        if (res.ok && contentType.includes("text/html")) {
          const text = await res.text();
          const confirmMatch = text.match(/href="(\/download\?[^"]*confirm=[^"]*)"/i) ||
            text.match(/confirm=([a-zA-Z0-9_-]+)/i);

          if (confirmMatch) {
            const confirmedUrl = confirmMatch[1].startsWith("http")
              ? confirmMatch[1]
              : confirmMatch[1].startsWith("/")
              ? `https://drive.usercontent.google.com${confirmMatch[1]}`
              : `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=${confirmMatch[1]}`;

            const retryRes = await fetch(confirmedUrl, {
              headers: fetchHeaders,
              redirect: "follow",
            });
            if (retryRes.ok || retryRes.status === 206) {
              upstreamRes = retryRes;
              successfulUrl = confirmedUrl;
              break;
            }
          }
        }
      } catch (fetchErr) {
        console.warn(`Video upstream fetch error for ${url}:`, fetchErr);
      }
    }

    if (!upstreamRes) {
      if (candidateUrls[0]) {
        return NextResponse.redirect(candidateUrls[0], { status: 302 });
      }
      return NextResponse.json({ error: "Unable to stream video from source" }, { status: 502 });
    }

    const responseHeaders = new Headers();
    let detectedType = upstreamRes.headers.get("content-type") || "video/mp4";
    if (detectedType.includes("text/plain") || detectedType.includes("application/octet-stream")) {
      detectedType = "video/mp4";
    }

    responseHeaders.set("Content-Type", detectedType);
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }
    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }
    const cacheControl =
      upstreamRes.headers.get("cache-control") ||
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
    responseHeaders.set("Cache-Control", cacheControl);

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Video streaming error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to stream video" },
      { status: 500 }
    );
  }
}
