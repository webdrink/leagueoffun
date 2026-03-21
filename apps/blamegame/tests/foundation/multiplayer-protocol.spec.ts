import { expect, test } from '@playwright/test';
import { applyPlayerInput } from '../../framework/network/reducer';
import { createEnvelope, parseEnvelope } from '../../framework/network/protocol';
import { parseInitialParams } from '../../framework/utils/url';

test.describe('Multiplayer protocol', () => {
  test('should parse room role and offer URL params', () => {
    const result = parseInitialParams({
      search: '?game=nameblame&playerId=p1&room=AB12&role=host&offer=token123'
    } as unknown as Location);

    expect(result).toEqual({
      game: 'nameblame',
      playerId: 'p1',
      roomId: 'AB12',
      role: 'host',
      offerToken: 'token123'
    });
  });

  test('should validate multiplayer envelopes with payload schemas', () => {
    const valid = createEnvelope('PLAYER_INPUT', 'AB12', 'p1', 1, {
      playerId: 'p1',
      action: 'SELECT_TARGET',
      payload: { targetPlayerId: 'p2' }
    });

    const parsedValid = parseEnvelope(valid);
    expect(parsedValid).not.toBeNull();

    const invalid = {
      ...valid,
      payload: {
        playerId: 'p1'
      }
    };

    const parsedInvalid = parseEnvelope(invalid);
    expect(parsedInvalid).toBeNull();
  });

  test('should apply deterministic host reducer transitions', () => {
    const initial = {
      phaseId: 'play',
      providerIndex: 3,
      players: [],
      currentPlayerId: 'p1',
      selectedTargetId: null,
      reveal: false,
      revision: 5
    };

    const selected = applyPlayerInput(initial, {
      playerId: 'p1',
      action: 'SELECT_TARGET',
      payload: { targetPlayerId: 'p2' }
    });

    expect(selected.selectedTargetId).toBe('p2');
    expect(selected.reveal).toBe(true);

    const advanced = applyPlayerInput(selected, {
      playerId: 'p1',
      action: 'ADVANCE'
    });

    expect(advanced.selectedTargetId).toBeNull();
    expect(advanced.reveal).toBe(false);
  });
});
