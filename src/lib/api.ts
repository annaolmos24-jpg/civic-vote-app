import type { Election, VoterInfo } from "./types";

export class ApiError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
  }
}

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new ApiError("network");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error ?? "upstream_error", body?.message);
  return body as T;
}

export async function fetchElections(): Promise<Election[]> {
  const data = await getJson<{ elections?: Election[] }>("/api/elections");
  return data.elections ?? [];
}

export function fetchVoterInfo(address: string, electionId?: string): Promise<VoterInfo> {
  const params = new URLSearchParams({ address });
  if (electionId) params.set("electionId", electionId);
  return getJson<VoterInfo>(`/api/voterinfo?${params}`);
}

// Friendly messages for each API status (PRD section 7).
export function errorMessage(code: string): string {
  switch (code) {
    case "addressUnparseable":
    case "bad_request":
      return "We couldn't read that address. Please enter your full home address, including city, state, and ZIP code.";
    case "noStreetSegmentFound":
    case "noAddressMatches":
      return "We couldn't match that address to a voting precinct. Double-check the spelling, or contact your local election office.";
    case "multipleStreetSegmentsFound":
      return "That address matches more than one precinct. Try adding an apartment or unit number.";
    case "electionOver":
      return "That election is over. Pick an upcoming election, or check your election office for results.";
    case "electionUnknown":
    case "notFound":
      return "No voting information has been published for your address yet. Check back closer to election day, or contact your local election office.";
    case "rate_limited":
      return "Too many searches in a short time. Please wait a minute and try again.";
    case "not_configured":
      return "VoteReady isn't fully set up yet: the server is missing its Google Civic API key.";
    case "network":
      return "We couldn't connect. Check your internet connection and try again.";
    default:
      return "Something went wrong getting voting information. Please try again in a moment.";
  }
}
