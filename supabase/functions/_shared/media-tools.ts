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

/**
 * Makes an image URL safe to embed in markdown: drops tracking query strings
 * (Commons appends utm_* params) and escapes the parentheses/spaces that break
 * markdown `![](...)` parsing and produce a broken-image placeholder.
 */
function markdownSafeUrl(raw: string): string {
  if (!raw) return raw;
  try {
    const u = new URL(raw);
    u.search = "";
    return u.toString().replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20");
  } catch {
    return raw;
  }
}

/**
 * Wikimedia serves only an allowed set of thumbnail widths and answers anything
 * else with HTTP 400 ("Use thumbnail sizes listed on ..."), which shows up as a
 * broken image. So we normalize any thumbnail width to 800px, and only fall back
 * to the full-size original when the browser can actually render that format
 * (TIFF/SVG/PDF originals render as a broken image / question mark).
 */
const ALLOWED_THUMB_WIDTHS = new Set([250, 320, 500, 640, 800, 960, 1024, 1280, 2560]);
const RENDERABLE = /\.(jpe?g|png|gif|webp)$/i;
function safeCommonsImageUrl(thumbUrl?: string, originalUrl?: string): string {
  if (thumbUrl) {
    const width = Number(thumbUrl.match(/\/(\d+)px-/)?.[1] ?? 0);
    if (width && ALLOWED_THUMB_WIDTHS.has(width)) return thumbUrl;
    // Rewrite an odd width (e.g. /743px-) to an allowed one instead of dropping the thumb.
    const normalized = thumbUrl.replace(/\/(\d+)px-/, "/800px-");
    if (normalized !== thumbUrl) return normalized;
  }
  if (originalUrl && RENDERABLE.test(new URL(originalUrl).pathname)) return originalUrl;
  return thumbUrl || originalUrl || "";
}

/**
 * Commons is full of multi-panel teaching montages ("4x4 CT grid", figure
 * collages, before/after strips). Those are useless for pointing a student at a
 * single finding, so they are dropped unless the student explicitly asked for a
 * comparison or series.
 */
const MONTAGE_RE =
  /\b(montage|collage|composite|grid|panels?|multipanel|multi-panel|figure\s*\d\s*[-–]\s*\d|fig\.?\s*\d[a-f]\b|\d\s*x\s*\d|series|sequence|animation|gallery|comparison of \d)\b/i;
const COMPARISON_INTENT_RE = /\b(compare|comparison|montage|series|sequence|panel|grid|side by side)\b/i;

/** Rejects montages and results that don't mention any of the query's terms. */
function isTeachableSingleImage(r: MediaResult, tokens: string[], allowMontage: boolean): boolean {
  const haystack = `${r.title} ${r.description}`;
  if (!allowMontage && MONTAGE_RE.test(haystack)) return false;
  if (tokens.length === 0) return true;
  const lower = haystack.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}



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

/** One Commons search pass. Returns [] when the phrase matches nothing. */
async function commonsSearch(searchString: string, fetchLimit: number): Promise<MediaResult[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    // Restrict to formats a browser can render inline (no TIFF/SVG originals).
    gsrsearch: `filetype:bitmap ${searchString}`,
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: String(fetchLimit),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "800", // Commons only serves an allowed set of widths (…, 640, 800, 1024, …)
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
        imageUrl: markdownSafeUrl(safeCommonsImageUrl(info.thumburl, info.url)),
        pageUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        credit: stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? "Wikimedia Commons").slice(0, 160),
        license: stripHtml(meta.LicenseShortName?.value ?? "See source page").slice(0, 80),
        description: stripHtml(meta.ImageDescription?.value ?? "").slice(0, 400),
      } as MediaResult;
    })
    .filter((r): r is MediaResult => {
      if (!r?.imageUrl) return false;
      try {
        return RENDERABLE.test(new URL(r.imageUrl).pathname);
      } catch {
        return false;
      }
    });
}

export async function searchMedicalImages(query: string, limit = 3): Promise<MediaResult[]> {
  const count = Math.min(6, Math.max(1, Math.round(limit || 3)));
  const allowMontage = COMPARISON_INTENT_RE.test(query);
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3)
    .slice(0, 8);

  // Commons ANDs every term, so a long phrase ("CT head subdural hematoma")
  // often matches nothing. Widen progressively instead of returning empty.
  const variants = [query];
  if (tokens.length > 2) variants.push(tokens.slice(-3).join(" "));
  if (tokens.length > 1) variants.push(tokens.slice(-2).join(" "));
  if (tokens.length > 0) variants.push(tokens[tokens.length - 1]);

  const fetchLimit = Math.min(30, Math.max(10, count * 5));
  const byUrl = new Map<string, MediaResult>();
  for (const variant of variants) {
    for (const r of await commonsSearch(variant, fetchLimit)) {
      if (!byUrl.has(r.imageUrl)) byUrl.set(r.imageUrl, r);
    }
    if ([...byUrl.values()].filter((r) => isTeachableSingleImage(r, tokens, allowMontage)).length >= count) break;
  }
  const mapped = [...byUrl.values()];

  // Rank by how many query terms the title/description mention, single images first.
  const score = (r: MediaResult) => {
    const lower = `${r.title} ${r.description}`.toLowerCase();
    const hits = tokens.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
    return hits - (MONTAGE_RE.test(lower) ? 5 : 0);
  };

  const clean = mapped.filter((r) => isTeachableSingleImage(r, tokens, allowMontage));
  const ranked = (clean.length > 0 ? clean : mapped).sort((a, b) => score(b) - score(a));
  return ranked.slice(0, count);
}



/**
 * Curriculum source registry lookup. Returns the approved source row whose
 * domain covers this hostname, or null when the host is not on the allow-list.
 * When the registry has no retrieval-enabled rows at all, nothing is blocked.
 */
async function lookupApprovedSource(
  admin: any,
  hostname: string,
): Promise<{ allowed: boolean; source: any | null }> {
  if (!admin) return { allowed: true, source: null };
  try {
    const { data, error } = await admin
      .from("content_sources")
      .select("name, publisher, domain, authority_tier, license, citation_format, allowed_for_retrieval, status")
      .eq("allowed_for_retrieval", true)
      .eq("status", "approved");
    if (error) throw error;
    const rows = data ?? [];
    if (rows.length === 0) return { allowed: true, source: null };
    const host = hostname.toLowerCase();
    const match = rows.find(
      (r: any) => host === r.domain.toLowerCase() || host.endsWith(`.${r.domain.toLowerCase()}`),
    );
    return { allowed: Boolean(match), source: match ?? null };
  } catch (err) {
    console.error("Source registry lookup failed, allowing read:", err);
    return { allowed: true, source: null };
  }
}

export async function fetchWebPage(
  url: string,
  admin?: any,
): Promise<{ url: string; title: string; text: string; source?: unknown; citation?: string }> {
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

  const { allowed, source } = await lookupApprovedSource(admin, parsed.hostname);
  if (!allowed) {
    throw new Error(
      `${parsed.hostname} is not on the Livemed approved source list, so it cannot be used to teach. ` +
        `Use an approved source (USMLE/NBME outlines, ACGME, StatPearls/NCBI, PubMed, CDC, USPSTF, NIH, DailyMed, ` +
        `ACC/AHA, ACOG, AAP, IDSA, ADA, Radiopaedia) and tell the student the link was outside the vetted registry.`,
    );
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
  return {
    url: parsed.toString(),
    title,
    text: stripHtml(body).slice(0, 7000),
    source: source
      ? { name: source.name, publisher: source.publisher, authorityTier: source.authority_tier, license: source.license }
      : null,
    citation: source?.citation_format ?? undefined,
  };
}

export interface LibraryMedia extends MediaResult {
  id: string;
  modality: string | null;
  bodyRegion: string | null;
  teachingCaption: string | null;
}

/**
 * Deterministic layer: faculty-approved images from our own curated library.
 * Matched on keywords / topic tags / title / description tokens.
 */
export async function searchCuratedLibrary(
  admin: any,
  query: string,
  limit: number,
): Promise<LibraryMedia[]> {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 8);
  if (tokens.length === 0) return [];

  const select =
    "id,title,description,teaching_caption,image_url,source_page_url,credit,license,modality,body_region,keywords,topic_tags,usage_count";
  const textOr = tokens
    .flatMap((t) => [`title.ilike.%${t}%`, `description.ilike.%${t}%`, `teaching_caption.ilike.%${t}%`])
    .join(",");

  // Two passes: free-text match, plus array-overlap on curated keywords/tags.
  // (PostgREST `or=` cannot safely carry `{a,b}` array literals, so they stay separate.)
  const [byText, byKeyword, byTag] = await Promise.all([
    admin.from("medical_media").select(select).eq("status", "approved").or(textOr).limit(limit * 3),
    admin.from("medical_media").select(select).eq("status", "approved").overlaps("keywords", tokens).limit(limit * 3),
    admin.from("medical_media").select(select).eq("status", "approved").overlaps("topic_tags", tokens).limit(limit * 3),
  ]);

  const firstError = byText.error || byKeyword.error || byTag.error;
  if (firstError) {
    console.error("Curated library search failed:", firstError.message);
  }

  const byId = new Map<string, any>();
  for (const row of [...(byText.data ?? []), ...(byKeyword.data ?? []), ...(byTag.data ?? [])]) {
    byId.set(row.id, row);
  }
  const data = [...byId.values()];


  const scored = (data ?? []).map((row: any) => {
    const haystack = [
      row.title,
      row.description,
      row.teaching_caption,
      ...(row.keywords ?? []),
      ...(row.topic_tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    const score = tokens.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
    return { row, score };
  });

  scored.sort((a, b) => b.score - a.score || (b.row.usage_count ?? 0) - (a.row.usage_count ?? 0));

  return scored.slice(0, limit).map(({ row }) => ({
    id: row.id,
    title: row.title,
    imageUrl: markdownSafeUrl(row.image_url),
    pageUrl: row.source_page_url ?? "",
    credit: row.credit ?? "Livemed Academy curated library",
    license: row.license ?? "Faculty-approved",
    description: row.description ?? "",
    teachingCaption: row.teaching_caption,
    modality: row.modality,
    bodyRegion: row.body_region,
  }));
}

/** Files open-license candidates into the faculty review queue (pending, never auto-visible). */
async function suggestForReview(
  admin: any,
  userId: string | null,
  query: string,
  results: MediaResult[],
): Promise<void> {
  if (!admin || results.length === 0) return;
  const rows = results.map((r) => ({
    title: r.title,
    description: r.description || null,
    image_url: r.imageUrl,
    source_page_url: r.pageUrl,
    credit: r.credit,
    license: r.license,
    keywords: query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2)
      .slice(0, 8),
    status: "pending",
    suggested_by: userId,
    suggested_query: query,
  }));

  const { error } = await admin
    .from("medical_media")
    .upsert(rows, { onConflict: "image_url", ignoreDuplicates: true });
  if (error) console.error("Could not queue media suggestions:", error.message);
}

async function bumpUsage(admin: any, ids: string[]): Promise<void> {
  if (!admin || ids.length === 0) return;
  for (const id of ids) {
    const { data } = await admin.from("medical_media").select("usage_count").eq("id", id).maybeSingle();
    await admin
      .from("medical_media")
      .update({ usage_count: (data?.usage_count ?? 0) + 1 })
      .eq("id", id);
  }
}

export interface AtlasToolContext {
  admin?: any;
  userId?: string | null;
}

/** Runs one tool call and returns a JSON string for the model. */
export async function runAtlasTool(
  name: string,
  rawArgs: string,
  ctx: AtlasToolContext = {},
): Promise<string> {
  let args: any = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return JSON.stringify({ error: "Could not parse tool arguments." });
  }

  try {
    if (name === "search_medical_images") {
      const query = String(args.query ?? "");
      const count = Math.min(6, Math.max(1, Math.round(Number(args.limit ?? 3))));

      // Layer 1 — deterministic: our faculty-approved library.
      const curated = ctx.admin ? await searchCuratedLibrary(ctx.admin, query, count) : [];
      await bumpUsage(ctx.admin, curated.map((c) => c.id));

      // Layer 2 — fallback: open-license web search for long-tail topics.
      let fallback: MediaResult[] = [];
      if (curated.length < count) {
        try {
          fallback = await searchMedicalImages(query, count - curated.length);
        } catch (err) {
          console.error("Commons fallback failed:", err);
        }
        // Everything surfaced from the web is queued for faculty verification.
        await suggestForReview(ctx.admin, ctx.userId ?? null, query, fallback);
      }

      if (curated.length === 0 && fallback.length === 0) {
        return JSON.stringify({ results: [], note: "No images matched. Try broader terms." });
      }

      return JSON.stringify({
        verified: curated.map((c) => ({
          title: c.title,
          imageUrl: c.imageUrl,
          pageUrl: c.pageUrl,
          credit: c.credit,
          license: c.license,
          description: c.teachingCaption || c.description,
          modality: c.modality,
          bodyRegion: c.bodyRegion,
          faculty_verified: true,
        })),
        unverified: fallback.map((f) => ({ ...f, faculty_verified: false })),
        note:
          curated.length > 0
            ? "Prefer the faculty-verified images. Any unverified image must carry the unverified caveat."
            : "No faculty-verified image exists for this topic yet; these are open-license candidates queued for faculty review — label them as not yet faculty-verified.",
      });
    }
    if (name === "fetch_web_page") {
      return JSON.stringify(await fetchWebPage(String(args.url ?? ""), ctx.admin));
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  } catch (error) {
    console.error(`ATLAS tool ${name} failed:`, error);
    return JSON.stringify({ error: error instanceof Error ? error.message : "Tool failed" });
  }
}

