import type { AdministrationBody, AdministrativeRegion } from "../lib/types";
import { formatAddress, safeUrl } from "../lib/format";

const LINKS: { key: keyof AdministrationBody; label: string }[] = [
  { key: "electionRegistrationConfirmationUrl", label: "Check my registration" },
  { key: "electionRegistrationUrl", label: "Register to vote" },
  { key: "absenteeVotingInfoUrl", label: "Vote by mail / absentee info" },
  { key: "ballotInfoUrl", label: "Ballot information" },
  { key: "votingLocationFinderUrl", label: "Official polling place finder" },
  { key: "electionInfoUrl", label: "Election information" },
  { key: "electionRulesUrl", label: "Election rules" },
];

function Office({ title, body }: { title: string; body: AdministrationBody }) {
  const links = LINKS.map((l) => ({ ...l, href: safeUrl(body[l.key] as string | undefined) })).filter((l) => l.href);
  const address = formatAddress(body.physicalAddress) || formatAddress(body.correspondenceAddress);
  return (
    <section className="rounded-xl border border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold">{title}</h3>
      {body.name && <p className="font-semibold">{body.name}</p>}
      {address && <p>{address}</p>}
      {body.hoursOfOperation && <p className="text-sm text-slate-700">Hours: {body.hoursOfOperation}</p>}

      {links.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.key}>
              <a
                href={l.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border-2 border-blue-800 px-3 py-2 font-semibold text-blue-800 hover:bg-blue-50"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {body.electionOfficials?.length ? (
        <div className="mt-3">
          <p className="font-semibold">Contact</p>
          <ul className="space-y-2 text-sm">
            {body.electionOfficials.map((o, i) => (
              <li key={i}>
                {[o.name, o.title].filter(Boolean).join(", ")}
                {o.officePhoneNumber && (
                  <>
                    {" · "}
                    <a href={`tel:${o.officePhoneNumber.replace(/[^\d+]/g, "")}`} className="text-blue-800 underline">
                      {o.officePhoneNumber}
                    </a>
                  </>
                )}
                {o.emailAddress && (
                  <>
                    {" · "}
                    <a href={`mailto:${o.emailAddress}`} className="text-blue-800 underline">
                      {o.emailAddress}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default function ElectionOffice({ regions }: { regions: AdministrativeRegion[] }) {
  const offices: { title: string; body: AdministrationBody }[] = [];
  for (const r of regions) {
    const local = r.local_jurisdiction;
    if (local?.electionAdministrationBody) {
      offices.push({ title: `Local office${local.name ? `: ${local.name}` : ""}`, body: local.electionAdministrationBody });
    }
    if (r.electionAdministrationBody) {
      offices.push({ title: `State office${r.name ? `: ${r.name}` : ""}`, body: r.electionAdministrationBody });
    }
  }

  if (!offices.length) {
    return (
      <p className="rounded-lg bg-slate-100 p-4">
        Election office details aren't available for this address. Visit{" "}
        <a href="https://www.usa.gov/election-office" target="_blank" rel="noopener noreferrer" className="underline">
          usa.gov/election-office
        </a>{" "}
        to find yours.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {offices.map((o, i) => (
        <Office key={i} title={o.title} body={o.body} />
      ))}
    </div>
  );
}

// The best single link to send someone to for "confirm with your election office".
export function primaryOfficeUrl(regions?: AdministrativeRegion[]): string | null {
  for (const r of regions ?? []) {
    const local = r.local_jurisdiction?.electionAdministrationBody;
    const state = r.electionAdministrationBody;
    const url = safeUrl(local?.electionInfoUrl) || safeUrl(state?.electionInfoUrl);
    if (url) return url;
  }
  return null;
}
