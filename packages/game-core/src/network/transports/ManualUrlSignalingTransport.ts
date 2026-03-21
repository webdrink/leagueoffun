import { MultiplayerEnvelope, parseEnvelope } from '../protocol';
import { RoomTransport, TransportHandlers, TransportStartOptions } from '../transport';

interface SignalTokenPayload {
  roomId: string;
  peerId: string;
  sdp: RTCSessionDescriptionInit;
  candidates: RTCIceCandidateInit[];
}

const noopHandlers: TransportHandlers = {
  onReady: () => undefined,
  onMessage: () => undefined,
  onPeerJoin: () => undefined,
  onPeerLeave: () => undefined,
  onError: () => undefined,
  onFallbackHint: () => undefined
};

function encodeSignalToken(payload: SignalTokenPayload): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeSignalToken(token: string): SignalTokenPayload {
  const decoded = decodeURIComponent(escape(atob(token)));
  const parsed = JSON.parse(decoded) as SignalTokenPayload;
  if (!parsed.roomId || !parsed.peerId || !parsed.sdp) {
    throw new Error('Invalid manual signaling token.');
  }
  return parsed;
}

async function waitForIceGatheringComplete(pc: RTCPeerConnection, timeoutMs = 6000): Promise<void> {
  if (pc.iceGatheringState === 'complete') {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
    }, timeoutMs);

    const onStateChange = () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timeout);
        pc.removeEventListener('icegatheringstatechange', onStateChange);
        resolve();
      }
    };

    pc.addEventListener('icegatheringstatechange', onStateChange);
  });
}

export class ManualUrlSignalingTransport implements RoomTransport {
  readonly kind = 'manual' as const;

  private handlers: TransportHandlers = noopHandlers;
  private options: TransportStartOptions | null = null;
  private selfPeerId = '';
  private remotePeerId = '';
  private connection: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private offerToken: string | null = null;
  private answerToken: string | null = null;
  private gatheredCandidates: RTCIceCandidateInit[] = [];
  private peerIds = new Set<string>();

  setHandlers(handlers: Partial<TransportHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  async start(options: TransportStartOptions): Promise<void> {
    this.options = options;
    this.selfPeerId = `${options.selfPlayerId}-manual`;

    if (options.role === 'host') {
      await this.prepareHostOffer();
      this.handlers.onFallbackHint('MANUAL_OFFER_READY');
      this.handlers.onReady();
      return;
    }

    this.handlers.onReady();

    if (options.manualOfferToken) {
      await this.acceptOfferToken(options.manualOfferToken);
      return;
    }

    this.handlers.onFallbackHint('MANUAL_NEEDS_OFFER_TOKEN');
  }

  async stop(): Promise<void> {
    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // Ignore close errors.
      }
    }

    if (this.connection) {
      try {
        this.connection.close();
      } catch {
        // Ignore close errors.
      }
    }

    this.channel = null;
    this.connection = null;
    this.peerIds.clear();
  }

  async send(message: MultiplayerEnvelope, targetPeerId: string): Promise<void> {
    if (!this.channel || this.channel.readyState !== 'open') {
      throw new Error('Manual transport data channel not open.');
    }

    if (this.remotePeerId !== targetPeerId) {
      return;
    }

    this.channel.send(JSON.stringify(message));
  }

  async broadcast(message: MultiplayerEnvelope): Promise<void> {
    if (!this.channel || this.channel.readyState !== 'open') {
      throw new Error('Manual transport data channel not open.');
    }

    this.channel.send(JSON.stringify(message));
  }

  getPeerIds(): string[] {
    return Array.from(this.peerIds);
  }

  getSelfPeerId(): string {
    return this.selfPeerId;
  }

  getOfferToken(): string | null {
    return this.offerToken;
  }

  getAnswerToken(): string | null {
    return this.answerToken;
  }

  async acceptOfferToken(token: string): Promise<void> {
    if (!this.options) {
      throw new Error('Manual transport must be started before accepting offer token.');
    }

    const parsed = decodeSignalToken(token);
    this.remotePeerId = parsed.peerId;

    const pc = this.createPeerConnection();
    this.connection = pc;

    pc.ondatachannel = (event) => {
      this.attachDataChannel(event.channel, this.remotePeerId);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp));

    for (const candidate of parsed.candidates) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForIceGatheringComplete(pc);

    this.answerToken = encodeSignalToken({
      roomId: this.options.roomId,
      peerId: this.selfPeerId,
      sdp: pc.localDescription
        ? { type: pc.localDescription.type, sdp: pc.localDescription.sdp || '' }
        : answer,
      candidates: this.gatheredCandidates
    });

    this.handlers.onFallbackHint('MANUAL_ANSWER_READY');
  }

  async acceptAnswerToken(token: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Host manual connection not initialized.');
    }

    const parsed = decodeSignalToken(token);
    this.remotePeerId = parsed.peerId;

    await this.connection.setRemoteDescription(new RTCSessionDescription(parsed.sdp));

    for (const candidate of parsed.candidates) {
      await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private async prepareHostOffer(): Promise<void> {
    if (!this.options) {
      throw new Error('Manual transport options missing.');
    }

    const pc = this.createPeerConnection();
    this.connection = pc;

    const dataChannel = pc.createDataChannel('leagueoffun-manual');
    this.attachDataChannel(dataChannel, 'manual-controller');

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitForIceGatheringComplete(pc);

    this.offerToken = encodeSignalToken({
      roomId: this.options.roomId,
      peerId: this.selfPeerId,
      sdp: pc.localDescription
        ? { type: pc.localDescription.type, sdp: pc.localDescription.sdp || '' }
        : offer,
      candidates: this.gatheredCandidates
    });
  }

  private createPeerConnection(): RTCPeerConnection {
    this.gatheredCandidates = [];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.gatheredCandidates.push(event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        this.handlers.onError('Manual signaling connection failed.');
      }
    };

    return pc;
  }

  private attachDataChannel(channel: RTCDataChannel, peerId: string) {
    this.channel = channel;

    channel.onopen = () => {
      this.peerIds.add(peerId);
      this.handlers.onPeerJoin(peerId);
    };

    channel.onclose = () => {
      this.peerIds.delete(peerId);
      this.handlers.onPeerLeave(peerId);
    };

    channel.onerror = () => {
      this.handlers.onError('Manual signaling data channel error.');
    };

    channel.onmessage = (event) => {
      try {
        const raw = JSON.parse(String(event.data));
        const parsed = parseEnvelope(raw);
        if (!parsed) {
          this.handlers.onError('Dropped malformed manual transport message.');
          return;
        }

        this.handlers.onMessage(parsed, { peerId });
      } catch {
        this.handlers.onError('Failed to decode manual transport message.');
      }
    };
  }
}
