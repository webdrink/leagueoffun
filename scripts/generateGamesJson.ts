import * as fs from 'fs';
const path = require('path');

const GAMES_DIR = path.resolve(__dirname, '../games');
const OUTPUT_FILE = path.resolve(__dirname, '../public/games.json');

function readGames(): { name: string, title: string, description?: string, domain: string }[] {
  const entries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });

  const games = entries.filter((dirent: fs.Dirent) => dirent.isDirectory()).map((dirent: fs.Dirent) => {
    const name = dirent.name;
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const description = getDescriptionForGame(name); // optional
    return {
      name,
      title,
      description,
      domain: `${name}.leagueoffun.de`
    };
  });

  return games;
}

function getDescriptionForGame(name: string): string | undefined {
  // Extendable: later read from a per-game metadata file
  const descriptions: Record<string, string> = {
    blamegame: "Who's to blame? A logic-based social trap.",
    truthordrink: "Spicy questions. Honest answers. Or drinks."
  };
  return descriptions[name];
}

function main() {
  const games = readGames();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(games, null, 2));
  console.log(`✅ Wrote ${games.length} games to games.json`);
}

main();
