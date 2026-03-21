export type GameAppKey = 'gamepicker' | 'blamegame' | 'hookhunt';

export interface PlayerSessionContext {
  playerId: string;
  returnUrl: string | null;
}

const ROOT_PLAYER_ID_KEY = 'leagueoffun.playerId';
const ROOT_RETURN_URL_KEY = 'leagueoffun.returnUrl';
const PLAYER_ID_COOKIE = 'leagueoffun_player_id';

const GAME_PLAYER_ID_KEYS: Record<GameAppKey, string> = {
  gamepicker: 'leagueoffun.playerId',
  blamegame: 'blamegame.playerId',
  hookhunt: 'hookhunt.playerId',
};

const GAME_RETURN_URL_KEYS: Partial<Record<GameAppKey, string>> = {
  blamegame: 'blamegame.returnUrl',
  hookhunt: 'hookhunt.returnUrl',
};

const LEGACY_PLAYER_KEYS = [
  ROOT_PLAYER_ID_KEY,
  'blamegame.playerId',
  'hookhunt.playerId',
];

const SESSION_QUERY_KEYS = ['playerId', 'returnUrl', 'gameId', 'score', 'playedAt'];

function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore quota and storage access errors.
  }
}

function normalizeValue(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getCookieValue(name: string): string | null {
  try {
    const cookieString = document.cookie || '';
    if (!cookieString) return null;
    const cookies = cookieString.split(';').map((cookie) => cookie.trim());
    for (const cookie of cookies) {
      if (!cookie.startsWith(`${name}=`)) continue;
      return normalizeValue(decodeURIComponent(cookie.slice(name.length + 1)));
    }
    return null;
  } catch {
    return null;
  }
}

function getCookieDomain(hostname: string): string | null {
  if (hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return null;
  }
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length < 2) return null;
  return `.${parts.slice(-2).join('.')}`;
}

function persistPlayerIdCookie(playerId: string) {
  try {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    const cookieDomain = getCookieDomain(window.location.hostname);
    const domain = cookieDomain ? `; Domain=${cookieDomain}` : '';
    document.cookie = `${PLAYER_ID_COOKIE}=${encodeURIComponent(playerId)}; Expires=${expires}; Path=/${domain}; SameSite=Lax${secure}`;
  } catch {
    // Ignore cookie write failures.
  }
}

function createPlayerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getStoredPlayerId(game: GameAppKey): string | null {
  const cookiePlayerId = getCookieValue(PLAYER_ID_COOKIE);
  if (cookiePlayerId) return cookiePlayerId;

  const preferredKeys = [GAME_PLAYER_ID_KEYS[game], ROOT_PLAYER_ID_KEY, ...LEGACY_PLAYER_KEYS];
  const dedupedKeys = Array.from(new Set(preferredKeys));
  for (const key of dedupedKeys) {
    const value = normalizeValue(safeStorageGet(key));
    if (value) return value;
  }
  return null;
}

function persistPlayerId(playerId: string, game: GameAppKey) {
  const keys = new Set<string>([ROOT_PLAYER_ID_KEY, ...LEGACY_PLAYER_KEYS, GAME_PLAYER_ID_KEYS[game]]);
  keys.forEach((key) => safeStorageSet(key, playerId));
  persistPlayerIdCookie(playerId);
}

function getStoredReturnUrl(game: GameAppKey): string | null {
  const gameKey = GAME_RETURN_URL_KEYS[game];
  const fromGame = gameKey ? normalizeValue(safeStorageGet(gameKey)) : null;
  if (fromGame) return fromGame;
  return normalizeValue(safeStorageGet(ROOT_RETURN_URL_KEY));
}

function persistReturnUrl(returnUrl: string, game: GameAppKey) {
  const normalized = normalizeValue(returnUrl);
  if (!normalized) return;
  safeStorageSet(ROOT_RETURN_URL_KEY, normalized);
  const gameKey = GAME_RETURN_URL_KEYS[game];
  if (gameKey) {
    safeStorageSet(gameKey, normalized);
  }
}

export function resolvePlayerSession(game: GameAppKey): PlayerSessionContext {
  const params = new URLSearchParams(window.location.search);
  const fromUrlPlayerId = normalizeValue(params.get('playerId'));
  const fromUrlReturnUrl = normalizeValue(params.get('returnUrl'));

  const playerId = fromUrlPlayerId || getStoredPlayerId(game) || createPlayerId();
  persistPlayerId(playerId, game);

  if (fromUrlReturnUrl) {
    persistReturnUrl(fromUrlReturnUrl, game);
  }

  return {
    playerId,
    returnUrl: fromUrlReturnUrl || getStoredReturnUrl(game),
  };
}

export function stripSessionParamsFromUrl() {
  const url = new URL(window.location.href);
  let changed = false;

  SESSION_QUERY_KEYS.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  });

  if (!changed) return;

  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
}
