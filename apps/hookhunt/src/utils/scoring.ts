import FuzzySet from 'fuzzyset.js';

export function fuzzyMatch(a: string, b: string): number {
  const fs = FuzzySet([b.toLowerCase()]);
  const res = fs.get(a.toLowerCase());
  return res?.[0]?.[0] || 0;
}

export function decadeFromYear(dateStr?: string): string | null {
  if (!dateStr) return null;
  const y = parseInt(dateStr.substring(0, 4));
  if (isNaN(y)) return null;
  const d = Math.floor(y / 10) * 10;
  return `${d}s`;
}

export function pointsForGuess(
  guess: string,
  title: string,
  artist: string,
  decade: string | null,
  thresholdPct: number,
  partial: number,
  full: number
): { awarded: number; matched: { title: number; artist: number; decade: number } } {
  const mt = fuzzyMatch(guess, title);
  const ma = fuzzyMatch(guess, artist);
  const md = decade ? fuzzyMatch(guess, decade) : 0;
  const threshold = thresholdPct / 100;
  const matchedAny = Math.max(mt, ma, md) >= threshold;
  const fullMatch = mt >= 0.9 && ma >= 0.9 && (!decade || md >= 0.9);
  const awarded = matchedAny ? (fullMatch ? full : partial) : 0;
  return { awarded, matched: { title: mt, artist: ma, decade: md } };
}
