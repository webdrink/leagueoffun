/**
 * LocalStorage adapter (versioned & namespaced)
 */
const NAMESPACE = 'lof';
const VERSION = 'v1';

function key(k: string) { return `${NAMESPACE}.${VERSION}.${k}`; }

export function storageGet<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(key(k));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageSet<T>(k: string, value: T) {
  try {
    localStorage.setItem(key(k), JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function storageRemove(k: string) { localStorage.removeItem(key(k)); }

export function storageClearNamespace() {
  const prefix = `${NAMESPACE}.${VERSION}.`;
  Object.keys(localStorage).forEach(lsKey => {
    if (lsKey.startsWith(prefix)) localStorage.removeItem(lsKey);
  });
}

export const STORAGE_KEYS = {
  selectedGame: 'selectedGame',
  sessionPlayer: 'session.player',
  flags: 'flags',
  recentGames: 'recentGames'
};
