/**
 * Utility functions to extract, normalize, and format Google Drive links
 * and other media URLs so they work seamlessly for images, audio players,
 * and file downloads throughout the Kryso platform.
 */

/**
 * Extracts the Google Drive File ID from any share / direct / preview URL format.
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/preview
 * - https://drive.google.com/file/d/FILE_ID
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=download&id=FILE_ID
 * - https://docs.google.com/uc?export=download&id=FILE_ID
 * - https://docs.google.com/file/d/FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 * - /api/image-stream?id=FILE_ID
 * - /api/video-stream?id=FILE_ID
 * - /api/audio-stream?id=FILE_ID
 */
export function extractGoogleDriveId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // 0. Handle internal proxy URLs /api/(audio|video|image)-stream?id=...
  const streamMatch = trimmed.match(/\/api\/(?:audio|video|image)-stream\?id=([a-zA-Z0-9_-]+)/i);
  if (streamMatch && streamMatch[1]) return streamMatch[1];

  // Check if it looks like a Google Drive / Google Docs / Google User Content URL
  const isGoogleDomain =
    trimmed.includes("drive.google.com") ||
    trimmed.includes("docs.google.com") ||
    trimmed.includes("googleusercontent.com") ||
    trimmed.includes("drive.usercontent.google.com");

  if (isGoogleDomain) {
    // 1. /file/d/([a-zA-Z0-9_-]+)
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

    // 2. /d/([a-zA-Z0-9_-]+)
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (dMatch && dMatch[1]) return dMatch[1];

    // 3. /folders/([a-zA-Z0-9_-]+)
    const foldersMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/i);
    if (foldersMatch && foldersMatch[1]) return foldersMatch[1];

    // 4. id=([a-zA-Z0-9_-]+)
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  }

  return null;
}

/**
 * Formats an image URL. If it's a Google Drive link, routes through our dedicated
 * streaming proxy `/api/image-stream?id=${driveId}` which streams the high-resolution
 * image data with full CORS, caching, and no 429 rate limits or CORP blocking.
 */
export function formatImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `/api/image-stream?id=${driveId}`;
  }
  return trimmed;
}

/**
 * Formats an audio URL. If it's a Google Drive link, routes through our dedicated
 * streaming proxy `/api/audio-stream?id=${driveId}` so that the browser HTML5
 * audio player can buffer, scrub, and play smoothly without Google CORS / cookie / redirect blocks.
 */
export function formatAudioUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `/api/audio-stream?id=${driveId}`;
  }
  return trimmed;
}

/**
 * Formats a download URL for audio/files.
 */
export function formatDownloadUrl(url?: string | null, filename?: string): string {
  if (!url || typeof url !== "string") return "";
  const resolved = formatAudioUrl(url);
  const name = filename || "audio-track.mp3";
  return `/api/download?url=${encodeURIComponent(resolved)}&filename=${encodeURIComponent(name)}`;
}

/**
 * Formats a video URL. If it's a Google Drive link, routes through our dedicated
 * streaming proxy `/api/video-stream?id=${driveId}` so that the browser HTML5
 * video player can stream smoothly at full 1080p quality with direct native autoplay.
 */
export function formatVideoUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `/api/video-stream?id=${driveId}`;
  }
  return trimmed;
}

export function getDrivePreviewUrl(urlOrId?: string | null): string {
  if (!urlOrId || typeof urlOrId !== "string") return "";
  const driveId = extractGoogleDriveId(urlOrId) || urlOrId.trim();
  return `https://drive.google.com/file/d/${driveId}/preview`;
}

export type VideoSourceType = "drive" | "youtube" | "video";

export interface VideoSourceInfo {
  type: VideoSourceType;
  src: string;
  driveId?: string;
  previewSrc?: string;
  youtubeId?: string;
}

/**
 * Resolves video sources for optimized autoplay playback.
 * - Google Drive links route through /api/video-stream for seamless zero-click HTML5 autoplay at 1080p,
 *   with fallback to Google Drive preview iframe.
 * - YouTube links are converted to autoplaying embedded players.
 * - Direct video URLs (.mp4, .webm, Cloudinary, local) are returned for native HTML5 video autoplay.
 */
export function getVideoSourceInfo(url?: string | null): VideoSourceInfo {
  if (!url || typeof url !== "string") {
    return { type: "video", src: "" };
  }
  const trimmed = url.trim();

  // 1. YouTube URLs
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${ytMatch[1]}&iv_load_policy=3&showinfo=0`,
      youtubeId: ytMatch[1],
    };
  }

  // 2. Google Drive URLs -> Direct Native HTML5 Video Stream (clean, zero player bars, pure autoplay)
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: "video",
      src: `/api/video-stream?id=${driveId}`,
      driveId,
    };
  }

  // 3. Direct video file
  return {
    type: "video",
    src: trimmed,
  };
}
