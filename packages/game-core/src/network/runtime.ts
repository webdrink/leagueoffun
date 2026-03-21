import { MultiplayerSessionManager } from './manager';

let activeSession: MultiplayerSessionManager | null = null;

export function getActiveMultiplayerSession(): MultiplayerSessionManager | null {
  return activeSession;
}

export function setActiveMultiplayerSession(session: MultiplayerSessionManager | null) {
  activeSession = session;
}

export function createMultiplayerSession(): MultiplayerSessionManager {
  const session = new MultiplayerSessionManager();
  activeSession = session;
  return session;
}
