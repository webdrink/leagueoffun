import { joinRoom, selfId, type Room } from 'trystero/torrent';
import { parseEnvelope, type MultiplayerEnvelope } from '../protocol';
import { RoomTransport, TransportHandlers, TransportStartOptions } from '../transport';

const ACTION_NAMESPACE = 'leagueoffun-envelope-v1';

const noopHandlers: TransportHandlers = {
  onReady: () => undefined,
  onMessage: () => undefined,
  onPeerJoin: () => undefined,
  onPeerLeave: () => undefined,
  onError: () => undefined,
  onFallbackHint: () => undefined
};

export class RelayBootstrapP2PTransport implements RoomTransport {
  readonly kind = 'relay' as const;

  private handlers: TransportHandlers = noopHandlers;
  private room: Room | null = null;
  private sendEnvelope: ((data: string, targetPeerId?: string | string[] | null) => Promise<void[]>) | null = null;
  private peerIds = new Set<string>();
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private selfPeerId = '';

  setHandlers(handlers: Partial<TransportHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  async start(options: TransportStartOptions): Promise<void> {
    this.selfPeerId = selfId || options.selfPlayerId;

    try {
      this.room = joinRoom(
        {
          appId: options.appId,
          relayRedundancy: 2
        },
        options.roomId
      );

      const [sendEnvelope, receiveEnvelope] = this.room.makeAction<string>(ACTION_NAMESPACE);
      this.sendEnvelope = sendEnvelope;

      receiveEnvelope((rawEnvelope, peerId) => {
        let decoded: unknown = null;
        try {
          decoded = JSON.parse(rawEnvelope);
        } catch {
          this.handlers.onError('Failed to decode relay message.');
          return;
        }

        const parsed = parseEnvelope(decoded);
        if (!parsed) {
          this.handlers.onError('Dropped malformed relay message.');
          return;
        }
        this.handlers.onMessage(parsed, { peerId });
      });

      this.room.onPeerJoin((peerId) => {
        this.peerIds.add(peerId);
        this.handlers.onPeerJoin(peerId);
      });

      this.room.onPeerLeave((peerId) => {
        this.peerIds.delete(peerId);
        this.handlers.onPeerLeave(peerId);
      });

      if (this.fallbackTimer) {
        clearTimeout(this.fallbackTimer);
      }

      const timeoutMs = options.fallbackTimeoutMs ?? 12000;
      this.fallbackTimer = setTimeout(() => {
        if (this.peerIds.size === 0) {
          this.handlers.onFallbackHint('No peers discovered via relay bootstrap timeout.');
        }
      }, timeoutMs);

      this.handlers.onReady();
    } catch (error) {
      this.handlers.onError(
        `Failed to start relay transport: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    if (this.room) {
      try {
        await this.room.leave();
      } catch {
        // Ignore shutdown errors.
      }
    }

    this.room = null;
    this.sendEnvelope = null;
    this.peerIds.clear();
  }

  async send(message: MultiplayerEnvelope, targetPeerId: string): Promise<void> {
    if (!this.sendEnvelope) {
      throw new Error('Relay transport not initialized.');
    }

    await this.sendEnvelope(JSON.stringify(message), targetPeerId);
  }

  async broadcast(message: MultiplayerEnvelope): Promise<void> {
    if (!this.sendEnvelope) {
      throw new Error('Relay transport not initialized.');
    }

    await this.sendEnvelope(JSON.stringify(message), null);
  }

  getPeerIds(): string[] {
    return Array.from(this.peerIds);
  }

  getSelfPeerId(): string {
    return this.selfPeerId;
  }
}
