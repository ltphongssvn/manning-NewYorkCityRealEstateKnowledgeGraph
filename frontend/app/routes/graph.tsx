// frontend/app/routes/graph.tsx
import { useState } from "react";
import type { Route } from "./+types/graph";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Graph Explorer | NYC Real Estate KG" }];
}

export default function Graph() {
  const [bbl, setBbl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleTraverse(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const res = await fetch("/api/graph/traverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bbl, hops: 2 }),
    });
    if (!res.ok) {
      setError(`BBL ${bbl} not found`);
      return;
    }
    setResult(await res.json());
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <a href="/" className="text-blue-400 hover:underline mb-4 inline-block">← Home</a>
      <h1 className="text-3xl font-bold mb-6">Graph Explorer</h1>
      <form onSubmit={handleTraverse} className="flex gap-3 mb-6">
        <input
          className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:outline-none"
          placeholder="Enter BBL (e.g. 1008350041)"
          value={bbl}
          onChange={e => setBbl(e.target.value)}
          data-testid="bbl-input"
        />
        <button className="px-6 py-2 bg-green-600 rounded hover:bg-green-700" type="submit">
          Traverse
        </button>
      </form>
      {error && <p className="text-red-400" data-testid="error-msg">{error}</p>}
      {result && (
        <div className="bg-gray-800 rounded p-4 space-y-4" data-testid="result">
          <p><span className="text-gray-400">BBL:</span> {result.bbl}</p>
          <div>
            <p className="text-gray-400 mb-1">Nodes ({result.nodes?.length ?? 0}) — properties and owners:</p>
            <ul className="ml-4 space-y-1">
              {result.nodes?.map((n: any, i: number) => (
                <li key={i} className="text-sm">
                  <span className="text-green-400">[{n.labels?.join(", ")}]</span>
                  <span className="text-white ml-2">
                    {n.properties?.name ?? n.properties?.bbl ?? n.id}
                  </span>
                  {n.properties?.address && <span className="text-gray-400 ml-2">— {n.properties.address}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Edges ({result.edges?.length ?? 0}) — ownership links:</p>
            <ul className="ml-4 space-y-1">
              {result.edges?.map((e: any, i: number) => (
                <li key={i} className="text-sm text-gray-300">
                  Node {e.start} <span className="text-green-400">—{e.type}→</span> Node {e.end}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
