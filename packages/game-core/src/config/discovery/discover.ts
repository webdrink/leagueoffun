/**
 * Build-time discovery of game configs using Vite glob import.
 * Currently no game modules migrated; returns empty until extraction.
 */
import { GameConfigSchema, GameConfig } from '../game.schema';

type ImportMetaWithGlob = ImportMeta & {
  glob: <T = unknown>(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ) => Record<string, T>;
};

const viteImportMeta = import.meta as ImportMetaWithGlob;
const safeGlob = typeof viteImportMeta.glob === 'function'
  ? viteImportMeta.glob.bind(viteImportMeta)
  : (() => ({})) as ImportMetaWithGlob['glob'];

// Vite glob import for game.json files - try multiple patterns
const rawConfigs: Record<string, { default: GameConfig }> = {
  ...safeGlob<{ default: GameConfig }>('/src/games/**/game.json', { eager: true }),
  ...safeGlob<{ default: GameConfig }>('../../games/**/game.json', { eager: true }),
  ...safeGlob<{ default: GameConfig }>('../../../games/**/game.json', { eager: true })
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
