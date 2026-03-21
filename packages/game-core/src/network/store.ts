import { create } from 'zustand';
import { AuthoritativeRoomState, RoomPlayerInfo, RoomRole } from './protocol';

export type MultiplayerStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'fallback-required'
  | 'manual-awaiting-token'
  | 'manual-ready'
  | 'error';

export interface MultiplayerState {
  enabled: boolean;
  role: RoomRole | null;
  roomId: string | null;
  status: MultiplayerStatus;
  transport: 'relay' | 'manual' | null;
  selfPlayerId: string | null;
  selfDisplayName: string;
  hostPlayerId: string | null;
  players: RoomPlayerInfo[];
  peerIds: string[];
  fallbackReason: string | null;
  error: string | null;
  manualOfferToken: string | null;
  manualAnswerToken: string | null;
  authoritativeState: AuthoritativeRoomState | null;
}

export interface MultiplayerActions {
  reset: () => void;
  setEnabled: (enabled: boolean) => void;
  setRole: (role: RoomRole | null) => void;
  setRoomId: (roomId: string | null) => void;
  setStatus: (status: MultiplayerStatus) => void;
  setTransport: (transport: 'relay' | 'manual' | null) => void;
  setSelfIdentity: (playerId: string, displayName: string) => void;
  setHostPlayerId: (hostPlayerId: string | null) => void;
  setPlayers: (players: RoomPlayerInfo[]) => void;
  upsertPlayer: (player: RoomPlayerInfo) => void;
  setPeerIds: (peerIds: string[]) => void;
  setFallbackReason: (reason: string | null) => void;
  setError: (error: string | null) => void;
  setManualOfferToken: (token: string | null) => void;
  setManualAnswerToken: (token: string | null) => void;
  setAuthoritativeState: (state: AuthoritativeRoomState | null) => void;
}

export type MultiplayerStore = MultiplayerState & MultiplayerActions;

const initialState: MultiplayerState = {
  enabled: false,
  role: null,
  roomId: null,
  status: 'idle',
  transport: null,
  selfPlayerId: null,
  selfDisplayName: '',
  hostPlayerId: null,
  players: [],
  peerIds: [],
  fallbackReason: null,
  error: null,
  manualOfferToken: null,
  manualAnswerToken: null,
  authoritativeState: null
};

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  ...initialState,

  reset: () => set({ ...initialState }),

  setEnabled: (enabled) => set({ enabled }),

  setRole: (role) => set({ role }),

  setRoomId: (roomId) => set({ roomId }),

  setStatus: (status) => set({ status }),

  setTransport: (transport) => set({ transport }),

  setSelfIdentity: (playerId, displayName) => set({ selfPlayerId: playerId, selfDisplayName: displayName }),

  setHostPlayerId: (hostPlayerId) => set({ hostPlayerId }),

  setPlayers: (players) => set({ players }),

  upsertPlayer: (player) => {
    set((state) => {
      const index = state.players.findIndex((entry) => entry.id === player.id);
      if (index === -1) {
        return { players: [...state.players, player] };
      }

      const next = [...state.players];
      next[index] = player;
      return { players: next };
    });
  },

  setPeerIds: (peerIds) => set({ peerIds }),

  setFallbackReason: (fallbackReason) => set({ fallbackReason }),

  setError: (error) => set({ error }),

  setManualOfferToken: (manualOfferToken) => set({ manualOfferToken }),

  setManualAnswerToken: (manualAnswerToken) => set({ manualAnswerToken }),

  setAuthoritativeState: (authoritativeState) => set({ authoritativeState })
}));
