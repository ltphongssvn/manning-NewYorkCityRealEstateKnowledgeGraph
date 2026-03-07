// frontend/app/routes/owners.tsx
import { useState } from "react";
import type { Route } from "./+types/owners";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Owners | NYC Real Estate KG" }];
}

export default function Owners() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const res = await fetch(`/api/owners/${encodeURIComponent(name)}`);
    if (!res.ok) {
      setError(`Owner "${name}" not found`);
      return;
    }
    setResult(await res.json());
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <a href="/" className="text-blue-400 hover:underline mb-4 inline-block">← Home</a>
      <h1 className="text-3xl font-bold mb-6">Owner Search</h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:outline-none"
          placeholder="Enter owner name (e.g. ESRT EMPIRE STATE BUILDING, L.L.C.)"
          value={name}
          onChange={e => setName(e.target.value)}
          data-testid="owner-input"
        />
        <button className="px-6 py-2 bg-purple-600 rounded hover:bg-purple-700" type="submit">
          Search
        </button>
      </form>
      {error && <p className="text-red-400" data-testid="error-msg">{error}</p>}
      {result && (
        <div className="bg-gray-800 rounded p-4 space-y-2" data-testid="result">
          <p><span className="text-gray-400">Owner:</span> {result.name}</p>
          <p><span className="text-gray-400">Properties ({result.properties?.length ?? 0}):</span></p>
          <ul className="ml-4 space-y-1">
            {result.properties?.map((p: any, i: number) => (
              <li key={i} className="text-sm">
                <span className="text-yellow-400">{p.bbl}</span>
                {p.address && <span className="text-white ml-2">{p.address}</span>}
                <span className="text-gray-500 ml-2">({p.relationship})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
