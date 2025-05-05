import { useEffect, useState } from "react";

type Game = {
  name: string;
  title: string;
  description?: string;
  domain?: string;
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch("/games.json")
      .then(res => res.json())
      .then(setGames)
      .catch(err => console.error("Failed to load games.json:", err));
  }, []);

  return (
    <main className="p-6 font-sans text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">League of Fun</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game.name} className="bg-gray-800 rounded-xl p-4 shadow hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold">{game.title}</h2>
            <p className="text-sm text-gray-400 mb-3">{game.description}</p>
            <a
              href={`https://${game.domain || `${game.name}.leagueoffun.de`}`}
              className="inline-block bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              Play {game.title}
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
