import { AuthoritativeRoomState, PlayerInputPayload } from './protocol';

export type PlayerInputReducer = (
  state: AuthoritativeRoomState,
  input: PlayerInputPayload
) => AuthoritativeRoomState;

// Default reducer keeps backwards compatibility with NameBlame.
// Other games should pass `playerInputReducer` to `MultiplayerSessionManager.start`.
export function applyPlayerInput(
  state: AuthoritativeRoomState,
  input: PlayerInputPayload
): AuthoritativeRoomState {
  switch (input.action) {
    case 'SELECT_TARGET': {
      const payload = input.payload as { targetPlayerId?: string | null } | undefined;
      return {
        ...state,
        selectedTargetId: payload?.targetPlayerId ?? null,
        reveal: true
      };
    }
    case 'ADVANCE': {
      return {
        ...state,
        selectedTargetId: null,
        reveal: false
      };
    }
    default:
      return state;
  }
}
