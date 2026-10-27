import { useEffect, useRef, useState } from "react";
import AddressForm from "./components/AddressForm";
import PollingPlaces from "./components/PollingPlaces";
import Ballot from "./components/Ballot";
import ElectionOffice, { primaryOfficeUrl } from "./components/ElectionOffice";
import VerifyNotice from "./components/VerifyNotice";
import { ApiError, errorMessage, fetchElections, fetchVoterInfo } from "./lib/api";
import { clearAllData, loadAddress, saveAddress } from "./lib/storage";
import { daysUntil, formatAddress, formatDate } from "./lib/format";
import type { Election, VoterInfo } from "./lib/types";

// Google's permanent test election, used for demo mode.
const TEST_ELECTION_ID = "2000";
const DEMO_ADDRESS = "1263 Pacific Ave, Kansas City, KS 66102";

const TABS = [
  { id: "where", label: "Where to vote" },
  { id: "ballot", label: "My ballot" },
  { id: "office", label: "Election office" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [elections, setElections] = useState<Election[]>([]);
  const [info, setInfo] = useState<VoterInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);
  const [tab, setTab] = useState<TabId>("where");
  const [formKey, setFormKey] = useState(0);
  const [cleared, setCleared] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchElections()
      .then((list) =>
        setElections(
          list
            .filter((e) => e.id !== TEST_ELECTION_ID && daysUntil(e.electionDay) >= 0)
            .sort((a, b) => a.electionDay.localeCompare(b.electionDay)),
        ),
      )
      .catch(() => setElections([]));
  }, []);

  async function search(address: string, electionId: string, isDemo = false) {
    setLoading(true);
    setError(null);
    setInfo(null);
    setCleared(false);
    setDemo(isDemo);
    if (!isDemo) saveAddress(address);
    try {
      const data = await fetchVoterInfo(address, electionId || undefined);
      setInfo(data);
      setTab("where");
      requestAnimationFrame(() => resultsRef.current?.focus());
    } catch (e) {
      setError(errorMessage(e instanceof ApiError ? e.code : "upstream_error"));
    } finally {
      setLoading(false);
    }
  }

  function clearData() {
    clearAllData();
    setInfo(null);
    setError(null);
    setFormKey((k) => k + 1);
    setCleared(true);
  }

  const next = elections[0];
  const officeUrl = primaryOfficeUrl(info?.state);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-white focus:p-2">
        Skip to main content
      </a>

      <header className="bg-blue-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <p className="text-2xl font-extrabold tracking-tight">VoteReady</p>
          <p className="text-blue-100">Everything you need to vote, in one place.</p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {next && (
          <p className="rounded-lg bg-blue-50 p-4">
            <span className="font-semibold">{next.name}</span> is {formatDate(next.electionDay)}
            {" — "}
            {daysUntil(next.electionDay) === 0
              ? "that's today!"
              : `${daysUntil(next.electionDay)} day${daysUntil(next.electionDay) === 1 ? "" : "s"} away.`}
          </p>
        )}

        <section aria-labelledby="lookup-heading" className="space-y-4">
          <h1 id="lookup-heading" className="text-3xl font-bold">
            Get ready to vote
          </h1>
          <p>
            Enter your address to see where to vote, what's on your ballot, and how to reach your election office.
          </p>
          <AddressForm
            key={formKey}
            initialAddress={loadAddress()}
            elections={elections}
            loading={loading}
            onSearch={(a, id) => search(a, id)}
            onDemo={() => search(DEMO_ADDRESS, TEST_ELECTION_ID, true)}
          />
        </section>

        <div aria-live="polite" className="space-y-4">
          {loading && <p className="text-slate-700">Looking up your voting information…</p>}
          {cleared && <p className="rounded-lg bg-green-50 p-4">Your saved address and ballot picks were cleared.</p>}
          {error && (
            <div role="alert" className="rounded-lg border-l-4 border-red-700 bg-red-50 p-4">
              <p>{error}</p>
              <p className="mt-2 text-sm">
                You can always find your election office at{" "}
                <a href="https://www.usa.gov/election-office" target="_blank" rel="noopener noreferrer" className="underline">
                  usa.gov/election-office
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {info && (
          <section aria-labelledby="results-heading" className="space-y-5">
            <div>
              <h2 id="results-heading" ref={resultsRef} tabIndex={-1} className="text-2xl font-bold outline-none">
                {info.election?.name ?? "Your voting information"}
              </h2>
              {info.election?.electionDay && <p className="font-semibold">{formatDate(info.election.electionDay)}</p>}
              {info.normalizedInput && <p className="text-sm text-slate-700">For {formatAddress(info.normalizedInput)}</p>}
              {demo && (
                <p className="mt-2 rounded-lg bg-purple-50 p-3 text-sm">
                  Demo mode: this is Google's test election with sample data, not a real election.
                </p>
              )}
            </div>

            <VerifyNotice officeUrl={officeUrl} />

            <div role="tablist" aria-label="Voting information" className="flex gap-2 overflow-x-auto border-b border-slate-300">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap border-b-4 px-2 py-2 text-sm font-semibold sm:px-4 sm:text-base ${
                    tab === t.id ? "border-blue-800 text-blue-900" : "border-transparent text-slate-700 hover:text-blue-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              {tab === "where" && <PollingPlaces info={info} officeUrl={officeUrl} />}
              {tab === "ballot" && <Ballot contests={info.contests ?? []} electionId={info.election?.id ?? "unknown"} />}
              {tab === "office" && <ElectionOffice regions={info.state ?? []} />}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-300 bg-slate-50">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 text-sm text-slate-700">
          <p>
            VoteReady is nonpartisan and shows official data from the Google Civic Information API. It does not endorse
            any candidate or position, and you cannot vote through this app.
          </p>
          <p>Your address and ballot picks are saved only in this browser. Nothing is stored on our servers.</p>
          <button type="button" onClick={clearData} className="font-semibold text-blue-800 underline">
            Clear my data
          </button>
        </div>
      </footer>
    </div>
  );
}
