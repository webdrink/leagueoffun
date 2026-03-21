import FuzzySet from 'fuzzyset.js';

export type MatchStatus = 'exact' | 'close' | 'partial' | 'miss';

export interface FieldFeedback {
  confidence: number;
  points: number;
  status: MatchStatus;
}

export interface ArtistFieldFeedback extends FieldFeedback {
  mainConfidence: number;
  featureConfidence: number;
  matchedFeatureName: string | null;
  bonusPoints: number;
}

export interface YearFieldFeedback extends FieldFeedback {
  guessedYear: number | null;
  targetYear: number | null;
  yearDelta: number | null;
}

export interface GuessEvaluation {
  fields: {
    title: FieldFeedback;
    artist: ArtistFieldFeedback;
    year: YearFieldFeedback;
  };
  basePoints: number;
  replayPenaltyRatio: number;
  replayMultiplier: number;
  pointsAfterReplayPenalty: number;
}

export interface GuessEvaluationInput {
  titleGuess: string;
  artistGuess: string;
  yearGuess: string;
  targetTitle: string;
  mainArtist: string;
  featuredArtists: string[];
  targetYear: number | null;
  thresholdPct: number;
  partialPoints: number;
  fullPoints: number;
  replayCount: number;
  replayPenaltyPerReplay?: number;
}

const FEATURING_SPLIT_REGEX = /\s*(?:,|&| x | and | feat\.?|featuring|ft\.?|with)\s*/i;

function stripDiacritics(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeText(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fuzzyMatch(guess: string, target: string): number {
  const normalizedGuess = normalizeText(guess);
  const normalizedTarget = normalizeText(target);
  if (!normalizedGuess || !normalizedTarget) return 0;
  const fs = FuzzySet([normalizedTarget]);
  const res = fs.get(normalizedGuess);
  return res?.[0]?.[0] || 0;
}

function classifyStatus(confidence: number, threshold: number): MatchStatus {
  if (confidence >= 0.97) return 'exact';
  if (confidence >= threshold) return 'close';
  if (confidence >= threshold * 0.7) return 'partial';
  return 'miss';
}

function pointsFromConfidence(
  confidence: number,
  threshold: number,
  partialPoints: number,
  fullPoints: number
): number {
  if (confidence >= 0.92) return fullPoints;
  if (confidence >= threshold) return partialPoints;
  return 0;
}

function parseYear(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\d{4}/);
  if (!match) return null;
  const parsed = Number(match[0]);
  if (Number.isNaN(parsed)) return null;
  if (parsed < 1900 || parsed > 2100) return null;
  return parsed;
}

function extractArtistGuessParts(artistGuess: string): string[] {
  const cleaned = artistGuess.trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(FEATURING_SPLIT_REGEX)
    .map((value) => value.trim())
    .filter(Boolean);

  // Keep the full input as well: users often type "Main Artist ft. Feature Artist".
  return Array.from(new Set([cleaned, ...parts]));
}

function maxConfidence(guesses: string[], target: string): number {
  return guesses.reduce((best, guess) => Math.max(best, fuzzyMatch(guess, target)), 0);
}

function containsNormalizedPhrase(haystack: string, needle: string): boolean {
  const normalizedHaystack = normalizeText(haystack);
  const normalizedNeedle = normalizeText(needle);
  if (!normalizedHaystack || !normalizedNeedle) return false;
  return normalizedHaystack.includes(normalizedNeedle);
}

export function releaseYearFromDate(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = Number(dateStr.slice(0, 4));
  if (Number.isNaN(year)) return null;
  return year;
}

export function evaluateGuess(input: GuessEvaluationInput): GuessEvaluation {
  const {
    titleGuess,
    artistGuess,
    yearGuess,
    targetTitle,
    mainArtist,
    featuredArtists,
    targetYear,
    thresholdPct,
    partialPoints,
    fullPoints,
    replayCount,
    replayPenaltyPerReplay = 0.15,
  } = input;

  const threshold = thresholdPct / 100;

  const titleConfidence = fuzzyMatch(titleGuess, targetTitle);
  const titlePoints = pointsFromConfidence(titleConfidence, threshold, partialPoints, fullPoints);
  const titleFeedback: FieldFeedback = {
    confidence: titleConfidence,
    points: titlePoints,
    status: classifyStatus(titleConfidence, threshold),
  };

  const artistGuessParts = extractArtistGuessParts(artistGuess);
  const mainArtistConfidence = maxConfidence(artistGuessParts, mainArtist);
  const artistPoints = pointsFromConfidence(mainArtistConfidence, threshold, partialPoints, fullPoints);
  const featureMatch = featuredArtists
    .map((name) => {
      const fuzzyConfidence = maxConfidence(artistGuessParts, name);
      const phraseConfidence = containsNormalizedPhrase(artistGuess, name) ? 1 : 0;
      return { name, confidence: Math.max(fuzzyConfidence, phraseConfidence) };
    })
    .sort((a, b) => b.confidence - a.confidence)[0] || null;
  const featureConfidence = featureMatch?.confidence || 0;
  const bonusPoints =
    mainArtistConfidence >= threshold && featureConfidence >= threshold ? partialPoints : 0;
  const artistFeedback: ArtistFieldFeedback = {
    confidence: mainArtistConfidence,
    mainConfidence: mainArtistConfidence,
    featureConfidence,
    matchedFeatureName: featureMatch && featureConfidence >= threshold ? featureMatch.name : null,
    bonusPoints,
    points: artistPoints,
    status: classifyStatus(mainArtistConfidence, threshold),
  };

  const guessedYear = parseYear(yearGuess);
  const yearDelta = guessedYear !== null && targetYear !== null ? Math.abs(guessedYear - targetYear) : null;
  let yearConfidence = 0;
  if (yearDelta === 0) {
    yearConfidence = 1;
  } else if (yearDelta !== null && yearDelta <= 2) {
    yearConfidence = 0.78;
  } else if (yearDelta !== null && yearDelta <= 5) {
    yearConfidence = 0.58;
  }
  const yearPoints = pointsFromConfidence(yearConfidence, threshold, partialPoints, fullPoints);
  const yearFeedback: YearFieldFeedback = {
    confidence: yearConfidence,
    points: yearPoints,
    status: classifyStatus(yearConfidence, threshold),
    guessedYear,
    targetYear,
    yearDelta,
  };

  const basePoints = titleFeedback.points + artistFeedback.points + yearFeedback.points + artistFeedback.bonusPoints;
  const replayPenaltyRatio = Math.max(0, replayCount) * replayPenaltyPerReplay;
  const replayMultiplier = Math.max(0.25, 1 - replayPenaltyRatio);
  const pointsAfterReplayPenalty = Math.max(0, Math.floor(basePoints * replayMultiplier));

  return {
    fields: {
      title: titleFeedback,
      artist: artistFeedback,
      year: yearFeedback,
    },
    basePoints,
    replayPenaltyRatio,
    replayMultiplier,
    pointsAfterReplayPenalty,
  };
}
