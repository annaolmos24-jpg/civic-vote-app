import type { Config, Context } from "@netlify/functions";
import { callCivic, errorResponse, isRateLimited } from "../lib/civic";

// Lists elections the Civic API currently covers. Cached for 1 hour.
export default async (_req: Request, context: Context) => {
  if (isRateLimited(context.ip)) return errorResponse(429, "rate_limited");
  return callCivic("/elections", {}, 3600);
};

export const config: Config = {
  path: "/api/elections",
};
