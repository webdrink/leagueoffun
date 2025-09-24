/**
 * StaticListProvider
 * Wraps a static list (e.g., questions) with shuffle & index progression.
 * Ported (simplified) from legacy useQuestions hook for modular architecture.
 */
export interface StaticItem { id?: string; text: string; [k: string]: unknown }

export interface StaticListProviderConfig<T extends StaticItem> {
  items: T[];
  shuffle?: boolean;
}

export interface ContentProvider<T> {
  preload?(): Promise<void>;
  current(): T | null;
  next(): T | null;
  previous?(): T | null;
  progress(): { index: number; total: number };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export class StaticListProvider<T extends StaticItem> implements ContentProvider<T> {
  private list: T[];
  private index = 0;
  constructor(cfg: StaticListProviderConfig<T>) {
    this.list = cfg.shuffle ? shuffle(cfg.items) : cfg.items;
  }
  current(): T | null { return this.list[this.index] ?? null; }
  next(): T | null {
    if (this.index < this.list.length - 1) {
      this.index += 1;
      return this.current();
    }
    return null;
  }
  previous(): T | null {
    if (this.index > 0) {
      this.index -= 1;
      return this.current();
    }
    return null;
  }
  progress() { return { index: this.index, total: this.list.length }; }
}
