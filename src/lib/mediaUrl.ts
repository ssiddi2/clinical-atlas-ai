/**
 * Wikimedia upload paths can become stale when a file is replaced or moved.
 * The canonical file redirect resolves the current path and a valid thumbnail.
 */
export function getRenderableMediaUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;

  try {
    const url = new URL(rawUrl);
    if (url.hostname !== "upload.wikimedia.org") return rawUrl;

    const parts = url.pathname.split("/").filter(Boolean);
    const thumbIndex = parts.indexOf("thumb");
    const encodedFileName = thumbIndex >= 0 ? parts[thumbIndex + 3] : parts[parts.length - 1];
    if (!encodedFileName) return rawUrl;

    const fileName = decodeURIComponent(encodedFileName);
    return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=800`;
  } catch {
    return rawUrl;
  }
}