import { MultiplayerEnvelope, RoomRole } from './protocol';

export type TransportKind = 'relay' | 'manual';

export interface TransportStartOptions {
  appId: string;
  roomId: string;
  role: RoomRole;
  selfPlayerId: string;
  fallbackTimeoutMs?: number;
  manualOfferToken?: string | null;
}

export interface TransportMessageContext {
  peerId: string;
}

export interface TransportHandlers {
  onReady: () => void;
  onMessage: (envelope: MultiplayerEnvelope, ctx: TransportMessageContext) => void;
  onPeerJoin: (peerId: string) => void;
  onPeerLeave: (peerId: string) => void;
  onError: (error: string) => void;
  onFallbackHint: (reason: string) => void;
}

export interface RoomTransport {
  kind: TransportKind;
  start(options: TransportStartOptions): Promise<void>;
  stop(): Promise<void>;
  setHandlers(handlers: Partial<TransportHandlers>): void;
  send(message: MultiplayerEnvelope, targetPeerId: string): Promise<void>;
  broadcast(message: MultiplayerEnvelope): Promise<void>;
  getPeerIds(): string[];
  getSelfPeerId(): string;
}
