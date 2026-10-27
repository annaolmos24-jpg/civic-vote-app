// Everything VoteReady saves lives only in this browser's localStorage.

const PREFIX = "voteready:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage blocked or full: the app still works, it just won't remember.
  }
}

export const loadAddress = () => read<string>("address", "");
export const saveAddress = (address: string) => write("address", address);

export type Picks = Record<string, string>;
export const loadPicks = (electionId: string) => read<Picks>(`picks:${electionId}`, {});
export const savePicks = (electionId: string, picks: Picks) => write(`picks:${electionId}`, picks);

export function clearAllData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Nothing to clear.
  }
}
