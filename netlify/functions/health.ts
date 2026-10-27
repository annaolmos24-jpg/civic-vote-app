import type { Config } from "@netlify/functions";

// Reports whether the server is configured. Never returns the key itself.
export default async () => {
  return Response.json(
    { ok: true, civicKeyConfigured: Boolean(process.env.CIVIC_API_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
};

export const config: Config = {
  path: "/api/health",
};
