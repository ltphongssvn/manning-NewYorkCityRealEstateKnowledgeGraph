// frontend/app/routes/recommend.tsx
import { useState } from "react";
import type { Route } from "./+types/recommend";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Recommendations | NYC Real Estate KG" }];
}

export default function Recommend() {
  const [bbl, setBbl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const res = await fetch(`/api/recommend/${bbl}`);
    if (!res.ok) {
      setError(`BBL ${bbl} not found in embeddings`);
      return;
    }
    setResult(await res.json());
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <a href="/" className="text-blue-400 hover:underline mb-4 inline-block">← Home</a>
      <h1 className="text-3xl font-bold mb-6">Similar Property Recommendations</h1>
      <p className="text-gray-400 mb-4 text-sm">AI-powered similarity using node2vec embeddings trained on 97,000 NYC properties. Lower distance = more similar ownership pattern.</p>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:outline-none"
          placeholder="Enter BBL (e.g. 1008350041)"
          value={bbl}
          onChange={e => setBbl(e.target.value)}
          data-testid="bbl-input"
        />
        <button className="px-6 py-2 bg-yellow-600 rounded hover:bg-yellow-700" type="submit">
          Recommend
        </button>
      </form>
      {error && <p className="text-red-400" data-testid="error-msg">{error}</p>}
      {result && (
        <div className="bg-gray-800 rounded p-4 space-y-2" data-testid="result">
          <p className="mb-2"><span className="text-gray-400">Query BBL:</span> {result.bbl}</p>
          <p className="text-gray-400 text-sm mb-2">Top {result.recommendations?.length} similar properties by ownership network:</p>
          <ul className="space-y-2">
            {result.recommendations?.map((r: any, i: number) => (
              <li key={i} className="flex items-center gap-4 text-sm bg-gray-700 rounded px-3 py-2">
                <span className="text-gray-400">#{i + 1}</span>
                <span className="text-yellow-400 font-mono">{r.bbl}</span>
                <span className="text-gray-400">similarity distance:</span>
                <span className={r.distance < 0.3 ? "text-green-400" : "text-orange-400"}>{r.distance}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
