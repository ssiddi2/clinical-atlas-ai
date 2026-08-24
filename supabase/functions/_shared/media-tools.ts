/**
 * Keyless web/media tools for ATLAS.
 *
 * These let the AI professor pull real, citable images and page text into a
 * lesson when words alone can't explain a finding (radiographs, ECGs, gross
 * pathology, histology, anatomy plates).
 *
 * Sources are open-license and stable (Wikimedia Commons / Wikipedia) plus a
 * guarded plain-text page reader for links the student supplies. Every result
 * carries a direct reference URL so ATLAS can cite what it shows.
 */

export interface MediaResult {
  title: string;
  imageUrl: string;
  pageUrl: string;
  credit: string;
  license: string;
  description: string;
}

export const ATLAS_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_medical_images",
      description:
        "Search open-license medical/scientific images (radiographs, ECGs, histology, gross pathology, anatomy diagrams) on Wikimedia Commons. Use whenever a visual would teach the concept better than prose, or when the student asks to see something. Returns direct image URLs plus the source page to cite.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Concise visual search terms, e.g. 'chest radiograph lobar pneumonia' or 'ECG atrial fibrillation'.",
          },
          limit: { type: "number", description: "How many images to return (1-6). Default 3." },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_web_page",
      description:
        "Read the readable text of a public https web page (guideline, article, review) so you can teach from it and cite it. Use for links the student shares or authoritative references you name.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Absolute https URL of the page to read." },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
] as const;

const UA = "LivemedAcademy-ATLAS/1.0 (medical education; contact info@livemedhealth.com)";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchMedicalImages(query: string, limit = 3): Promise<MediaResult[]> {
  const count = Math.min(6, Math.max(1, Math.round(limit || 3)));
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: String(count),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "900",
  });

  const resp = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!resp.ok) {
    throw new Error(`Wikimedia Commons search failed [${resp.status}]: ${await resp.text()}`);
  }

  const json = await resp.json();
  const pages: Record<string, any> = json?.query?.pages ?? {};

  return Object.values(pages)
    .map((page: any) => {
      const info = page?.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: String(page.title ?? "").replace(/^File:/, ""),
        imageUrl: info.thumburl || info.url,
        pageUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        credit: stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? "Wikimedia Commons").slice(0, 160),
        license: stripHtml(meta.LicenseShortName?.value ?? "See source page").slice(0, 80),
        description: stripHtml(meta.ImageDescription?.value ?? "").slice(0, 400),
      } as MediaResult;
    })
    .filter((r): r is MediaResult => Boolean(r?.imageUrl));
}

export async function fetchWebPage(url: string): Promise<{ url: string; title: string; text: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "https:") throw new Error("Only https URLs can be read.");
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(parsed.hostname)) {
    throw new Error("This host cannot be read.");
  }

  const resp = await fetch(parsed.toString(), {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });
  if (!resp.ok) throw new Error(`Page fetch failed [${resp.status}]`);

  const contentType = resp.headers.get("content-type") ?? "";
  const body = await resp.text();
  if (!contentType.includes("html") && !contentType.includes("text")) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const title = stripHtml(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? parsed.hostname);
  return { url: parsed.toString(), title, text: stripHtml(body).slice(0, 7000) };
}

/** Runs one tool call and returns a JSON string for the model. */
export async function runAtlasTool(name: string, rawArgs: string): Promise<string> {
  let args: any = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return JSON.stringify({ error: "Could not parse tool arguments." });
  }

  try {
    if (name === "search_medical_images") {
      const results = await searchMedicalImages(String(args.query ?? ""), Number(args.limit ?? 3));
      if (results.length === 0) {
        return JSON.stringify({ results: [], note: "No open-license images matched. Try broader terms." });
      }
      return JSON.stringify({ results });
    }
    if (name === "fetch_web_page") {
      return JSON.stringify(await fetchWebPage(String(args.url ?? "")));
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  } catch (error) {
    console.error(`ATLAS tool ${name} failed:`, error);
    return JSON.stringify({ error: error instanceof Error ? error.message : "Tool failed" });
  }
}
