export interface CompletedGameRunInput {
  id?: string;
  gameId: string;
  playerId: string;
  startedAt: string;
  endedAt?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface GameRunRecord {
  id: string;
  gameId: string;
  playerId: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  score: number;
  metadata?: Record<string, unknown>;
}

const DB_NAME = 'leagueoffun_analytics';
const DB_VERSION = 1;
const RUNS_STORE = 'game_runs';

function makeRandomId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createRunId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return makeRandomId();
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
  });
}

async function openRunsDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return null;
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RUNS_STORE)) {
        const store = db.createObjectStore(RUNS_STORE, { keyPath: 'id' });
        store.createIndex('by_game_id', 'gameId', { unique: false });
        store.createIndex('by_player_id', 'playerId', { unique: false });
        store.createIndex('by_ended_at', 'endedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open run history database'));
  });
}

function toIsoOrNow(input?: string): string {
  if (!input) return new Date().toISOString();
  const timestamp = Date.parse(input);
  if (Number.isNaN(timestamp)) return new Date().toISOString();
  return new Date(timestamp).toISOString();
}

export async function saveCompletedGameRun(input: CompletedGameRunInput): Promise<GameRunRecord | null> {
  const db = await openRunsDb();
  if (!db) return null;

  const endedAt = toIsoOrNow(input.endedAt);
  const startedAt = toIsoOrNow(input.startedAt);
  const durationMs = Math.max(0, Date.parse(endedAt) - Date.parse(startedAt));

  const record: GameRunRecord = {
    id: input.id || createRunId(),
    gameId: input.gameId,
    playerId: input.playerId,
    startedAt,
    endedAt,
    durationMs,
    score: Number.isFinite(input.score) ? input.score : 0,
    metadata: input.metadata,
  };

  const tx = db.transaction(RUNS_STORE, 'readwrite');
  tx.objectStore(RUNS_STORE).put(record);
  await transactionDone(tx);
  db.close();
  return record;
}

export async function listGameRuns(options?: {
  gameId?: string;
  playerId?: string;
  limit?: number;
}): Promise<GameRunRecord[]> {
  const db = await openRunsDb();
  if (!db) return [];

  const tx = db.transaction(RUNS_STORE, 'readonly');
  const rows = await requestToPromise(tx.objectStore(RUNS_STORE).getAll());
  await transactionDone(tx);
  db.close();

  const filtered = rows
    .filter((row) => !options?.gameId || row.gameId === options.gameId)
    .filter((row) => !options?.playerId || row.playerId === options.playerId)
    .sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt));

  const limit = options?.limit ?? 200;
  return filtered.slice(0, Math.max(0, limit));
}
