/**
 * GameModule interface & registry.
 */
import { GameConfig } from './config/game.schema';
import { PhaseControllerMap } from './phases';
import { EventBus } from './events/eventBus';
import { GameAction } from './actions';
import type { ComponentType } from 'react'; // Corrected import statement

// Temporary relaxed typing for legacy screens; will tighten after full extraction.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ScreenRegistry { [screenId: string]: ComponentType<any>; }

export interface GameModuleContextMinimal {
  config: GameConfig;
  dispatch: (action: GameAction, payload?: unknown) => void;
  eventBus: EventBus;
  playerId?: string | null;
  roomId?: string | null;
}
export interface GameModule {
  id: string;
  init(ctx: GameModuleContextMinimal): void | Promise<void>;
  registerScreens(): ScreenRegistry;
  getPhaseControllers(): PhaseControllerMap;
  getTranslations?(): Array<{ namespace: string; resources: Record<string, unknown> }>;
  getThemeExtensions?(): unknown;
  getModuleStore?(): unknown; // to refine later
}

class ModuleRegistry {
  private modules = new Map<string, GameModule>();
  register(module: GameModule) {
    if (this.modules.has(module.id)) {
      throw new Error(`Module with id ${module.id} already registered`);
    }
    this.modules.set(module.id, module);
  }
  get(id: string) {
    return this.modules.get(id);
  }
  list() {
    return Array.from(this.modules.values());
  }
}

export const gameModuleRegistry = new ModuleRegistry();
