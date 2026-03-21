import { RoomRole, sanitizeRoomCode } from '../protocol';

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length = 4): string {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join('');
}

interface RoomUrlOptions {
  gameId: string;
  roomId: string;
  role: RoomRole;
  offerToken?: string | null;
}

export function buildRoomUrl(baseHref: string, options: RoomUrlOptions): string {
  const url = new URL(baseHref);
  url.searchParams.set('game', options.gameId);
  url.searchParams.set('room', sanitizeRoomCode(options.roomId));
  url.searchParams.set('role', options.role);

  if (options.offerToken) {
    url.searchParams.set('offer', options.offerToken);
  } else {
    url.searchParams.delete('offer');
  }

  return url.toString();
}

export function buildQrImageUrl(shareUrl: string): string {
  const qr = new URL('https://api.qrserver.com/v1/create-qr-code/');
  qr.searchParams.set('size', '240x240');
  qr.searchParams.set('data', shareUrl);
  qr.searchParams.set('margin', '8');
  return qr.toString();
}
