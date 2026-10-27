import type { SimpleAddress } from "./types";

export function formatAddress(a?: SimpleAddress): string {
  if (!a) return "";
  const street = [a.line1, a.line2, a.line3].filter(Boolean).join(", ");
  const cityLine = [a.city, [a.state, a.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [street, cityLine].filter(Boolean).join(", ");
}

export function directionsUrl(a?: SimpleAddress, lat?: number, lng?: number): string {
  const destination = lat != null && lng != null ? `${lat},${lng}` : formatAddress(a);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

// Civic API dates are YYYY-MM-DD; parse as a local date so the day doesn't shift.
export function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86_400_000);
}

// Turns a social channel into a link. Only http(s) URLs are allowed through.
export function channelUrl(type: string, id: string): string | null {
  if (/^https?:\/\//i.test(id)) return id;
  const handle = id.replace(/^@/, "");
  switch (type.toLowerCase()) {
    case "twitter":
      return `https://x.com/${encodeURIComponent(handle)}`;
    case "facebook":
      return `https://www.facebook.com/${encodeURIComponent(handle)}`;
    case "youtube":
      return `https://www.youtube.com/${encodeURIComponent(handle)}`;
    default:
      return null;
  }
}

export function safeUrl(url?: string): string | null {
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : /^[\w.-]+\.[a-z]{2,}/i.test(url) ? `https://${url}` : null;
  return withScheme;
}
