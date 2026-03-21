import { z } from 'zod';

export type RoomRole = 'host' | 'controller';

export type MultiplayerMessageType =
  | 'HELLO'
  | 'JOIN_REQUEST'
  | 'JOIN_ACCEPT'
  | 'PLAYER_READY'
  | 'PLAYER_INPUT'
  | 'STATE_SNAPSHOT'
  | 'STATE_PATCH'
  | 'ACK'
  | 'LEAVE'
  | 'HOST_TRANSFER_INTENT';

export interface RoomPlayerInfo {
  id: string;
  name: string;
  ready: boolean;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
}

export interface AuthoritativeRoomState {
  phaseId: string;
  providerIndex: number;
  players: RoomPlayerInfo[];
  currentPlayerId: string | null;
  selectedTargetId: string | null;
  reveal: boolean;
  revision: number;
}

export interface HelloPayload {
  playerId: string;
  displayName: string;
  role: RoomRole;
  clientVersion: string;
}

export interface JoinRequestPayload {
  playerId: string;
  displayName: string;
}

export interface JoinAcceptPayload {
  accepted: boolean;
  hostPlayerId: string;
  players: RoomPlayerInfo[];
}

export interface PlayerReadyPayload {
  playerId: string;
  ready: boolean;
}

export interface PlayerInputPayload {
  playerId: string;
  action: string;
  payload?: unknown;
}

export interface StateSnapshotPayload {
  state: AuthoritativeRoomState;
}

export interface StatePatchPayload {
  action: string;
  payload?: unknown;
  originPlayerId: string;
  phaseId: string;
  providerIndex: number;
  revision: number;
}

export interface AckPayload {
  ackSeq: number;
}

export interface LeavePayload {
  playerId: string;
  reason?: string;
}

export interface HostTransferIntentPayload {
  fromPlayerId: string;
  toPlayerId?: string;
}

export type MultiplayerPayload =
  | HelloPayload
  | JoinRequestPayload
  | JoinAcceptPayload
  | PlayerReadyPayload
  | PlayerInputPayload
  | StateSnapshotPayload
  | StatePatchPayload
  | AckPayload
  | LeavePayload
  | HostTransferIntentPayload;

export interface MultiplayerEnvelope<TPayload = MultiplayerPayload> {
  type: MultiplayerMessageType;
  roomId: string;
  senderId: string;
  seq: number;
  ts: number;
  payload: TPayload;
}

const RoomRoleSchema = z.enum(['host', 'controller']);

const RoomPlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ready: z.boolean(),
  isHost: z.boolean(),
  connected: z.boolean(),
  joinedAt: z.number().int().nonnegative()
});

const AuthoritativeRoomStateSchema = z.object({
  phaseId: z.string().min(1),
  providerIndex: z.number().int().min(0),
  players: z.array(RoomPlayerSchema),
  currentPlayerId: z.string().nullable(),
  selectedTargetId: z.string().nullable(),
  reveal: z.boolean(),
  revision: z.number().int().min(0)
});

const PayloadSchemas: Record<MultiplayerMessageType, z.ZodTypeAny> = {
  HELLO: z.object({
    playerId: z.string().min(1),
    displayName: z.string().min(1),
    role: RoomRoleSchema,
    clientVersion: z.string().min(1)
  }),
  JOIN_REQUEST: z.object({
    playerId: z.string().min(1),
    displayName: z.string().min(1)
  }),
  JOIN_ACCEPT: z.object({
    accepted: z.boolean(),
    hostPlayerId: z.string().min(1),
    players: z.array(RoomPlayerSchema)
  }),
  PLAYER_READY: z.object({
    playerId: z.string().min(1),
    ready: z.boolean()
  }),
  PLAYER_INPUT: z.object({
    playerId: z.string().min(1),
    action: z.string().min(1),
    payload: z.unknown().optional()
  }),
  STATE_SNAPSHOT: z.object({
    state: AuthoritativeRoomStateSchema
  }),
  STATE_PATCH: z.object({
    action: z.string().min(1),
    payload: z.unknown().optional(),
    originPlayerId: z.string().min(1),
    phaseId: z.string().min(1),
    providerIndex: z.number().int().min(0),
    revision: z.number().int().min(0)
  }),
  ACK: z.object({
    ackSeq: z.number().int().min(0)
  }),
  LEAVE: z.object({
    playerId: z.string().min(1),
    reason: z.string().min(1).optional()
  }),
  HOST_TRANSFER_INTENT: z.object({
    fromPlayerId: z.string().min(1),
    toPlayerId: z.string().min(1).optional()
  })
};

const EnvelopeBaseSchema = z.object({
  type: z.enum([
    'HELLO',
    'JOIN_REQUEST',
    'JOIN_ACCEPT',
    'PLAYER_READY',
    'PLAYER_INPUT',
    'STATE_SNAPSHOT',
    'STATE_PATCH',
    'ACK',
    'LEAVE',
    'HOST_TRANSFER_INTENT'
  ]),
  roomId: z.string().min(1),
  senderId: z.string().min(1),
  seq: z.number().int().min(0),
  ts: z.number().int().min(0),
  payload: z.unknown()
});

export function parseEnvelope(input: unknown): MultiplayerEnvelope | null {
  const base = EnvelopeBaseSchema.safeParse(input);
  if (!base.success) {
    return null;
  }

  const payloadSchema = PayloadSchemas[base.data.type];
  const payload = payloadSchema.safeParse(base.data.payload);
  if (!payload.success) {
    return null;
  }

  return {
    ...base.data,
    payload: payload.data
  };
}

export function createEnvelope<TPayload>(
  type: MultiplayerMessageType,
  roomId: string,
  senderId: string,
  seq: number,
  payload: TPayload
): MultiplayerEnvelope<TPayload> {
  return {
    type,
    roomId,
    senderId,
    seq,
    ts: Date.now(),
    payload
  };
}

export function sanitizeRoomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}
