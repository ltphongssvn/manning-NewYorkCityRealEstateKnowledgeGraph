// frontend/app/routes/properties.tsx
import { useState } from "react";
import type { Route } from "./+types/properties";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Properties | NYC Real Estate KG" }];
}

export default function Properties() {
  const [bbl, setBbl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const res = await fetch(`/api/properties/${bbl}`);
    if (!res.ok) {
      setError(`BBL ${bbl} not found`);
      return;
    }
    setResult(await res.json());
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <a href="/" className="text-blue-400 hover:underline mb-4 inline-block">← Home</a>
      <h1 className="text-3xl font-bold mb-6">Property Search</h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:outline-none"
          placeholder="Enter BBL (e.g. 1008350041)"
          value={bbl}
          onChange={e => setBbl(e.target.value)}
          data-testid="bbl-input"
        />
        <button className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700" type="submit">
          Search
        </button>
      </form>
      {error && <p className="text-red-400" data-testid="error-msg">{error}</p>}
      {result && (
        <div className="bg-gray-800 rounded p-4" data-testid="result">
          <p><span className="text-gray-400">BBL:</span> {result.bbl}</p>
          <p><span className="text-gray-400">Owners:</span> {result.owners?.length ?? 0}</p>
          <p className="text-gray-500 text-sm mt-2">{result.message}</p>
        </div>
      )}
    </main>
  );
}
