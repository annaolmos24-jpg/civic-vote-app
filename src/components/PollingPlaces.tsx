import { lazy, Suspense } from "react";
import type { PollingLocation, VoterInfo } from "../lib/types";
import { directionsUrl, formatAddress, formatDate } from "../lib/format";
import type { MapPoint } from "./PollingMap";

const PollingMap = lazy(() => import("./PollingMap"));

const GROUPS = [
  { key: "pollingLocations", title: "Election day polling places", color: "#1e40af" },
  { key: "earlyVoteSites", title: "Early voting sites", color: "#047857" },
  { key: "dropOffLocations", title: "Ballot drop off locations", color: "#7c2d12" },
] as const;

function LocationCard({ loc }: { loc: PollingLocation }) {
  const name = loc.address?.locationName || loc.name;
  const dates =
    loc.startDate && loc.endDate && loc.startDate !== loc.endDate
      ? `${formatDate(loc.startDate)} to ${formatDate(loc.endDate)}`
      : formatDate(loc.startDate);
  return (
    <li className="rounded-lg border border-slate-300 bg-white p-4">
      {name && <p className="font-semibold">{name}</p>}
      <p>{formatAddress(loc.address)}</p>
      {dates && <p className="mt-1 text-sm text-slate-700">{dates}</p>}
      {loc.pollingHours && <p className="text-sm text-slate-700">Hours: {loc.pollingHours}</p>}
      {loc.notes && <p className="mt-1 text-sm text-slate-700">{loc.notes}</p>}
      <a
        href={directionsUrl(loc.address, loc.latitude, loc.longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block font-semibold text-blue-800 underline"
      >
        Get directions<span className="sr-only"> to {name || formatAddress(loc.address)}</span>
      </a>
    </li>
  );
}

export default function PollingPlaces({ info, officeUrl }: { info: VoterInfo; officeUrl?: string | null }) {
  const points: MapPoint[] = [];
  for (const g of GROUPS) {
    for (const loc of info[g.key] ?? []) {
      if (loc.latitude != null && loc.longitude != null && (loc.latitude !== 0 || loc.longitude !== 0)) {
        points.push({
          lat: loc.latitude,
          lng: loc.longitude,
          label: `${g.title}: ${loc.address?.locationName || formatAddress(loc.address)}`,
          color: g.color,
        });
      }
    }
  }
  const hasAny = GROUPS.some((g) => (info[g.key]?.length ?? 0) > 0);

  return (
    <div className="space-y-6">
      {info.mailOnly && (
        <p className="rounded-lg bg-blue-50 p-4">
          Your area votes entirely by mail. Your ballot will be mailed to you. You can return it by mail or at a drop off
          location.
        </p>
      )}

      {!hasAny && (
        <p className="rounded-lg bg-slate-100 p-4">
          Voting locations haven't been published for your address yet.{" "}
          {officeUrl ? (
            <a href={officeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Check your election office's website
            </a>
          ) : (
            "Check your election office's website"
          )}{" "}
          or come back closer to election day.
        </p>
      )}

      {points.length > 0 && (
        <div>
          <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-slate-200 sm:h-96" />}>
            <PollingMap points={points} />
          </Suspense>
          <ul className="mt-2 flex flex-wrap gap-4 text-sm" aria-label="Map legend">
            {GROUPS.filter((g) => info[g.key]?.length).map((g) => (
              <li key={g.key} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: g.color }} aria-hidden />
                {g.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {GROUPS.map((g) => {
        const locs = info[g.key];
        if (!locs?.length) return null;
        return (
          <section key={g.key}>
            <h3 className="mb-2 text-lg font-bold">{g.title}</h3>
            <ul className="space-y-3">
              {locs.map((loc, i) => (
                <LocationCard key={i} loc={loc} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
