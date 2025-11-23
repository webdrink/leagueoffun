/**
 * Build-time discovery of game configs using Vite glob import.
 * Currently no game modules migrated; returns empty until extraction.
 */
import { GameConfigSchema, GameConfig } from '../game.schema';

// Vite glob import for game.json files - try multiple patterns
const rawConfigs: Record<string, { default: GameConfig }> = {
  ...import.meta.glob('/src/games/**/game.json', { eager: true }),
  ...import.meta.glob('../../games/**/game.json', { eager: true }),
  ...import.meta.glob('../../../games/**/game.json', { eager: true })
} as Record<string, { default: GameConfig }>;

export function discoverGameConfigs(): GameConfig[] {
  const results: GameConfig[] = [];
  
  for (const [path, mod] of Object.entries(rawConfigs || {})) {
    try {
      const parsed = GameConfigSchema.parse(mod.default);
      results.push(parsed);
    } catch (err) {
      console.error('[discoverGameConfigs] Invalid config at', path, ':', err);
    }
  }
  
  return results;
}
