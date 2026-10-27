import { useState } from "react";
import type { Election } from "../lib/types";
import { formatDate } from "../lib/format";

interface Props {
  initialAddress: string;
  elections: Election[];
  loading: boolean;
  onSearch: (address: string, electionId: string) => void;
  onDemo: () => void;
}

export default function AddressForm({ initialAddress, elections, loading, onSearch, onDemo }: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [electionId, setElectionId] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (address.trim()) onSearch(address.trim(), electionId);
      }}
    >
      <div>
        <label htmlFor="address" className="block font-semibold">
          Your home address
        </label>
        <p id="address-help" className="text-sm text-slate-600">
          Use the address where you're registered to vote. It's only saved on this device.
        </p>
        <input
          id="address"
          type="text"
          autoComplete="street-address"
          aria-describedby="address-help"
          required
          minLength={5}
          maxLength={300}
          placeholder="123 Main St, Miami, FL 33101"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-2 w-full rounded-lg border-2 border-slate-400 px-4 py-3 text-lg focus:border-blue-700"
        />
      </div>

      {elections.length > 0 && (
        <div>
          <label htmlFor="election" className="block font-semibold">
            Election
          </label>
          <select
            id="election"
            value={electionId}
            onChange={(e) => setElectionId(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-slate-400 bg-white px-4 py-3"
          >
            <option value="">Next election for my address</option>
            {elections.map((el) => (
              <option key={el.id} value={el.id}>
                {el.name} ({formatDate(el.electionDay)})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-800 px-6 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
        >
          {loading ? "Looking up…" : "Get my voting info"}
        </button>
        <button
          type="button"
          onClick={onDemo}
          disabled={loading}
          className="rounded-lg border-2 border-blue-800 px-6 py-3 font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-60"
        >
          Try a demo
        </button>
      </div>
    </form>
  );
}
