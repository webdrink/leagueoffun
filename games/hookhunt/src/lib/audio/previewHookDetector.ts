/**
 * Preview Hook Detector (Lite Mode)
 * 
 * Analyzes Spotify 30-second preview tracks to identify the most engaging
 * "hook" segment for gameplay. Uses browser-based audio analysis with
 * Meyda for feature extraction.
 * 
 * Features:
 * - RMS (loudness) analysis for energy detection
 * - Spectral flux for onset/beat detection
 * - Sliding window analysis for segment scoring
 * - Confidence-based hook selection
 * - Fallback mechanisms for analysis failures
 */

// import Meyda from 'meyda';
import type {
  HookCandidate,
  HookDetectionResult,
  HookSegment,
  AudioAnalysisData
} from '../../hookHuntTypes';

// Analysis configuration
const ANALYSIS_CONFIG = {
  windowSize: 1024,
  hopSize: 512,
  sampleRate: 44100,
  features: ['rms', 'spectralFlux'] as const,
  
  // Hook detection parameters
  minHookDuration: 7, // seconds
  maxHookDuration: 12, // seconds
  defaultHookDuration: 10, // seconds
  
  // Scoring weights
  loudnessWeight: 0.6,
  spectralFluxWeight: 0.4,
  
  // Confidence thresholds
  minConfidence: 0.3,
  goodConfidence: 0.7,
} as const;

/**
 * Audio processing utilities
 */
export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  
  /**
   * Initializes the Web Audio API context
   */
  private async getAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
    
    return this.audioContext;
  }
  
  /**
   * Loads and decodes audio from URL
   */
  async loadAudio(url: string): Promise<AudioBuffer> {
    try {
      const audioContext = await this.getAudioContext();
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio:', error);
      throw new Error('Failed to load audio for analysis');
    }
  }
  
  /**
   * Extracts audio features using simple RMS analysis (Meyda mock for now)
   */
  analyzeAudio(audioBuffer: AudioBuffer): AudioAnalysisData {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const features: AudioAnalysisData = {
      rms: [],
      spectralFlux: [],
    };
    
    // Analyze audio in chunks using simple RMS calculation
    const hopSize = ANALYSIS_CONFIG.hopSize;
    const windowSize = ANALYSIS_CONFIG.windowSize;
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const chunk = channelData.slice(i, i + windowSize);
      
      try {
        // Simple RMS calculation
        let sum = 0;
        for (let j = 0; j < chunk.length; j++) {
          sum += chunk[j] * chunk[j];
        }
        const rms = Math.sqrt(sum / chunk.length);
        
        // Simple spectral flux approximation (energy difference)
        const energy = chunk.reduce((acc, val) => acc + Math.abs(val), 0) / chunk.length;
        
        features.rms.push(rms);
        features.spectralFlux.push(energy);
      } catch (error) {
        // Skip this frame on analysis error
        features.rms.push(0);
        features.spectralFlux.push(0);
      }
    }
    
    return features;
  }
  
  /**
   * Cleans up audio context
   */
  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Hook detection algorithm for preview tracks
 */
export class PreviewHookDetector {
  private audioProcessor = new AudioProcessor();
  
  /**
   * Detects the best hook segment in a preview track
   */
  async detectHook(previewUrl: string, hookDuration = ANALYSIS_CONFIG.defaultHookDuration): Promise<HookDetectionResult> {
    const startTime = performance.now();
    
    try {
      // Load and analyze audio
      const audioBuffer = await this.audioProcessor.loadAudio(previewUrl);
      const features = this.audioProcessor.analyzeAudio(audioBuffer);
      
      // Find hook candidates
      const candidates = this.findHookCandidates(features, audioBuffer.duration, hookDuration);
      
      // Select best hook
      const bestHook = this.selectBestHook(candidates);
      
      const processingTime = performance.now() - startTime;
      
      return {
        hookSegment: bestHook,
        candidates,
        detectionMethod: 'lite',
        confidence: bestHook?.confidence || 0,
        processingTime,
      };
      
    } catch (error) {
      console.error('Hook detection failed:', error);
      
      // Return fallback hook (middle of preview)
      const fallbackHook = this.createFallbackHook(hookDuration);
      
      return {
        hookSegment: fallbackHook,
        candidates: [],
        detectionMethod: 'fallback',
        confidence: 0.1,
        processingTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Finds potential hook segments using sliding window analysis
   */
  private findHookCandidates(
    features: AudioAnalysisData,
    audioDuration: number,
    hookDuration: number
  ): HookCandidate[] {
    const candidates: HookCandidate[] = [];
    
    // Calculate window parameters
    const frameRate = features.rms.length / audioDuration;
    const windowFrames = Math.floor(hookDuration * frameRate);
    const stepFrames = Math.floor(windowFrames * 0.25); // 25% overlap
    
    // Normalize features for scoring
    const normalizedRMS = this.normalizeArray(features.rms);
    const normalizedFlux = this.normalizeArray(features.spectralFlux);
    
    // Analyze sliding windows
    for (let i = 0; i < features.rms.length - windowFrames; i += stepFrames) {
      const startTime = i / frameRate;
      const endTime = (i + windowFrames) / frameRate;
      
      // Skip if window would extend beyond audio
      if (endTime > audioDuration) break;
      
      // Calculate window features
      const windowRMS = normalizedRMS.slice(i, i + windowFrames);
      const windowFlux = normalizedFlux.slice(i, i + windowFrames);
      
      // Score the window
      const loudness = this.calculateMean(windowRMS);
      const spectralFlux = this.calculateMean(windowFlux);
      const energyVariance = this.calculateVariance(windowRMS);
      
      // Combined score with weights
      const score = (loudness * ANALYSIS_CONFIG.loudnessWeight) + 
                   (spectralFlux * ANALYSIS_CONFIG.spectralFluxWeight);
      
      const candidate: HookCandidate = {
        startTime,
        endTime,
        duration: endTime - startTime,
        confidence: Math.min(score, 1.0),
        loudness,
        spectralFlux,
        energyVariance,
      };
      
      candidates.push(candidate);
    }
    
    return candidates.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Selects the best hook from candidates
   */
  private selectBestHook(candidates: HookCandidate[]): HookSegment | null {
    if (candidates.length === 0) return null;
    
    // Find candidates above minimum confidence
    const viableCandidates = candidates.filter(c => c.confidence >= ANALYSIS_CONFIG.minConfidence);
    
    if (viableCandidates.length === 0) {
      // Use best candidate even if below threshold
      if (candidates.length > 0) {
        const best = candidates[0];
        return {
          startTime: best.startTime,
          endTime: best.endTime,
          duration: best.duration,
          confidence: best.confidence,
          reason: 'Best available (low confidence)',
        };
      }
      return null;
    }
    
    // Select the highest scoring viable candidate
    const best = viableCandidates[0];
    const reason = best.confidence >= ANALYSIS_CONFIG.goodConfidence 
      ? 'High confidence hook detected'
      : 'Moderate confidence hook detected';
    
    return {
      startTime: best.startTime,
      endTime: best.endTime,
      duration: best.duration,
      confidence: best.confidence,
      reason,
    };
  }
  
  /**
   * Creates a fallback hook (middle of track)
   */
  private createFallbackHook(duration: number): HookSegment {
    const previewDuration = 30; // Spotify previews are 30 seconds
    const startTime = Math.max(0, (previewDuration - duration) / 2);
    const endTime = Math.min(previewDuration, startTime + duration);
    
    return {
      startTime,
      endTime,
      duration: endTime - startTime,
      confidence: 0.1,
      reason: 'Fallback hook (analysis failed)',
    };
  }
  
  /**
   * Normalizes an array to 0-1 range
   */
  private normalizeArray(arr: number[]): number[] {
    if (arr.length === 0) return [];
    
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;
    
    if (range === 0) return arr.map(() => 0.5);
    
    return arr.map(val => (val - min) / range);
  }
  
  /**
   * Calculates mean of array
   */
  private calculateMean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
  
  /**
   * Calculates variance of array
   */
  private calculateVariance(arr: number[]): number {
    if (arr.length === 0) return 0;
    
    const mean = this.calculateMean(arr);
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return this.calculateMean(squaredDiffs);
  }
  
  /**
   * Cleans up resources
   */
  cleanup(): void {
    this.audioProcessor.cleanup();
  }
}

// Export singleton instance
export const previewHookDetector = new PreviewHookDetector();