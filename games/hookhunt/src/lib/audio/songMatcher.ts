/**
 * Song Matching Logic
 * 
 * Implements fuzzy string matching for song titles and artist names
 * with configurable confidence thresholds and text normalization.
 * 
 * Features:
 * - FuzzySet.js integration for approximate string matching
 * - Text cleaning and normalization rules
 * - Confidence-based matching with thresholds
 * - Support for featuring patterns and artist lists
 * - Performance optimized for real-time matching
 */

import FuzzySet from 'fuzzyset.js';
import type { MatchResult, Track } from '../../hookHuntTypes';

// Matching configuration
const MATCHING_CONFIG = {
  defaultThreshold: 0.7, // 70% confidence
  minThreshold: 0.5,
  maxThreshold: 0.95,
  
  // Text cleaning rules
  cleaning: {
    removeFeaturingPattern: true,
    normalizeWhitespace: true,
    removePunctuation: true,
    toLowerCase: true,
    removeArticles: true,
  },
  
  // Scoring configuration
  scoring: {
    exactMatchBonus: 0.2,
    partialMatchPenalty: 0.1,
    lengthDifferencePenalty: 0.05,
  },
} as const;

// Common words to remove from song/artist names
const STOP_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'feat', 'featuring', 'ft', 'remix', 'edit', 'version', 'remaster', 'remastered'
];

// Common featuring patterns to remove
const FEATURING_PATTERNS = [
  /\s*\(?\s*feat\.?\s+[^)]*\)?/gi,
  /\s*\(?\s*featuring\s+[^)]*\)?/gi,
  /\s*\(?\s*ft\.?\s+[^)]*\)?/gi,
  /\s*\(?\s*with\s+[^)]*\)?/gi,
];

/**
 * Text cleaning and normalization utilities
 */
export class TextCleaner {
  /**
   * Normalizes text for matching
   */
  static clean(text: string): string {
    let cleaned = text;
    
    // Remove featuring patterns
    if (MATCHING_CONFIG.cleaning.removeFeaturingPattern) {
      FEATURING_PATTERNS.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
      });
    }
    
    // Convert to lowercase
    if (MATCHING_CONFIG.cleaning.toLowerCase) {
      cleaned = cleaned.toLowerCase();
    }
    
    // Remove punctuation
    if (MATCHING_CONFIG.cleaning.removePunctuation) {
      cleaned = cleaned.replace(/[^\w\s]/g, ' ');
    }
    
    // Normalize whitespace
    if (MATCHING_CONFIG.cleaning.normalizeWhitespace) {
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
    }
    
    // Remove common articles and stop words
    if (MATCHING_CONFIG.cleaning.removeArticles) {
      const words = cleaned.split(' ').filter(word => 
        word.length > 0 && !STOP_WORDS.includes(word.toLowerCase())
      );
      cleaned = words.join(' ');
    }
    
    return cleaned;
  }
  
  /**
   * Extracts main artist name from artist string with features
   */
  static extractMainArtist(artistString: string): string {
    let mainArtist = artistString;
    
    // Remove featuring patterns
    FEATURING_PATTERNS.forEach(pattern => {
      mainArtist = mainArtist.replace(pattern, '');
    });
    
    // Split by common separators and take first artist
    const separators = [',', '&', 'and', 'feat', 'featuring', 'ft', 'with'];
    const regex = new RegExp(`\\s*(${separators.join('|')})\\s*`, 'i');
    const parts = mainArtist.split(regex);
    
    return this.clean(parts[0] || mainArtist);
  }
  
  /**
   * Extracts all artists from artist string
   */
  static extractAllArtists(artistString: string): string[] {
    // Split by common separators
    const separators = [',', '&', ' and ', ' feat ', ' featuring ', ' ft ', ' with '];
    let artists = [artistString];
    
    separators.forEach(separator => {
      const newArtists: string[] = [];
      artists.forEach(artist => {
        newArtists.push(...artist.split(separator));
      });
      artists = newArtists;
    });
    
    return artists
      .map(artist => this.clean(artist))
      .filter(artist => artist.length > 0);
  }
}

/**
 * Fuzzy matching engine using FuzzySet
 */
export class FuzzyMatcher {
  private songFuzzySet: FuzzySet | null = null;
  private artistFuzzySet: FuzzySet | null = null;
  private tracks: Track[] = [];
  
  /**
   * Initializes the matcher with a set of tracks
   */
  initialize(tracks: Track[]): void {
    this.tracks = tracks;
    
    // Extract and clean song titles
    const cleanSongTitles = tracks.map(track => 
      TextCleaner.clean(track.title)
    ).filter(title => title.length > 0);
    
    // Extract and clean artist names
    const cleanArtistNames: string[] = [];
    tracks.forEach(track => {
      const mainArtist = TextCleaner.extractMainArtist(track.artist);
      const allArtists = TextCleaner.extractAllArtists(track.artist);
      
      if (mainArtist) cleanArtistNames.push(mainArtist);
      cleanArtistNames.push(...allArtists);
    });
    
    // Remove duplicates
    const uniqueArtists = [...new Set(cleanArtistNames)].filter(name => name.length > 0);
    
    // Create FuzzySets
    try {
      this.songFuzzySet = FuzzySet(cleanSongTitles);
      this.artistFuzzySet = FuzzySet(uniqueArtists);
    } catch (error) {
      console.error('Error creating FuzzySets:', error);
      this.songFuzzySet = null;
      this.artistFuzzySet = null;
    }
  }
  
  /**
   * Matches a guess against song titles
   */
  matchSong(guess: string, threshold = MATCHING_CONFIG.defaultThreshold): { match: boolean; confidence: number; matchedTitle?: string } {
    if (!this.songFuzzySet) {
      return { match: false, confidence: 0 };
    }
    
    const cleanGuess = TextCleaner.clean(guess);
    if (cleanGuess.length === 0) {
      return { match: false, confidence: 0 };
    }
    
    try {
      const results = this.songFuzzySet.get(cleanGuess);
      
      if (!results || results.length === 0) {
        return { match: false, confidence: 0 };
      }
      
  // FuzzySet result type is not a real tuple in typings; avoid array destructuring
  const top = results[0] as unknown as [number, string];
  const confidence = top[0] as number;
  const matchedText = top[1] as string;
  const adjustedConfidence = this.adjustConfidence(cleanGuess, matchedText, confidence);
      
      return {
        match: adjustedConfidence >= threshold,
        confidence: adjustedConfidence,
        matchedTitle: matchedText,
      };
    } catch (error) {
      console.error('Error matching song:', error);
      return { match: false, confidence: 0 };
    }
  }
  
  /**
   * Matches a guess against artist names
   */
  matchArtist(guess: string, threshold = MATCHING_CONFIG.defaultThreshold): { match: boolean; confidence: number; matchedArtist?: string } {
    if (!this.artistFuzzySet) {
      return { match: false, confidence: 0 };
    }
    
    const cleanGuess = TextCleaner.clean(guess);
    if (cleanGuess.length === 0) {
      return { match: false, confidence: 0 };
    }
    
    try {
      const results = this.artistFuzzySet.get(cleanGuess);
      
      if (!results || results.length === 0) {
        return { match: false, confidence: 0 };
      }
      
  const top = results[0] as unknown as [number, string];
  const confidence = top[0] as number;
  const matchedText = top[1] as string;
  const adjustedConfidence = this.adjustConfidence(cleanGuess, matchedText, confidence);
      
      return {
        match: adjustedConfidence >= threshold,
        confidence: adjustedConfidence,
        matchedArtist: matchedText,
      };
    } catch (error) {
      console.error('Error matching artist:', error);
      return { match: false, confidence: 0 };
    }
  }
  
  /**
   * Adjusts confidence based on additional factors
   */
  private adjustConfidence(guess: string, match: string, baseConfidence: number): number {
    let adjustedConfidence = baseConfidence;
    
    // Exact match bonus
    if (guess === match) {
      adjustedConfidence += MATCHING_CONFIG.scoring.exactMatchBonus;
    }
    
    // Length difference penalty
    const lengthDiff = Math.abs(guess.length - match.length);
    const maxLength = Math.max(guess.length, match.length);
    if (maxLength > 0) {
      const lengthPenalty = (lengthDiff / maxLength) * MATCHING_CONFIG.scoring.lengthDifferencePenalty;
      adjustedConfidence -= lengthPenalty;
    }
    
    // Ensure confidence stays within bounds
    return Math.max(0, Math.min(1, adjustedConfidence));
  }
}

/**
 * Main song matcher class that combines song and artist matching
 */
export class SongMatcher {
  private fuzzyMatcher = new FuzzyMatcher();
  private initialized = false;
  
  /**
   * Initializes the matcher with tracks
   */
  initialize(tracks: Track[]): void {
    this.fuzzyMatcher.initialize(tracks);
    this.initialized = true;
  }
  
  /**
   * Matches guesses against a specific track
   */
  matchGuess(
    songGuess: string | undefined,
    artistGuess: string | undefined,
    correctTrack: Track,
    threshold = MATCHING_CONFIG.defaultThreshold
  ): MatchResult {
    if (!this.initialized) {
      throw new Error('SongMatcher not initialized. Call initialize() first.');
    }
    
    let songMatch = false;
    let artistMatch = false;
    let songConfidence = 0;
    let artistConfidence = 0;
    
    // Match song title
    if (songGuess && songGuess.trim().length > 0) {
      const songResult = this.fuzzyMatcher.matchSong(songGuess, threshold);
      songMatch = songResult.match;
      songConfidence = songResult.confidence;
      
      // Additional check against the correct track's title
      const directSongMatch = this.directMatch(songGuess, correctTrack.title, threshold);
      if (directSongMatch.match && directSongMatch.confidence > songConfidence) {
        songMatch = true;
        songConfidence = directSongMatch.confidence;
      }
    }
    
    // Match artist name
    if (artistGuess && artistGuess.trim().length > 0) {
      const artistResult = this.fuzzyMatcher.matchArtist(artistGuess, threshold);
      artistMatch = artistResult.match;
      artistConfidence = artistResult.confidence;
      
      // Additional check against the correct track's artist
      const directArtistMatch = this.directMatch(artistGuess, correctTrack.artist, threshold);
      if (directArtistMatch.match && directArtistMatch.confidence > artistConfidence) {
        artistMatch = true;
        artistConfidence = directArtistMatch.confidence;
      }
    }
    
    // Calculate points
    let pointsAwarded = 0;
    if (songMatch) pointsAwarded += 1;
    if (artistMatch) pointsAwarded += 1;
    
    // Calculate bonus points for high confidence
    let bonusPoints = 0;
    if (songMatch && songConfidence > 0.9) bonusPoints += 0.5;
    if (artistMatch && artistConfidence > 0.9) bonusPoints += 0.5;
    
    return {
      songMatch,
      artistMatch,
      songConfidence,
      artistConfidence,
      pointsAwarded,
      bonusPoints,
    };
  }
  
  /**
   * Direct fuzzy matching between two strings
   */
  private directMatch(guess: string, target: string, threshold: number): { match: boolean; confidence: number } {
    const cleanGuess = TextCleaner.clean(guess);
    const cleanTarget = TextCleaner.clean(target);
    
    if (cleanGuess.length === 0 || cleanTarget.length === 0) {
      return { match: false, confidence: 0 };
    }
    
    try {
      const tempFuzzySet = FuzzySet([cleanTarget]);
      const results = tempFuzzySet.get(cleanGuess);
      
      if (!results || results.length === 0) {
        return { match: false, confidence: 0 };
      }
      
      const confidence = results[0][0];
      return {
        match: confidence >= threshold,
        confidence,
      };
    } catch (error) {
      console.error('Error in direct match:', error);
      return { match: false, confidence: 0 };
    }
  }
  
  /**
   * Gets current matching threshold
   */
  getThreshold(): number {
    return MATCHING_CONFIG.defaultThreshold;
  }
  
  /**
   * Sets matching threshold with validation
   */
  setThreshold(threshold: number): void {
    if (threshold < MATCHING_CONFIG.minThreshold || threshold > MATCHING_CONFIG.maxThreshold) {
      throw new Error(`Threshold must be between ${MATCHING_CONFIG.minThreshold} and ${MATCHING_CONFIG.maxThreshold}`);
    }
    // Note: This would need to be stored in configuration or state
  }
}

// Export singleton instance
export const songMatcher = new SongMatcher();