import { useEffect, useState } from "react";
import type { Candidate, Contest } from "../lib/types";
import { channelUrl, safeUrl } from "../lib/format";
import { loadPicks, savePicks, type Picks } from "../lib/storage";

function contestKey(c: Contest, i: number) {
  return `${i}:${c.office ?? c.referendumTitle ?? c.ballotTitle ?? "contest"}`;
}

function CandidateLinks({ candidate }: { candidate: Candidate }) {
  const links: { label: string; href: string }[] = [];
  const site = safeUrl(candidate.candidateUrl);
  if (site) links.push({ label: "Website", href: site });
  for (const ch of candidate.channels ?? []) {
    const href = channelUrl(ch.type, ch.id);
    if (href) links.push({ label: ch.type, href });
  }
  if (!links.length) return null;
  return (
    <span className="flex flex-wrap gap-3 text-sm">
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-blue-800 underline">
          {l.label}
          <span className="sr-only"> for {candidate.name}</span>
        </a>
      ))}
    </span>
  );
}

function Choice({
  name,
  value,
  checked,
  onToggle,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onToggle: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-300 bg-white p-3">
      <input
        type="checkbox"
        id={`${name}-${value}`}
        checked={checked}
        onChange={() => onToggle(value)}
        className="mt-1 h-5 w-5 shrink-0"
      />
      <label htmlFor={`${name}-${value}`} className="flex-1">
        {children}
      </label>
    </li>
  );
}

export default function Ballot({ contests, electionId }: { contests: Contest[]; electionId: string }) {
  const [picks, setPicks] = useState<Picks>(() => loadPicks(electionId));

  useEffect(() => setPicks(loadPicks(electionId)), [electionId]);

  function toggle(key: string, value: string) {
    const next = { ...picks };
    if (next[key] === value) delete next[key];
    else next[key] = value;
    setPicks(next);
    savePicks(electionId, next);
  }

  if (!contests.length) {
    return (
      <p className="rounded-lg bg-slate-100 p-4">
        Ballot contests haven't been published for your address yet. Check back closer to election day.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        Candidates are listed in the order provided by official sources. Check a box to mark your choice. Your picks are
        private and saved only on this device, so you can bring them to the polls.{" "}
        <button type="button" onClick={() => window.print()} className="font-semibold text-blue-800 underline">
          Print my ballot
        </button>
      </p>

      <ol className="space-y-6">
        {contests.map((c, i) => {
          const key = contestKey(c, i);
          const isMeasure = c.type === "Referendum" || Boolean(c.referendumTitle);
          return (
            <li key={key} className="rounded-xl border border-slate-300 bg-slate-50 p-4">
              <fieldset>
                <legend className="text-lg font-bold">
                  {isMeasure ? c.referendumTitle || c.ballotTitle : c.office || c.ballotTitle}
                </legend>
                {c.district?.name && <p className="text-sm text-slate-700">{c.district.name}</p>}
                {c.numberVotingFor && Number(c.numberVotingFor) > 1 && (
                  <p className="text-sm text-slate-700">Vote for up to {c.numberVotingFor}</p>
                )}

                {isMeasure ? (
                  <div className="mt-3 space-y-3">
                    {c.referendumSubtitle && <p className="font-semibold">{c.referendumSubtitle}</p>}
                    {c.referendumText && (
                      <details>
                        <summary className="cursor-pointer font-semibold text-blue-800">Official ballot text</summary>
                        <p className="mt-2 whitespace-pre-line">{c.referendumText}</p>
                      </details>
                    )}
                    {(c.referendumProStatement || c.referendumConStatement) && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {c.referendumProStatement && (
                          <div className="rounded-lg border border-slate-300 bg-white p-3">
                            <p className="font-semibold">Official statement in favor</p>
                            <p className="mt-1 whitespace-pre-line text-sm">{c.referendumProStatement}</p>
                          </div>
                        )}
                        {c.referendumConStatement && (
                          <div className="rounded-lg border border-slate-300 bg-white p-3">
                            <p className="font-semibold">Official statement against</p>
                            <p className="mt-1 whitespace-pre-line text-sm">{c.referendumConStatement}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {safeUrl(c.referendumUrl) && (
                      <a
                        href={safeUrl(c.referendumUrl)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-blue-800 underline"
                      >
                        More information
                      </a>
                    )}
                    <ul className="space-y-2">
                      {(c.referendumBallotResponses?.length ? c.referendumBallotResponses : ["Yes", "No"]).map((r) => (
                        <Choice key={r} name={key} value={r} checked={picks[key] === r} onToggle={(v) => toggle(key, v)}>
                          {r}
                        </Choice>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {(c.candidates ?? []).map((cand) => (
                      <Choice
                        key={cand.name}
                        name={key}
                        value={cand.name}
                        checked={picks[key] === cand.name}
                        onToggle={(v) => toggle(key, v)}
                      >
                        <span className="block font-semibold">{cand.name}</span>
                        {cand.party && <span className="block text-sm text-slate-700">{cand.party}</span>}
                        <CandidateLinks candidate={cand} />
                      </Choice>
                    ))}
                    {!c.candidates?.length && <li className="text-sm text-slate-700">No candidates listed yet.</li>}
                  </ul>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
