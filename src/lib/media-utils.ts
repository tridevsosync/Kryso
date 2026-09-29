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
 * - https://drive.google.com/file/d/FILE_ID
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=download&id=FILE_ID
 * - https://docs.google.com/uc?export=download&id=FILE_ID
 * - https://docs.google.com/file/d/FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 */
export function extractGoogleDriveId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // 0. Handle internal proxy URLs /api/audio-stream?id=...
  const audioStreamMatch = trimmed.match(/\/api\/audio-stream\?id=([a-zA-Z0-9_-]+)/i);
  if (audioStreamMatch && audioStreamMatch[1]) return audioStreamMatch[1];

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

    // 3. id=([a-zA-Z0-9_-]+)
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  }

  return null;
}

/**
 * Formats an image URL. If it's a Google Drive link, converts it to
 * the high-performance Google User Content CDN link: `https://lh3.googleusercontent.com/d/${fileId}`
 * which works reliably in <Image />, <img> tags, and background CSS without CORS issues.
 */
export function formatImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
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
