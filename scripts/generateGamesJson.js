"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = require('path');
const GAMES_DIR = path.resolve(__dirname, '../games');
const OUTPUT_FILE = path.resolve(__dirname, '../public/games.json');
function readGames() {
    const entries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
    const games = entries.filter((dirent) => dirent.isDirectory()).map((dirent) => {
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
function getDescriptionForGame(name) {
    // Extendable: later read from a per-game metadata file
    const descriptions = {
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
