import type { Config, Context } from "@netlify/functions";
import { callCivic, errorResponse, isRateLimited } from "../lib/civic";

// Looks up polling places, contests, and election offices for an address.
// Cached up to 24 hours, per Google's data guidelines.
export default async (req: Request, context: Context) => {
  if (isRateLimited(context.ip)) return errorResponse(429, "rate_limited");

  const query = new URL(req.url).searchParams;
  const address = (query.get("address") ?? "").trim();
  const electionId = (query.get("electionId") ?? "").trim();

  if (address.length < 5 || address.length > 300) {
    return errorResponse(400, "bad_request", "Enter a full street address.");
  }
  if (electionId && !/^\d{1,10}$/.test(electionId)) {
    return errorResponse(400, "bad_request", "Invalid election ID.");
  }

  const params: Record<string, string> = { address };
  if (electionId) params.electionId = electionId;
  return callCivic("/voterinfo", params, 86400, ["address", "electionId"]);
};

export const config: Config = {
  path: "/api/voterinfo",
};
