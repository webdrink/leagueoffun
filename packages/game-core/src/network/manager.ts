import {
  AuthoritativeRoomState,
  JoinRequestPayload,
  MultiplayerEnvelope,
  PlayerInputPayload,
  PlayerReadyPayload,
  RoomPlayerInfo,
  RoomRole,
  StatePatchPayload,
  createEnvelope,
  sanitizeRoomCode
} from './protocol';
import { useMultiplayerStore } from './store';
import { RoomTransport, TransportStartOptions } from './transport';
import { RelayBootstrapP2PTransport } from './transports/RelayBootstrapP2PTransport';
import { ManualUrlSignalingTransport } from './transports/ManualUrlSignalingTransport';
import { applyPlayerInput } from './reducer';

const CLIENT_VERSION = 'v1';
const JOIN_RETRY_INTERVAL_MS = 2500;
const SNAPSHOT_EVERY_ACTIONS = 6;

export interface MultiplayerSessionCallbacks {
  onPlayerInput?: (payload: PlayerInputPayload, senderPlayerId: string) => void;
  onStatePatch?: (patch: StatePatchPayload) => void;
  onStateSnapshot?: (snapshot: AuthoritativeRoomState) => void;
  onPlayersUpdated?: (players: RoomPlayerInfo[]) => void;
  onError?: (error: string) => void;
}

export interface MultiplayerStartOptions {
  appId: string;
  roomId: string;
  role: RoomRole;
  selfPlayerId: string;
  selfDisplayName: string;
  manualOfferToken?: string | null;
  playerInputReducer?: (state: AuthoritativeRoomState, input: PlayerInputPayload) => AuthoritativeRoomState;
}

export class MultiplayerSessionManager {
  private callbacks: MultiplayerSessionCallbacks = {};
  private transport: RoomTransport | null = null;
  private relayTransport: RelayBootstrapP2PTransport | null = null;
  private manualTransport: ManualUrlSignalingTransport | null = null;

  private started = false;
  private seq = 0;
  private latestRevision = 0;
  private role: RoomRole | null = null;
  private appId = '';
  private roomId = '';
  private selfPlayerId = '';
  private selfDisplayName = '';

  private hostPeerId: string | null = null;
  private hostPlayerId: string | null = null;
  private joinedByController = false;

  private peerToPlayer = new Map<string, string>();
  private dedupeBySender = new Map<string, number>();
  private joinRetryTimer: ReturnType<typeof setInterval> | null = null;
  private patchesSinceSnapshot = 0;
  private playerInputReducer: ((state: AuthoritativeRoomState, input: PlayerInputPayload) => AuthoritativeRoomState) | null = null;

  setCallbacks(callbacks: MultiplayerSessionCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async start(options: MultiplayerStartOptions): Promise<void> {
    if (this.started) {
      await this.stop();
    }

    this.started = true;
    this.role = options.role;
    this.appId = options.appId;
    this.roomId = sanitizeRoomCode(options.roomId);
    this.selfPlayerId = options.selfPlayerId;
    this.selfDisplayName = options.selfDisplayName;
    this.playerInputReducer = options.playerInputReducer ?? null;

    const store = useMultiplayerStore.getState();
    store.reset();
    store.setEnabled(true);
    store.setRole(options.role);
    store.setRoomId(this.roomId);
    store.setSelfIdentity(this.selfPlayerId, this.selfDisplayName);
    store.setStatus('connecting');
    store.setTransport('relay');

    if (options.role === 'host') {
      this.hostPlayerId = this.selfPlayerId;
      this.upsertPlayer({
        id: this.selfPlayerId,
        name: this.selfDisplayName,
        isHost: true,
        ready: true,
        connected: true,
        joinedAt: Date.now()
      });
      store.setHostPlayerId(this.selfPlayerId);
    }

    this.relayTransport = new RelayBootstrapP2PTransport();
    this.transport = this.relayTransport;

    this.bindTransport(this.relayTransport, {
      appId: options.appId,
      roomId: this.roomId,
      role: options.role,
      selfPlayerId: options.selfPlayerId,
      fallbackTimeoutMs: 10000
    });

    await this.relayTransport.start({
      appId: options.appId,
      roomId: this.roomId,
      role: options.role,
      selfPlayerId: options.selfPlayerId,
      fallbackTimeoutMs: 10000
    });

    await this.sendHello();

    if (options.role === 'controller') {
      this.startJoinRetry();
    }

    if (options.manualOfferToken && options.role === 'controller') {
      await this.enableManualFallback('Manual offer token provided in URL.', options.manualOfferToken);
    }
  }

  async stop(): Promise<void> {
    this.started = false;

    if (this.joinRetryTimer) {
      clearInterval(this.joinRetryTimer);
      this.joinRetryTimer = null;
    }

    if (this.transport) {
      try {
        await this.transport.stop();
      } catch {
        // Ignore shutdown errors.
      }
    }

    if (this.manualTransport && this.transport !== this.manualTransport) {
      try {
        await this.manualTransport.stop();
      } catch {
        // Ignore shutdown errors.
      }
    }

    this.transport = null;
    this.relayTransport = null;
    this.manualTransport = null;
    this.appId = '';
    this.seq = 0;
    this.latestRevision = 0;
    this.playerInputReducer = null;
    this.peerToPlayer.clear();
    this.dedupeBySender.clear();
    this.hostPeerId = null;
    this.hostPlayerId = null;
    this.joinedByController = false;

    useMultiplayerStore.getState().reset();
  }

  isHost(): boolean {
    return this.role === 'host';
  }

  isController(): boolean {
    return this.role === 'controller';
  }

  getRoomId(): string {
    return this.roomId;
  }

  getRole(): RoomRole | null {
    return this.role;
  }

  async sendReady(ready: boolean): Promise<void> {
    if (this.isHost()) {
      this.applyPlayerReady({ playerId: this.selfPlayerId, ready });
      await this.broadcastPlayersSnapshot();
      return;
    }

    await this.sendEnvelope(
      'PLAYER_READY',
      {
        playerId: this.selfPlayerId,
        ready
      } satisfies PlayerReadyPayload,
      this.hostPeerId ?? undefined
    );
  }

  async sendPlayerInput(action: string, payload?: unknown): Promise<void> {
    const message: PlayerInputPayload = {
      playerId: this.selfPlayerId,
      action,
      payload
    };

    if (this.isHost()) {
      this.callbacks.onPlayerInput?.(message, this.selfPlayerId);
      return;
    }

    await this.sendEnvelope('PLAYER_INPUT', message, this.hostPeerId ?? undefined);
  }

  async broadcastStatePatch(patch: Omit<StatePatchPayload, 'originPlayerId' | 'revision'> & { originPlayerId?: string }): Promise<void> {
    if (!this.isHost()) {
      return;
    }

    this.latestRevision += 1;

    await this.broadcastEnvelope('STATE_PATCH', {
      ...patch,
      originPlayerId: patch.originPlayerId ?? this.selfPlayerId,
      revision: this.latestRevision
    } satisfies StatePatchPayload);

    this.patchesSinceSnapshot += 1;
    if (this.patchesSinceSnapshot < SNAPSHOT_EVERY_ACTIONS) {
      return;
    }

    const current = useMultiplayerStore.getState().authoritativeState;
    if (!current) {
      return;
    }

    const { revision: _revision, ...snapshotWithoutRevision } = current;
    await this.broadcastStateSnapshot(snapshotWithoutRevision);
  }

  async broadcastStateSnapshot(snapshot: Omit<AuthoritativeRoomState, 'revision'>): Promise<void> {
    if (!this.isHost()) {
      return;
    }

    this.latestRevision += 1;
    this.patchesSinceSnapshot = 0;

    const enrichedState: AuthoritativeRoomState = {
      ...snapshot,
      revision: this.latestRevision
    };

    useMultiplayerStore.getState().setAuthoritativeState(enrichedState);

    await this.broadcastEnvelope('STATE_SNAPSHOT', {
      state: enrichedState
    });
  }

  getManualOfferToken(): string | null {
    return this.manualTransport?.getOfferToken() ?? null;
  }

  getManualAnswerToken(): string | null {
    return this.manualTransport?.getAnswerToken() ?? null;
  }

  async applyManualOfferToken(token: string): Promise<void> {
    if (!this.manualTransport) {
      await this.enableManualFallback('Manual offer flow requested.', token);
      return;
    }

    if (this.isHost()) {
      return;
    }

    await this.manualTransport.acceptOfferToken(token);
    const answerToken = this.manualTransport.getAnswerToken();
    useMultiplayerStore.getState().setManualAnswerToken(answerToken);
    useMultiplayerStore.getState().setStatus('manual-ready');
  }

  async applyManualAnswerToken(token: string): Promise<void> {
    if (!this.manualTransport || !this.isHost()) {
      return;
    }

    await this.manualTransport.acceptAnswerToken(token);
    useMultiplayerStore.getState().setStatus('manual-ready');
  }

  private bindTransport(transport: RoomTransport, startOptions: TransportStartOptions) {
    transport.setHandlers({
      onReady: () => {
        const store = useMultiplayerStore.getState();
        store.setStatus('connected');
        store.setTransport(transport.kind);
        store.setPeerIds(transport.getPeerIds());
      },
      onPeerJoin: async (peerId) => {
        useMultiplayerStore.getState().setPeerIds(transport.getPeerIds());
        await this.sendHello(peerId);

        if (this.isHost()) {
          await this.broadcastPlayersSnapshot();
        }
      },
      onPeerLeave: (peerId) => {
        const playerId = this.peerToPlayer.get(peerId);
        if (playerId) {
          this.markPlayerDisconnected(playerId);
          this.peerToPlayer.delete(peerId);
        }

        useMultiplayerStore.getState().setPeerIds(transport.getPeerIds());
      },
      onMessage: (envelope, ctx) => {
        this.handleEnvelope(envelope, ctx.peerId).catch((error) => {
          const message = error instanceof Error ? error.message : 'Failed to process multiplayer message.';
          useMultiplayerStore.getState().setError(message);
          this.callbacks.onError?.(message);
        });
      },
      onError: (error) => {
        useMultiplayerStore.getState().setError(error);
        useMultiplayerStore.getState().setStatus('error');
        this.callbacks.onError?.(error);
      },
      onFallbackHint: async (reason) => {
        if (!this.started || transport.kind === 'manual') {
          return;
        }

        await this.enableManualFallback(reason, startOptions.manualOfferToken);
      }
    });
  }

  private async enableManualFallback(reason: string, manualOfferToken?: string | null) {
    const store = useMultiplayerStore.getState();
    store.setFallbackReason(reason);
    store.setStatus('fallback-required');

    if (this.relayTransport && this.transport === this.relayTransport) {
      try {
        await this.relayTransport.stop();
      } catch {
        // Ignore shutdown errors.
      }
      this.relayTransport = null;
    }

    this.manualTransport = new ManualUrlSignalingTransport();
    this.transport = this.manualTransport;
    const manualAppId = this.appId ? `${this.appId}-manual` : 'leagueoffun-room-manual';

    this.bindTransport(this.manualTransport, {
      appId: manualAppId,
      roomId: this.roomId,
      role: this.role || 'controller',
      selfPlayerId: this.selfPlayerId,
      manualOfferToken: manualOfferToken ?? null
    });

    await this.manualTransport.start({
      appId: manualAppId,
      roomId: this.roomId,
      role: this.role || 'controller',
      selfPlayerId: this.selfPlayerId,
      manualOfferToken: manualOfferToken ?? null
    });

    store.setTransport('manual');

    const offerToken = this.manualTransport.getOfferToken();
    const answerToken = this.manualTransport.getAnswerToken();

    store.setManualOfferToken(offerToken);
    store.setManualAnswerToken(answerToken);

    if (this.isHost()) {
      store.setStatus(offerToken ? 'manual-ready' : 'manual-awaiting-token');
      return;
    }

    store.setStatus(answerToken ? 'manual-ready' : 'manual-awaiting-token');
  }

  private startJoinRetry() {
    if (this.joinRetryTimer) {
      clearInterval(this.joinRetryTimer);
      this.joinRetryTimer = null;
    }

    this.joinRetryTimer = setInterval(() => {
      if (this.joinedByController || !this.started || !this.isController()) {
        return;
      }

      this.sendJoinRequest().catch(() => {
        // Ignore retry errors.
      });
    }, JOIN_RETRY_INTERVAL_MS);
  }

  private async handleEnvelope(envelope: MultiplayerEnvelope, peerId: string): Promise<void> {
    if (envelope.roomId !== this.roomId) {
      return;
    }

    if (envelope.senderId === this.selfPlayerId) {
      return;
    }

    const lastSeq = this.dedupeBySender.get(envelope.senderId) ?? -1;
    if (envelope.seq <= lastSeq) {
      return;
    }

    this.dedupeBySender.set(envelope.senderId, envelope.seq);

    switch (envelope.type) {
      case 'HELLO': {
        const payload = envelope.payload as {
          playerId: string;
          displayName: string;
          role: RoomRole;
        };

        if (payload.playerId !== envelope.senderId) {
          return;
        }

        this.peerToPlayer.set(peerId, payload.playerId);

        if (payload.role === 'host') {
          this.hostPeerId = peerId;
          this.hostPlayerId = payload.playerId;
          useMultiplayerStore.getState().setHostPlayerId(payload.playerId);
        }

        if (this.isHost()) {
          this.upsertPlayer({
            id: payload.playerId,
            name: payload.displayName,
            isHost: payload.role === 'host',
            ready: false,
            connected: true,
            joinedAt: Date.now()
          });

          await this.sendJoinAccept(peerId);
        }

        if (this.isController() && this.hostPeerId) {
          await this.sendJoinRequest();
        }
        break;
      }

      case 'JOIN_REQUEST': {
        if (!this.isHost()) {
          return;
        }

        const payload = envelope.payload as JoinRequestPayload;
        if (payload.playerId !== envelope.senderId) {
          return;
        }

        this.peerToPlayer.set(peerId, payload.playerId);

        this.upsertPlayer({
          id: payload.playerId,
          name: payload.displayName,
          isHost: false,
          ready: false,
          connected: true,
          joinedAt: Date.now()
        });

        await this.sendJoinAccept(peerId);
        await this.broadcastPlayersSnapshot();
        break;
      }

      case 'JOIN_ACCEPT': {
        if (!this.isController()) {
          return;
        }

        const payload = envelope.payload as {
          accepted: boolean;
          hostPlayerId: string;
          players: RoomPlayerInfo[];
        };

        if (!payload.accepted) {
          return;
        }

        if (payload.hostPlayerId !== envelope.senderId) {
          return;
        }

        if (this.hostPlayerId && this.hostPlayerId !== envelope.senderId) {
          return;
        }

        this.joinedByController = true;
        this.hostPeerId = peerId;
        this.hostPlayerId = payload.hostPlayerId;

        const store = useMultiplayerStore.getState();
        store.setHostPlayerId(payload.hostPlayerId);
        store.setPlayers(payload.players);

        if (this.joinRetryTimer) {
          clearInterval(this.joinRetryTimer);
          this.joinRetryTimer = null;
        }
        break;
      }

      case 'PLAYER_READY': {
        if (!this.isHost()) {
          return;
        }

        const payload = envelope.payload as PlayerReadyPayload;
        if (payload.playerId !== envelope.senderId) {
          return;
        }

        const mappedPlayerId = this.peerToPlayer.get(peerId);
        if (mappedPlayerId && mappedPlayerId !== payload.playerId) {
          return;
        }

        this.applyPlayerReady(payload);
        await this.broadcastPlayersSnapshot();
        break;
      }

      case 'PLAYER_INPUT': {
        if (!this.isHost()) {
          return;
        }

        const payload = envelope.payload as PlayerInputPayload;
        if (payload.playerId !== envelope.senderId) {
          return;
        }

        const mappedPlayerId = this.peerToPlayer.get(peerId);
        if (mappedPlayerId && mappedPlayerId !== payload.playerId) {
          return;
        }

        const currentState = useMultiplayerStore.getState().authoritativeState;
        if (currentState) {
          const reducer = this.playerInputReducer ?? applyPlayerInput;
          useMultiplayerStore.getState().setAuthoritativeState(reducer(currentState, payload));
        }
        this.callbacks.onPlayerInput?.(payload, envelope.senderId);
        break;
      }

      case 'STATE_PATCH': {
        if (!this.isController()) {
          return;
        }

        if (!this.hostPlayerId || envelope.senderId !== this.hostPlayerId) {
          return;
        }

        const patch = envelope.payload as StatePatchPayload;
        this.latestRevision = Math.max(this.latestRevision, patch.revision);
        this.callbacks.onStatePatch?.(patch);
        break;
      }

      case 'STATE_SNAPSHOT': {
        if (!this.isController()) {
          return;
        }

        if (!this.hostPlayerId || envelope.senderId !== this.hostPlayerId) {
          return;
        }

        const snapshot = (envelope.payload as { state: AuthoritativeRoomState }).state;
        this.latestRevision = Math.max(this.latestRevision, snapshot.revision);
        useMultiplayerStore.getState().setAuthoritativeState(snapshot);
        this.callbacks.onStateSnapshot?.(snapshot);
        break;
      }

      case 'LEAVE': {
        const payload = envelope.payload as { playerId: string };
        this.markPlayerDisconnected(payload.playerId);

        if (this.isHost()) {
          await this.broadcastPlayersSnapshot();
        }
        break;
      }

      case 'HOST_TRANSFER_INTENT':
      case 'ACK':
      default:
        break;
    }
  }

  private async sendHello(targetPeerId?: string): Promise<void> {
    const payload = {
      playerId: this.selfPlayerId,
      displayName: this.selfDisplayName,
      role: this.role,
      clientVersion: CLIENT_VERSION
    };

    if (!payload.role) {
      return;
    }

    if (targetPeerId) {
      await this.sendEnvelope('HELLO', payload, targetPeerId);
      return;
    }

    await this.broadcastEnvelope('HELLO', payload);
  }

  private async sendJoinRequest(): Promise<void> {
    const payload: JoinRequestPayload = {
      playerId: this.selfPlayerId,
      displayName: this.selfDisplayName
    };

    if (this.hostPeerId) {
      await this.sendEnvelope('JOIN_REQUEST', payload, this.hostPeerId);
      return;
    }

    await this.broadcastEnvelope('JOIN_REQUEST', payload);
  }

  private async sendJoinAccept(targetPeerId: string): Promise<void> {
    if (!this.hostPlayerId) {
      return;
    }

    await this.sendEnvelope(
      'JOIN_ACCEPT',
      {
        accepted: true,
        hostPlayerId: this.hostPlayerId,
        players: useMultiplayerStore.getState().players
      },
      targetPeerId
    );
  }

  private async broadcastPlayersSnapshot(): Promise<void> {
    if (!this.hostPlayerId) {
      return;
    }

    await this.broadcastEnvelope('JOIN_ACCEPT', {
      accepted: true,
      hostPlayerId: this.hostPlayerId,
      players: useMultiplayerStore.getState().players
    });
  }

  private async sendEnvelope(
    type: MultiplayerEnvelope['type'],
    payload: unknown,
    targetPeerId?: string
  ): Promise<void> {
    if (!this.transport) {
      return;
    }

    const envelope = createEnvelope(type, this.roomId, this.selfPlayerId, this.seq++, payload) as MultiplayerEnvelope;
    if (targetPeerId) {
      await this.transport.send(envelope, targetPeerId);
      return;
    }

    await this.transport.broadcast(envelope);
  }

  private async broadcastEnvelope(
    type: MultiplayerEnvelope['type'],
    payload: unknown
  ): Promise<void> {
    if (!this.transport) {
      return;
    }

    const envelope = createEnvelope(type, this.roomId, this.selfPlayerId, this.seq++, payload) as MultiplayerEnvelope;
    await this.transport.broadcast(envelope);
  }

  private applyPlayerReady(payload: PlayerReadyPayload) {
    const players = useMultiplayerStore.getState().players;
    const target = players.find((player) => player.id === payload.playerId);
    if (!target) {
      return;
    }

    this.upsertPlayer({ ...target, ready: payload.ready });
  }

  private markPlayerDisconnected(playerId: string) {
    const players = useMultiplayerStore.getState().players;
    const target = players.find((player) => player.id === playerId);
    if (!target) {
      return;
    }

    this.upsertPlayer({ ...target, connected: false, ready: false });
  }

  private upsertPlayer(player: RoomPlayerInfo) {
    const store = useMultiplayerStore.getState();
    store.upsertPlayer(player);
    this.callbacks.onPlayersUpdated?.(useMultiplayerStore.getState().players);
  }
}
