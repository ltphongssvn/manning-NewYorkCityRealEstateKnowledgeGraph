// frontend/app/routes/home.tsx
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NYC Real Estate Knowledge Graph" },
    { name: "description", content: "Explore NYC property ownership networks" },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">NYC Real Estate Knowledge Graph</h1>
      <p className="text-gray-400 mb-8">Explore property ownership networks across New York City.</p>
      <nav className="flex gap-4">
        <a href="/properties" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Properties</a>
        <a href="/owners" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Owners</a>
        <a href="/graph" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Graph Explorer</a>
      </nav>
    </main>
  );
}
