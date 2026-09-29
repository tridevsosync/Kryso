import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { extractGoogleDriveId } from "@/lib/media-utils";
import fs from "fs/promises";
import path from "path";

async function fetchAudioBuffer(rawUrl: string, origin: string): Promise<ArrayBuffer | Buffer | null> {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();

  // 1. Local filesystem path /uploads/...
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    try {
      const cleanPath = trimmed.replace(/^\/?uploads\//, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", cleanPath);
      return await fs.readFile(fullPath);
    } catch (e) {
      console.warn("Could not read local file:", trimmed, e);
    }
  }

  // 2. Google Drive URLs or /api/audio-stream?id=...
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    const candidateUrls = [
      `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0`,
      `https://docs.google.com/uc?export=download&id=${driveId}`,
      `https://drive.google.com/uc?id=${driveId}&export=download`,
    ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          redirect: "follow",
        });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          if (ab.byteLength > 100) return ab;
        }
      } catch {
        // try next candidate
      }
    }
  }

  // 3. Relative URLs on own origin e.g. /api/...
  let targetUrl = trimmed;
  if (targetUrl.startsWith("/")) {
    targetUrl = `${origin}${targetUrl}`;
  }

  // 4. Remote HTTP/HTTPS links (Cloudinary, Dropbox, CDN, external servers)
  if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });
      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 50) return ab;
      }
    } catch (err) {
      console.warn("Remote fetch failed for targetUrl:", targetUrl, err);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { files, bundleName } = body as {
      files: { url: string; filename: string }[];
      bundleName?: string;
    };

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files specified" }, { status: 400 });
    }

    const zip = new JSZip();
    const origin = req.nextUrl.origin || "http://localhost:3000";

    // Fetch and add each file to the zip
    await Promise.all(
      files.map(async (file, index) => {
        if (!file.url) return;

        let filename = file.filename || `track-${index + 1}.mp3`;
        // Ensure unique, clean filename inside zip
        filename = filename.replace(/[/\\?%*:|"<>]/g, "_").trim() || `track-${index + 1}.mp3`;

        try {
          const buffer = await fetchAudioBuffer(file.url, origin);
          if (buffer && (buffer.byteLength > 0 || (buffer as Buffer).length > 0)) {
            zip.file(filename, buffer);
          }
        } catch (err) {
          console.warn(`Failed to include file in zip: ${file.filename}`, err);
        }
      })
    );

    const zipFilesCount = Object.keys(zip.files).length;
    if (zipFilesCount === 0) {
      return NextResponse.json(
        { error: "No downloadable audio streams could be retrieved from the provided links." },
        { status: 404 }
      );
    }

    const zipUint8Array = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const safeBundleName = (bundleName || "Kryso_Audio_Bundle")
      .replace(/[/\\?%*:|"<>]/g, "_")
      .trim() || "Kryso_Audio_Bundle";

    const zipFilename = safeBundleName.endsWith(".zip")
      ? safeBundleName
      : `${safeBundleName}.zip`;

    const asciiZipFilename = zipFilename.replace(/[^\x20-\x7E]/g, "_");

    return new NextResponse(zipUint8Array as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${asciiZipFilename}"; filename*=UTF-8''${encodeURIComponent(zipFilename)}`,
        "Content-Length": zipUint8Array.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download bundle error:", error);
    return NextResponse.json({ error: "Failed to generate zip bundle" }, { status: 500 });
  }
}
