// Shared helpers for the Civic API proxy functions.
// Addresses are never logged or stored here.

const CIVIC_BASE = "https://www.googleapis.com/civicinfo/v2";

// Google's error reasons, normalized so the browser can show a friendly message.
const KNOWN_ERRORS = [
  "addressUnparseable",
  "noStreetSegmentFound",
  "noAddressMatches",
  "multipleStreetSegmentsFound",
  "electionOver",
  "electionUnknown",
  "notFound",
] as const;

export type CivicErrorCode = (typeof KNOWN_ERRORS)[number] | "not_configured" | "rate_limited" | "bad_request" | "upstream_error";

export function errorResponse(status: number, error: CivicErrorCode, message?: string) {
  return Response.json(
    { error, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

// Best-effort per-instance rate limit: 30 requests per minute per IP.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; start: number }>();

export function isRateLimited(ip: string | undefined) {
  const key = ip ?? "unknown";
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { count: 1, start: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

function classify(reason: string | undefined, message: string | undefined): CivicErrorCode {
  const candidates = [reason, message].map((s) => (s ?? "").replace(/\s+/g, "").toLowerCase());
  for (const code of KNOWN_ERRORS) {
    if (candidates.includes(code.toLowerCase())) return code;
  }
  return "upstream_error";
}

// Calls the Civic API and returns a Response with CDN cache headers on success.
export async function callCivic(
  path: string,
  params: Record<string, string>,
  cacheSeconds: number,
  varyParams: string[] = [],
) {
  const key = process.env.CIVIC_API_KEY;
  if (!key) return errorResponse(500, "not_configured", "CIVIC_API_KEY is not set.");

  const url = new URL(CIVIC_BASE + path);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  url.searchParams.set("key", key);

  let upstream: Response;
  try {
    upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
  } catch {
    return errorResponse(502, "upstream_error", "Could not reach the Google Civic API.");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    const err = body?.error;
    const code = classify(err?.errors?.[0]?.reason, err?.message);
    const status = code === "upstream_error" ? 502 : upstream.status === 404 ? 404 : 400;
    return errorResponse(status, code, err?.message);
  }

  const headers: Record<string, string> = {
    "Cache-Control": "public, max-age=300",
    "Netlify-CDN-Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=600`,
  };
  if (varyParams.length) headers["Netlify-Vary"] = `query=${varyParams.join("|")}`;
  return Response.json(body, { headers });
}
